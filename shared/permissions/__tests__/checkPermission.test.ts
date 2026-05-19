import { hasAllPermissions, hasAnyPermission } from "../checkPermission";

describe("checkPermission", () => {
  const userPerms = ["patients:read", "appointments:read:own"];

  it("hasAnyPermission returns true when one matches", () => {
    expect(hasAnyPermission(userPerms, ["admin:all", "patients:read"])).toBe(true);
  });

  it("hasAnyPermission returns false when none match", () => {
    expect(hasAnyPermission(userPerms, ["services:delete"])).toBe(false);
  });

  it("hasAllPermissions requires every permission", () => {
    expect(hasAllPermissions(userPerms, ["patients:read", "appointments:read:own"])).toBe(true);
    expect(hasAllPermissions(userPerms, ["patients:read", "services:read"])).toBe(false);
  });
});
