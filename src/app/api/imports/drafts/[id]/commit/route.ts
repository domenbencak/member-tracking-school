import { assertSameOrigin, requireAdmin } from "@/lib/auth/authorization";
import { commitImportDraft } from "@/lib/import/service";
import { AppError } from "@/lib/errors";

export const maxDuration = 300;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const actor = await requireAdmin();
    const { id } = await context.params;
    const batch = await commitImportDraft(id, actor);
    return Response.json({ id: batch.id });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 400;
    return Response.json({ error: error instanceof Error ? error.message : "Uvoz ni uspel." }, { status });
  }
}
