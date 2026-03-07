import AppDataSource from "../config/data-source.js";
import { Incident } from "../entities/Incident.js";
import { User } from "../entities/User.js";
import { pointGeoJSON } from "../utils/geo.js";
import { detectViolationFromDescription } from "../utils/detectViolationFromDescription.js";
import { normalizePlate } from "../utils/normalizePlate.js";
import { Vehicle } from "../entities/Vehicle.js";
import { ViolationType } from "../entities/ViolationType.js";
import { Penalty } from "../entities/Penalty.js";
import { Driver, LicenseStatus } from "../entities/Driver.js";

function addOneMonth(date: Date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

export async function createIncident(
  userId: string,
  dto: {
    type: "ACCIDENT" | "BREAKDOWN" | "MEDICAL" | "FIRE" | "OTHER";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    lat: number;
    lng: number;
    description?: string | null;
    locationText?: string | null;
    evidence?: string | null;
    plateNo?: string | null;
    suspectedViolationCode?: string | null;
  }
) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const iRepo = trx.getRepository(Incident);
    const vRepo = trx.getRepository(Vehicle);
    const vtRepo = trx.getRepository(ViolationType);
    const pRepo = trx.getRepository(Penalty);
    const dRepo = trx.getRepository(Driver);

    const user = await uRepo.findOne({ where: { id: userId } });
    if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

    const detectedViolation =
      dto.suspectedViolationCode?.trim() ||
      detectViolationFromDescription(dto.description);

    const normalizedPlate =
      dto.plateNo && dto.plateNo.trim().length > 0
        ? normalizePlate(dto.plateNo)
        : null;

    let matchedVehicle: Vehicle | null = null;

    if (normalizedPlate) {
      matchedVehicle = await vRepo.findOne({
        where: { plateNo: normalizedPlate },
        relations: { driver: { user: true } },
      });
    }

    const canAutoIssuePenalty =
      user.role === "OFFICER" &&
      !!matchedVehicle &&
      !!detectedViolation &&
      !!matchedVehicle.driver &&
      !!matchedVehicle.driver.user;

    const incident = iRepo.create({
      reportedBy: user,
      type: dto.type,
      severity: dto.severity,
      status: canAutoIssuePenalty ? "NEW" : "UNDER_REVIEW",
      description: dto.description ?? null,
      locationText: dto.locationText ?? null,
      evidence: dto.evidence ?? null,
      baseLocation: pointGeoJSON(dto.lng, dto.lat),
      plateNo: normalizedPlate,
      suspectedViolationCode: detectedViolation ?? null,
      requiresOfficerReview: !canAutoIssuePenalty && !!detectedViolation,
      penaltySuggestionStatus: canAutoIssuePenalty
        ? "AUTO_ISSUED"
        : detectedViolation
          ? "SUGGESTED"
          : "NONE",
      reviewedBy: null,
      reviewedAt: null,
      resolvedBy: null,
      resolvedAt: null,
    });

    const savedIncident = await iRepo.save(incident);

    let autoPenalty: Penalty | null = null;

    if (canAutoIssuePenalty && matchedVehicle) {
      const vt = await vtRepo.findOne({ where: { code: detectedViolation! } });
      if (vt) {
        const driver = matchedVehicle.driver;

        if (driver.licenseStatus === LicenseStatus.SUSPENDED) {
          throw Object.assign(
            new Error("Driver license is currently suspended."),
            { status: 409 }
          );
        }

        if (!matchedVehicle.ownershipVerified) {
          throw Object.assign(
            new Error("Vehicle ownership not verified."),
            { status: 409 }
          );
        }

        if (matchedVehicle.insuranceExpiry) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const expiry = new Date(matchedVehicle.insuranceExpiry);
          expiry.setHours(0, 0, 0, 0);

          if (expiry < today) {
            throw Object.assign(
              new Error("Vehicle insurance expired."),
              { status: 409 }
            );
          }
        }

        autoPenalty = pRepo.create({
          vehicle: matchedVehicle,
          driverUser: driver.user,
          issuedBy: user,
          violationType: vt,
          status: "UNPAID",
          fineLkr: vt.baseFineLkr,
          demeritPoints: vt.demeritPoints,
          occurredAt: new Date(),
          locationText: dto.locationText ?? "Incident location",
          notes: `Auto-issued from incident ${savedIncident.id}`,
        });

        autoPenalty = await pRepo.save(autoPenalty);

        driver.currentPoints = Math.max(0, driver.currentPoints - vt.demeritPoints);

        if (driver.currentPoints === 0) {
          driver.licenseStatus = LicenseStatus.SUSPENDED;

          if (driver.suspendedUntil && driver.suspendedUntil > new Date()) {
            driver.suspendedUntil = addOneMonth(driver.suspendedUntil);
          } else {
            driver.suspendedUntil = addOneMonth(new Date());
          }
        }

        await dRepo.save(driver);
      }
    }

    return {
      incident: savedIncident,
      matchedVehicle: matchedVehicle
        ? {
            id: matchedVehicle.id,
            plateNo: matchedVehicle.plateNo,
            type: matchedVehicle.type,
            model: matchedVehicle.model ?? null,
            color: matchedVehicle.color ?? null,
            year: matchedVehicle.year ?? null,
            insuranceExpiry: matchedVehicle.insuranceExpiry ?? null,
            ownershipVerified: matchedVehicle.ownershipVerified,
            driver: matchedVehicle.driver
              ? {
                  id: matchedVehicle.driver.id,
                  licenseNo: matchedVehicle.driver.licenseNo,
                  currentPoints: matchedVehicle.driver.currentPoints,
                  licenseStatus: matchedVehicle.driver.licenseStatus,
                  suspendedUntil: matchedVehicle.driver.suspendedUntil ?? null,
                  user: matchedVehicle.driver.user
                    ? {
                        id: matchedVehicle.driver.user.id,
                        name: matchedVehicle.driver.user.name,
                        email: matchedVehicle.driver.user.email,
                        phone: matchedVehicle.driver.user.phone ?? null,
                        nic: matchedVehicle.driver.user.nic ?? null,
                      }
                    : null,
                }
              : null,
          }
        : null,
      detectedViolation: detectedViolation ?? null,
      autoPenalty,
      requiresOfficerReview: !canAutoIssuePenalty && !!detectedViolation,
    };
  });
}

