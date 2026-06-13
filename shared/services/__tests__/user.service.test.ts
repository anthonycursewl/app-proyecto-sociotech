import { HttpClient } from "@/shared/http/http.client";
import { userService } from "../user.service";

jest.mock("@/shared/http/http.client", () => ({
  HttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedHttp = HttpClient as jest.Mocked<typeof HttpClient>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("userService.listAdmin", () => {
  it("GETs /users/admin/list with no params when called without arguments", async () => {
    mockedHttp.get.mockResolvedValueOnce({ users: [], nextCursor: null, hasNext: false });
    await userService.listAdmin();
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/users/admin/list",
      undefined,
      { requireAuth: true },
    );
  });

  it("passes through cursor, limit, isActive params", async () => {
    mockedHttp.get.mockResolvedValueOnce({ users: [], nextCursor: null, hasNext: false });
    await userService.listAdmin({ cursor: "x", limit: 50, isActive: true });
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/users/admin/list",
      { cursor: "x", limit: 50, isActive: true },
      { requireAuth: true },
    );
  });
});

describe("userService.toggleActive", () => {
  it("PUTs /users/admin/:id/toggle-active with empty body", async () => {
    const mock = { user: { id: "u-1" } } as any;
    mockedHttp.put.mockResolvedValueOnce(mock);
    const result = await userService.toggleActive("u-1");

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/users/admin/u-1/toggle-active",
      {},
      { requireAuth: true },
    );
    expect(result).toEqual(mock);
  });
});

describe("userService.assignRole", () => {
  it("PUTs /users/admin/:id/role with roleId body", async () => {
    const mock = { user: { id: "u-1" } } as any;
    mockedHttp.put.mockResolvedValueOnce(mock);
    const result = await userService.assignRole("u-1", "r-2");

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/users/admin/u-1/role",
      { roleId: "r-2" },
      { requireAuth: true },
    );
    expect(result).toEqual(mock);
  });
});
