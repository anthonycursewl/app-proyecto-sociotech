import { HttpClient } from "@/shared/http/http.client";
import { patientService } from "../patient.service";

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

describe("patientService.getMetrics", () => {
  it("GETs /patients/metrics with requireAuth", async () => {
    const mock = { totalActive: 10, totalInactive: 2, totalNew: 3, updatedAt: "2026-06-01" };
    mockedHttp.get.mockResolvedValueOnce(mock);

    const result = await patientService.getMetrics();

    expect(mockedHttp.get).toHaveBeenCalledWith("/patients/metrics", {}, { requireAuth: true });
    expect(result).toEqual(mock);
  });
});

describe("patientService.getAll", () => {
  it("GETs /patients/list with no params when called without arguments", async () => {
    mockedHttp.get.mockResolvedValueOnce({ patients: [], nextCursor: null, hasNext: false });
    await patientService.getAll();

    expect(mockedHttp.get).toHaveBeenCalledWith("/patients/list", undefined, { requireAuth: true });
  });

  it("passes through cursor, limit and isActive params", async () => {
    mockedHttp.get.mockResolvedValueOnce({ patients: [], nextCursor: null, hasNext: false });
    await patientService.getAll({ cursor: "abc", limit: 50, isActive: true });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/patients/list",
      { cursor: "abc", limit: 50, isActive: true },
      { requireAuth: true },
    );
  });
});

describe("patientService.getById", () => {
  it("GETs /patients/:id", async () => {
    const mock = { id: "p1" } as any;
    mockedHttp.get.mockResolvedValueOnce(mock);
    const result = await patientService.getById("p1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/patients/p1", {}, { requireAuth: true });
    expect(result).toEqual(mock);
  });
});

describe("patientService.search", () => {
  it("GETs /patients/search with the q param", async () => {
    const mock = [{ id: "p1" }];
    mockedHttp.get.mockResolvedValueOnce(mock);
    const result = await patientService.search("juan");
    expect(mockedHttp.get).toHaveBeenCalledWith("/patients/search", { q: "juan" }, { requireAuth: true });
    expect(result).toEqual(mock);
  });
});

describe("patientService.getMyProfile", () => {
  it("GETs /patients/me", async () => {
    mockedHttp.get.mockResolvedValueOnce({ id: "p1" });
    await patientService.getMyProfile();
    expect(mockedHttp.get).toHaveBeenCalledWith("/patients/me", {}, { requireAuth: true });
  });
});

describe("patientService.createMyProfile", () => {
  it("POSTs /patients/me with profile data", async () => {
    const data = { cedula: "001-1234567-8", dateOfBirth: "1990-01-01", phone: "+18095551111", address: "Calle 1", emergencyContact: "Madre", emergencyPhone: "+18095552222" };
    mockedHttp.post.mockResolvedValueOnce({ id: "p1" });
    await patientService.createMyProfile(data);
    expect(mockedHttp.post).toHaveBeenCalledWith("/patients/me", data, { requireAuth: true });
  });
});

describe("patientService.updateMyProfile", () => {
  it("PUTs /patients/me with partial update data", async () => {
    const data = { phone: "+18095553333" };
    mockedHttp.put.mockResolvedValueOnce({ id: "p1" });
    await patientService.updateMyProfile(data);
    expect(mockedHttp.put).toHaveBeenCalledWith("/patients/me", data, { requireAuth: true });
  });
});
