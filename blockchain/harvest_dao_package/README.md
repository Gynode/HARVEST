# HARVEST DAO — Package

Governance, proposals, voting and treasury for HARVEST, the Proof-of-Authority sidechain on Cardano.

**Status: design and specification only. Nothing here is deployed, and there is no on-chain code.**

## Contents

| Path | What it is |
|------|-----------|
| `harvest_dao/contracts/` | **Python specification** of the DAO's behaviour — governance token, proposal manager, quadratic voting, treasury manager. Runs, prints, and demonstrates its own logic. Not deployable. |
| `harvest_dao/docs/` | Technical documentation and user guide for that specification |
| `harvest_dao/tests/`, `harvest_dao/tools/` | **Empty** |
| `harvest-dao-interface/` | React 19 + Vite + Tailwind + shadcn/ui. A UI **mockup** — hardcoded data, no network calls |
| `dao_deployment_steps.md` | The intended Cardano/Aiken deployment path (nothing to deploy yet) |
| `corrected_hrv_valuation.md` | The HRV valuation model |
| `qstp_treasury_roadmap.md`, `updated_qstp_treasury_summary.md` | Funding strategy and current treasury configuration |
| `CHANGELOG.md` | What changed, and which numbers are void |

## The DAO

- **Governance token** — HRV, with delegation, voting-power snapshots, and a proposal threshold of 0.1% of
  supply.
- **Proposal manager** — lifecycle from draft through Node Handler review to execution or cancellation.
- **Voting** — quadratic, with quorum and thresholds.
- **Treasury** — multi-signature control, yield strategies, QSTP funding preparation.

All four exist as Python with typed interfaces, dataclasses and working demos. They run against a mock
`blockchain_state` object.

## Facts to read before the numbers

- **HRV supply is 1,000,000,000**, minted on Cardano mainnet as a Cardano Native Token. There is no separate
  sidechain supply: the sidechain represents the locked CNT. (Earlier versions of this package said 50M.)
- **HRV has no value today.** The treasury is unfunded and is to be funded with **actual fiat**. Any per-coin
  figure you find in these documents is void.
- **The platform is Cardano/Plutus**, and on-chain code is to be written in **Aiken**. Python does not run on
  Cardano — the contracts here are a specification to port, not code to complete.
- **Two wallets were lost** after the mint, so the remaining supply is not yet known.

## Running the specification

```bash
# Each contract has an __main__ block that exercises it
python harvest_dao/contracts/governance_token.py
python harvest_dao/contracts/proposal_manager.py
python harvest_dao/contracts/voting_mechanism.py
python harvest_dao/contracts/treasury_manager.py

# The interface
cd harvest-dao-interface && pnpm install && pnpm dev
```

Standard library only — no dependencies to install.

## Next

See `dao_deployment_steps.md`. The short version: settle the token model and the bridge design, then write the
validators in Aiken and port the four contracts' behaviour to them.
