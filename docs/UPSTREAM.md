# Original application documentation

Archived documentation from the original project. For the isolated school
edition, use the setup instructions in the repository's main README.

Production-oriented member database for a Slovenian association. The application provides authenticated member browsing, administration, Excel import, audit history, privacy exports, and exact-size envelope label printing. All visible application text is Slovenian; source code and documentation use English.

This is an internal application. It does not use or reproduce official Slovenian Police logos, badges, coats of arms, or insignia, and it must not be presented as an official Policija Slovenije product.

## Technology

- Next.js 16 App Router, React 19, and TypeScript
- PostgreSQL and Prisma ORM 7 with the `pg` driver adapter
- Auth.js / NextAuth Credentials authentication with JWT sessions
- Tailwind CSS 4 and Radix/shadcn-style accessible components
- Zod validation, bcrypt password hashing, and SheetJS 0.20.3
- Vitest unit tests and Playwright end-to-end tests
- Docker Compose for local PostgreSQL

Exact dependency versions are pinned in `package.json` and `package-lock.json`. SheetJS is installed from its authoritative CDN tarball because the public npm `xlsx` package is outdated.

## Local setup

Use Node.js 24 LTS (`.nvmrc`) and a running Docker Desktop/Engine.

```bash
cp .env.example .env
# Set AUTH_SECRET and passwords in .env before continuing.
docker compose up -d
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Generate a strong authentication secret with `openssl rand -base64 32`. Both seeded passwords must contain at least 12 characters. Open `http://localhost:3000` after the server starts.

The seed is idempotent: it creates or enables the configured administrator, creates the sample user when both sample-user variables are present, and adds fictional member data only when the member table is empty.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Runtime PostgreSQL URL. Use a pooled URL on serverless hosting. |
| `DIRECT_URL` | Direct PostgreSQL URL used by Prisma Migrate; local setup may use the same URL. |
| `AUTH_SECRET` | Secret used to sign sessions and HMAC login-rate-limit identifiers. |
| `INITIAL_ADMIN_EMAIL` | Lowercased login address for the seeded administrator. |
| `INITIAL_ADMIN_PASSWORD` | Initial administrator password, minimum 12 characters. |
| `SAMPLE_USER_EMAIL` / `SAMPLE_USER_PASSWORD` | Optional fictional normal user seeded for local testing. |
| `NEXT_PUBLIC_ORGANIZATION_NAME` | Header name, default `Evidenca članov`. |
| `DATA_CONTROLLER_NAME` | Text displayed as the data controller on the privacy page. |
| `DATA_RETENTION_NOTICE` | Organization-specific retention notice. |
| `MAX_IMPORT_FILE_SIZE_MB` | Browser-side workbook limit, default 10 MB. |
| `MAX_IMPORT_ROWS` | Client and server staged-row limit, default 50,000. |
| `NEXTAUTH_URL` | Canonical local/deployment URL where required by NextAuth. |

Never commit `.env`. Rotate any credential that has been exposed and replace seeded passwords before production use.

## Database and migrations

The initial migration creates all models, enum types, foreign keys, filter/sort indexes, and PostgreSQL `pg_trgm` indexes for high-use substring search fields.

```bash
npm run db:generate       # regenerate the Prisma client
npm run db:migrate        # create/apply a development migration
npm run db:deploy         # apply committed migrations in staging/production
npm run db:seed           # seed configured users and fictional members
```

Production deployment must run `npm run db:deploy` as a separate release step. Do not run `prisma migrate dev` against production. The database user used for the first migration must be allowed to install the trusted `pg_trgm` extension; otherwise have the database administrator enable it first.

## Authentication and authorization

There is no public registration. Every page except `/prijava` requires authentication. Normal users can view, search, filter, sort, and print members. Administrator operations are checked again inside services, server actions, and route handlers; hiding controls is not treated as authorization.

Sessions are limited to eight hours. Every protected operation reloads the account and validates its active state, current role, and session version. Role changes, disabling, and password resets therefore invalidate old permissions immediately. The last active administrator cannot be disabled, demoted, or deleted. An administrator-set password is temporary and forces a password change.

Login attempts are grouped by HMAC-hashed email/IP without storing the raw attempted identifier. Five failures in 15 minutes cause a 15-minute block. Login responses do not reveal whether the account exists.

## Excel import

Download the fictional example at `/examples/clani-vzorec.xlsx`, or regenerate it:

```bash
npm run sample:xlsx
```

Supported columns are:

`Zap. Št.`, `Št. Izkaznice`, `Priimek`, `Ime`, `Rojstni datum`, `Ulica`, `Naselje`, `Poštna številka`, `Pošta`, `Status vojni veteran`, `E mail`, `Občina`, `Pododbor`, `Plačilo članarine`, and `VPO`.

