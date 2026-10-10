import { describe, expect, it } from "vitest";
import { matchHeader, normalizeHeader, parseBoolean, parseDate, parseMemberStatus } from "@/lib/import/parser";

describe("Slovenian Excel headers", () => {
  it.each([
    [" Zap.  Št. ", "zap st"],
    ["POŠTNA ŠTEVILKA", "postna st"],
    ["E-mail", "email"],
    ["E mail", "email"],
    ["Status vojni veteran", "status vojni veteran"],
  ])("normalizes %s", (header, normalized) => expect(normalizeHeader(header)).toBe(normalized));

  it("matches known variants", () => {
    expect(matchHeader("St. izkaznice")).toBe("membershipCardNumber");
    expect(matchHeader("Obcina")).toBe("municipality");
    expect(matchHeader("Plačilo članarine")).toBe("membershipFeePaid");
    expect(matchHeader("Datum statusa")).toBe("statusChangedAt");
    expect(matchHeader("Opomba")).toBe("notes");
  });
});

describe("import value parsing", () => {
  it.each([["DA", true], ["YES", true], ["TRUE", true], [1, true], ["NE", false], ["NO", false], ["FALSE", false], [0, false]])("parses boolean %s", (value, expected) => expect(parseBoolean(value).value).toBe(expected));
  it("rejects unknown boolean text", () => expect(parseBoolean("morda").error).toBeTruthy());
  it.each([["Pokojen", "DECEASED"], ["resigned", "RESIGNED"], ["Drugo", "OTHER"]])("parses member status %s", (value, expected) => expect(parseMemberStatus(value).value).toBe(expected));
  it("rejects unknown member status", () => expect(parseMemberStatus("morda").error).toBeTruthy());

  it.each([
    ["20/04/1970", "1970-04-20"], ["20. 4. 1970", "1970-04-20"],
    ["1970-04-20", "1970-04-20"], [25569, "1970-01-01"],
  ])("parses date %s", (value, expected) => expect(parseDate(value).value?.toISOString().slice(0, 10)).toBe(expected));
  it("rejects impossible and malformed dates", () => {
    expect(parseDate("31/02/2020").error).toBeTruthy();
    expect(parseDate("April 20, 1970").error).toBeTruthy();
  });
});
