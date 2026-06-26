import { HttpClient } from "@/shared/http/http.client";
import { notificationService } from "../notification.service";

jest.mock("@/shared/http/http.client", () => ({
  HttpClient: {
    get: jest.fn(),
  },
}));

const mockedHttp = HttpClient as jest.Mocked<typeof HttpClient>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("notificationService.getAll", () => {
  it("GETs /notifications with no params when called without arguments", async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: [], nextCursor: null });
    await notificationService.getAll();
    expect(mockedHttp.get).toHaveBeenCalledWith("/notifications", undefined, { requireAuth: true });
  });

  it("passes cursor, limit, status, and eventType params", async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: [], nextCursor: null });
    await notificationService.getAll({ cursor: "abc", limit: 20, status: "sent", eventType: "appointment" });
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/notifications",
      { cursor: "abc", limit: 20, status: "sent", eventType: "appointment" },
      { requireAuth: true },
    );
  });

  it("returns paginated data with nextCursor", async () => {
    const mockResponse = {
      data: [
        {
          id: "n-1",
          eventType: "appointment_reminder",
          subject: "Recordatorio de cita",
          body: "Tienes una cita mañana a las 10:00",
          status: "sent",
          recipientName: "Juan Pérez",
          recipientEmail: "juan@example.com",
          sentAt: "2026-06-25T10:00:00Z",
          createdAt: "2026-06-25T09:00:00Z",
          errorMessage: null,
        },
      ],
      nextCursor: "n-1",
    };
    mockedHttp.get.mockResolvedValueOnce(mockResponse);
    const result = await notificationService.getAll({ limit: 20 });
    expect(result).toEqual(mockResponse);
    expect(result.nextCursor).toBe("n-1");
  });
});
