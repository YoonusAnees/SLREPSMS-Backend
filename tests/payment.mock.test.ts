import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";

type CreateStripeIntentFn = (
  driverUserId: string,
  dto: {
    penaltyId: string;
    idempotencyKey: string;
  }
) => Promise<{
  id: string;
  stripeClientSecret: string | null;
  amountLkr: number;
  receiptNo: string;
}>;

type ConfirmStripeDemoFn = (
  driverUserId: string,
  dto: {
    paymentId: string;
  }
) => Promise<any>;

type MyPaymentsFn = (driverUserId: string) => Promise<any[]>;

const mockCreateStripeIntent = jest.fn<CreateStripeIntentFn>();
const mockConfirmStripeDemo = jest.fn<ConfirmStripeDemoFn>();
const mockMyPayments = jest.fn<MyPaymentsFn>();

jest.unstable_mockModule("../src/services/payment.service.js", () => ({
  createStripeIntent: mockCreateStripeIntent,
  confirmStripeDemo: mockConfirmStripeDemo,
  myPayments: mockMyPayments,
}));

const paymentController = await import("../src/controllers/payment.controller.js");

const {
  stripeCreateIntent,
  stripeConfirmDemo,
  mine,
} = paymentController;

function mockRes(): Response {
  const res = {} as Response;
  (res.json as any) = jest.fn().mockReturnValue(res);
  (res.status as any) = jest.fn().mockReturnValue(res);
  return res;
}

describe("Payment controller mock tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create stripe intent successfully", async () => {
    const req = {
      body: {
        penaltyId: "123e4567-e89b-42d3-a456-426614174000",
        idempotencyKey: "idem-key-001",
      },
      user: { sub: "driver1" },
    } as any as Request;

    const res = mockRes();

    mockCreateStripeIntent.mockResolvedValue({
      id: "pay1",
      stripeClientSecret: "secret_123",
      amountLkr: 5000,
      receiptNo: "RCT-001",
    });

    await stripeCreateIntent(req, res);

    expect(mockCreateStripeIntent).toHaveBeenCalledWith("driver1", {
      penaltyId: "123e4567-e89b-42d3-a456-426614174000",
      idempotencyKey: "idem-key-001",
    });

    expect(res.json).toHaveBeenCalledWith({
      paymentId: "pay1",
      clientSecret: "secret_123",
      amountLkr: 5000,
      receiptNo: "RCT-001",
    });
  });

  it("should confirm stripe payment successfully", async () => {
    const req = {
      body: {
        paymentId: "123e4567-e89b-42d3-a456-426614174001",
      },
      user: { sub: "driver1" },
    } as any as Request;

    const res = mockRes();

    mockConfirmStripeDemo.mockResolvedValue({
      id: "pay1",
      status: "SUCCESS",
      paidAt: "2026-03-10T10:00:00.000Z",
    });

    await stripeConfirmDemo(req, res);

    expect(mockConfirmStripeDemo).toHaveBeenCalledWith("driver1", {
      paymentId: "123e4567-e89b-42d3-a456-426614174001",
    });

    expect(res.json).toHaveBeenCalledWith({
      id: "pay1",
      status: "SUCCESS",
      paidAt: "2026-03-10T10:00:00.000Z",
    });
  });

  it("should return my payments successfully", async () => {
    const req = {
      user: { sub: "driver1" },
    } as any as Request;

    const res = mockRes();

    mockMyPayments.mockResolvedValue([
      {
        id: "pay1",
        receiptNo: "RCT-001",
        amountLkr: 5000,
        status: "SUCCESS",
        paidAt: "2026-03-10T10:00:00.000Z",
        updatedAt: "2026-03-10T10:05:00.000Z",
        officerName: "Officer Silva",
        violationCode: "SPD001",
        vehiclePlate: "CAB-1234",
      },
    ]);

    await mine(req, res);

    expect(mockMyPayments).toHaveBeenCalledWith("driver1");

    expect(res.json).toHaveBeenCalledWith([
      {
        id: "pay1",
        receiptNo: "RCT-001",
        amountLkr: 5000,
        status: "SUCCESS",
        paidAt: "2026-03-10T10:00:00.000Z",
        updatedAt: "2026-03-10T10:05:00.000Z",
        officerName: "Officer Silva",
        violationCode: "SPD001",
        vehiclePlate: "CAB-1234",
      },
    ]);
  });

  it("should fail create intent validation for invalid penaltyId", async () => {
    const req = {
      body: {
        penaltyId: "bad-id",
        idempotencyKey: "idem-key-001",
      },
      user: { sub: "driver1" },
    } as any as Request;

    const res = mockRes();

    await expect(stripeCreateIntent(req, res)).rejects.toBeDefined();
    expect(mockCreateStripeIntent).not.toHaveBeenCalled();
  });

  it("should fail create intent validation for short idempotencyKey", async () => {
    const req = {
      body: {
        penaltyId: "123e4567-e89b-42d3-a456-426614174000",
        idempotencyKey: "short",
      },
      user: { sub: "driver1" },
    } as any as Request;

    const res = mockRes();

    await expect(stripeCreateIntent(req, res)).rejects.toBeDefined();
    expect(mockCreateStripeIntent).not.toHaveBeenCalled();
  });

  it("should fail confirm validation for invalid paymentId", async () => {
    const req = {
      body: {
        paymentId: "bad-id",
      },
      user: { sub: "driver1" },
    } as any as Request;

    const res = mockRes();

    await expect(stripeConfirmDemo(req, res)).rejects.toBeDefined();
    expect(mockConfirmStripeDemo).not.toHaveBeenCalled();
  });
});