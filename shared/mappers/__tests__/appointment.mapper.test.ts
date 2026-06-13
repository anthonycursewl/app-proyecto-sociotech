import { Appointment, AppointmentStatus, DoctorSummary, ServiceSummary } from "@/shared/services/appointment.service";
import { mapToAppointmentData, mapToAdminAppointmentData } from "../appointment.mapper";

const baseDoctor: DoctorSummary = {
  id: "d1",
  firstName: "María",
  lastName: "García",
  fullName: "Dra. María García",
  specialty: "Cardiología",
  phoneNumber: "+18095551111",
};

const baseService: ServiceSummary = {
  id: "s1",
  name: "Consulta general",
  description: "Consulta médica general",
  durationMin: 30,
  price: 1500,
};

const buildAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: "apt-1",
  patientId: "p1",
  doctorId: "d1",
  serviceId: "s1",
  scheduledAt: "2026-06-10T14:30:00.000Z",
  timeSlot: "10:30",
  durationMinutes: 30,
  status: "SCHEDULED",
  reason: "Chequeo anual",
  notes: "Paciente recurrente",
  cancellation: null,
  doctor: baseDoctor,
  service: baseService,
  patient: {
    id: "p1",
    userId: "u1",
    firstName: "Juan",
    lastName: "Pérez",
    fullName: "Juan Pérez",
    email: "juan@test.com",
    phone: "+18095552222",
    medicalId: "HM-0001",
    cedula: "001-1234567-8",
  },
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  ...overrides,
});

describe("mapToAppointmentData", () => {
  describe("status mapping (STATUS_MAP)", () => {
    const cases: [AppointmentStatus, "pending" | "confirmed" | "completed" | "cancelled"][] = [
      ["SCHEDULED", "pending"],
      ["CONFIRMED", "confirmed"],
      ["COMPLETED", "completed"],
      ["CANCELLED", "cancelled"],
      ["NO_SHOW", "cancelled"],
    ];

    it.each(cases)("maps %s to %s", (apiStatus, expected) => {
      const result = mapToAppointmentData(buildAppointment({ status: apiStatus }));
      expect(result.status).toBe(expected);
    });

    it("falls back to 'pending' for unknown status", () => {
      const result = mapToAppointmentData(
        buildAppointment({ status: "UNKNOWN" as AppointmentStatus })
      );
      expect(result.status).toBe("pending");
    });
  });

  describe("scheduledAt splitting", () => {
    it("extracts date (YYYY-MM-DD) and uses timeSlot when scheduledAt is valid", () => {
      const result = mapToAppointmentData(
        buildAppointment({ scheduledAt: "2026-06-10T14:30:00.000Z", timeSlot: "10:30" })
      );
      expect(result.date).toBe("2026-06-10");
      expect(result.time).toBe("10:30");
    });

    it("extracts time from scheduledAt when timeSlot is undefined", () => {
      const result = mapToAppointmentData(
        buildAppointment({
          scheduledAt: "2026-06-10T14:30:00.000Z",
          timeSlot: undefined,
        })
      );
      expect(result.time).not.toBe("—");
      expect(result.time).toMatch(/^\d{2}:\d{2}$/);
    });

    it("uses em-dash placeholders when scheduledAt is null", () => {
      const result = mapToAppointmentData(
        buildAppointment({ scheduledAt: null as unknown as string, timeSlot: "10:30" })
      );
      expect(result.date).toBe("—");
      expect(result.time).toBe("10:30");
    });

    it("uses em-dash for both when scheduledAt is null and timeSlot is missing", () => {
      const result = mapToAppointmentData(
        buildAppointment({ scheduledAt: null as unknown as string, timeSlot: undefined })
      );
      expect(result.date).toBe("—");
      expect(result.time).toBe("—");
    });

    it("uses first 10 chars of scheduledAt when date is invalid", () => {
      const result = mapToAppointmentData(
        buildAppointment({ scheduledAt: "not-a-date-1234567", timeSlot: undefined })
      );
      expect(result.date).toBe("not-a-date");
      expect(result.time).toBe("00:00");
    });
  });

  describe("duration fallback", () => {
    it("uses service.durationMin when available", () => {
      const result = mapToAppointmentData(
        buildAppointment({ durationMinutes: 60, service: { ...baseService, durationMin: 45 } })
      );
      expect(result.durationMin).toBe(45);
    });

    it("falls back to durationMinutes when service is null", () => {
      const result = mapToAppointmentData(
        buildAppointment({ durationMinutes: 60, service: null })
      );
      expect(result.durationMin).toBe(60);
    });

    it("falls back to durationMinutes when service.durationMin is undefined", () => {
      const result = mapToAppointmentData(
        buildAppointment({
          durationMinutes: 60,
          service: { ...baseService, durationMin: undefined as unknown as number },
        })
      );
      expect(result.durationMin).toBe(60);
    });
  });

  describe("nested object fallbacks", () => {
    it("uses 'Profesional no disponible' when doctor is null", () => {
      const result = mapToAppointmentData(buildAppointment({ doctor: null }));
      expect(result.doctorName).toBe("Profesional no disponible");
      expect(result.doctorSpecialty).toBeNull();
      expect(result.doctorPhone).toBeNull();
    });

    it("uses 'Servicio no disponible' when service is null", () => {
      const result = mapToAppointmentData(buildAppointment({ service: null }));
      expect(result.serviceName).toBe("Servicio no disponible");
      expect(result.serviceDescription).toBeNull();
      expect(result.servicePrice).toBeNull();
    });

    it("preserves patientName as 'Tú' regardless of patient data", () => {
      const result = mapToAppointmentData(buildAppointment());
      expect(result.patientName).toBe("Tú");
    });

    it("preserves reason and notes as-is", () => {
      const result = mapToAppointmentData(
        buildAppointment({ reason: "Dolor", notes: "Nota clínica" })
      );
      expect(result.reason).toBe("Dolor");
      expect(result.notes).toBe("Nota clínica");
    });

    it("preserves null notes", () => {
      const result = mapToAppointmentData(buildAppointment({ notes: null }));
      expect(result.notes).toBeNull();
    });
  });
});

