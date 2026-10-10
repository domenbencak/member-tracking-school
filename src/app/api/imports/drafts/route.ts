import { z } from "zod";
import { assertSameOrigin, requireAdmin } from "@/lib/auth/authorization";
import { createImportDraft } from "@/lib/import/service";
import { AppError } from "@/lib/errors";

const schema = z.object({
  fileName: z.string().min(1).max(255),
  sheetName: z.string().min(1).max(255),
  columnMapping: z.record(z.string(), z.number().int().min(0)),
  duplicateStrategy: z.enum(["SKIP", "UPDATE", "CREATE_NEW"]),
  approvePostalWarnings: z.boolean(),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireAdmin();
    const draft = await createImportDraft(actor, schema.parse(await request.json()));
    return Response.json({ id: draft.id });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 400;
    return Response.json({ error: error instanceof Error ? error.message : "Neveljavna zahteva." }, { status });
  }
}