export async function listIncidents() {
  const repo = AppDataSource.getRepository(Incident);

  const { raw, entities } = await repo
    .createQueryBuilder("i")
    .leftJoinAndSelect("i.reportedBy", "reportedBy")
    .leftJoinAndSelect("i.dispatches", "dispatches")
    .leftJoinAndSelect("i.reviewedBy", "reviewedBy")
    .leftJoinAndSelect("i.resolvedBy", "resolvedBy")
    .addSelect(`ST_AsGeoJSON(i.location)`, "location_geojson")
    .orderBy("i.createdAt", "DESC")
    .getRawAndEntities();

  return entities.map((e, idx) => {
    const geo = raw[idx]?.location_geojson
      ? JSON.parse(raw[idx].location_geojson)
      : null;

    return {
      ...e,
      location: geo,
    };
  });
}

export async function listMyIncidents(userId: string) {
  const repo = AppDataSource.getRepository(Incident);

  const { raw, entities } = await repo
    .createQueryBuilder("i")
    .leftJoinAndSelect("i.reportedBy", "reportedBy")
    .leftJoinAndSelect("i.dispatches", "dispatches")
    .leftJoinAndSelect("i.reviewedBy", "reviewedBy")
    .leftJoinAndSelect("i.resolvedBy", "resolvedBy")
    .where("reportedBy.id = :userId", { userId })
    .addSelect(`ST_AsGeoJSON(i.location)`, "location_geojson")
    .orderBy("i.createdAt", "DESC")
    .getRawAndEntities();

  return entities.map((e, idx) => {
    const geo = raw[idx]?.location_geojson
      ? JSON.parse(raw[idx].location_geojson)
      : null;

    return {
      ...e,
      location: e.locationText || geo || null,
    };
  });
}

export async function reviewIncident(officerUserId: string, incidentId: string) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const iRepo = trx.getRepository(Incident);

    const officer = await uRepo.findOne({ where: { id: officerUserId } });
    if (!officer || officer.role !== "OFFICER") {
      throw Object.assign(new Error("Only OFFICER can review incidents"), { status: 403 });
    }

    const incident = await iRepo.findOne({
      where: { id: incidentId },
      relations: { reviewedBy: true, resolvedBy: true },
    });

    if (!incident) {
      throw Object.assign(new Error("Incident not found"), { status: 404 });
    }

    incident.reviewedBy = officer;
    incident.reviewedAt = new Date();

    if (incident.status === "NEW") {
      incident.status = "UNDER_REVIEW";
    }

    return iRepo.save(incident);
  });
}

export async function resolveIncident(officerUserId: string, incidentId: string) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const iRepo = trx.getRepository(Incident);

    const officer = await uRepo.findOne({ where: { id: officerUserId } });
    if (!officer || officer.role !== "OFFICER") {
      throw Object.assign(new Error("Only OFFICER can resolve incidents"), { status: 403 });
    }

    const incident = await iRepo.findOne({
      where: { id: incidentId },
      relations: { reviewedBy: true, resolvedBy: true },
    });

    if (!incident) {
      throw Object.assign(new Error("Incident not found"), { status: 404 });
    }

    incident.status = "RESOLVED";
    incident.resolvedBy = officer;
    incident.resolvedAt = new Date();

    if (!incident.reviewedBy) {
      incident.reviewedBy = officer;
      incident.reviewedAt = new Date();
    }

    return iRepo.save(incident);
  });
}