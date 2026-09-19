# HARVEST DAO Treasury — funding roadmap

**Rewritten 2026-09-19.** This file was `qstp_treasury_roadmap.md` and described entry to **QSTP** (the Qatar
Science and Technology Park) as the route to funding the treasury. **QSTP is no longer a source of funding, and
neither is Project Catalyst.** Funding is being sourced, and **2027** is the target.

## Today

| | |
|---|---|
| Treasury holdings | **none** |
| Treasury value | **$0** |
| HRV value | **$0 — no backing exists** |
| Funding required | **actual fiat** |
| Source | **being sourced — none named** |
| Target | **2027** |

Nothing has been contributed and no funding has been secured. This is intent, not a schedule of secured money.

## What was removed, and why

**QSTP.** The document's whole framing was entry to QSTP through the Compu-AId & ALSYS business. That is no
longer the plan, so the case it argued — regional innovation hub, technology demonstration, job creation in the
Qatar tech sector, ecosystem benefit to other QSTP startups — has been removed rather than left to describe a
route the project is not taking. The preparation checklist it implied (Qatar business entity setup, QSTP
compliance) has gone with it.

**Project Catalyst.** Earlier drafts ran two funding routes together: Catalyst for development costs and QSTP
for treasury backing. Neither is now a source.

**The figures, already void before this rewrite.** Earlier versions specified **100,000 ADA** (~$50,000), or
"$100,000 worth of ADA", as the request, and projected treasury values of $500K → $550K → $1M → $2M built on an
HRV price of $0.01. None of that survives:

- The funding asset is **fiat**, not ADA.
- HRV has no price, so no treasury value can be projected from holding it. See `corrected_hrv_valuation.md`.
- No funding has been requested or secured, from any source.

## What funding is for

The treasury is what gives HRV any value at all — value derives from backing, and there is no other mechanism.
A funded treasury is also what the DAO needs in order to do anything with its treasury: today it can pass a
funding proposal and there is nothing to pay it from.

## Preparation

**Technical** — none of this is done:

- [ ] Build the governance validators (Aiken — see `dao_deployment_steps.md`)
- [ ] Build the treasury validator
- [ ] Deploy and test on a Cardano testnet
- [ ] Document the governance mechanisms as built, not as designed

**Funding:**

- [ ] Decide the amount and the asset of the request — fiat, and no figure has been set
- [ ] Identify the sources being pursued, and record them when they are real
- [ ] Financial projections that do not rely on an HRV price
- [ ] Any legal or entity structure the chosen sources require

## Risk mitigation

**Funding risks**

- **Backup plan:** the DAO operates without a funded treasury — governance does not depend on it.
- **Gradual growth:** organic community building regardless of external funding.
- **No source is named, so none can slip.** The previous plan had a single route with a date attached; when the
  date passed, the document described a future that had already gone. Naming no source until there is one
  avoids repeating that.

**Technical risks**

- The governance and treasury validators do not exist yet. The Python in `harvest_dao/contracts/` is a
  behavioural specification, not a deployed system — do not represent it as working software to anyone
  considering funding it.

## Timeline

| | |
|---|---|
| **2026** | Unfunded. Build the validators, and community governance. |
| **2027** | Fund the treasury. |

Dollar targets have deliberately been removed from this table: with no funding secured and no HRV price, any
number here would be invented.
