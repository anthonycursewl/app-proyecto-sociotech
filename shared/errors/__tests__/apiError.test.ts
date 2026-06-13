import { ApiError, SessionExpiredError } from "@/shared/http/http.client";
import { getApiErrorMessage } from "../apiError";

jest.mock("@/shared/http/http.client", () => {
  class ApiError extends Error {
    constructor(
      public status: number,
      message: string,
      public data?: unknown,
    ) {
      super(message);
      this.name = "ApiError";
    }
  }
  class SessionExpiredError extends ApiError {
    constructor() {
      super(401, "Su sesión ha expirado. Inicie sesión nuevamente.");
      this.name = "SessionExpiredError";
    }
  }
  return { ApiError, SessionExpiredError };
});

describe("getApiErrorMessage", () => {
  it("maps ApiError status to Spanish message", () => {
    expect(getApiErrorMessage(new ApiError(403, "API Error: 403"))).toContain("permiso");
  });

  it("uses custom ApiError message when provided", () => {
    expect(getApiErrorMessage(new ApiError(400, "Email ya registrado"))).toBe("Email ya registrado");
  });

  it("handles generic Error", () => {
    expect(getApiErrorMessage(new Error("Network failed"))).toBe("Network failed");
  });

  it("returns null for SessionExpiredError", () => {
    expect(getApiErrorMessage(new SessionExpiredError())).toBeNull();
  });
});
