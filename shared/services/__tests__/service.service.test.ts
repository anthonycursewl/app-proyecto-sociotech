import { HttpClient } from "@/shared/http/http.client";
import { serviceService, ServiceResponse } from "../service.service";

jest.mock("@/shared/http/http.client", () => ({
  HttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedHttp = HttpClient as jest.Mocked<typeof HttpClient>;

const buildService = (overrides: Partial<ServiceResponse> = {}): ServiceResponse => ({
  id: "s-1",
  name: "Consulta",
  description: "General",
  durationMin: 30,
  price: 1500,
  isActive: true,
  createdBy: "u-1",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("serviceService.getAll", () => {
  it("GETs /services with no params when called without arguments", async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: [], nextCursor: null });
    await serviceService.getAll();
    expect(mockedHttp.get).toHaveBeenCalledWith("/services", undefined, { requireAuth: true });
  });

  it("passes through cursor, limit, and includeInactive params", async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: [], nextCursor: null });
    await serviceService.getAll({ cursor: "abc", limit: 10, includeInactive: true });
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/services",
      { cursor: "abc", limit: 10, includeInactive: true },
      { requireAuth: true },
    );
  });
});

describe("serviceService.getByDoctorId", () => {
  it("GETs /services/doctor/:id", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await serviceService.getByDoctorId("d-1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/services/doctor/d-1", {}, { requireAuth: true });
  });
});

describe("serviceService.getAllPublic", () => {
  it("GETs /public/services with optional params", async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: [], nextCursor: null });
    await serviceService.getAllPublic({ limit: 20 });
    expect(mockedHttp.get).toHaveBeenCalledWith("/public/services", { limit: 20 }, { requireAuth: true });
  });

  it("GETs /public/services with no params when called without arguments", async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: [], nextCursor: null });
    await serviceService.getAllPublic();
    expect(mockedHttp.get).toHaveBeenCalledWith("/public/services", undefined, { requireAuth: true });
  });
});

describe("serviceService.getByDoctorPublic", () => {
  it("GETs /public/services with doctorId param and returns paginated response", async () => {
    const paginated = { data: [buildService()], nextCursor: null };
    mockedHttp.get.mockResolvedValueOnce(paginated);
    const result = await serviceService.getByDoctorPublic("d-1");
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/public/services",
      { doctorId: "d-1", limit: 1000 },
      { requireAuth: true },
    );
    expect(result.data.length).toBe(1);
    expect(result.nextCursor).toBeNull();
  });
});

describe("serviceService.getByDoctorPublicPaginated", () => {
  it("GETs /public/services with doctorId and limit for first page", async () => {
    const paginated = { data: [buildService()], nextCursor: "cursor-abc" };
    mockedHttp.get.mockResolvedValueOnce(paginated);
    const result = await serviceService.getByDoctorPublicPaginated("d-1", { limit: 20 });
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/public/services",
      { doctorId: "d-1", limit: 20 },
      { requireAuth: true },
    );
    expect(result.data.length).toBe(1);
    expect(result.nextCursor).toBe("cursor-abc");
  });

  it("passes cursor for subsequent pages", async () => {
    const paginated = { data: [buildService()], nextCursor: null };
    mockedHttp.get.mockResolvedValueOnce(paginated);
    await serviceService.getByDoctorPublicPaginated("d-1", { cursor: "cursor-abc", limit: 20 });
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/public/services",
      { doctorId: "d-1", cursor: "cursor-abc", limit: 20 },
      { requireAuth: true },
    );
  });
});

describe("serviceService.getById", () => {
  it("GETs /services/:id", async () => {
    mockedHttp.get.mockResolvedValueOnce(buildService());
    await serviceService.getById("s-1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/services/s-1", {}, { requireAuth: true });
  });
});

describe("serviceService.create", () => {
  it("POSTs /services with name, description, durationMin, price", async () => {
    const data = { name: "Consulta", description: "General", durationMin: 30, price: 1500 };
    mockedHttp.post.mockResolvedValueOnce(buildService());
    await serviceService.create(data);
    expect(mockedHttp.post).toHaveBeenCalledWith("/services", data, { requireAuth: true });
  });
});

describe("serviceService.update", () => {
  it("PUTs /services/:id with partial data including isActive", async () => {
    const data = { price: 2000, isActive: false };
    mockedHttp.put.mockResolvedValueOnce(buildService({ price: 2000, isActive: false }));
    await serviceService.update("s-1", data);
    expect(mockedHttp.put).toHaveBeenCalledWith("/services/s-1", data, { requireAuth: true });
  });
});

describe("serviceService.deactivate", () => {
  it("DELETEs /services/:id (soft delete)", async () => {
    mockedHttp.delete.mockResolvedValueOnce({ message: "Service deactivated successfully" });
    await serviceService.deactivate("s-1");
    expect(mockedHttp.delete).toHaveBeenCalledWith("/services/s-1", { requireAuth: true });
  });
});

describe("serviceService.restore", () => {
  it("POSTs /services/:id/restore", async () => {
    mockedHttp.post.mockResolvedValueOnce(buildService({ isActive: true }));
    await serviceService.restore("s-1");
    expect(mockedHttp.post).toHaveBeenCalledWith("/services/s-1/restore", {}, { requireAuth: true });
  });
});
