import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * AssetStatus semantics used across this demo dataset (not enforced by the
 * schema, just a product convention — see ARCHITECTURE.md):
 *  - ACTIVE:    open for buyer inquiries
 *  - PENDING:   under negotiation with a buyer; still visible, not the
 *               default target for new inquiries
 *  - SOLD:      deal closed; kept for record, hidden from default browse
 *  - SUSPENDED: pulled by a Manager for a compliance concern
 *
 * usr_slr_vilnius (the one SUSPENDED seller) still owns an ACTIVE asset here
 * on purpose — the app hides a suspended seller's listings at the query
 * layer rather than mutating every one of their assets, so this is the
 * fixture that exercises that behavior.
 */
export const assets: Prisma.AssetCreateInput[] = [
  {
    id: "ast_ee_emi_nordic",
    seller: { connect: { id: "usr_slr_nordic" } },
    title: "Estonian EMI License Holding Company",
    description:
      "Fully licensed Electronic Money Institution incorporated in Tallinn, authorized under Art. 11 EMD2. Clean regulatory history, no active client funds on the books — ready for a buyer to plug in their own product.",
    sector: "Fintech",
    jurisdiction: "EE",
    licenseType: "EMI License (Art. 11 EMD2)",
    price: 185000,
    employeeCount: 2,
    yearIssued: 2021,
    includedItems: ["Bank account", "AML/CTF policies", "Compliance officer transfer", "Regulatory correspondence file"],
    viewCount: 214,
  },
  {
    id: "ast_ee_pi_nordic",
    seller: { connect: { id: "usr_slr_nordic" } },
    title: "PSD2-Licensed Payment Institution with Active Merchant Book",
    description:
      "Payment Institution license plus an active book of 40+ SME merchants processing card-not-present transactions. Includes acquiring partnerships already in place.",
    sector: "Payments",
    jurisdiction: "EE",
    licenseType: "Payment Institution License",
    price: 210000,
    employeeCount: 6,
    yearIssued: 2019,
    includedItems: ["Merchant portfolio", "Acquiring bank relationships", "AML/CTF policies", "Staff (6 FTE) transfer option"],
    viewCount: 187,
  },
  {
    id: "ast_ee_vasp_nordic",
    seller: { connect: { id: "usr_slr_nordic" } },
    title: "Ready-Made Crypto VASP Entity",
    description:
      "Registered Virtual Asset Service Provider entity in Estonia, no operating history. Suitable for a buyer wanting a fast route to market post-MiCA transition period.",
    sector: "Crypto",
    jurisdiction: "EE",
    licenseType: "VASP Registration",
    price: 95000,
    status: "PENDING",
    employeeCount: 0,
    yearIssued: 2022,
    includedItems: ["VASP registration certificate", "AML/CTF policies"],
    viewCount: 96,
  },
  {
    id: "ast_lt_emi_baltic",
    seller: { connect: { id: "usr_slr_baltic" } },
    title: "Lithuanian EMI with Active Client Base",
    description:
      "Established EMI with a loyal SME client base and 3 years of clean audits. Owner is retiring, not distressed — genuine growth opportunity for a buyer with a sales engine.",
    sector: "Fintech",
    jurisdiction: "LT",
    licenseType: "EMI License",
    price: 240000,
    employeeCount: 9,
    yearIssued: 2020,
    includedItems: ["Client portfolio", "Bank account", "AML/CTF policies", "Full staff transfer"],
    viewCount: 301,
  },
  {
    id: "ast_lt_lending_baltic",
    seller: { connect: { id: "usr_slr_baltic" } },
    title: "Lithuanian Consumer Lending License with Loan Book",
    description:
      "Consumer credit license with an existing performing loan book (~€1.2M outstanding). Sold as a share deal to preserve continuity with the regulator.",
    sector: "Lending",
    jurisdiction: "LT",
    licenseType: "Consumer Credit License",
    price: 150000,
    employeeCount: 4,
    yearIssued: 2018,
    includedItems: ["Loan book", "Servicing platform", "AML/CTF policies"],
    viewCount: 142,
  },
  {
    id: "ast_lt_pi_baltic",
    seller: { connect: { id: "usr_slr_baltic" } },
    title: "SEPA-Connected Payment Institution",
    description:
      "Direct SEPA participant with its own IBAN range. Deal closed — kept here for reference.",
    sector: "Payments",
    jurisdiction: "LT",
    licenseType: "Payment Institution License",
    price: 175000,
    status: "SOLD",
    employeeCount: 5,
    yearIssued: 2019,
    includedItems: ["SEPA participant status", "IBAN range", "AML/CTF policies"],
    viewCount: 268,
  },
  {
    id: "ast_pl_small_pi_cee",
    seller: { connect: { id: "usr_slr_cee" } },
    title: "Polish Small Payment Institution",
    description:
      "Small PI authorization (below the full PI turnover threshold), ideal for a buyer testing the Polish market before scaling into a full license.",
    sector: "Payments",
    jurisdiction: "PL",
    licenseType: "Small PI License",
    price: 90000,
    employeeCount: 1,
    yearIssued: 2022,
    includedItems: ["Small PI authorization", "AML/CTF policies"],
    viewCount: 88,
  },
  {
    id: "ast_pl_lending_cee",
    seller: { connect: { id: "usr_slr_cee" } },
    title: "Polish Loan Origination Platform",
    description:
      "Licensed loan originator with a proprietary underwriting platform and 2,000+ historical borrowers on file. Strong fit for a lending roll-up.",
    sector: "Lending",
    jurisdiction: "PL",
    licenseType: "Lending License",
    price: 130000,
    employeeCount: 7,
    yearIssued: 2020,
    includedItems: ["Underwriting platform", "Borrower database", "AML/CTF policies"],
    viewCount: 176,
  },
  {
    id: "ast_pl_remit_cee",
    seller: { connect: { id: "usr_slr_cee" } },
    title: "Cross-Border Remittance License",
    description:
      "PI license scoped for money remittance, with existing corridors into Ukraine and the Western Balkans. Includes agent network agreements.",
    sector: "Payments",
    jurisdiction: "PL",
    licenseType: "PI License (Remittance Scope)",
    price: 165000,
    employeeCount: 3,
    yearIssued: 2021,
    includedItems: ["Agent network agreements", "AML/CTF policies", "Corridor documentation"],
    viewCount: 121,
  },
  {
    id: "ast_pl_invfirm_warsaw",
    seller: { connect: { id: "usr_slr_warsaw" } },
    title: "Polish Investment Firm (MiFID-Scoped)",
    description:
      "MiFID-scoped investment firm license covering portfolio management and investment advice. Clean track record, no client complaints on file.",
    sector: "Wealth Management",
    jurisdiction: "PL",
    licenseType: "Investment Firm License (MiFID)",
    price: 320000,
    employeeCount: 5,
    yearIssued: 2017,
    includedItems: ["MiFID license", "Client agreements templates", "Compliance manual"],
    viewCount: 233,
  },
  {
    id: "ast_pl_insurtech_warsaw",
    seller: { connect: { id: "usr_slr_warsaw" } },
    title: "Insurance Intermediary Brokerage",
    description:
      "Licensed insurance intermediary with distribution agreements across 4 Polish insurers. Digital-first, low overhead.",
    sector: "Insurtech",
    jurisdiction: "PL",
    licenseType: "Insurance Intermediary License",
    price: 110000,
    employeeCount: 3,
    yearIssued: 2020,
    includedItems: ["Distribution agreements", "Brokerage platform", "Client database"],
    viewCount: 104,
  },
  {
    id: "ast_mt_emi_malta",
    seller: { connect: { id: "usr_slr_malta" } },
    title: "Malta EMI License with Gaming-Sector Client Book",
    description:
      "EMI license with an existing client book concentrated in the online gaming sector — high-margin, high-scrutiny; buyer should have gaming AML experience.",
    sector: "Fintech",
    jurisdiction: "MT",
    licenseType: "EMI License",
    price: 275000,
    employeeCount: 8,
    yearIssued: 2018,
    includedItems: ["Client portfolio", "Bank account", "AML/CTF policies", "Gaming-sector risk framework"],
    viewCount: 259,
  },
  {
    id: "ast_mt_vasp_malta",
    seller: { connect: { id: "usr_slr_malta" } },
    title: "Malta VASP with Active Exchange Operations",
    description:
      "VASP license with a live exchange product. Currently under Manager review following a compliance flag raised by the platform.",
    sector: "Crypto",
    jurisdiction: "MT",
    licenseType: "VASP License",
    price: 380000,
    status: "SUSPENDED",
    employeeCount: 12,
    yearIssued: 2021,
    includedItems: ["VASP license", "Exchange platform", "Client portfolio"],
    viewCount: 342,
  },
  {
    id: "ast_lt_fullsale_vilnius",
    seller: { connect: { id: "usr_slr_vilnius" } },
    title: "Lithuanian Fintech Startup — Full Company Sale",
    description:
      "Full share sale of an operating Lithuanian fintech startup, including team, product, and existing licensing application in progress.",
    sector: "Fintech",
    jurisdiction: "LT",
    licenseType: "Share Deal — Full Acquisition (license application in progress)",
    price: 500000,
    employeeCount: 18,
    yearIssued: 2023,
    includedItems: ["Full team transfer", "Product & codebase", "In-progress license application"],
    viewCount: 63,
  },
];
