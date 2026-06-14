import { DoctorBase } from "@/shared/services/doctor.service";
import { mapToDoctorData } from "../doctor.mapper";

const buildDoctor = (overrides: Partial<DoctorBase> = {}): DoctorBase => ({
  id: "d-1",
  userId: "u-1",
  specialty: "Cardiología",
  licenseNumber: "LIC-001",
  firstName: "María",
  lastName: "García",
  email: "maria@hospital.com",
  consultationPrice: 1500,
  phoneNumber: "+18095551111",
  isActive: true,
  isVisible: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("mapToDoctorData", () => {
  describe("name composition", () => {
    it("joins firstName and lastName with a space", () => {
      const result = mapToDoctorData(buildDoctor({ firstName: "Juan", lastName: "Pérez" }));
      expect(result.name).toBe("Juan Pérez");
    });

    it("uses only firstName when lastName is empty", () => {
      const result = mapToDoctorData(buildDoctor({ firstName: "Juan", lastName: "" }));
      expect(result.name).toBe("Juan");
    });

    it("uses only lastName when firstName is empty", () => {
      const result = mapToDoctorData(buildDoctor({ firstName: "", lastName: "Pérez" }));
      expect(result.name).toBe("Pérez");
    });

    it("falls back to 'Doctor' when both names are empty", () => {
      const result = mapToDoctorData(buildDoctor({ firstName: "", lastName: "" }));
      expect(result.name).toBe("Doctor");
    });
  });

  describe("optional field fallbacks", () => {
    it("uses em-dash for null specialty", () => {
      const result = mapToDoctorData(
        buildDoctor({ specialty: null as unknown as string })
      );
      expect(result.specialty).toBe("—");
    });

    it("uses em-dash for null email", () => {
      const result = mapToDoctorData(
        buildDoctor({ email: null as unknown as string })
      );
      expect(result.email).toBe("—");
    });

    it("uses em-dash for null phoneNumber", () => {
      const result = mapToDoctorData(
        buildDoctor({ phoneNumber: null })
      );
      expect(result.phone).toBe("—");
    });
  });

  describe("status mapping", () => {
    it("maps isActive=true to 'active'", () => {
      const result = mapToDoctorData(buildDoctor({ isActive: true }));
      expect(result.status).toBe("active");
    });

    it("maps isActive=false to 'inactive'", () => {
      const result = mapToDoctorData(buildDoctor({ isActive: false }));
      expect(result.status).toBe("inactive");
    });
  });

  describe("computed defaults", () => {
    it("always returns 0 for patientsCount (computed separately)", () => {
      const result = mapToDoctorData(buildDoctor());
      expect(result.patientsCount).toBe(0);
    });

    it("always returns 0 for todayAppointments (computed separately)", () => {
      const result = mapToDoctorData(buildDoctor());
      expect(result.todayAppointments).toBe(0);
    });

    it("preserves the id from the source", () => {
      const result = mapToDoctorData(buildDoctor({ id: "doctor-42" }));
      expect(result.id).toBe("doctor-42");
    });
  });
});
