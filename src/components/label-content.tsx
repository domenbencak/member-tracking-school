import type { LabelMember } from "@/lib/printing";
import { formatStickerAddress } from "@/lib/printing";

export function LabelContent({ member }: { member: LabelMember }) {
  const lines = formatStickerAddress(member);
  return <address><strong>{lines[0]}</strong>{lines.slice(1).map((line) => <span key={line}>{line}</span>)}</address>;
}
