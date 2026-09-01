import type { Prisma } from "@/lib/generated/prisma/client";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/**
 * Mix of Buyer -> Seller ("interested in this asset") and Seller -> Buyer
 * ("thought this fits your thesis") outreach, some with an assetId and some
 * without (pure prospecting) — see ContactRequest's doc comment in schema.prisma.
 */
export const contactRequests: Prisma.ContactRequestCreateInput[] = [
  {
    id: "cr_ozola_nordic",
    from: { connect: { id: "usr_byr_ozola" } },
    to: { connect: { id: "usr_slr_nordic" } },
    asset: { connect: { id: "ast_ee_emi_nordic" } },
    message:
      "Interested in the EMI shell — could we get a call this week to review the compliance file and outstanding correspondence with the regulator?",
    isRead: true,
    createdAt: daysAgo(12),
  },
  {
    id: "cr_jankauskas_baltic",
    from: { connect: { id: "usr_byr_jankauskas" } },
    to: { connect: { id: "usr_slr_baltic" } },
    asset: { connect: { id: "ast_lt_emi_baltic" } },
    message:
      "This looks like a strong fit for our lending/payments roll-up. Can you share the last 3 years of audited financials?",
    isRead: false,
    createdAt: daysAgo(2),
  },
  {
    id: "cr_cee_wozniak",
    from: { connect: { id: "usr_slr_cee" } },
    to: { connect: { id: "usr_byr_wozniak" } },
    message:
      "Saw your mandate for Polish regulated financial services — we have a new PI license coming to market next quarter that isn't listed yet. Want an early look?",
    isRead: false,
    createdAt: daysAgo(5),
  },
  {
    id: "cr_larsen_warsaw",
    from: { connect: { id: "usr_byr_larsen" } },
    to: { connect: { id: "usr_slr_warsaw" } },
    asset: { connect: { id: "ast_pl_invfirm_warsaw" } },
    message:
      "The MiFID scope matches exactly what we need for the discretionary mandate roll-up. What's driving the sale — retirement or something else?",
    isRead: true,
    createdAt: daysAgo(20),
  },
  {
    id: "cr_dubois_malta",
    from: { connect: { id: "usr_byr_dubois" } },
    to: { connect: { id: "usr_slr_malta" } },
    asset: { connect: { id: "ast_mt_emi_malta" } },
    message:
      "We're specifically comfortable with gaming-sector AML exposure — that's usually what scares other buyers off. Can we set up a call?",
    isRead: false,
    createdAt: daysAgo(1),
  },
  {
    id: "cr_nordic_kask",
    from: { connect: { id: "usr_slr_nordic" } },
    to: { connect: { id: "usr_byr_kask" } },
    message:
      "Andres — given your last two EE acquisitions, thought you'd want a heads-up before we list our next EMI shell publicly. Interested in a preview?",
    isRead: true,
    createdAt: daysAgo(9),
  },
  {
    id: "cr_petraityte_cee",
    from: { connect: { id: "usr_byr_petraityte" } },
    to: { connect: { id: "usr_slr_cee" } },
    asset: { connect: { id: "ast_pl_lending_cee" } },
    message:
      "The borrower database size is exactly the scale we look for. Is the underwriting platform's source code included, or licensed separately?",
    isRead: false,
    createdAt: daysAgo(3),
  },
  {
    id: "cr_ostrowski_baltic",
    from: { connect: { id: "usr_byr_ostrowski" } },
    to: { connect: { id: "usr_slr_baltic" } },
    asset: { connect: { id: "ast_lt_lending_baltic" } },
    message:
      "Open mandate here, but the loan book quality is what caught my eye. What's the current default rate running at?",
    isRead: true,
    createdAt: daysAgo(15),
  },
];
