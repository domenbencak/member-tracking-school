import { z } from "zod";
import { assertSameOrigin, requireAdmin } from "@/lib/auth/authorization";
import { IMPORT_FIELDS } from "@/lib/import/parser";
import { stageImportRows } from "@/lib/import/service";
import { AppError } from "@/lib/errors";

const schema = z.object({
  rows: z.array(z.object({
    sourceRowNumber: z.number().int().positive(),
    values: z.record(z.enum(IMPORT_FIELDS), z.unknown()),
  })).max(250),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const actor = await requireAdmin();
    const { id } = await context.params;
    const input = schema.parse(await request.json());
    return Response.json(await stageImportRows(id, actor, input.rows));
  } catch (error) {
    const status = error instanceof AppError ? error.status : 400;
    return Response.json({ error: error instanceof Error ? error.message : "Neveljavna zahteva." }, { status });
  }
}
