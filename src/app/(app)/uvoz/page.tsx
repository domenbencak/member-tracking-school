import { ImportWizard } from "@/components/import-wizard";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function ImportPage() { await requireAdmin(); const maxSizeMb = Number(process.env.MAX_IMPORT_FILE_SIZE_MB) || 10; const maxRows = Number(process.env.MAX_IMPORT_ROWS) || 50_000; return <><div className="page-header"><div><h1 className="page-title">Uvoz podatkov</h1><p className="page-description">Uvoz članov iz Excelove datoteke</p></div></div><ImportWizard maxSizeMb={maxSizeMb} maxRows={maxRows} /></>; }
