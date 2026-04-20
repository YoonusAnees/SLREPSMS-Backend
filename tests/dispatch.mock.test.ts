import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";

type NearestTeamsFn = (dto: {
  lat: number;
  lng: number;
  limit?: number;
  maxDistanceMeters?: number;
}) => Promise<any[]>;

type DispatchTeamFn = (
  userId: string,
  dto: {
    incidentId: string;
    rescueTeamId: string;
    notes?: string;
  }
) => Promise<any>;

type UpdateDispatchStatusFn = (dto: {
  dispatchId: string;
  status: "EN_ROUTE" | "ON_SCENE" | "COMPLETED" | "CANCELLED";
}) => Promise<any>;

type ListDispatchesFn = (opts: {
  dispatchedByUserId?: string;
}) => Promise<any[]>;

type DispatchStatsFn = () => Promise<any>;

type ListDispatchesForRescueFn = (userId: string) => Promise<any[]>;

const mockNearestTeams = jest.fn<NearestTeamsFn>();
const mockDispatchTeam = jest.fn<DispatchTeamFn>();
const mockUpdateDispatchStatus = jest.fn<UpdateDispatchStatusFn>();
const mockListDispatches = jest.fn<ListDispatchesFn>();
const mockDispatchStats = jest.fn<DispatchStatsFn>();
const mockListDispatchesForRescue = jest.fn<ListDispatchesForRescueFn>();

jest.unstable_mockModule("../src/services/dispatch.service.js", () => ({
  nearestTeams: mockNearestTeams,
  dispatchTeam: mockDispatchTeam,
  updateDispatchStatus: mockUpdateDispatchStatus,
  listDispatches: mockListDispatches,
  dispatchStats: mockDispatchStats,
  listDispatchesForRescue: mockListDispatchesForRescue,
}));

const dispatchController = await import("../src/controllers/dispatch.controller.js");

const {
  nearest,
  dispatch,
  updateStatus,
  myDispatches,
  allDispatches,
  stats,
  rescueMyDispatches,
} = dispatchController;

function mockRes(): Response {
  const res = {} as Response;
  (res.json as any) = jest.fn().mockReturnValue(res);
  (res.status as any) = jest.fn().mockReturnValue(res);
  return res;
}

