import { describe, expect, it } from "vitest";
import { csvCell } from "@/lib/csv";

describe("CSV safety", () => { it.each(["=SUM(A1:A2)", "+cmd", "-1+2", "@value"])("neutralizes formula prefix in %s", (value) => expect(csvCell(value)).toContain(`'${value}`)); it("escapes quotes", () => expect(csvCell('a"b')).toBe('"a""b"')); });