Header matching ignores capitalization, excess whitespace, punctuation differences, common `E-mail` spellings, `Št./St./Številka` variants, and missing header diacritics. Member values retain Slovenian characters.

The wizard reads the first worksheet, exposes all worksheet names, previews ten rows, auto-maps headers, and allows manual mapping. It supports `dd/mm/yyyy`, dotted Slovenian dates, ISO dates, and Excel serial dates. `DA/YES/TRUE/1` and `NE/NO/FALSE/0` are accepted booleans. First name and surname are required; malformed dates/booleans and invalid present emails are row errors. Non-four-digit postal codes are explicit overridable warnings.

The browser parses the workbook in a Web Worker. The original file is never stored or uploaded; primitive mapped rows are sent to an authenticated staging area in chunks of 250 and expire after 24 hours. The server validates every staged row again. This design avoids Vercel's function request limit while retaining a configurable 10 MB local file limit.

Duplicate priority is card number, then email, then normalized name + surname + date of birth + postal code. The identity fallback runs only when both date and postal code exist. Available strategies are skip, update, and import as new. Update mode changes only nonblank imported fields. Archived matches and ambiguous workbook-internal updates are not silently restored or overwritten. Invalid rows are listed, explicitly excluded, and retained in the final report summary.

## Member browsing and exports

Member table state is stored in URL query parameters, including page size, search, filters, sorting, and optional columns. This makes views bookmarkable. Date-of-birth and age ranges are combined when both are present. Active records are used for normal lists and dashboard totals; archived records have a separate administrator view with restoration.

Administrators can download one member as JSON/CSV or stream all active members as CSV. Export routes enforce administrator authorization and add audit events. CSV values beginning with spreadsheet formula characters are neutralized. To include archived records in a programmatic full export, request `/api/exports/members.csv?includeArchived=true` while authenticated as an administrator.

## Label printing

The individual label route prints exactly one `99.1 × 38.1 mm` label. Batch mode uses A4 portrait with two columns and seven rows. Its geometry is:

- label: `99.1 × 38.1 mm`
- side margins: `4.65 mm`
- top/bottom margins: `15.15 mm`
- column gap: `2.5 mm`
- row gap: `0 mm`

Batch selection is available from the member list and persists in session storage across pages, up to 140 members. Starting position 1–14 can be changed in the A4 preview so partially used sheets can be reused.

For every browser print dialog set:

- **Scale: 100% or Actual size**
- **Margins: None**, where supported
- **Headers and footers: Disabled**
- **A4 portrait** for batch sheets

To verify physical size, print one label on plain paper, disable any printer-driver “fit” setting, and measure the outer area with a ruler. It must be 99.1 mm wide and 38.1 mm high. Printer hardware may impose non-printable margins; dedicated label printers should use the single-label route and a custom 99.1 × 38.1 mm media definition.

## Testing and quality checks

```bash
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Unit tests cover Slovenian header normalization, boolean/date parsing, duplicates, member validation, authorization policy, CSV safety, address formatting, and exact print geometry. The Playwright suite imports, edits, and prints as an administrator, then verifies that a normal user receives `403` from an administrator endpoint. Set `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` and `E2E_USER_EMAIL`/`E2E_USER_PASSWORD`, or reuse the corresponding seed variables. Run E2E against a disposable seeded database because it writes records.

## Vercel deployment

1. Provision externally hosted PostgreSQL in the same or a nearby region.
2. Configure a pooled `DATABASE_URL` for runtime and a direct `DIRECT_URL` for migrations.
3. Set all required environment variables in Vercel for Production and Preview as appropriate.
4. Run `npm run db:deploy` from a controlled release job using the production direct URL.
5. Deploy with the repository's `npm run build`; `postinstall` generates Prisma Client.
6. Seed the initial administrator once from a secured environment, then remove or rotate the initial password variable.

Do not run migrations concurrently from multiple deployments. Use TLS-required database URLs, provider connection pooling, restricted database credentials, and a region compatible with the organization's data-governance requirements.

## Security, privacy, and operations

- Passwords use bcrypt cost 12 and are never included in audit JSON or application logs.
- Mutation handlers enforce current database authorization and same-origin checks where custom JSON endpoints are used.
- Member update audits store changed field names, not duplicate member records.
- No analytics or third-party member-data service is configured.
- Import files are parsed locally and are not retained; staged rows expire after 24 hours.
- Destructive operations require explicit confirmation, and member deletion is reversible archival.
- Secure HttpOnly/SameSite cookies are provided by NextAuth and become `Secure` on HTTPS deployments.

Database backups remain the operator's responsibility. Enable managed-provider point-in-time recovery, retain encrypted daily backups according to policy, store copies in a separate failure domain, and test restoration at least quarterly. Back up before migrations and large imports. Document retention and deletion responsibilities on the privacy page using the configured environment values.
