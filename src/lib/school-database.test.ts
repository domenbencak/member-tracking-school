import { describe, expect, it } from "vitest";
import { getSchoolDatabaseUrl } from "./school-database";

describe("school database isolation", () => {
  it.each(["127.0.0.1", "localhost", "[::1]"])("accepts dedicated school database on %s", (host) => {
    const url = `postgresql://member_tracking_school:example-password@${host}:5433/member_tracking_school`;
    expect(getSchoolDatabaseUrl(url)).toBe(url);
  });

  it.each([
    undefined,
    "",
    "not a database URL",
    "postgresql://member_tracking_school:password@production.example:5433/member_tracking_school",
    "postgresql://member_tracking_school:password@localhost.production.example:5433/member_tracking_school",
    "postgresql://member_tracking_school:password@127.0.0.1:5432/member_tracking_school",
    "postgresql://member_tracking_school:password@127.0.0.1:5433/member_tracking",
    "postgresql://member_tracking:password@127.0.0.1:5433/member_tracking_school",
    "postgresql://member_tracking_school@127.0.0.1:5433/member_tracking_school",
    "https://member_tracking_school:password@127.0.0.1:5433/member_tracking_school",
    "postgresql://member_tracking_school:password@127.0.0.1:5433/member_tracking_school?host=production.example",
  ])("rejects connections outside the school database without exposing credentials", (url) => {
    expect(() => getSchoolDatabaseUrl(url)).toThrow("School edition requires");
    try {
      getSchoolDatabaseUrl(url);
    } catch (error) {
      expect(String(error)).not.toContain("password@");
      expect(String(error)).not.toContain("production.example");
    }
  });
});
