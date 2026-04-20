import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";

type IssuePenaltyFn = (
  officerUserId: string,
  dto: {
    licenseNo: string;
    plateNo?: string;
    violationCode: string;
    locationText: string;
    occurredAt: string;
    notes?: string;
  }
) => Promise<any>;

type ListMyPenaltiesFn = (driverUserId: string) => Promise<any[]>;

const mockIssuePenalty = jest.fn<IssuePenaltyFn>();
const mockListMyPenalties = jest.fn<ListMyPenaltiesFn>();

jest.unstable_mockModule("../src/services/penalty.service.js", () => ({
  issuePenalty: mockIssuePenalty,
  listMyPenalties: mockListMyPenalties,
}));

const penaltyController = await import("../src/controllers/penalty.controller.js");

const {
  createPenalty,
  myPenalties,
} = penaltyController;

function mockRes(): Response {
  const res = {} as Response;
  (res.json as any) = jest.fn().mockReturnValue(res);
  (res.status as any) = jest.fn().mockReturnValue(res);
  return res;
}

describe("Penalty controller mock tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create penalty successfully", async () => {
    const req = {
      body: {
        licenseNo: "B12345",
        plateNo: "CAB-1234",
        violationCode: "SPD001",
        locationText: "Colombo Fort",
        occurredAt: "2026-03-10T10:00:00.000Z",
        notes: "Overspeeding on main road",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    mockIssuePenalty.mockResolvedValue({
      id: "pen1",
      status: "UNPAID",
      fineLkr: 5000,
      demeritPoints: 2,
      locationText: "Colombo Fort",
    });

    await createPenalty(req, res);

    expect(mockIssuePenalty).toHaveBeenCalledWith("off1", {
      licenseNo: "B12345",
      plateNo: "CAB-1234",
      violationCode: "SPD001",
      locationText: "Colombo Fort",
      occurredAt: "2026-03-10T10:00:00.000Z",
      notes: "Overspeeding on main road",
    });

    expect(res.json).toHaveBeenCalledWith({
      id: "pen1",
      status: "UNPAID",
      fineLkr: 5000,
      demeritPoints: 2,
      locationText: "Colombo Fort",
    });
  });

  it("should create penalty successfully without plateNo", async () => {
    const req = {
      body: {
        licenseNo: "B12345",
        violationCode: "SPD001",
        locationText: "Kandy Road",
        occurredAt: "2026-03-10T10:00:00.000Z",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    mockIssuePenalty.mockResolvedValue({
      id: "pen2",
      status: "UNPAID",
      fineLkr: 5000,
      demeritPoints: 2,
      locationText: "Kandy Road",
    });

    await createPenalty(req, res);

    expect(mockIssuePenalty).toHaveBeenCalledWith("off1", {
      licenseNo: "B12345",
      violationCode: "SPD001",
      locationText: "Kandy Road",
      occurredAt: "2026-03-10T10:00:00.000Z",
    });

    expect(res.json).toHaveBeenCalledWith({
      id: "pen2",
      status: "UNPAID",
      fineLkr: 5000,
      demeritPoints: 2,
      locationText: "Kandy Road",
    });
  });

  it("should return my penalties", async () => {
    const req = {
      user: { sub: "driver1" },
    } as any as Request;

    const res = mockRes();

    mockListMyPenalties.mockResolvedValue([
      {
        id: "pen1",
        status: "UNPAID",
        fineLkr: 5000,
        violationType: { code: "SPD001" },
      },
      {
        id: "pen2",
        status: "PAID",
        fineLkr: 3000,
        violationType: { code: "PRK001" },
      },
    ]);

    await myPenalties(req, res);

    expect(mockListMyPenalties).toHaveBeenCalledWith("driver1");
    expect(res.json).toHaveBeenCalledWith([
      {
        id: "pen1",
        status: "UNPAID",
        fineLkr: 5000,
        violationType: { code: "SPD001" },
      },
      {
        id: "pen2",
        status: "PAID",
        fineLkr: 3000,
        violationType: { code: "PRK001" },
      },
    ]);
  });

  it("should fail createPenalty validation for short licenseNo", async () => {
    const req = {
      body: {
        licenseNo: "B12",
        plateNo: "CAB-1234",
        violationCode: "SPD001",
        locationText: "Colombo Fort",
        occurredAt: "2026-03-10T10:00:00.000Z",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    await expect(createPenalty(req, res)).rejects.toBeDefined();
    expect(mockIssuePenalty).not.toHaveBeenCalled();
  });

  it("should fail createPenalty validation for short plateNo", async () => {
    const req = {
      body: {
        licenseNo: "B12345",
        plateNo: "A1",
        violationCode: "SPD001",
        locationText: "Colombo Fort",
        occurredAt: "2026-03-10T10:00:00.000Z",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    await expect(createPenalty(req, res)).rejects.toBeDefined();
    expect(mockIssuePenalty).not.toHaveBeenCalled();
  });

  it("should fail createPenalty validation for short violationCode", async () => {
    const req = {
      body: {
        licenseNo: "B12345",
        plateNo: "CAB-1234",
        violationCode: "SP",
        locationText: "Colombo Fort",
        occurredAt: "2026-03-10T10:00:00.000Z",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    await expect(createPenalty(req, res)).rejects.toBeDefined();
    expect(mockIssuePenalty).not.toHaveBeenCalled();
  });

  it("should fail createPenalty validation for short locationText", async () => {
    const req = {
      body: {
        licenseNo: "B12345",
        plateNo: "CAB-1234",
        violationCode: "SPD001",
        locationText: "A",
        occurredAt: "2026-03-10T10:00:00.000Z",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    await expect(createPenalty(req, res)).rejects.toBeDefined();
    expect(mockIssuePenalty).not.toHaveBeenCalled();
  });

  it("should fail createPenalty validation when occurredAt is missing", async () => {
    const req = {
      body: {
        licenseNo: "B12345",
        plateNo: "CAB-1234",
        violationCode: "SPD001",
        locationText: "Colombo Fort",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    await expect(createPenalty(req, res)).rejects.toBeDefined();
    expect(mockIssuePenalty).not.toHaveBeenCalled();
  });
});