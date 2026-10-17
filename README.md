# Member Tracking — School Edition

Independent school copy of the Slovenian member-management app. This repository
contains source code, schema migrations, and fictional sample data. Every local
setup creates its own administrator, normal user, and database.

## Šolska dokumentacija

- [Vzpostavitev projekta](docs/VZPOSTAVITEV.md)
- [Ključne funkcionalnosti in izbira projekta](docs/FUNKCIONALNOSTI.md)
- [Stanje testiranja in zagotavljanja kakovosti](docs/STANJE_TESTIRANJA_IN_ZAGOTAVLJANJA_KAKOVOSTI.md)
- [Pet funkcionalnih testnih primerov in končni ukaz agentu](docs/funkcionalno-testiranje/Testni_primeri_in_ukaz_agentu.docx)
- [Matrika povezav funkcionalnosti s testnimi primeri](docs/funkcionalno-testiranje/Matrika_funkcionalnosti_in_testov.docx)
- [Dokumentacija v slovenščini](docs/DOKUMENTACIJA.md)
- [Šest diagramov: arhitektura, vloge, ER, prijava, uvoz in lokalno sodelovanje](docs/DIAGRAMI.md)
- Diagrami so na voljo kot SVG, PNG in urejljive definicije Mermaid.

## Start locally

Install Node.js 24 LTS (see `.nvmrc`) and start Docker Desktop or Docker Engine.
Then, from this repository:

```bash
npm run school:env
npm ci
npm run school:setup
npm run dev
```

Open **http://localhost:3001**.

- Administrator: `admin@example.test`
- Normal user: `user@example.test`
- Read their generated passwords from your local `.env` file

`school:env` generates random database, account, and authentication credentials.
It keeps an existing `.env` unchanged, so repeated setup preserves your logins.
`school:setup` starts PostgreSQL, applies committed migrations, and seeds ten
fictional members when the member table is empty.

## Collaborating with a classmate

Give your classmate access to this private GitHub repository. They clone it and
run the commands above on their own computer. Both work on the same source code,
but each has an independent local database and independently generated passwords.

Use feature branches and pull requests for changes. Commit migrations when the
schema changes. Share fictional import files only; the included
`public/examples/clani-vzorec.xlsx` is generated from the fictional seed data.

Keep `.env` private. The repository includes `.env.example` with placeholders
so nobody needs another person's credentials to start the app.

## Database isolation

The school database is `member_tracking_school`, served locally on port **5433**.
Docker Compose uses project `member-tracking-school` and volume
`member-tracking-school_school_postgres`. PostgreSQL binds only to `127.0.0.1`.
The app uses port **3001**.

An optional `COMPOSE_PROJECT_NAME` in your private `.env` selects a separate
Compose project and volume. See the [setup troubleshooting guide](docs/VZPOSTAVITEV.md#5-težave-pri-vzpostavitvi)
if an existing volume uses credentials from a different setup.

Runtime queries, seed commands, and Prisma migrations validate the database URL.
They reject remote hosts, other database/user names, other ports, and connection
query parameters. An inherited production URL therefore fails before connecting.
Never copy environment files or database dumps from the original project.

This edition is configured for local development. A future online demo needs its
own hosting project, its own school database, new credentials, and an explicit
update to the local database check.

## Useful commands

```bash
npm run dev          # local app on port 3001
npm run db:migrate   # create a development migration for a schema change
npm run db:deploy    # apply existing migrations
npm run db:seed      # seed school users and fictional members
npm run sample:xlsx  # regenerate the fictional import example
docker compose stop # stop the school database without deleting data
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

End-to-end tests read school login details from `.env`, start their own app
server, and write fictional records to the school database. Stop `npm run dev`
before running them. They never reuse a server from the original project.

## Application

Next.js, React, TypeScript, PostgreSQL, Prisma, NextAuth Credentials, Tailwind,
Vitest, and Playwright. UI text is Slovenian. Administrators can manage members
and users, import Excel, view audit history, and export data. Normal users can
browse members and print labels. See [original app documentation](docs/UPSTREAM.md)
for upstream context and [current school functionality](docs/FUNKCIONALNOSTI.md)
for the implemented features and known limitations of this copy.

## Uporaba generativne UI

Pri pregledu projekta, preverjanju vzpostavitve in pripravi dokumentov za to
nalogo je bil uporabljen agent **OpenAI Codex**. Rezultati so bili preverjeni z
izvorno kodo, zagonom obstoječih preverjanj in pregledom njihovih izhodov.
Podrobnosti ter omejitve podatkov o pretekli uporabi UI so navedene v
[dokumentu o kakovosti](docs/STANJE_TESTIRANJA_IN_ZAGOTAVLJANJA_KAKOVOSTI.md#6-uporaba-generativne-umetne-inteligence).

Based on the original `member-tracking` project. This is a school demonstration
using fictional data, not an official association or Slovenian Police product.
