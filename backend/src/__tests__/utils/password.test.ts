import { hashPassword, comparePassword } from "../../utils/password";

describe("Password Utilities", () => {
  const testPassword = "testPassword123";

  it("should hash password", async () => {
    const hash = await hashPassword(testPassword);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(testPassword);
    expect(hash.length).toBeGreaterThan(20);
  });

  it("should verify correct password", async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await comparePassword(testPassword, hash);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await comparePassword("wrongPassword", hash);
    expect(isValid).toBe(false);
  });
});