describe("mapToAdminAppointmentData", () => {
  it("extends base mapping with patient details from populated patient", () => {
    const result = mapToAdminAppointmentData(buildAppointment());
    expect(result.patientId).toBe("p1");
    expect(result.patientName).toBe("Juan Pérez");
    expect(result.patientPhone).toBe("+18095552222");
  });

  it("falls back to 'Paciente' when patient is null", () => {
    const result = mapToAdminAppointmentData(
      buildAppointment({ patient: null })
    );
    expect(result.patientName).toBe("Paciente");
    expect(result.patientPhone).toBeNull();
  });

  it("preserves cancellation object when present", () => {
    const cancellation = {
      cancelledAt: "2026-06-05T10:00:00.000Z",
      cancelledBy: "u-doctor",
      cancellationReason: "Paciente enfermo",
    };
    const result = mapToAdminAppointmentData(
      buildAppointment({ cancellation })
    );
    expect(result.cancellation).toEqual(cancellation);
  });

  it("keeps cancellation as null when not set", () => {
    const result = mapToAdminAppointmentData(buildAppointment({ cancellation: null }));
    expect(result.cancellation).toBeNull();
  });

  it("inherits doctor/service/date/time/status from base mapping", () => {
    const result = mapToAdminAppointmentData(
      buildAppointment({ status: "CONFIRMED", timeSlot: "09:00" })
    );
    expect(result.doctorName).toBe("Dra. María García");
    expect(result.serviceName).toBe("Consulta general");
    expect(result.time).toBe("09:00");
    expect(result.status).toBe("confirmed");
  });
});
