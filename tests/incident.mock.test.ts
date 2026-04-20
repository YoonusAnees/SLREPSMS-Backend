import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";

type IncidentType = "ACCIDENT" | "BREAKDOWN" | "MEDICAL" | "FIRE" | "OTHER";
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type CreateIncidentFn = (
  userId: string | null,
  dto: {
    type: IncidentType;
    severity: Severity;
    lat: number;
    lng: number;
    description?: string;
    locationText?: string;
    evidence?: string;
    plateNo?: string;
    suspectedViolationCode?: string;
  }
) => Promise<any>;

type ListIncidentsFn = () => Promise<any[]>;
type ListMyIncidentsFn = (userId: string) => Promise<any[]>;
type ReviewIncidentFn = (officerUserId: string, incidentId: string) => Promise<any>;
type ResolveIncidentFn = (officerUserId: string, incidentId: string) => Promise<any>;

const mockCreateIncident = jest.fn<CreateIncidentFn>();
const mockListIncidents = jest.fn<ListIncidentsFn>();
const mockListMyIncidents = jest.fn<ListMyIncidentsFn>();
const mockReviewIncident = jest.fn<ReviewIncidentFn>();
const mockResolveIncident = jest.fn<ResolveIncidentFn>();

jest.unstable_mockModule("../src/services/incident.service.js", () => ({
  createIncident: mockCreateIncident,
  listIncidents: mockListIncidents,
  listMyIncidents: mockListMyIncidents,
  reviewIncident: mockReviewIncident,
  resolveIncident: mockResolveIncident,
}));

const incidentController = await import("../src/controllers/incident.controller.js");

const {
  create,
  list,
  my,
  review,
  resolve,
} = incidentController;

function mockRes(): Response {
  const res = {} as Response;
  (res.json as any) = jest.fn().mockReturnValue(res);
  (res.status as any) = jest.fn().mockReturnValue(res);
  return res;
}

