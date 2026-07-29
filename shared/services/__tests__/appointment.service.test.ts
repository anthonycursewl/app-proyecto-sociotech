import { HttpClient } from "@/shared/http/http.client";
import { appointmentService } from "../appointment.service";

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

describe("appointmentService.getAvailableSlots", () => {
  it("GETs /appointments/available-slots with doctor, service and date params", async () => {
    const mockResponse = { slots: ["09:00", "10:00"] };
    mockedHttp.get.mockResolvedValueOnce(mockResponse);

    const result = await appointmentService.getAvailableSlots("d1", "s1", "2026-06-15");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/appointments/available-slots",
      { doctorId: "d1", serviceId: "s1", date: "2026-06-15" },
      { requireAuth: true },
    );
    expect(result).toEqual(mockResponse);
  });
});

describe("appointmentService.getMonthlyAvailability", () => {
  it("GETs /appointments/available-slots/month with year and month", async () => {
    const mockResponse = { days: [{ date: "2026-06-15", availableSlots: 5 }] };
    mockedHttp.get.mockResolvedValueOnce(mockResponse);

    const result = await appointmentService.getMonthlyAvailability("d1", "s1", 2026, 6);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/appointments/available-slots/month",
      { doctorId: "d1", serviceId: "s1", year: 2026, month: 6 },
      { requireAuth: true },
    );
    expect(result).toEqual(mockResponse);
  });
});

describe("appointmentService.create", () => {
  it("POSTs /appointments with create data", async () => {
    const data = {
      doctorId: "d1",
      serviceId: "s1",
      scheduledAt: "2026-06-15T10:00:00.000Z",
      reason: "Chequeo",
    };
    const mockResponse = { id: "apt1" } as any;
    mockedHttp.post.mockResolvedValueOnce(mockResponse);

    const result = await appointmentService.create(data);

    expect(mockedHttp.post).toHaveBeenCalledWith("/appointments", data, { requireAuth: true });
    expect(result).toEqual(mockResponse);
  });
});

describe("appointmentService.getMyAppointments", () => {
  it("GETs /appointments/me with default filter 'upcoming'", async () => {
    const mockResponse: any[] = [];
    mockedHttp.get.mockResolvedValueOnce(mockResponse);

    const result = await appointmentService.getMyAppointments();

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/appointments/me",
      { filter: "upcoming" },
      { requireAuth: true },
    );
    expect(result).toEqual(mockResponse);
  });

  it("passes through the filter param when provided", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await appointmentService.getMyAppointments("pending");
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/appointments/me",
      { filter: "pending" },
      { requireAuth: true },
    );
  });
});

describe("appointmentService.getAll", () => {
  it("GETs /appointments with default filter and no doctorId", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await appointmentService.getAll();

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/appointments",
      { filter: "upcoming" },
      { requireAuth: true },
    );
  });

  it("includes doctorId in params when provided", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await appointmentService.getAll("pending", "d1");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/appointments",
      { filter: "pending", doctorId: "d1" },
      { requireAuth: true },
    );
  });

  it("omits doctorId when empty string is passed", async () => {
    mockedHttp.get.mockResolvedValueOnce([]);
    await appointmentService.getAll("upcoming", "");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/appointments",
      { filter: "upcoming" },
      { requireAuth: true },
    );
  });
});

describe("appointmentService.getById", () => {
  it("GETs /appointments/:id with no params", async () => {
    const mockResponse = { id: "apt1" } as any;
    mockedHttp.get.mockResolvedValueOnce(mockResponse);

    const result = await appointmentService.getById("apt1");

    expect(mockedHttp.get).toHaveBeenCalledWith("/appointments/apt1", {}, { requireAuth: true });
    expect(result).toEqual(mockResponse);
  });
});

describe("appointmentService.cancel", () => {
  it("PUTs /appointments/:id/cancel with no body when no data provided", async () => {
    mockedHttp.put.mockResolvedValueOnce({} as any);
    await appointmentService.cancel("apt1");

    expect(mockedHttp.put).toHaveBeenCalledWith("/appointments/apt1/cancel", undefined, {
      requireAuth: true,
    });
  });

  it("PUTs /appointments/:id/cancel with reason when data provided", async () => {
    mockedHttp.put.mockResolvedValueOnce({} as any);
    await appointmentService.cancel("apt1", { reason: "Enfermedad" });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/appointments/apt1/cancel",
      { reason: "Enfermedad" },
      { requireAuth: true },
    );
  });
});

describe("appointmentService.doctorCancel", () => {
  it("PUTs /appointments/:id/doctor-cancel", async () => {
    mockedHttp.put.mockResolvedValueOnce({} as any);
    await appointmentService.doctorCancel("apt1", { reason: "Doctor ausente" });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/appointments/apt1/doctor-cancel",
      { reason: "Doctor ausente" },
      { requireAuth: true },
    );
  });
});

describe("appointmentService.confirm", () => {
  it("PUTs /appointments/:id/confirm with undefined body", async () => {
    mockedHttp.put.mockResolvedValueOnce({} as any);
    await appointmentService.confirm("apt1");

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/appointments/apt1/confirm",
      undefined,
      { requireAuth: true },
    );
  });
});

describe("appointmentService.complete", () => {
  it("PUTs /appointments/:id/complete", async () => {
    mockedHttp.put.mockResolvedValueOnce({} as any);
    await appointmentService.complete("apt1");

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/appointments/apt1/complete",
      undefined,
      { requireAuth: true },
    );
  });
});

describe("appointmentService.markNoShow", () => {
  it("PUTs /appointments/:id/no-show", async () => {
    mockedHttp.put.mockResolvedValueOnce({} as any);
    await appointmentService.markNoShow("apt1");

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/appointments/apt1/no-show",
      undefined,
      { requireAuth: true },
    );
  });
});

describe("appointmentService.reschedule", () => {
  it("PUTs /appointments/:id/reschedule with scheduledAt, reason, and notes", async () => {
    mockedHttp.put.mockResolvedValueOnce({} as any);
    await appointmentService.reschedule("apt1", {
      scheduledAt: "2026-07-01T10:00:00.000Z",
      reason: "Cambio de horario",
      notes: "Preferencia turno mañana",
    });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/appointments/apt1/reschedule",
      {
        scheduledAt: "2026-07-01T10:00:00.000Z",
        reason: "Cambio de horario",
        notes: "Preferencia turno mañana",
      },
      { requireAuth: true },
    );
  });
});
