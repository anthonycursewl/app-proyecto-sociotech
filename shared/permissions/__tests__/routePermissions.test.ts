import {
  canAccessRoute,
  isPublicMainRoute,
  normalizeMainRoutePath,
} from "../routePermissions";

describe("routePermissions", () => {
  it("normalizes group paths", () => {
    expect(normalizeMainRoutePath("/(main)/services")).toBe("services");
    expect(normalizeMainRoutePath("/services")).toBe("services");
  });

  it("marks public routes", () => {
    expect(isPublicMainRoute("/home")).toBe(true);
    expect(isPublicMainRoute("/(main)/access-denied")).toBe(true);
    expect(isPublicMainRoute("/services")).toBe(false);
  });

  it("allows route when user has required permission", () => {
    expect(canAccessRoute(["services:read"], "/services")).toBe(true);
    expect(canAccessRoute([], "/services")).toBe(false);
  });
});
