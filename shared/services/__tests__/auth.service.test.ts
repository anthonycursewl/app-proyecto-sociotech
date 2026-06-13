import { HttpClient } from "@/shared/http/http.client";
import { authService } from "../auth.service";

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

describe("authService.login", () => {
  it("POSTs /auth/login with credentials and returns the response", async () => {
    const mockResponse = {
      accessToken: "at",
      refreshToken: "rt",
      user: { id: "u1", email: "a@b.com", firstName: "A", lastName: "B", roleId: "r", roleName: "ADMIN", permissions: [] },
    };
    mockedHttp.post.mockResolvedValueOnce(mockResponse);

    const result = await authService.login({ email: "a@b.com", password: "secret" });

    expect(mockedHttp.post).toHaveBeenCalledWith("/auth/login", { email: "a@b.com", password: "secret" });
    expect(result).toEqual(mockResponse);
  });
});

describe("authService.register", () => {
  it("POSTs /auth/register with full registration data", async () => {
    const mockResponse = { accessToken: "at", refreshToken: "rt", user: { id: "u1" } };
    mockedHttp.post.mockResolvedValueOnce(mockResponse);

    const result = await authService.register({
      email: "new@user.com",
      password: "pw",
      firstName: "New",
      lastName: "User",
    });

    expect(mockedHttp.post).toHaveBeenCalledWith("/auth/register", {
      email: "new@user.com",
      password: "pw",
      firstName: "New",
      lastName: "User",
    });
    expect(result).toEqual(mockResponse);
  });
});

describe("authService.me", () => {
  it("GETs /auth/me with requireAuth", async () => {
    const mockResponse = { user: { id: "u1", email: "a@b.com" } };
    mockedHttp.get.mockResolvedValueOnce(mockResponse);

    const result = await authService.me();

    expect(mockedHttp.get).toHaveBeenCalledWith("/auth/me", {}, { requireAuth: true });
    expect(result).toEqual(mockResponse);
  });
});

describe("authService.updateUser", () => {
  it("PUTs /auth/user with the full user object", async () => {
    const user = {
      id: "u1",
      email: "a@b.com",
      firstName: "A",
      lastName: "B",
      role: "ADMIN" as any,
      roleId: "r1",
      isActive: true,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      permissions: [],
    };
    const updated = { ...user, firstName: "Updated" };
    mockedHttp.put.mockResolvedValueOnce(updated);

    const result = await authService.updateUser(user);

    expect(mockedHttp.put).toHaveBeenCalledWith("/auth/user", user, { requireAuth: true });
    expect(result).toEqual(updated);
  });
});