describe("Incident controller mock tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an incident successfully", async () => {
    const req = {
      body: {
        type: "ACCIDENT",
        severity: "HIGH",
        lat: 6.9271,
        lng: 79.8612,
        description: "Vehicle crash near junction",
        locationText: "Colombo",
        evidence: "photo.jpg",
        plateNo: "CAB-1234",
        suspectedViolationCode: "SPD001",
      },
      user: { sub: "u1" },
    } as any as Request;

    const res = mockRes();

    mockCreateIncident.mockResolvedValue({
      incident: {
        id: "inc1",
        type: "ACCIDENT",
        severity: "HIGH",
        status: "UNDER_REVIEW",
      },
      matchedVehicle: null,
      detectedViolation: "SPD001",
      autoPenalty: null,
      requiresOfficerReview: true,
    });

    await create(req, res);

    expect(mockCreateIncident).toHaveBeenCalledWith("u1", {
      type: "ACCIDENT",
      severity: "HIGH",
      lat: 6.9271,
      lng: 79.8612,
      description: "Vehicle crash near junction",
      locationText: "Colombo",
      evidence: "photo.jpg",
      plateNo: "CAB-1234",
      suspectedViolationCode: "SPD001",
    });

    expect(res.json).toHaveBeenCalledWith({
      incident: {
        id: "inc1",
        type: "ACCIDENT",
        severity: "HIGH",
        status: "UNDER_REVIEW",
      },
      matchedVehicle: null,
      detectedViolation: "SPD001",
      autoPenalty: null,
      requiresOfficerReview: true,
    });
  });

  it("should create an incident with null userId when user is missing", async () => {
    const req = {
      body: {
        type: "FIRE",
        severity: "CRITICAL",
        lat: 7.2906,
        lng: 80.6337,
      },
    } as any as Request;

    const res = mockRes();

    mockCreateIncident.mockResolvedValue({
      incident: {
        id: "inc2",
        type: "FIRE",
        severity: "CRITICAL",
        status: "UNDER_REVIEW",
      },
      matchedVehicle: null,
      detectedViolation: null,
      autoPenalty: null,
      requiresOfficerReview: false,
    });

    await create(req, res);

    expect(mockCreateIncident).toHaveBeenCalledWith(null, {
      type: "FIRE",
      severity: "CRITICAL",
      lat: 7.2906,
      lng: 80.6337,
    });

    expect(res.json).toHaveBeenCalled();
  });

  it("should list all incidents", async () => {
    const req = {} as Request;
    const res = mockRes();

    mockListIncidents.mockResolvedValue([
      { id: "inc1", type: "ACCIDENT" },
      { id: "inc2", type: "FIRE" },
    ]);

    await list(req, res);

    expect(mockListIncidents).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith([
      { id: "inc1", type: "ACCIDENT" },
      { id: "inc2", type: "FIRE" },
    ]);
  });

  it("should list my incidents", async () => {
    const req = {
      user: { sub: "u1" },
    } as any as Request;

    const res = mockRes();

    mockListMyIncidents.mockResolvedValue([
      { id: "inc1", type: "ACCIDENT", reportedBy: "u1" },
    ]);

    await my(req, res);

    expect(mockListMyIncidents).toHaveBeenCalledWith("u1");
    expect(res.json).toHaveBeenCalledWith([
      { id: "inc1", type: "ACCIDENT", reportedBy: "u1" },
    ]);
  });

  it("should review an incident successfully", async () => {
    const req = {
      params: {
        id: "123e4567-e89b-42d3-a456-426614174000",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    mockReviewIncident.mockResolvedValue({
      id: "123e4567-e89b-42d3-a456-426614174000",
      status: "UNDER_REVIEW",
      reviewedBy: { id: "off1" },
    });

    await review(req, res);

    expect(mockReviewIncident).toHaveBeenCalledWith(
      "off1",
      "123e4567-e89b-42d3-a456-426614174000"
    );

    expect(res.json).toHaveBeenCalledWith({
      id: "123e4567-e89b-42d3-a456-426614174000",
      status: "UNDER_REVIEW",
      reviewedBy: { id: "off1" },
    });
  });

  it("should resolve an incident successfully", async () => {
    const req = {
      params: {
        id: "123e4567-e89b-42d3-a456-426614174001",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    mockResolveIncident.mockResolvedValue({
      id: "123e4567-e89b-42d3-a456-426614174001",
      status: "RESOLVED",
      resolvedBy: { id: "off1" },
    });

    await resolve(req, res);

    expect(mockResolveIncident).toHaveBeenCalledWith(
      "off1",
      "123e4567-e89b-42d3-a456-426614174001"
    );

    expect(res.json).toHaveBeenCalledWith({
      id: "123e4567-e89b-42d3-a456-426614174001",
      status: "RESOLVED",
      resolvedBy: { id: "off1" },
    });
  });

  it("should fail create validation for invalid type", async () => {
    const req = {
      body: {
        type: "CRASH",
        severity: "HIGH",
        lat: 6.9,
        lng: 79.8,
      },
      user: { sub: "u1" },
    } as any as Request;

    const res = mockRes();

    await expect(create(req, res)).rejects.toBeDefined();
    expect(mockCreateIncident).not.toHaveBeenCalled();
  });

  it("should fail create validation for missing coordinates", async () => {
    const req = {
      body: {
        type: "ACCIDENT",
        severity: "HIGH",
      },
      user: { sub: "u1" },
    } as any as Request;

    const res = mockRes();

    await expect(create(req, res)).rejects.toBeDefined();
    expect(mockCreateIncident).not.toHaveBeenCalled();
  });

  it("should fail review validation for invalid uuid", async () => {
    const req = {
      params: {
        id: "bad-id",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    await expect(review(req, res)).rejects.toBeDefined();
    expect(mockReviewIncident).not.toHaveBeenCalled();
  });

  it("should fail resolve validation for invalid uuid", async () => {
    const req = {
      params: {
        id: "bad-id",
      },
      user: { sub: "off1" },
    } as any as Request;

    const res = mockRes();

    await expect(resolve(req, res)).rejects.toBeDefined();
    expect(mockResolveIncident).not.toHaveBeenCalled();
  });
});