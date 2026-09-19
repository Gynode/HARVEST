# HARVEST DAO — Changelog

This package's documents have changed models twice, both times because the earlier model was wrong. This file
exists so the superseded numbers are not reintroduced.

## 2026-09-19 — Funding sources removed, and two documents renamed

Decided by the project owner:

- **QSTP is no longer a source of funding.** The Qatar Science and Technology Park route, and the case argued
  for it, are removed. The target date it carried (Q1 2026) had already passed.
- **Project Catalyst is no longer a source of funding either.** Earlier drafts ran Catalyst (development
  costs) and QSTP (treasury backing) together as two routes; neither stands now.
- **Funding is being sourced, with 2027 as the target.** No source is named, and the asset remains fiat.

Two files were renamed as a result, since their names carried QSTP:

| Was | Now |
|---|---|
| `qstp_treasury_roadmap.md` | `treasury_funding_roadmap.md` — rewritten; the QSTP framing and its preparation checklist are gone |
| `updated_qstp_treasury_summary.md` | `treasury_summary.md` |

The 2026-09-18 entries below refer to these files by their old names, because that is what they were called
when those changes were made.

## 2026-09-18 — Platform and token model settled

Decisions taken by the project owner:

- **Platform: Cardano/Plutus.** On-chain code is to be written in **Aiken**.
- **HRV supply: 1,000,000,000, minted on Cardano mainnet as a Cardano Native Token (CNT).** The
  **50,000,000** figure used throughout this package was wrong — in both amount and model.
- **There is no second supply.** The sidechain represents the CNT locked on mainnet; it does not mint its own
  HRV.
- **HRV value: none.** The treasury is unfunded and still has to be funded with **actual fiat**. The
  `$0.01` / `$0.002` / `$500,000` figures are removed as void.
- **Remaining supply is unknown** — two wallets were lost after the mint, so the amount left has to be read
  off another machine. How a lost wallet is treated on-chain is undecided.

Documents rewritten:

| File | Change |
|------|--------|
| `corrected_hrv_valuation.md` | Replaced with the settled model; void arithmetic listed explicitly |
| `updated_qstp_treasury_summary.md` | Reduced to the true current configuration: unfunded, $0 |
| `qstp_treasury_roadmap.md` | Strategy kept; all treasury-value projections removed, asset marked unconfirmed |
| `dao_deployment_steps.md` | **Rewritten from scratch** — was an EVM/web3 procedure, now Cardano/Aiken |
| `README.md` | Corrected supply, value and toolchain; removed the zip/`pip install web3` quick start |

Also corrected: `harvest_blockchain_architecture.md` §4 and §6.1, and the token-supply sentence in
`harvest_dao/docs/technical_documentation.md` and `blockchain/documentation/technical_documentation.md`.

## Version 2.0 — "Corrected HRV valuation" (superseded)

Removed v1.0's fantasy treasury (10M USDC, 5M ADA) and replaced arbitrary pricing with a backing-derived
model. **The shape was right; every number was wrong.** It kept a 50M supply, kept ADA as the backing asset
when funding is to be fiat, left the treasury documents asserting a $500K valuation that the valuation
document contradicted, and specified an EVM deployment for a Cardano project. Marked "Final Implementation"
at the time; it was not.

## Version 1.0 — Initial implementation (deprecated)

Treasury of 10M USDC and 5M ADA with HRV priced arbitrarily at $0.01. No funding source. Deprecated in v2.0
for being unrealistic.
