import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { A4_COLUMN_GAP_MM, A4_HEIGHT_MM, A4_HORIZONTAL_MARGIN_MM, A4_VERTICAL_MARGIN_MM, A4_WIDTH_MM, formatStickerAddress, LABEL_HEIGHT_MM, LABEL_WIDTH_MM } from "@/lib/printing";

describe("sticker formatting and dimensions", () => {
  it("omits a missing street without a blank line", () => expect(formatStickerAddress({ firstName: "Maja", surname: "Kovačič", street: null, postalCode: "1000", postOffice: "Ljubljana" })).toEqual(["Maja Kovačič", "1000 Ljubljana"]));
  it("uses exact physical dimensions", () => {
    expect([LABEL_WIDTH_MM, LABEL_HEIGHT_MM]).toEqual([99.1, 38.1]);
    expect(A4_HORIZONTAL_MARGIN_MM * 2 + LABEL_WIDTH_MM * 2 + A4_COLUMN_GAP_MM).toBeCloseTo(A4_WIDTH_MM, 8);
    expect(A4_VERTICAL_MARGIN_MM * 2 + LABEL_HEIGHT_MM * 7).toBeCloseTo(A4_HEIGHT_MM, 8);
  });
  it("declares exact CSS page and label sizes", () => {
    const single = readFileSync("src/app/(app)/clani/[id]/nalepka/single-label.module.css", "utf8");
    const a4 = readFileSync("src/app/(app)/nalepke/a4/a4-labels.module.css", "utf8");
    expect(single).toContain("size: 99.1mm 38.1mm"); expect(single).toContain("width: 99.1mm"); expect(single).toContain("height: 38.1mm");
    expect(a4).toContain("grid-template-columns: 99.1mm 99.1mm"); expect(a4).toContain("grid-template-rows: repeat(7, 38.1mm)");
  });
});
