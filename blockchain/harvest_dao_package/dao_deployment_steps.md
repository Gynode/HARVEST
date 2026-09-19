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
# Aiken — INSTALLED 2026-09-19 as v1.1.23, at C:\Users\gydan\.aiken\bin (on the user PATH).
# It came via aikup, the version manager: npm install -g @aiken-lang/aikup, then `aikup`.
aiken --version

# Tools you will also need, and which are NOT installed yet
#   - a Cardano node (or a provider such as Blockfrost / Koios / Maestro)
#   - cardano-cli, or a transaction builder (Lucid, Mesh)
```

## 2. Design before code

**All settled 2026-09-19.** Reasoning in `onchain_design.md`. Nothing here blocks anything any more.

- [x] **What is on-chain.** On-chain: proposal lifecycle, voting-power snapshot commitment, vote tally,
      treasury spend authorisation, and governance parameters. Off-chain: proposal title and description,
      snapshot construction, the voter interface, and reporting.
- [x] **The treasury custody model — Plutus validator plus committee signatures.** The Aiken validator
      enforces the proposal check (the referenced proposal UTxO is spent in the same transaction, its datum
      says `Passed`, and the recipient and amount match) *and* requires M-of-N treasury-committee signatures
      via `tx.extra_signatories`. Timelocks come from `tx.validity_range` against a deadline in the proposal
      datum. A native script alone was rejected: it cannot read a datum or inspect a transaction, so it can
      express "3 of 5 keys signed" but never "…and this matches proposal 7".
- [x] **Voting power's source of truth — a snapshot committed in the proposal datum.** Power is frozen at
      proposal creation and the validator reads it directly, so no proof is needed and there is nothing to
      trust at this electorate size. A validator cannot read an address's balance, so the alternatives were
      a Merkle-root snapshot (the migration path once the map outgrows the transaction size limit) or
      reading the voter's UTxOs live (rejected: undercounts unless the voter spends every HRV UTxO, and
      power can be borrowed within one atomic transaction).
- [x] **Which ledger hosts the DAO — Cardano.** Not the sidechain: HRV on the sidechain is a representation
      of locked CNT, so sidechain governance would make the Node Handler set the final authority over the
      treasury. The sidechain consumes governance decisions through the Chain Follower.

- [x] **What the treasury holds — on-chain assets only, with fiat converted on entry.** A script address can
      custody ADA and native tokens and nothing else; it cannot hold a bank balance. The DAO therefore has
      **one** treasury, on-chain, and fiat becomes an on-chain asset before it reaches it. Two consequences
      are recorded in `onchain_design.md` §C and belong in the treasury documents: the backing is whatever the
      fiat was converted *into* (exposed to that issuer, not to the currency), and the conversion step itself
      is off-chain and unverifiable by any script.
- [x] **The quorum denominator — a governance-set `voting_supply` parameter.** No threshold is ever computed
      against the minted 1,000,000,000.
- [x] **Delegation — all-or-nothing.** Delegating hands over the whole position, as Cardano's own stake
      delegation does. `amount` and `min_delegation_amount` are **not** ported: the Python validated an amount
      that `get_voting_power()` then ignored.

**One consequence worth noting:** because quorum is denominated against a governance-set `voting_supply`
parameter rather than the minted supply, the lost-wallet figure does not block the validators — only the
initial value of that one parameter, which governance can correct afterwards. **Nothing in this section
blocks the Aiken work any more.**

## 3. Build the validators

**The project exists as of 2026-09-19** — at `blockchain/harvest-onchain/`, not `harvest_dao/`. It is
`gynode/harvest-onchain` on Aiken `v1.1.23`, Plutus `v3`, with `aiken-lang/stdlib` `v3.1.0`.

```bash
cd blockchain/harvest-onchain

# the validators live in validators/ — nothing there yet
aiken build      # compiles; emits plutus.json (CIP-57 blueprint)
aiken check      # runs the test blocks
aiken fmt
```

What exists so far:

- `lib/harvest/types.ak` — the shared types (proposal, snapshot, tally, voting parameters).
- `lib/harvest/voting.ak` — the voting rules from `voting_mechanism.py`: per-type default parameters,
  quadratic/weighted/linear weighting, quorum, approval, tallying. **17 tests, all passing.**

**Two deliberate departures from the Python, both documented in the module.** There are no floats on-chain,
so percentages are integers and approval is a cross-multiplication (`yes * 100 >= approval_percent *
(yes + no)`) — exact, rather than the Python's float comparison. And quorum divides by `voting_supply`, not
the minted `total_supply`, per §2 above.

Port the rest of the behaviour from the Python specification: delegation and voting power
(`governance_token.py`), proposal lifecycle and Node Handler review (`proposal_manager.py`), quadratic voting
with quorum (`voting_mechanism.py`), and multi-signature treasury with timelocks (`treasury_manager.py`).
Per `onchain_design.md` §B, **`voting_mechanism.py` is the specification for vote parameters and weighting,
`proposal_manager.py` for the lifecycle only** — they are two complete implementations and they disagree.

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

**Updated 2026-09-19 — the bridge now has a design, and its first validator is written.** See
`blockchain/bridge_design.md` for the reasoning and `validators/lock.ak` for the script, whose rules and
9 tests live in `lib/harvest/bridge.ak`.

The design, in one paragraph: a Cardano validator cannot see the sidechain, so it cannot establish that a
burn happened. Something has to tell it, and the only thing a script can verify is a signature. So this is a
**custodial** bridge — the user holds the signing key, settled 2026-09-19 — and it is written as M-of-N
anyway so that raising the threshold to a committee later is a deployment parameter rather than a rewrite.
The validator limits the signer's power in one specific way: the attesters choose *when* a release happens,
never *to whom* — the transaction must pay the lock's recorded owner everything the lock held.

**The "bridge first" ordering no longer holds, and it never really did.** The HRV CNT already exists on
Cardano mainnet, which is where the DAO now lives (§2), so the governance and treasury validators can be
written against the real CNT policy id without the bridge existing. And the one place the two designs touch —
whether locked HRV votes — is now settled as **no** (`bridge_design.md` §7), which means the snapshot builder
does not read the lock script at all. The DAO validators and the bridge are independent.

Also unresolved: **the amount of HRV actually remaining** after two wallets were lost. This no longer blocks
the validators — see §2 — provided quorum and approval thresholds are expressed against a governance-set
`voting_supply` parameter rather than against the minted 1,000,000,000. What it does block is the *initial
value* of that parameter, which is set at deployment and can be corrected by governance afterwards.

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
