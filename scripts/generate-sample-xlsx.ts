import * as fs from "node:fs";
import { dirname, resolve } from "node:path";
import * as XLSX from "xlsx";
import { closeSeedDatabase, fictionalMembers } from "../prisma/seed";

const output = resolve("public/examples/clani-vzorec.xlsx");
fs.mkdirSync(dirname(output), { recursive: true });
XLSX.set_fs(fs);
const rows = fictionalMembers.map((member) => ({
  "Zap. Št.": member.sequenceNumber,
  "Št. Izkaznice": member.membershipCardNumber,
  Priimek: member.surname,
  Ime: member.firstName,
  "Rojstni datum": member.dateOfBirth ? member.dateOfBirth.split("-").reverse().join("/") : null,
  "Status člana": member.sequenceNumber === 2 ? "Pokojen" : member.sequenceNumber === 3 ? "Izstopil" : "Drugo",
  "Datum spremembe statusa": member.sequenceNumber === 2 ? "15/03/2025" : member.sequenceNumber === 3 ? "01/01/2024" : null,
  Opombe: member.sequenceNumber === 3 ? "Vzorec opombe" : null,
  Ulica: member.street,
  Naselje: member.settlement,
  "Poštna številka": member.postalCode,
  Pošta: member.postOffice,
  "Status vojni veteran": member.warVeteranStatus === null ? null : member.warVeteranStatus ? "DA" : "NE",
  "E mail": member.email,
  Občina: member.municipality,
  Pododbor: member.subcommittee,
  "Plačilo članarine": member.membershipFeePaid === null ? null : member.membershipFeePaid ? "DA" : "NE",
  VPO: member.vpo,
}));
const headers = Object.keys(rows[0]);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows, { header: headers }), "Člani");
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Navodilo"], ["Za uvoz izberite delovni list Člani."]]), "Navodila");
XLSX.writeFile(workbook, output);
await closeSeedDatabase();
