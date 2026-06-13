import { HttpClient } from "@/shared/http/http.client";
import { medicalRecordService, MedicalRecordResponse } from "../medicalRecord.service";

jest.mock("@/shared/http/http.client", () => ({
  HttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedHttp = HttpClient as jest.Mocked<typeof HttpClient>;

const buildRecord = (overrides: Partial<MedicalRecordResponse> = {}): MedicalRecordResponse => ({
  id: "mr-1",
  patientId: "p-1",
  doctorId: "d-1",
  appointmentId: "apt-1",
  chiefComplaint: "Dolor de cabeza",
  symptoms: ["cefalea"],
  diagnosis: "Migraña",
  diagnosisCode: "G43",
  treatment: "Ibuprofeno",
  notes: "Control en 2 semanas",
  isSigned: false,
  signedAt: null,
  bloodPressure: "120/80",
  heartRate: 70,
  temperature: 36.5,
  weight: 70,
  height: 170,
  respiratoryRate: 16,
  oxygenSaturation: 98,
  prescriptions: [],
  createdAt: "2026-06-01",
  updatedAt: "2026-06-01",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("medicalRecordService.create", () => {
  it("POSTs /medical-records with full data", async () => {
    const data = {
      patientId: "p-1",
      doctorId: "d-1",
      chiefComplaint: "Dolor",
      symptoms: ["x"],
      diagnosis: "Dx",
      treatment: "Tx",
      notes: "n",
    };
    mockedHttp.post.mockResolvedValueOnce(buildRecord());
    await medicalRecordService.create(data);
    expect(mockedHttp.post).toHaveBeenCalledWith("/medical-records", data, { requireAuth: true });
  });
});

describe("medicalRecordService.update", () => {
  it("PUTs /medical-records/:id with partial update", async () => {
    const data = { diagnosis: "Nuevo dx" };
    mockedHttp.put.mockResolvedValueOnce(buildRecord({ diagnosis: "Nuevo dx" }));
    await medicalRecordService.update("mr-1", data);
    expect(mockedHttp.put).toHaveBeenCalledWith("/medical-records/mr-1", data, { requireAuth: true });
  });
});

describe("medicalRecordService.getById", () => {
  it("GETs /medical-records/:id", async () => {
    mockedHttp.get.mockResolvedValueOnce(buildRecord());
    await medicalRecordService.getById("mr-1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/medical-records/mr-1", {}, { requireAuth: true });
  });
});

describe("medicalRecordService.getByPatient", () => {
  it("GETs /medical-records/patient/:id", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await medicalRecordService.getByPatient("p-1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/medical-records/patient/p-1", {}, { requireAuth: true });
  });
});

describe("medicalRecordService.getByDoctor", () => {
  it("GETs /medical-records/doctor/:id", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await medicalRecordService.getByDoctor("d-1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/medical-records/doctor/d-1", {}, { requireAuth: true });
  });
});

describe("medicalRecordService.getByAppointment", () => {
  it("GETs /medical-records/appointment/:id (can return null)", async () => {
    mockedHttp.get.mockResolvedValueOnce(null);
    const result = await medicalRecordService.getByAppointment("apt-1");
    expect(mockedHttp.get).toHaveBeenCalledWith("/medical-records/appointment/apt-1", {}, { requireAuth: true });
    expect(result).toBeNull();
  });
});

describe("medicalRecordService.getMyRecords", () => {
  it("GETs /medical-records/me", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await medicalRecordService.getMyRecords();
    expect(mockedHttp.get).toHaveBeenCalledWith("/medical-records/me", {}, { requireAuth: true });
  });
});

describe("medicalRecordService.sign", () => {
  it("PUTs /medical-records/:id/sign with { signed: true } body", async () => {
    mockedHttp.put.mockResolvedValueOnce(buildRecord({ isSigned: true }));
    await medicalRecordService.sign("mr-1");
    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/medical-records/mr-1/sign",
      { signed: true },
      { requireAuth: true },
    );
  });
});

describe("medicalRecordService.delete", () => {
  it("DELETEs /medical-records/:id", async () => {
    mockedHttp.delete.mockResolvedValueOnce(undefined);
    await medicalRecordService.delete("mr-1");
    expect(mockedHttp.delete).toHaveBeenCalledWith("/medical-records/mr-1", { requireAuth: true });
  });
});
