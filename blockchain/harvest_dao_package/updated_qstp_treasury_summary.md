# HARVEST DAO Treasury — Current Configuration

**Settled 2026-09-18.** The figures previously in this file were wrong and have been removed.

## Today

| | |
|---|---|
| Treasury holdings | **none** |
| Treasury value | **$0** |
| HRV value | **$0 — no backing exists** |
| Funding required | **actual fiat** |

The treasury is unfunded. Nothing has been contributed, and no funding has been secured.

## What was removed, and why

This file previously projected a $500,000–$600,000 treasury from "50,000,000 HRV @ $0.01" plus "$100,000
worth of ADA", growing to $1,300,000+. Three things were wrong with that:

1. **The supply.** HRV supply is **1,000,000,000**, minted on Cardano mainnet as a Cardano Native Token — not
   50,000,000. There is no separate sidechain supply to hold.
2. **The price.** A token with no backing has no price. Assigning one at $0.01 and then counting the holding as
   treasury value is circular — the treasury was valued at a price derived from the treasury's own token.
3. **The asset.** Funding is to be in **fiat**, not ADA.

## Still to confirm

- Whether the QSTP route in `qstp_treasury_roadmap.md` remains the funding strategy, and in what asset.
- The remaining HRV supply after the two lost wallets.
- Any yield strategy. There is nothing to stake or lend until the treasury is funded.
