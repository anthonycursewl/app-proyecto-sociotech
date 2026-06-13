import { HttpClient } from "@/shared/http/http.client";
import { doctorService, DoctorDetailResponse, CreateDoctorData, CreateScheduleData } from "../doctor.service";

jest.mock("@/shared/http/http.client", () => ({
  HttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedHttp = HttpClient as jest.Mocked<typeof HttpClient>;

const buildDetailResponse = (overrides: Partial<DoctorDetailResponse> = {}): DoctorDetailResponse => ({
  id: "d-1",
  userId: "u-1",
  specialty: "Cardio",
  licenseNumber: "LIC-001",
  firstName: "María",
  lastName: "García",
  email: "maria@h.com",
  consultationPrice: 1500,
  phoneNumber: "+18095551111",
  isActive: true,
  biography: null,
  schedules: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  doctorService.invalidateGetByIdCache();
});

describe("doctorService profile methods", () => {
  it("getMyProfile GETs /doctors/me/profile", async () => {
    mockedHttp.get.mockResolvedValueOnce(buildDetailResponse());
    await doctorService.getMyProfile();
    expect(mockedHttp.get).toHaveBeenCalledWith("/doctors/me/profile", {}, { requireAuth: true });
  });

  it("createMyProfile POSTs to /doctors/profile (not /me)", async () => {
    const data: CreateDoctorData = { consultationPrice: 1500 };
    mockedHttp.post.mockResolvedValueOnce(buildDetailResponse());
    await doctorService.createMyProfile(data);
    expect(mockedHttp.post).toHaveBeenCalledWith("/doctors/profile", data, { requireAuth: true });
  });

  it("updateMyProfile PUTs /doctors/me/profile and clears the getById cache", async () => {
    const data = { consultationPrice: 2000 };
    mockedHttp.put.mockResolvedValueOnce(buildDetailResponse());

    await doctorService.updateMyProfile(data);

    expect(mockedHttp.put).toHaveBeenCalledWith("/doctors/me/profile", data, { requireAuth: true });
  });
});

describe("doctorService schedule methods", () => {
  it("listMySchedules GETs /doctors/me/schedules", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await doctorService.listMySchedules();
    expect(mockedHttp.get).toHaveBeenCalledWith("/doctors/me/schedules", {}, { requireAuth: true });
  });

  it("createSchedule POSTs /doctors/me/schedules", async () => {
    const data: CreateScheduleData = { dayOfWeek: 1, startTime: "08:00", endTime: "16:00" };
    mockedHttp.post.mockResolvedValueOnce({ id: "s1" });
    await doctorService.createSchedule(data);
    expect(mockedHttp.post).toHaveBeenCalledWith("/doctors/me/schedules", data, { requireAuth: true });
  });

  it("updateSchedule PUTs /doctors/me/schedules/:id", async () => {
    mockedHttp.put.mockResolvedValueOnce({ id: "s1" });
    await doctorService.updateSchedule("s1", { isActive: false });
    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/doctors/me/schedules/s1",
      { isActive: false },
      { requireAuth: true },
    );
  });

  it("deleteSchedule DELETEs /doctors/me/schedules/:id", async () => {
    mockedHttp.delete.mockResolvedValueOnce({ success: true });
    await doctorService.deleteSchedule("s1");
    expect(mockedHttp.delete).toHaveBeenCalledWith("/doctors/me/schedules/s1", { requireAuth: true });
  });
});

describe("doctorService list/detail methods", () => {
  it("listAll GETs /doctors", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await doctorService.listAll();
    expect(mockedHttp.get).toHaveBeenCalledWith("/doctors", {}, { requireAuth: true });
  });

  it("getAll GETs /doctors/list with params", async () => {
    mockedHttp.get.mockResolvedValueOnce({ doctors: [], nextCursor: null, hasNext: false });
    await doctorService.getAll({ isActive: true, limit: 20 });
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/doctors/list",
      { isActive: true, limit: 20 },
      { requireAuth: true },
    );
  });

  describe("getById with 30s cache", () => {
    it("fetches from API on first call", async () => {
      const data = buildDetailResponse();
      mockedHttp.get.mockResolvedValueOnce(data);

      const result = await doctorService.getById("d-1");

      expect(mockedHttp.get).toHaveBeenCalledTimes(1);
      expect(mockedHttp.get).toHaveBeenCalledWith("/doctors/d-1", {}, { requireAuth: true });
      expect(result).toEqual(data);
    });

    it("returns cached data on second call within TTL (no extra HTTP call)", async () => {
      const data = buildDetailResponse();
      mockedHttp.get.mockResolvedValueOnce(data);

      await doctorService.getById("d-1");
      const result2 = await doctorService.getById("d-1");

      expect(mockedHttp.get).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(data);
    });

    it("does not share cache between different doctor ids", async () => {
      mockedHttp.get.mockResolvedValueOnce(buildDetailResponse({ id: "d-1" }));
      mockedHttp.get.mockResolvedValueOnce(buildDetailResponse({ id: "d-2" }));

      await doctorService.getById("d-1");
      await doctorService.getById("d-2");

      expect(mockedHttp.get).toHaveBeenCalledTimes(2);
    });

    it("updateMyProfile clears the cache (next getById re-fetches)", async () => {
      const data1 = buildDetailResponse({ id: "d-1", consultationPrice: 1000 });
      const data2 = buildDetailResponse({ id: "d-1", consultationPrice: 2000 });
      mockedHttp.get.mockResolvedValueOnce(data1);

      await doctorService.getById("d-1");

      mockedHttp.put.mockResolvedValueOnce(data2);
      await doctorService.updateMyProfile({ consultationPrice: 2000 });

      mockedHttp.get.mockResolvedValueOnce(data2);
      const result = await doctorService.getById("d-1");

      expect(mockedHttp.get).toHaveBeenCalledTimes(2);
      expect(result.consultationPrice).toBe(2000);
    });

    it("invalidateGetByIdCache clears the cache directly", async () => {
      const data = buildDetailResponse();
      mockedHttp.get.mockResolvedValueOnce(data);

      await doctorService.getById("d-1");
      doctorService.invalidateGetByIdCache();

      mockedHttp.get.mockResolvedValueOnce(data);
      await doctorService.getById("d-1");

      expect(mockedHttp.get).toHaveBeenCalledTimes(2);
    });
  });

  it("getMetrics GETs /doctors/metrics", async () => {
    mockedHttp.get.mockResolvedValueOnce({ totalActive: 0, totalInactive: 0, totalPatients: 0, updatedAt: "2026-01-01" });
    await doctorService.getMetrics();
    expect(mockedHttp.get).toHaveBeenCalledWith("/doctors/metrics", {}, { requireAuth: true });
  });

  it("getDoctorSchedules GETs /doctor-schedules/doctor/:id", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await doctorService.getDoctorSchedules("d-1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/doctor-schedules/doctor/d-1", {}, { requireAuth: true });
  });
});

describe("doctorService public methods", () => {
  it("getAllPublic GETs /public/doctors", async () => {
    mockedHttp.get.mockResolvedValueOnce({ doctors: [], nextCursor: null, hasNext: false });
    await doctorService.getAllPublic({ limit: 20 });
    expect(mockedHttp.get).toHaveBeenCalledWith("/public/doctors", { limit: 20 }, { requireAuth: true });
  });

  it("getByIdPublic GETs /public/doctors/:id (does NOT use cache)", async () => {
    const data = buildDetailResponse();
    mockedHttp.get.mockResolvedValue(data);

    await doctorService.getByIdPublic("d-1");
    await doctorService.getByIdPublic("d-1");

    expect(mockedHttp.get).toHaveBeenCalledTimes(2);
    expect(mockedHttp.get).toHaveBeenCalledWith("/public/doctors/d-1", {}, { requireAuth: true });
  });

  it("getSchedulesPublic GETs /public/doctors/:id/schedules", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await doctorService.getSchedulesPublic("d-1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/public/doctors/d-1/schedules", {}, { requireAuth: true });
  });
});
