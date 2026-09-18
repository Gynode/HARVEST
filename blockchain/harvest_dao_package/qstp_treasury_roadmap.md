# HARVEST DAO Treasury Roadmap — QSTP

**Status:** the strategy below is the documented plan, but its figures are **unconfirmed** as of 2026-09-18.
The treasury is currently unfunded and is to be funded with **actual fiat**. Read this as intent, not as a
schedule of secured money.

## The opportunity

QSTP (Qatar Science and Technology Park) entry, targeted for Q1 2026, through the AI & blockchain business
(Compu-AId & ALSYS) — the route by which the DAO treasury is intended to be funded.

## What is not yet settled

Earlier versions of this document specified **100,000 ADA** (~$50,000), or "$100,000 worth of ADA", as the
QSTP treasury request, and projected treasury values of $500K → $550K → $1M → $2M built on an HRV price of
$0.01. None of that survives:

- The funding asset is **fiat**, not ADA.
- HRV has no price, so no treasury value can be projected from holding it. See `corrected_hrv_valuation.md`.
- No funding has been requested or secured.

**The amount and asset of the QSTP request must be restated before this document is used for an actual
application.**

Also note two funding routes that earlier drafts ran together: Project Catalyst (for development costs) and
QSTP (for treasury backing). They are different requests to different bodies.

## The case for QSTP funding

1. **Regional innovation hub** — HARVEST as a blockchain governance platform in Qatar, connecting the Middle
   East to the Cardano ecosystem and supporting the regional startup ecosystem.
2. **Technology demonstration** — Proof-of-Authority consensus for enterprise use, DAO governance for
   transparent operations, AI integration through Compu-AId.
3. **Economic impact** — job creation in the Qatar tech sector, attracting international blockchain projects.
4. **Sustainability model** — a treasury governed by its community, with revenue from partnerships rather than
   an asserted token price.

## What QSTP gets

- **Innovation** — DAO governance technology.
- **Ecosystem** — blockchain expertise available to other QSTP startups.
- **Regional impact** — Middle East blockchain leadership.
- **A demonstrable success story.**

## Preparation checklist

**Technical** — nothing here is done yet:

- [ ] Build the governance validators (Aiken — see `dao_deployment_steps.md`)
- [ ] Deploy and test on a Cardano testnet
- [ ] Document the governance mechanisms as built, not as designed
- [ ] Demonstrate community adoption

**Business:**

- [ ] Restate the funding request: amount, asset (fiat), purpose
- [ ] Financial projections that do not rely on an HRV price
- [ ] Identify partnership opportunities
- [ ] Regional expansion strategy

**Legal:**

- [ ] Qatar business entity setup
- [ ] Compliance with QSTP requirements
- [ ] Intellectual property documentation
- [ ] Partnership agreements framework

## Risk mitigation

**Funding risks**

- **Backup plan:** the DAO operates without a funded treasury — governance does not depend on it.
- **Alternative sources:** other regional funding opportunities, and community contributions in fiat.
- **Gradual growth:** organic community building regardless of external funding.

**Technical risks**

- The governance contracts do not exist yet. The Python in `harvest_dao/contracts/` is a behavioural
  specification, not a deployed system — do not represent it to QSTP as working software.

## Timeline

| | |
|---|---|
| **2025** | Unfunded. Build community governance. |
| **Q1 2026** | Apply to QSTP. |
| **2026+** | Fund the treasury. |

Dollar targets have deliberately been removed from this table: with no funding secured and no HRV price, any
number here would be invented.
