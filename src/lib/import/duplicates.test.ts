import { describe, expect, it } from "vitest";
import { findDuplicate, type DuplicateCandidate } from "@/lib/import/duplicates";
import { memberInputSchema } from "@/lib/members/validation";

const candidates: DuplicateCandidate[] = [
  { id: "card", membershipCardNumber: "0012", email: "other@example.test", firstName: "Maja", surname: "Kovačič", dateOfBirth: new Date("1970-04-20T00:00:00Z"), postalCode: "1000" },
  { id: "email", membershipCardNumber: null, email: "rok@example.test", firstName: "Rok", surname: "Kos", dateOfBirth: new Date("1980-01-01T00:00:00Z"), postalCode: "2000" },
];

describe("duplicate priority", () => {
  it("prefers membership card over email", () => {
    const input = memberInputSchema.parse({ firstName: "Drugo", surname: "Ime", membershipCardNumber: " 0012 ", email: "rok@example.test" });
    expect(findDuplicate(input, candidates)).toMatchObject({ candidate: { id: "card" }, matchedBy: "membershipCardNumber" });
  });
  it("falls back to case-insensitive email", () => {
    const input = memberInputSchema.parse({ firstName: "Rok", surname: "Kos", email: "ROK@example.test" });
    expect(findDuplicate(input, candidates)?.candidate.id).toBe("email");
  });
  it("uses identity only when birth date and postal code exist", () => {
    const full = memberInputSchema.parse({ firstName: " Maja ", surname: "Kovačič", dateOfBirth: "1970-04-20", postalCode: "1000" });
    expect(findDuplicate(full, candidates)?.matchedBy).toBe("identity");
    const partial = memberInputSchema.parse({ firstName: "Maja", surname: "Kovačič" });
    expect(findDuplicate(partial, candidates)).toBeNull();
  });
});
