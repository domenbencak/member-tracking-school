export const MEMBER_STATUSES = ["DECEASED", "RESIGNED", "OTHER"] as const;

export type MemberStatusValue = (typeof MEMBER_STATUSES)[number];

export const memberStatusLabels: Record<MemberStatusValue, string> = {
  DECEASED: "Pokojen",
  RESIGNED: "Izstopil",
  OTHER: "Drugo",
};

export const memberStatusOptions = MEMBER_STATUSES.map((value) => ({
  value,
  label: memberStatusLabels[value],
}));

export function memberStatusLabel(value: MemberStatusValue) {
  return memberStatusLabels[value];
}

export function memberStatusBadgeClass(value: MemberStatusValue) {
  if (value === "DECEASED") return "border-[#cbd5e1] bg-[#f1f5f9] text-[#334155]";
  if (value === "RESIGNED") return "border-[#d7c68b] bg-[#fff8db] text-[#6b4e16]";
  return "border-[#b9cde0] bg-[#eef5fb] text-[#234f72]";
}
