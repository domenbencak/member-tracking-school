import { assertSameOrigin, requireAdmin } from "@/lib/auth/authorization";
import { analyzeImportDraft } from "@/lib/import/service";
import { AppError } from "@/lib/errors";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const actor = await requireAdmin();
    const { id } = await context.params;
    return Response.json(await analyzeImportDraft(id, actor));
  } catch (error) {
    const status = error instanceof AppError ? error.status : 400;
    return Response.json({ error: error instanceof Error ? error.message : "Analiza ni uspela." }, { status });
  }
}