describe("Dispatch controller mock tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return nearest teams successfully", async () => {
    const req = {
      body: {
        lat: 6.9271,
        lng: 79.8612,
        limit: 5,
        maxDistanceMeters: 30000,
      },
    } as Request;

    const res = mockRes();

    mockNearestTeams.mockResolvedValue([
      { id: "rt1", name: "Team Alpha", distanceMeters: 1200 },
      { id: "rt2", name: "Team Bravo", distanceMeters: 2500 },
    ]);

    await nearest(req, res);

    expect(mockNearestTeams).toHaveBeenCalledWith({
      lat: 6.9271,
      lng: 79.8612,
      limit: 5,
      maxDistanceMeters: 30000,
    });

    expect(res.json).toHaveBeenCalledWith([
      { id: "rt1", name: "Team Alpha", distanceMeters: 1200 },
      { id: "rt2", name: "Team Bravo", distanceMeters: 2500 },
    ]);
  });

  it("should dispatch a team successfully", async () => {
    const req = {
      body: {
        incidentId: "123e4567-e89b-42d3-a456-426614174000",
        rescueTeamId: "123e4567-e89b-42d3-a456-426614174001",
        notes: "Urgent dispatch required",
      },
      user: { sub: "dispatcher1" },
    } as any as Request;

    const res = mockRes();

    mockDispatchTeam.mockResolvedValue({
      id: "disp1",
      status: "ASSIGNED",
      notes: "Urgent dispatch required",
    });

    await dispatch(req, res);

    expect(mockDispatchTeam).toHaveBeenCalledWith("dispatcher1", {
      incidentId: "123e4567-e89b-42d3-a456-426614174000",
      rescueTeamId: "123e4567-e89b-42d3-a456-426614174001",
      notes: "Urgent dispatch required",
    });

    expect(res.json).toHaveBeenCalledWith({
      id: "disp1",
      status: "ASSIGNED",
      notes: "Urgent dispatch required",
    });
  });

  it("should update dispatch status successfully", async () => {
    const req = {
      body: {
        dispatchId: "123e4567-e89b-42d3-a456-426614174002",
        status: "EN_ROUTE",
      },
    } as Request;

    const res = mockRes();

    mockUpdateDispatchStatus.mockResolvedValue({
      id: "disp1",
      status: "EN_ROUTE",
    });

    await updateStatus(req, res);

    expect(mockUpdateDispatchStatus).toHaveBeenCalledWith({
      dispatchId: "123e4567-e89b-42d3-a456-426614174002",
      status: "EN_ROUTE",
    });

    expect(res.json).toHaveBeenCalledWith({
      id: "disp1",
      status: "EN_ROUTE",
    });
  });

  it("should return my dispatches", async () => {
    const req = {
      user: { sub: "dispatcher1" },
    } as any as Request;

    const res = mockRes();

    mockListDispatches.mockResolvedValue([
      { id: "disp1", status: "ASSIGNED" },
      { id: "disp2", status: "ON_SCENE" },
    ]);

    await myDispatches(req, res);

    expect(mockListDispatches).toHaveBeenCalledWith({
      dispatchedByUserId: "dispatcher1",
    });

    expect(res.json).toHaveBeenCalledWith([
      { id: "disp1", status: "ASSIGNED" },
      { id: "disp2", status: "ON_SCENE" },
    ]);
  });

  it("should return all dispatches", async () => {
    const req = {} as Request;
    const res = mockRes();

    mockListDispatches.mockResolvedValue([
      { id: "disp1", status: "ASSIGNED" },
      { id: "disp2", status: "COMPLETED" },
    ]);

    await allDispatches(req, res);

    expect(mockListDispatches).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith([
      { id: "disp1", status: "ASSIGNED" },
      { id: "disp2", status: "COMPLETED" },
    ]);
  });

  it("should return dispatch stats", async () => {
    const req = {} as Request;
    const res = mockRes();

    mockDispatchStats.mockResolvedValue({
      incidents: {
        NEW: 2,
        DISPATCHED: 3,
        RESOLVED: 5,
        CANCELLED: 1,
      },
      activeDispatches: 4,
    });

    await stats(req, res);

    expect(mockDispatchStats).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      incidents: {
        NEW: 2,
        DISPATCHED: 3,
        RESOLVED: 5,
        CANCELLED: 1,
      },
      activeDispatches: 4,
    });
  });

  it("should return rescue team dispatches", async () => {
    const req = {
      user: { sub: "rescue1" },
    } as any as Request;

    const res = mockRes();

    mockListDispatchesForRescue.mockResolvedValue([
      { id: "disp1", status: "EN_ROUTE" },
      { id: "disp2", status: "ON_SCENE" },
    ]);

    await rescueMyDispatches(req, res);

    expect(mockListDispatchesForRescue).toHaveBeenCalledWith("rescue1");
    expect(res.json).toHaveBeenCalledWith([
      { id: "disp1", status: "EN_ROUTE" },
      { id: "disp2", status: "ON_SCENE" },
    ]);
  });

  it("should fail nearest validation for invalid lat", async () => {
    const req = {
      body: {
        lat: "bad",
        lng: 79.8612,
      },
    } as any as Request;

    const res = mockRes();

    await expect(nearest(req, res)).rejects.toBeDefined();
    expect(mockNearestTeams).not.toHaveBeenCalled();
  });

  it("should fail nearest validation for invalid limit", async () => {
    const req = {
      body: {
        lat: 6.9271,
        lng: 79.8612,
        limit: 0,
      },
    } as any as Request;

    const res = mockRes();

    await expect(nearest(req, res)).rejects.toBeDefined();
    expect(mockNearestTeams).not.toHaveBeenCalled();
  });

  it("should fail dispatch validation for invalid incidentId", async () => {
    const req = {
      body: {
        incidentId: "bad-id",
        rescueTeamId: "123e4567-e89b-42d3-a456-426614174001",
        notes: "Urgent dispatch required",
      },
      user: { sub: "dispatcher1" },
    } as any as Request;

    const res = mockRes();

    await expect(dispatch(req, res)).rejects.toBeDefined();
    expect(mockDispatchTeam).not.toHaveBeenCalled();
  });

  it("should fail dispatch validation for invalid rescueTeamId", async () => {
    const req = {
      body: {
        incidentId: "123e4567-e89b-42d3-a456-426614174000",
        rescueTeamId: "bad-id",
      },
      user: { sub: "dispatcher1" },
    } as any as Request;

    const res = mockRes();

    await expect(dispatch(req, res)).rejects.toBeDefined();
    expect(mockDispatchTeam).not.toHaveBeenCalled();
  });

  it("should fail updateStatus validation for invalid dispatchId", async () => {
    const req = {
      body: {
        dispatchId: "bad-id",
        status: "EN_ROUTE",
      },
    } as any as Request;

    const res = mockRes();

    await expect(updateStatus(req, res)).rejects.toBeDefined();
    expect(mockUpdateDispatchStatus).not.toHaveBeenCalled();
  });

  it("should fail updateStatus validation for invalid status", async () => {
    const req = {
      body: {
        dispatchId: "123e4567-e89b-42d3-a456-426614174002",
        status: "STARTED",
      },
    } as any as Request;

    const res = mockRes();

    await expect(updateStatus(req, res)).rejects.toBeDefined();
    expect(mockUpdateDispatchStatus).not.toHaveBeenCalled();
  });
});