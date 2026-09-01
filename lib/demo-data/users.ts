import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Fixed, human-readable ids so the other demo-data files (assets, buyer
 * profiles, contact requests) can reference a specific seeded user without
 * capturing return values from a create call. Re-seeding is idempotent
 * because prisma/seed.ts wipes these tables before recreating them.
 */

export const managers: Prisma.UserCreateInput[] = [
  {
    id: "usr_mgr_voss",
    email: "elena.voss@n5deal.com",
    name: "Elena Voss",
    role: "MANAGER",
  },
  {
    id: "usr_mgr_lindqvist",
    email: "marcus.lindqvist@n5deal.com",
    name: "Marcus Lindqvist",
    role: "MANAGER",
  },
  {
    id: "usr_mgr_raman",
    email: "priya.raman@n5deal.com",
    name: "Priya Raman",
    role: "MANAGER",
  },
];

/** name = the selling company's name, since a Seller has no fields beyond User. */
export const sellers: Prisma.UserCreateInput[] = [
  {
    id: "usr_slr_nordic",
    email: "deals@nordicfintechpartners.com",
    name: "Nordic Fintech Partners",
    role: "SELLER",
  },
  {
    id: "usr_slr_baltic",
    email: "contact@balticlicensebrokers.com",
    name: "Baltic License Brokers",
    role: "SELLER",
  },
  {
    id: "usr_slr_cee",
    email: "hello@ceepaymentsgroup.com",
    name: "CEE Payments Group",
    role: "SELLER",
  },
  {
    id: "usr_slr_warsaw",
    email: "advisory@warsawcapitaladvisors.pl",
    name: "Warsaw Capital Advisors",
    role: "SELLER",
  },
  {
    id: "usr_slr_malta",
    email: "info@maltagamingfintech.com",
    name: "Malta Gaming & Fintech Holdings",
    role: "SELLER",
  },
  {
    id: "usr_slr_vilnius",
    email: "team@vilniusfintechexits.lt",
    name: "Vilnius Fintech Exits",
    role: "SELLER",
    status: "SUSPENDED",
    statusReason:
      "Multiple buyer complaints about undisclosed liabilities in a prior sale — under compliance review.",
  },
];

export const buyers: Prisma.UserCreateInput[] = [
  {
    id: "usr_byr_ozola",
    email: "aiva.ozola@novacapitalpartners.ee",
    name: "Aiva Ozola",
    role: "BUYER",
  },
  {
    id: "usr_byr_jankauskas",
    email: "tomas.jankauskas@baltichorizon.lt",
    name: "Tomas Jankauskas",
    role: "BUYER",
  },
  {
    id: "usr_byr_wozniak",
    email: "k.wozniak@wozniakventures.pl",
    name: "Katarzyna Woźniak",
    role: "BUYER",
  },
  {
    id: "usr_byr_larsen",
    email: "henrik.larsen@larsencapital.dk",
    name: "Henrik Larsen",
    role: "BUYER",
  },
  {
    id: "usr_byr_dubois",
    email: "mireille.dubois@dubois-invest.fr",
    name: "Mireille Dubois",
    role: "BUYER",
  },
  {
    id: "usr_byr_kask",
    email: "andres.kask@kaskholdings.ee",
    name: "Andres Kask",
    role: "BUYER",
  },
  {
    id: "usr_byr_petraityte",
    email: "ingrida.petraityte@vilniusacquisitions.lt",
    name: "Ingrida Petraitytė",
    role: "BUYER",
  },
  {
    id: "usr_byr_ostrowski",
    email: "ben.ostrowski@ostrowskicapital.com",
    name: "Ben Ostrowski",
    role: "BUYER",
  },
  {
    id: "usr_byr_marchetti",
    email: "sofia.marchetti@marchettifg.it",
    name: "Sofia Marchetti",
    role: "BUYER",
  },
  {
    id: "usr_byr_kowalski",
    email: "daniel.kowalski@kowalski-holdco.pl",
    name: "Daniel Kowalski",
    role: "BUYER",
    status: "REMOVED",
    statusReason: "Fake company registration detected during KYC review.",
  },
];
