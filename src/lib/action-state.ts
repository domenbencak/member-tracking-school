import { z } from "zod";
import { errorMessage } from "@/lib/errors";

export type ActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialActionState: ActionState = {};

export function actionError(error: unknown): ActionState {
  if (error instanceof z.ZodError) {
    return {
      error: "Preverite označena polja.",
      fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
    };
  }
  return { error: errorMessage(error) };
}
