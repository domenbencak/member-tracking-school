import type { MemberInput } from "@/lib/members/validation";
import {
  buildIdentityFingerprint,
  normalizeDuplicateText,
} from "@/lib/members/validation";

export type DuplicateCandidate = {
  id: string;
  membershipCardNumber: string | null;
  email: string | null;
  firstName: string;
  surname: string;
  dateOfBirth: Date | null;
  postalCode: string | null;
};

export type DuplicateMatch = {
  candidate: DuplicateCandidate;
  matchedBy: "membershipCardNumber" | "email" | "identity";
};

export function findDuplicate(input: MemberInput, candidates: DuplicateCandidate[]): DuplicateMatch | null {
  if (input.membershipCardNumber) {
    const key = normalizeDuplicateText(input.membershipCardNumber);
    const match = candidates.find(
      (candidate) =>
        candidate.membershipCardNumber &&
        normalizeDuplicateText(candidate.membershipCardNumber) === key,
    );
    if (match) return { candidate: match, matchedBy: "membershipCardNumber" };
  }
  if (input.email) {
    const key = input.email.toLocaleLowerCase("sl-SI");
    const match = candidates.find(
      (candidate) => candidate.email?.toLocaleLowerCase("sl-SI") === key,
    );
    if (match) return { candidate: match, matchedBy: "email" };
  }
  const fingerprint = buildIdentityFingerprint(input);
  if (!fingerprint) return null;
  const match = candidates.find((candidate) =>
    buildIdentityFingerprint({
      firstName: candidate.firstName,
      surname: candidate.surname,
      dateOfBirth: candidate.dateOfBirth,
      postalCode: candidate.postalCode,
    }) === fingerprint,
  );
  return match ? { candidate: match, matchedBy: "identity" } : null;
}
