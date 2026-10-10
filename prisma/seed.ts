import "dotenv/config";
import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { memberInputSchema, memberPersistenceData } from "../src/lib/members/validation";
import { getSchoolDatabaseUrl } from "../src/lib/school-database";

const connectionString = getSchoolDatabaseUrl(process.env.DATABASE_URL);
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

export const fictionalMembers = [
  { sequenceNumber: 1, membershipCardNumber: "0012", surname: "Kovačič", firstName: "Maja", dateOfBirth: "1974-02-18", street: "Lipova ulica 12", settlement: "Center", postalCode: "1000", postOffice: "Ljubljana", warVeteranStatus: false, email: "maja.kovacic@example.test", municipality: "Ljubljana", subcommittee: "Ljubljana Center", membershipFeePaid: true, vpo: "A" },
  { sequenceNumber: 2, membershipCardNumber: "0047", surname: "Horvat", firstName: "Andrej", dateOfBirth: "1961-11-03", street: "Trg svobode 4", settlement: null, postalCode: "2000", postOffice: "Maribor", warVeteranStatus: true, email: null, municipality: "Maribor", subcommittee: "Maribor", membershipFeePaid: false, vpo: null },
  { sequenceNumber: 3, membershipCardNumber: null, surname: "Zupan", firstName: "Petra", dateOfBirth: "1985-06-27", street: "Cankarjeva cesta 8", settlement: "Mesto", postalCode: "3000", postOffice: "Celje", warVeteranStatus: false, email: "petra.zupan@example.test", municipality: "Celje", subcommittee: "Celje", membershipFeePaid: null, vpo: "B" },
  { sequenceNumber: 4, membershipCardNumber: "0101", surname: "Mlakar", firstName: "Bojan", dateOfBirth: "1957-09-14", street: "Prešernova 19", settlement: null, postalCode: "4000", postOffice: "Kranj", warVeteranStatus: true, email: "bojan.mlakar@example.test", municipality: "Kranj", subcommittee: "Gorenjska", membershipFeePaid: true, vpo: "A" },
  { sequenceNumber: 5, membershipCardNumber: "0108", surname: "Krajnc", firstName: "Nina", dateOfBirth: "1991-12-02", street: "Sončna pot 5", settlement: "Šmihel", postalCode: "8000", postOffice: "Novo mesto", warVeteranStatus: null, email: "nina.krajnc@example.test", municipality: "Novo mesto", subcommittee: "Dolenjska", membershipFeePaid: true, vpo: null },
  { sequenceNumber: 6, membershipCardNumber: null, surname: "Vidmar", firstName: "Rok", dateOfBirth: "1979-04-20", street: null, settlement: "Markovci", postalCode: "2281", postOffice: "Markovci", warVeteranStatus: false, email: null, municipality: "Markovci", subcommittee: "Ptuj", membershipFeePaid: false, vpo: "C" },
  { sequenceNumber: 7, membershipCardNumber: "0205", surname: "Potočnik", firstName: "Tina", dateOfBirth: "1968-01-31", street: "Mladinska ulica 2", settlement: null, postalCode: "9000", postOffice: "Murska Sobota", warVeteranStatus: true, email: "tina.potocnik@example.test", municipality: "Murska Sobota", subcommittee: "Pomurje", membershipFeePaid: true, vpo: "B" },
  { sequenceNumber: 8, membershipCardNumber: "0217", surname: "Turk", firstName: "Jure", dateOfBirth: null, street: "Obrtna cona 7", settlement: "Lucija", postalCode: "6320", postOffice: "Portorož", warVeteranStatus: null, email: "jure.turk@example.test", municipality: "Piran", subcommittee: "Obala", membershipFeePaid: null, vpo: null },
  { sequenceNumber: 9, membershipCardNumber: "0303", surname: "Bizjak", firstName: "Sara", dateOfBirth: "1996-08-11", street: "Goriška cesta 30", settlement: null, postalCode: "5270", postOffice: "Ajdovščina", warVeteranStatus: false, email: "sara.bizjak@example.test", municipality: "Ajdovščina", subcommittee: "Primorska", membershipFeePaid: false, vpo: "C" },
  { sequenceNumber: 10, membershipCardNumber: null, surname: "Kos", firstName: "Aleš", dateOfBirth: "1952-05-09", street: "Partizanska 14", settlement: "Bistrica", postalCode: "2310", postOffice: "Slovenska Bistrica", warVeteranStatus: true, email: null, municipality: "Slovenska Bistrica", subcommittee: "Štajerska", membershipFeePaid: true, vpo: "A" },
];

async function main() {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLocaleLowerCase("sl-SI");
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const userEmail = process.env.SAMPLE_USER_EMAIL?.trim().toLocaleLowerCase("sl-SI");
  const userPassword = process.env.SAMPLE_USER_PASSWORD;
  if (!adminEmail || !adminPassword) throw new Error("Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD before seeding.");
  if (adminPassword.length < 12) throw new Error("INITIAL_ADMIN_PASSWORD must contain at least 12 characters.");
  await db.user.upsert({ where: { email: adminEmail }, update: { role: "ADMIN", isActive: true }, create: { email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 12), role: "ADMIN" } });
  if (userEmail && userPassword) {
    if (userPassword.length < 12) throw new Error("SAMPLE_USER_PASSWORD must contain at least 12 characters.");
    await db.user.upsert({ where: { email: userEmail }, update: {}, create: { email: userEmail, passwordHash: await bcrypt.hash(userPassword, 12), role: "USER" } });
  }
  if (await db.member.count() === 0) {
    await db.member.createMany({ data: fictionalMembers.map((member) => memberPersistenceData(memberInputSchema.parse(member))) });
  }
}

export async function closeSeedDatabase() {
  await db.$disconnect();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().finally(() => db.$disconnect());
}
