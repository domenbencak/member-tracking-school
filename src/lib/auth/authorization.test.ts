import { describe, expect, it } from "vitest";
import { assertAdmin } from "@/lib/auth/authorization";
import { AppError } from "@/lib/errors";

describe("authorization policy", () => {
  it("allows administrators", () => expect(() => assertAdmin({ role: "ADMIN" })).not.toThrow());
  it("rejects normal users with a forbidden error", () => {
    try { assertAdmin({ role: "USER" }); throw new Error("Expected rejection"); }
    catch (error) { expect(error).toBeInstanceOf(AppError); expect((error as AppError).status).toBe(403); }
  });
});
