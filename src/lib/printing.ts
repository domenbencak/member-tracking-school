export const LABEL_WIDTH_MM = 99.1;
export const LABEL_HEIGHT_MM = 38.1;
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_HORIZONTAL_MARGIN_MM = 4.65;
export const A4_VERTICAL_MARGIN_MM = 15.15;
export const A4_COLUMN_GAP_MM = 2.5;
export const LABELS_PER_SHEET = 14;

export type LabelMember = {
  firstName: string;
  surname: string;
  street: string | null;
  postalCode: string | null;
  postOffice: string | null;
};

export function formatStickerAddress(member: LabelMember) {
  const lines = [`${member.firstName} ${member.surname}`.trim()];
  if (member.street?.trim()) lines.push(member.street.trim());
  const postalLine = [member.postalCode?.trim(), member.postOffice?.trim()]
    .filter(Boolean)
    .join(" ");
  if (postalLine) lines.push(postalLine);
  return lines;
}
