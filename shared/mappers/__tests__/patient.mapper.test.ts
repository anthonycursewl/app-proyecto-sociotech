import { ListPatientItem } from "@/shared/services/patient.service";
import { mapToPatientData } from "../patient.mapper";

const buildPatient = (overrides: Partial<ListPatientItem> = {}): ListPatientItem => ({
  id: "p-1",
  userId: "u-1",
  medicalId: "HM-0001",
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@test.com",
  cedula: "001-1234567-8",
  dateOfBirth: "1990-01-15",
  gender: "Masculino",
  phone: "+18095551111",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("mapToPatientData", () => {
  describe("name composition", () => {
    it("joins firstName and lastName with a space", () => {
      const result = mapToPatientData(
        buildPatient({ firstName: "Juan", lastName: "Pérez" })
      );
      expect(result.name).toBe("Juan Pérez");
    });

    it("uses only firstName when lastName is empty", () => {
      const result = mapToPatientData(
        buildPatient({ firstName: "Juan", lastName: "" })
      );
      expect(result.name).toBe("Juan");
    });

    it("uses only lastName when firstName is empty", () => {
      const result = mapToPatientData(
        buildPatient({ firstName: "", lastName: "Pérez" })
      );
      expect(result.name).toBe("Pérez");
    });

    it("falls back to 'Paciente' when both names are empty", () => {
      const result = mapToPatientData(
        buildPatient({ firstName: "", lastName: "" })
      );
      expect(result.name).toBe("Paciente");
    });
  });

  describe("optional field fallbacks", () => {
    it("uses em-dash for null medicalId", () => {
      const result = mapToPatientData(
        buildPatient({ medicalId: null as unknown as string })
      );
      expect(result.medicalId).toBe("—");
    });

    it("uses em-dash for null email", () => {
      const result = mapToPatientData(
        buildPatient({ email: null as unknown as string })
      );
      expect(result.email).toBe("—");
    });

    it("uses em-dash for null phone", () => {
      const result = mapToPatientData(
        buildPatient({ phone: null as unknown as string })
      );
      expect(result.phone).toBe("—");
    });
  });

  describe("hardcoded values", () => {
    it("always returns 'active' status (computed from list endpoint)", () => {
      const result = mapToPatientData(buildPatient());
      expect(result.status).toBe("active");
    });

    it("always returns 0 for totalAppointments (computed separately)", () => {
      const result = mapToPatientData(buildPatient());
      expect(result.totalAppointments).toBe(0);
    });
  });

  it("preserves the id from the source", () => {
    const result = mapToPatientData(buildPatient({ id: "patient-99" }));
    expect(result.id).toBe("patient-99");
  });
});
