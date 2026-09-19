# HRV Valuation Model

**Settled 2026-09-18.** This replaces the earlier "$0.01 per HRV" model, which was wrong.

## The model in one line

**HRV has no standalone value.** It is worth only whatever proportion of the DAO treasury backs it — and the
treasury is currently **unfunded**.

## Supply

- **1,000,000,000 HRV were minted on Cardano mainnet** as a Cardano Native Token (CNT). This is the only HRV
  supply.
- **Two wallets have since been lost.** The amount actually remaining has not been confirmed — it has to be
  read off another machine. Until then, no figure should be treated as the circulating supply.
- The project website states that lost wallets are treated as burned, reducing supply. How a lost wallet is
  reflected on-chain has **not** been decided.

## One HRV, represented on the sidechain

The sidechain does not mint its own HRV. The CNT is locked on Cardano mainnet under a Plutus script and the
sidechain represents the locked amount. Sidechain supply is therefore bounded by what is locked on mainnet,
and burning the representation releases the CNT.

Earlier drafts of this package described a separate **50,000,000** HRV "from existing supply" sitting in the
treasury. That was wrong in both amount and model — there is no second supply to hold.

## Value

| | |
|---|---|
| Standalone value | **$0.00** |
| Backing today | **none — the treasury is unfunded** |
| What creates value | funding the treasury with **actual fiat** |

Value derives from the treasury; it is not asserted for the token. A per-coin figure is therefore undefined
until the treasury holds assets.

**Void arithmetic.** The following appeared in this package and must not be reused:

- "$100,000 ADA backing ÷ 50,000,000 HRV coins = $0.002 per HRV" — wrong supply, and the backing was never
  secured.
- The growth scenarios built on it ("$200K → $0.004", "$500K → $0.01", "$1M → $0.02") — same.
- "$500,000 treasury (50M HRV @ $0.01)" — circular: the treasury was being valued at a price derived from
  holding the treasury's own token.

The backing asset is **fiat**, not ADA.

## What this means for governance

Voting power is denominated in HRV, not in currency, so governance is unaffected by the treasury being
unfunded. Proposal thresholds are set in HRV amounts — see `harvest_dao/docs/technical_documentation.md`.

## Open

1. The remaining supply, after the two lost wallets.
2. How a lost wallet is treated on-chain (burned? unspendable? both, depending on custody?).
3. The size, asset and **source** of the first treasury funding — see `treasury_funding_roadmap.md`. As of
   2026-09-19 no source is named: QSTP and Project Catalyst were both removed, and funding is being sourced
   with 2027 as the target.
