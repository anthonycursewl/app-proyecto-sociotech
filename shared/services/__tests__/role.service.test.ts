import { HttpClient } from "@/shared/http/http.client";
import { roleService } from "../role.service";

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

describe("roleService.listAdmin", () => {
  it("GETs /roles with no params when called without arguments", async () => {
    mockedHttp.get.mockResolvedValueOnce({ roles: [], nextCursor: null, hasNext: false });
    await roleService.listAdmin();
    expect(mockedHttp.get).toHaveBeenCalledWith("/roles", undefined, { requireAuth: true });
  });

  it("passes through cursor and limit", async () => {
    mockedHttp.get.mockResolvedValueOnce({ roles: [], nextCursor: null, hasNext: false });
    await roleService.listAdmin({ cursor: "x", limit: 20 });
    expect(mockedHttp.get).toHaveBeenCalledWith("/roles", { cursor: "x", limit: 20 }, { requireAuth: true });
  });
});

describe("roleService.getById", () => {
  it("GETs /roles/:id with undefined params", async () => {
    mockedHttp.get.mockResolvedValueOnce({ id: "r-1" });
    await roleService.getById("r-1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/roles/r-1", undefined, { requireAuth: true });
  });
});

describe("roleService.listAllPermissions", () => {
  it("GETs /roles/permissions with undefined params", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await roleService.listAllPermissions();
    expect(mockedHttp.get).toHaveBeenCalledWith("/roles/permissions", undefined, { requireAuth: true });
  });
});

describe("roleService.create", () => {
  it("POSTs /roles with name and optional description", async () => {
    mockedHttp.post.mockResolvedValueOnce({ id: "r-1" });
    await roleService.create({ name: "Custom", description: "desc" });
    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/roles",
      { name: "Custom", description: "desc" },
      { requireAuth: true },
    );
  });
});

describe("roleService.update", () => {
  it("PUTs /roles/:id with description", async () => {
    mockedHttp.put.mockResolvedValueOnce({ id: "r-1" });
    await roleService.update("r-1", { description: "new desc" });
    expect(mockedHttp.put).toHaveBeenCalledWith("/roles/r-1", { description: "new desc" }, { requireAuth: true });
  });
});

describe("roleService.delete", () => {
  it("DELETEs /roles/:id", async () => {
    mockedHttp.delete.mockResolvedValueOnce(undefined);
    await roleService.delete("r-1");
    expect(mockedHttp.delete).toHaveBeenCalledWith("/roles/r-1", { requireAuth: true });
  });
});

describe("roleService.getTrash", () => {
  it("GETs /roles/trash", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await roleService.getTrash();
    expect(mockedHttp.get).toHaveBeenCalledWith("/roles/trash", undefined, { requireAuth: true });
  });
});

describe("roleService.restore", () => {
  it("POSTs /roles/trash/:id/restore with undefined body", async () => {
    mockedHttp.post.mockResolvedValueOnce({ id: "r-1" });
    await roleService.restore("r-1");
    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/roles/trash/r-1/restore",
      undefined,
      { requireAuth: true },
    );
  });
});

describe("roleService.deletePermanent", () => {
  it("DELETEs /roles/trash/:id/permanent", async () => {
    mockedHttp.delete.mockResolvedValueOnce(undefined);
    await roleService.deletePermanent("r-1");
    expect(mockedHttp.delete).toHaveBeenCalledWith("/roles/trash/r-1/permanent", { requireAuth: true });
  });
});

describe("roleService.addPermission", () => {
  it("POSTs /roles/:id/permissions with permissionId", async () => {
    mockedHttp.post.mockResolvedValueOnce({ id: "r-1" });
    await roleService.addPermission("r-1", { permissionId: "p-1" });
    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/roles/r-1/permissions",
      { permissionId: "p-1" },
      { requireAuth: true },
    );
  });
});

describe("roleService.replacePermissions", () => {
  it("PUTs /roles/:id/permissions with permissionIds array", async () => {
    mockedHttp.put.mockResolvedValueOnce({ id: "r-1" });
    await roleService.replacePermissions("r-1", { permissionIds: ["p-1", "p-2"] });
    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/roles/r-1/permissions",
      { permissionIds: ["p-1", "p-2"] },
      { requireAuth: true },
    );
  });
});

describe("roleService.removePermission", () => {
  it("DELETEs /roles/:id/permissions/:permissionId", async () => {
    mockedHttp.delete.mockResolvedValueOnce({ id: "r-1" });
    await roleService.removePermission("r-1", "p-1");
    expect(mockedHttp.delete).toHaveBeenCalledWith(
      "/roles/r-1/permissions/p-1",
      { requireAuth: true },
    );
  });
});
