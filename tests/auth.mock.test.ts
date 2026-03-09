import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";

type RegisterUserFn = (payload: {
  name: string;
  email: string;
  role: "DRIVER" | "OFFICER" | "ADMIN" | "DISPATCHER" | "RESCUE";
  password: string;
  phone?: string;
  nic?: string;
}) => Promise<{
  id: string;
  email: string;
  role: string;
}>;

type BulkRegisterUsersFn = (items: {
  name: string;
  email: string;
  role: "DRIVER" | "OFFICER" | "ADMIN" | "DISPATCHER" | "RESCUE";
  password: string;
  phone?: string;
  nic?: string;
}[]) => Promise<
  {
    id: string;
    email: string;
    role: string;
  }[]
>;

type LoginFn = (
  email: string,
  password: string
) => Promise<{
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    nic?: string;
  };
}>;

type LogoutUserFn = (refreshToken: string) => Promise<void>;

type RefreshFn = (
  refreshToken: string
) => Promise<{
  accessToken: string;
  refreshToken: string;
}>;

const mockRegisterUser = jest.fn<RegisterUserFn>();
const mockBulkRegisterUsers = jest.fn<BulkRegisterUsersFn>();
const mockLogin = jest.fn<LoginFn>();
const mockLogoutUser = jest.fn<LogoutUserFn>();
const mockRefresh = jest.fn<RefreshFn>();

jest.unstable_mockModule("../src/services/auth.service.js", () => ({
  registerUser: mockRegisterUser,
  bulkRegisterUsers: mockBulkRegisterUsers,
  login: mockLogin,
  logoutUser: mockLogoutUser,
  refresh: mockRefresh,
}));

const authController = await import("../src/controllers/auth.controller.js");

const {
  register,
  bulkRegister,
  loginCtrl,
  logoutCtrl,
  refreshCtrl,
} = authController;

function mockRes(): Response {
  const res = {} as Response;
  (res.json as any) = jest.fn().mockReturnValue(res);
  (res.status as any) = jest.fn().mockReturnValue(res);
  return res;
}

describe("Auth controller mock tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a user successfully", async () => {
    const req = {
      body: {
        name: "Yoonus",
        email: "yoonus@test.com",
        role: "DRIVER",
        password: "password123",
        phone: "0771234567",
        nic: "200012345678",
      },
    } as Request;

    const res = mockRes();

    mockRegisterUser.mockResolvedValue({
      id: "u1",
      email: "yoonus@test.com",
      role: "DRIVER",
    });

    await register(req, res);

    expect(mockRegisterUser).toHaveBeenCalledWith({
      name: "Yoonus",
      email: "yoonus@test.com",
      role: "DRIVER",
      password: "password123",
      phone: "0771234567",
      nic: "200012345678",
    });

    expect(res.json).toHaveBeenCalledWith({
      id: "u1",
      email: "yoonus@test.com",
      role: "DRIVER",
    });
  });

  it("should bulk register users successfully", async () => {
    const req = {
      body: [
        {
          name: "Driver One",
          email: "driver1@test.com",
          role: "DRIVER",
          password: "password123",
          phone: "0771111111",
          nic: "200000000001",
        },
        {
          name: "Officer One",
          email: "officer1@test.com",
          role: "OFFICER",
          password: "password123",
          phone: "0772222222",
          nic: "200000000002",
        },
      ],
    } as Request;

    const res = mockRes();

    mockBulkRegisterUsers.mockResolvedValue([
      { id: "u1", email: "driver1@test.com", role: "DRIVER" },
      { id: "u2", email: "officer1@test.com", role: "OFFICER" },
    ]);

    await bulkRegister(req, res);

    expect(mockBulkRegisterUsers).toHaveBeenCalledWith([
      {
        name: "Driver One",
        email: "driver1@test.com",
        role: "DRIVER",
        password: "password123",
        phone: "0771111111",
        nic: "200000000001",
      },
      {
        name: "Officer One",
        email: "officer1@test.com",
        role: "OFFICER",
        password: "password123",
        phone: "0772222222",
        nic: "200000000002",
      },
    ]);

    expect(res.json).toHaveBeenCalledWith({
      message: "Users created successfully",
      count: 2,
      data: [
        { id: "u1", email: "driver1@test.com", role: "DRIVER" },
        { id: "u2", email: "officer1@test.com", role: "OFFICER" },
      ],
    });
  });

  it("should login a user successfully", async () => {
    const req = {
      body: {
        email: "yoonus@test.com",
        password: "password123",
      },
    } as Request;

    const res = mockRes();

    mockLogin.mockResolvedValue({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "u1",
        name: "Yoonus",
        email: "yoonus@test.com",
        role: "DRIVER",
        phone: "0771234567",
        nic: "200012345678",
      },
    });

    await loginCtrl(req, res);

    expect(mockLogin).toHaveBeenCalledWith("yoonus@test.com", "password123");

    expect(res.json).toHaveBeenCalledWith({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "u1",
        name: "Yoonus",
        email: "yoonus@test.com",
        role: "DRIVER",
        phone: "0771234567",
        nic: "200012345678",
      },
    });
  });

  it("should logout successfully", async () => {
    const req = {
      body: {
        refreshToken: "refresh-token-123456",
      },
    } as Request;

    const res = mockRes();

    mockLogoutUser.mockResolvedValue(undefined);

    await logoutCtrl(req, res);

    expect(mockLogoutUser).toHaveBeenCalledWith("refresh-token-123456");
    expect(res.json).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });

  it("should refresh token successfully", async () => {
    const req = {
      body: {
        refreshToken: "refresh-token-123456",
      },
    } as Request;

    const res = mockRes();

    mockRefresh.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    await refreshCtrl(req, res);

    expect(mockRefresh).toHaveBeenCalledWith("refresh-token-123456");
    expect(res.json).toHaveBeenCalledWith({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
  });

  it("should fail register validation for bad email", async () => {
    const req = {
      body: {
        name: "Yoonus",
        email: "bad-email",
        role: "DRIVER",
        password: "password123",
      },
    } as Request;

    const res = mockRes();

    await expect(register(req, res)).rejects.toBeDefined();
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  it("should fail login validation for short password", async () => {
    const req = {
      body: {
        email: "yoonus@test.com",
        password: "123",
      },
    } as Request;

    const res = mockRes();

    await expect(loginCtrl(req, res)).rejects.toBeDefined();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("should fail logout validation for short refresh token", async () => {
    const req = {
      body: {
        refreshToken: "123",
      },
    } as Request;

    const res = mockRes();

    await expect(logoutCtrl(req, res)).rejects.toBeDefined();
    expect(mockLogoutUser).not.toHaveBeenCalled();
  });

  it("should fail refresh validation for short refresh token", async () => {
    const req = {
      body: {
        refreshToken: "123",
      },
    } as Request;

    const res = mockRes();

    await expect(refreshCtrl(req, res)).rejects.toBeDefined();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});