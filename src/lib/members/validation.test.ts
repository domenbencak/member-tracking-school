import { describe, expect, it } from "vitest";
import { memberInputSchema, postalCodeWarning, resolveStatusChangedAt } from "@/lib/members/validation";

describe("member validation", () => {
  it("requires first name and surname", () => expect(memberInputSchema.safeParse({ firstName: "", surname: "" }).success).toBe(false));
  it("normalizes optional blanks and whitespace", () => {
    const member = memberInputSchema.parse({ firstName: "  Maja  ", surname: " Kovačič ", email: "" });
    expect(member).toMatchObject({ firstName: "Maja", surname: "Kovačič", email: null });
  });
  it("validates present emails", () => expect(memberInputSchema.safeParse({ firstName: "Maja", surname: "Kovačič", email: "not-email" }).success).toBe(false));
  it("defaults new members to other and accepts supported statuses", () => {
    expect(memberInputSchema.parse({ firstName: "Maja", surname: "Kovačič" }).memberStatus).toBe("OTHER");
    expect(memberInputSchema.parse({ firstName: "Maja", surname: "Kovačič", memberStatus: "DECEASED", statusChangedAt: "2026-08-20" })).toMatchObject({
      memberStatus: "DECEASED",
      statusChangedAt: new Date("2026-08-20T00:00:00.000Z"),
    });
  });
  it("normalizes notes and enforces their maximum length", () => {
    expect(memberInputSchema.parse({ firstName: "Maja", surname: "Kovačič", notes: "  Prva vrstica.\r\n\r\nDruga vrstica.  " }).notes).toBe("Prva vrstica.\n\nDruga vrstica.");
    expect(memberInputSchema.safeParse({ firstName: "Maja", surname: "Kovačič", notes: "x".repeat(5_001) }).success).toBe(false);
  });
  it("records today when status changes without a separately entered date", () => {
    const current = { memberStatus: "OTHER" as const, statusChangedAt: new Date("2024-01-01T00:00:00.000Z") };
    expect(resolveStatusChangedAt({ memberStatus: "RESIGNED", statusChangedAt: current.statusChangedAt }, current, new Date("2026-08-28T18:00:00.000Z"))).toEqual(new Date("2026-08-28T00:00:00.000Z"));
    expect(resolveStatusChangedAt({ memberStatus: "RESIGNED", statusChangedAt: new Date("2025-04-10T00:00:00.000Z") }, current)).toEqual(new Date("2025-04-10T00:00:00.000Z"));
    expect(resolveStatusChangedAt({ memberStatus: "RESIGNED", statusChangedAt: current.statusChangedAt }, current, new Date("2026-08-28T22:30:00.000Z"))).toEqual(new Date("2026-08-29T00:00:00.000Z"));
    expect(resolveStatusChangedAt({ memberStatus: "RESIGNED", statusChangedAt: current.statusChangedAt }, current, new Date(), true)).toEqual(current.statusChangedAt);
  });
  it("reports postal code as an overridable warning", () => {
    expect(postalCodeWarning("1000")).toBeNull();
    expect(postalCodeWarning("SI-1000")).toBeTruthy();
  });
});
