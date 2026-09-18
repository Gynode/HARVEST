# HARVEST DAO — Deployment Plan (Cardano)

**Rewritten 2026-09-18.** The previous version of this file was an EVM/web3 procedure — `pip3 install web3`,
`HARVEST_RPC_URL`, `HARVEST_CHAIN_ID`, `DEPLOYER_PRIVATE_KEY`, `0x...` contract addresses, and running the
Python files as though that deployed them. **None of that applies.** HARVEST is a Cardano/Plutus project.

**Nothing is deployed, and no on-chain code exists yet.** There are no validators to deploy — the Python in
`harvest_dao/contracts/` is a behavioural specification (see `harvest_dao/docs/technical_documentation.md`).
This document is the intended path, not a runbook; steps are marked with what actually exists.

## 1. Language and toolchain

On-chain code is written in **Aiken** (decided 2026-09-18). It compiles to Plutus Core and targets the same
ledger as Plutus Tx — it is not a separate chain.

```bash
# Install Aiken (see aiken-lang.org for the current instructions)
aiken --version

# Tools you will also need
#   - a Cardano node (or a provider such as Blockfrost / Koios / Maestro)
#   - cardano-cli, or a transaction builder (Lucid, Mesh)
```

## 2. Design before code

Not yet done, and blocking:

- [ ] **Decide what is on-chain.** Governance voting and treasury custody do not have to live in the same
      validator. Settle the split before writing any of it.
- [ ] **Decide the treasury custody model.** Cardano multi-signature can be a native script or a Plutus
      validator; the choice drives how treasury spends are authorised.
- [ ] **Decide voting power's source of truth.** Voting power is computed from HRV holdings and delegations.
      On-chain, that means either a snapshot datum or a validator that reads the holder's UTxO — this is the
      central design question of the whole DAO.

## 3. Build the validators

```bash
aiken new harvest_dao
cd harvest_dao

# the validators live in validators/
aiken build      # compiles; emits plutus.json (CIP-57 blueprint)
aiken check      # runs the test blocks
aiken fmt
```

Port the behaviour from the Python specification: delegation and voting power (`governance_token.py`),
proposal lifecycle and Node Handler review (`proposal_manager.py`), quadratic voting with quorum
(`voting_mechanism.py`), and multi-signature treasury with timelocks (`treasury_manager.py`).

The Python files are useful as *behaviour* — they are typed, readable, and each has a working demo. Port the
rules, not the code.

## 4. Test

Aiken has tests built in (`test` blocks, run by `aiken check`). Additionally:

- [ ] Property tests over voting power: delegation in/out nets correctly; no address can exceed total supply.
- [ ] Proposal lifecycle: illegal transitions are rejected (e.g. executing a proposal that never passed).
- [ ] Treasury: a spend without the required approvals fails.
- [ ] Quadratic voting: cost curve behaves at boundaries (zero votes, maximum votes).

There is currently **no test suite of any kind** in `harvest_dao/tests/` — that directory is empty.

## 5. Deploy to a testnet

Work on **Preview** or **Preprod** first. Never on mainnet until the token model question below is settled.

- [ ] Fund a test wallet from the testnet faucet.
- [ ] Publish the validators (reference scripts) and record the script hashes.
- [ ] Register the DAO's own state UTxO (treasury address, proposal counter, parameter datum).

## 6. The bridge is a prerequisite for anything touching HRV

The sidechain does not mint its own HRV. The CNT is locked on Cardano mainnet under a Plutus script and the
sidechain represents the locked amount (settled 2026-09-18 — see `corrected_hrv_valuation.md`).

That means the DAO's on-chain code depends on the bridge's locking validator, which **does not exist yet**.
Settle the bridge design first or build against a placeholder.

Also unresolved and load-bearing: **the amount of HRV actually remaining** after two wallets were lost. No
governance parameter that references supply should be fixed until that is known.

## 7. Initial configuration

Node Handlers and the treasury committee are **Cardano addresses** (bech32, `addr1...`), not `0x...`
addresses. Configuring them means registering keys and, where authority is on-chain, putting their
credentials into the validator's datum or a native script.

There is no `add_node_handler()` transaction today — the Python method is a `list.append()` on an in-memory
list.

## 8. Web interface

The React interface in `harvest-dao-interface/` is a **mockup**: it renders hardcoded data and makes no
network calls at all. It needs a backend before it can show anything real.

```bash
cd harvest-dao-package/harvest-dao-interface
pnpm install
pnpm dev        # http://localhost:5173
```

Its environment variables must describe a Cardano deployment, not an EVM one:

```bash
# Replaces the old VITE_HARVEST_RPC_URL / VITE_CHAIN_ID / *_CONTRACT_ADDRESS block.
VITE_CARDANO_NETWORK=preprod
VITE_BLOCKFROST_PROJECT_ID=...
VITE_GOVERNANCE_SCRIPT_HASH=...
VITE_TREASURY_SCRIPT_HASH=...
```

Serving the production build (`pnpm build`, then Vercel/Netlify/static host) is unchanged from before and is
the one part of the old document that still holds.

## 9. Security checklist

- [ ] Keys generated and stored offline; no key material in the repo or in CI
- [ ] Treasury spends require the agreed quorum — as a native script or in the validator, tested
- [ ] Timelocks implemented via validity intervals and a deadline datum, and tested
- [ ] Every validator has failure tests, not only success tests
- [ ] The Python specification and the Aiken implementation are checked against each other, rule by rule
- [ ] No private key, mnemonic or seed phrase appears in any document in this repository

## What was removed

The old Phase 3.3 "Fund Initial Treasury" block, which added 50,000,000 HRV to the treasury at `$0.00` and
then computed an HRV price of $0.002 from a $100,000 ADA backing. Supply, price and asset were all wrong. See
`corrected_hrv_valuation.md`.
