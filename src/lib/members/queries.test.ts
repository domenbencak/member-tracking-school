import { describe, expect, it } from "vitest";
import { buildMemberOrderBy, buildMemberWhere, parseMemberQuery } from "@/lib/members/queries";

describe("member sorting", () => {
  it("uses a scalar order for required fields", () => {
    expect(buildMemberOrderBy({ sort: "surname", dir: "asc" })).toEqual({ surname: "asc" });
  });
  it("puts nulls last for optional fields", () => {
    expect(buildMemberOrderBy({ sort: "dateOfBirth", dir: "desc" })).toEqual({ dateOfBirth: { sort: "desc", nulls: "last" } });
  });
});

describe("member filters", () => {
  it("searches member notes", () => {
    const query = parseMemberQuery({ q: "prostovoljec" });
    expect(buildMemberWhere(query).AND).toEqual(expect.arrayContaining([
      { OR: expect.arrayContaining([{ notes: { contains: "prostovoljec", mode: "insensitive" } }]) },
    ]));
  });

  it("does not coerce blank age fields to zero", () => {
    const query = parseMemberQuery({
      ageMin: "",
      ageMax: "",
      dobFrom: "",
      dobTo: "",
      fee: "all",
      veteran: "all",
      status: "all",
      hasEmail: "all",
      hasCard: "all",
    });

    expect(query.ageMin).toBeUndefined();
    expect(query.ageMax).toBeUndefined();
    expect(query.dobFrom).toBeUndefined();
    expect(query.dobTo).toBeUndefined();
    expect(buildMemberWhere(query)).toEqual({ AND: [{ deletedAt: null }] });
  });

  it("keeps valid filter values from a submitted form", () => {
    const query = parseMemberQuery({
      ageMin: "18",
      municipality: "Ljubljana",
      fee: "yes",
      veteran: "all",
      status: "RESIGNED",
      hasEmail: "yes",
      hasCard: "all",
    });

    expect(query.ageMin).toBe(18);
    expect(query.municipality).toBe("Ljubljana");
    expect(query.fee).toBe("yes");
    expect(query.hasEmail).toBe("yes");
    expect(buildMemberWhere(query).AND).toEqual(expect.arrayContaining([
      { deletedAt: null },
      { membershipFeePaid: true },
      { memberStatus: "RESIGNED" },
      { municipality: "Ljubljana" },
      { email: { not: null } },
    ]));
  });
});
