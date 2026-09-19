# AGENTS.md — HARVEST

Read this before doing any work in this repository. It is the honest inventory: what HARVEST is, what
actually exists on disk, and which documents in here cannot be trusted at face value.

Last verified: **2026-09-19**, against the working tree at `C:\HARVEST`.

---

## 1. What HARVEST is

HARVEST is a permissioned **Proof-of-Authority (PoA) sidechain for the Cardano ecosystem**, and the
**HARVEST DAO** that governs its treasury.

- **HRV coin** — **already minted on Cardano mainnet as a Cardano Native Token (CNT): 1,000,000,000.** This is
  the only HRV: the sidechain represents the locked CNT rather than minting its own. Used for transaction fees,
  governance and in-app rewards. Two wallets have since been lost, so the amount actually remaining is
  unconfirmed — see §3.
- **NFTs** — 3,125 designed NFTs minted on the sidechain. Cardano-minted NFTs are locked on the mainnet and
  represented as wrapped NFTs on HARVEST, and vice versa.
- **Node Handlers (Masters)** — the authorised validators. Round-robin block production at a fixed interval,
  authorised by identity and reputation rather than stake or computation. Minimum spec: dual-core CPU,
  8 GB RAM, 250 GB SSD, 10 Mbps up/down, Ubuntu 20.04+.
- **HARVEST DAO** — proposal lifecycle with Node Handler review, quadratic voting, and a multi-signature
  treasury. Growth strategy centres on QSTP (Qatar Science and Technology Park) entry in Q1 2026 bringing
  $100K of ADA backing, via the Compu-AId & ALSYS business.

### Direction, as decided on 2026-09-18

The sidechain + DAO material in `blockchain/` is the current project, built on **Cardano / Plutus** (eUTxO,
via the Cardano Sidechain Toolkit), with on-chain code in **Aiken**. The treasury is unfunded — it still has
to be funded with actual fiat, so **HRV has no value today**.

The **RWA positioning is superseded**, but not everything it claimed was wrong. It was published on the repo's
Docusaurus site until 2026-09-18, when that content was replaced (it remains in git history), and in the
`Gynode/HARVEST` history of Mar–May 2025: HRV as a Cardano Native Token backed by real-world assets,
Shari'ah-aligned, launched through an anti-whale smart wallet (send ADA, receive HRV at a fixed rate), revalued
roughly annually through a CSWAP liquidity pool, with lost wallets treated as burned. The token half of that is
true — HRV is minted on Cardano as a CNT. Superseded is the *positioning around it*: the CSWAP pool, the
smart-wallet launch, the annual revaluation. Do not build against those without asking.

---

## 2. What actually exists — component inventory

### 2.1 `blockchain/blockchain_code/` — prototypes, not software

Everything here is a single-file demonstration. None of it has networking, persistence, real cryptography,
or any connection to Cardano. There is no chain state, no mempool, no storage layer.

| File | What it really does |
|------|---------------------|
| `core_components/poa_consensus.py` | Round-robin leader selection: `select_leader(height)` returns `node_handlers[height % len]`. That part is coherent. The rest is not: `create_block()` sets `height = len(transactions)` — block height derived from the transaction count, which is wrong — and signs the block with the literal string `"signed_by_leader"`. `validate_block()` returns `True` unconditionally with a `# Placeholder for actual validation logic` comment. |
| `smart_contracts/hrv_token.py` | In-memory `dict` of balances. `transfer`/`mint`/`burn` mutate the dict and `print`. No signing, no authorisation beyond an `owner` string comparison, no persistence. |
| `smart_contracts/nft_contract.py` | Same shape for NFTs: an in-memory `nfts` dict, a monotonic `token_counter`, `metadata_uri` stored as given, `royalty_percentage` hardcoded to `0` as a placeholder. Its `__main__` mints all 3,125 NFTs into a dict. |
| `tools/harvest_cli.py` | An `argparse` skeleton whose handlers `print` things like `"Balance for {addr}: 1000 HRV (placeholder)"`. The imports of the core components are **commented out**. It does not call anything. |
| `tools/harvest_wallet.py` | Basic wallet sketch. Same standard. |
| `tools/harvest_explorer.py` | Explorer sketch. Same standard. |
| `tools/batch_mint_nfts.py` | Batch-mint sketch. Same standard. |

### 2.2 `blockchain/harvest_dao_package/harvest_dao/contracts/` — the substantive code

This is the best code in the repository: typed, dataclass-based, with real logic and docstrings. It is still
a **simulation**, not a deployable contract — everything runs in-process against a mock object that exposes
`add_pending_transaction()`.

| File | Contents |
|------|----------|
| `governance_token.py` | `GovernanceToken`: balances, delegation (`delegate`/`revoke_delegation`), `get_voting_power()` computed as own balance + delegated-in − delegated-away, `create_voting_snapshot(block_number)`, `can_create_proposal()` against `min_proposal_threshold` (0.1% of supply), `get_top_voters()`. |
| `proposal_manager.py` | `ProposalType` and `ProposalStatus` enums, full lifecycle from `DRAFT` through `EXECUTED`/`CANCELLED`, Node Handler review stage. |
| `voting_mechanism.py` | Quadratic voting, quorum and threshold handling. |
| `treasury_manager.py` | `AssetType` enum, multi-signature approvals, yield strategy, QSTP funding preparation. |

Each contract has an `if __name__ == "__main__"` block that exercises it and prints results — that is how they
are meant to be run.

`harvest_dao/tests/` and `harvest_dao/tools/` are **empty directories**. There is no test file anywhere under
`blockchain/`, and no linter or CI configuration for the Python code.

### 2.3 `blockchain/harvest_dao_package/harvest-dao-interface/` — a UI mockup

React 19 + Vite 6 + Tailwind 4 + shadcn/ui (Radix primitives, Recharts, react-router-dom, react-hook-form,
zod). Package manager is **pnpm** (`packageManager: pnpm@10.4.1`), with a `pnpm-lock.yaml`.

Components: `Dashboard`, `Proposals`, `Voting`, `Treasury`, `Governance`, `Sidebar`, plus ~50 shadcn/ui
primitives under `src/components/ui/`.

**It is not connected to anything.** A search of `src/` for `fetch(`, `axios`, `localhost`, `127.0.0.1`, and
`http://` returns nothing but an SVG asset; `Proposals.jsx` defines its data as a local `const proposals = [...]`.
There is no API layer, no contract binding, no wallet integration.

### 2.4 Documentation

`blockchain/development_plan/` (`harvest_blockchain_architecture.md`, `harvest_development_roadmap.md`,
`cardano_sidechain_research.md`, `todo.md`) and `blockchain/documentation/` (`technical_documentation.md`,
`node_handler_guide.md`, `user_guide.md`) are **design and intent documents written in the present tense about
software that does not exist**. `technical_documentation.md` describes `poa_consensus.py` as implementing
block signing and validation; `todo.md` ticks Phases 1–6 (core blockchain, smart contracts, tools,
documentation) as complete.

Treat all of it as specification, never as evidence of a working system. `cardano_sidechain_research.md` is
the exception — it is a genuine summary of how Cardano sidechains and PoA actually work, and is accurate.

### 2.5 `blockchain/harvest-onchain/` — the Aiken project (new, 2026-09-19)

**The first real on-chain code in the repository** — the only code here that can actually execute on Cardano.
Created 2026-09-19 with `aiken new`, once `onchain_design.md` had settled what to write.

| Path | What it is |
|------|-----------|
| `aiken.toml` | `gynode/harvest-onchain`, compiler `v1.1.23`, Plutus `v3`, depends on `aiken-lang/stdlib` `v3.1.0` |
| `lib/harvest/types.ak` | Shared types: `ProposalType`, `ProposalStatus`, `VoteChoice`, `VotingType`, `VotingParameters`, `VotingPower`, `Snapshot`, `Tally`, `ProposalDatum`, `Funding` |
| `lib/harvest/voting.ak` | The voting rules ported from `voting_mechanism.py`, with 17 tests |
| `validators/` | **Empty.** The scaffold's `placeholder.ak` was deleted — it was a `todo` stub, and the point now is real code |

**Deviation from the scaffold worth knowing:** `aiken new` also wrote
`.github/workflows/continuous-integration.yml` inside the project. GitHub only runs workflows from the
repository root's `.github/workflows/`, so that file is inert — it would need moving to
`.github/workflows/` at the root to do anything.

Deliberate departures from the Python specification in `voting.ak`, both recorded in its header comment:
**no floats** (percentages are integers and approval is compared by cross-multiplication, which is exact),
and **quorum divides by `voting_supply`, never the minted `total_supply`** — the fix for §3.2's item D.

Also checked and worth knowing before planning the Merkle migration: **`aiken-lang/stdlib` v3.1.0 has no
Merkle tree module**, so that path means writing the tree and its proofs by hand.

### 2.6 The websites — two trees

- **Repo root** (`docs/`, `src/`, `static/`, `docusaurus.config.js`, `package.json`, `sidebars.js`) — a
  Docusaurus **source** site (Docusaurus `2.0.0-beta.18`, React 17), built and deployed to `gh-pages`.
  **Rewritten 2026-09-18** to describe the current direction: introduction, the HRV token, governance, the
  NFTs, Node Handlers, and project status.

  Its previous content was the superseded RWA narrative — `1 ADA = 1,000 HRV`, a smart-wallet launch, staking
  ADA in the HARVEST pool, a CSWAP liquidity pool — and the `How-to-Participate/` group holding it has been
  deleted, as has the `markdown-page` template page. Recoverable from git history. The `blog/` directory is
  disabled in the config because its only posts were the Docusaurus template's own.

  The site states two things explicitly, on the user's instruction: that the circulating supply is unconfirmed
  because **two wallets holding HRV were lost after the mint** — with the caveat that how a lost wallet is
  treated on-chain is not finalised, so the supply should not be assumed reduced — and that **HRV has no value,
  with no price, exchange rate or sale offered**. It quotes no HRV figure, because there is none to quote.
- **`website/`** — a **separate git repository** (`Gynode/HARVEST-Docusaurus-Site`) containing a *built*
  Docusaurus site with a different content set: a whitepaper (abstract, introduction, vision-mission,
  tokenomics, core-technology-architecture, use-cases-applications, ecosystem-community, roadmap, team-legal,
  conclusion), plus `HARVEST_Technical_Documentation`, `HARVEST_User_Guide`, and `HARVEST_Deployment_Guide`.
  This is the sidechain-era site. It is ignored by the root repo — see §5.
- **`manus-website-update_node_handler_rewards/`** — another built copy of the site, from a node-handler-rewards
  update, with no source. Ignored.

---

## 3. Contradictions: settled and open

### 3.1 Settled by the user, 2026-09-18

These override every older document.

1. **Platform = Cardano/Plutus.** eUTxO, via the Cardano Sidechain Toolkit.
2. **On-chain language = Aiken.** It compiles to Plutus Core and targets the same ledger as Plutus Tx — it is
   not a separate chain.
3. **HRV supply = 1,000,000,000**, minted on Cardano mainnet as a Cardano Native Token.
4. **One HRV; there is no second supply.** The CNT is locked on mainnet under a Plutus script and the
   sidechain represents the locked amount. Sidechain supply is bounded by what is locked and can never exceed
   the mainnet supply.
5. **HRV value = none yet.** The treasury is unfunded and must be funded with actual fiat. Value derives from
   backing; it is not asserted for the token.

**The documents have been brought into line with these** (2026-09-18):

| File | What changed |
|------|--------------|
| `harvest_dao_package/corrected_hrv_valuation.md` | Replaced with the settled model; the void arithmetic listed explicitly |
| `harvest_dao_package/updated_qstp_treasury_summary.md` | Reduced to the true configuration: unfunded, $0 |
| `harvest_dao_package/qstp_treasury_roadmap.md` | Strategy kept, all value projections removed, asset marked unconfirmed |
| `harvest_dao_package/dao_deployment_steps.md` | **Rewritten from scratch** — was EVM/web3, now Cardano/Aiken |
| `harvest_dao_package/README.md` | Corrected supply, value, toolchain |
| `harvest_dao_package/CHANGELOG.md` | Records which numbers are void |
| `harvest_blockchain_architecture.md` | §4 bridge model, §6.1 supply, §7 language platform, status banner |
| Both technical documentation files | Supply line corrected; status banners added |
| `blockchain/documentation/*` | Status banners on all three |

Two further EVM artifacts were found and removed while doing this: **"ERC20-compliant token"** in
`harvest_dao/docs/technical_documentation.md`, and **"low gas fees"** in the architecture document's §7.

**The Docusaurus build was broken and is now fixed.** The site at the repo root could not build at all:

- `sidebars.js` exported a hand-written sidebar naming the doc ids `how-to-participate` and `whitepaper`.
  Neither exists in this repo — the whitepaper belongs to `website/`, the *other* site. The working
  autogenerated config was already in the same file, with its `module.exports` commented out.
- `docusaurus.config.js` (navbar) and `src/pages/index.js` (hero button) both pointed at `/docs/intro`; the
  doc's id is `introduction`.
- `onBrokenLinks: 'throw'` made both fatal rather than warnings.

So **`main` has never been buildable**, and the old `path: '.'` workflow could never have published a working
site from it either — it uploaded raw source with no `index.html` at the root. Fixed 2026-09-18; the build now
succeeds and serves. Note the stack is Docusaurus `2.0.0-beta.18` / React 17, and the build prints an upgrade
notice for 3.x — a separate decision, not made here.

**Nothing is implemented.** There is still no Plutus, Aiken or Haskell source in the repository — the contracts
remain Python simulations, which cannot run on Cardano.

### 3.2 Settled 2026-09-19 — the on-chain design

The five questions that blocked the Aiken work are answered. Full reasoning in
`blockchain/harvest_dao_package/onchain_design.md`; `dao_deployment_steps.md` §2 is updated to match.

| | Decision |
|---|---|
| **A. Host ledger** | **Cardano**, not the sidechain. HRV on the sidechain is a representation of locked CNT, so sidechain governance would make the Node Handler set the final authority over the treasury. The sidechain consumes governance decisions through the Chain Follower. |
| **B. Which Python file is the spec** | **`voting_mechanism.py` for vote parameters and weighting** (per-type quorum and approval, quadratic where configured, power read at the snapshot block). **`proposal_manager.py` for the lifecycle only** — the open question below explains why. |
| **1. On-chain / off-chain split** | On-chain: proposal lifecycle, snapshot commitment, vote tally, treasury authorisation, parameters. Off-chain: proposal text, snapshot construction, UI, reporting. |
| **2. Treasury custody** | **Aiken validator *plus* M-of-N treasury-committee signatures** (`tx.extra_signatories`). The validator checks the proposal UTxO is spent in the same transaction, its datum says `Passed`, and recipient and amount match; the timelock is `tx.validity_range` against a deadline in the proposal datum. A native script was rejected: it cannot read a datum or inspect a transaction, so it can never tie a spend to a specific proposal. |
| **3. Voting power** | **A snapshot committed in the proposal datum**, read directly by the validator — nothing to trust at this electorate size. Merkle root is the migration path once the map outgrows the transaction size limit. |
| **Fiat and the treasury** | **One treasury, on-chain, with fiat converted on entry.** A script address custodies ADA and native tokens and nothing else — it cannot hold a bank balance. Recorded with the decision: the backing is whatever the fiat was converted *into* (exposed to that issuer, not to the currency), and the conversion step is off-chain and unverifiable by any script. |
| **Quorum basis** | **A governance-set `voting_supply` parameter** — never the minted 1,000,000,000. `voting_supply` starts at the snapshot total and governance can correct it as lost wallets are confirmed. |
| **Delegation** | **All-or-nothing** — the whole position, as Cardano's own stake delegation. `amount` and `min_delegation_amount` are **not** ported; the Python validated an amount that `get_voting_power()` then ignored. |

**The specification contradicts itself, and this was not previously recorded.** `proposal_manager.py` and
`voting_mechanism.py` are not two halves of one system — each is a complete voting implementation, and they
disagree. `proposal_manager.start_voting()` creates a voting-power snapshot and `cast_vote()` then reads
**live balances** anyway, so under that file a voter can move HRV after the snapshot and still vote the old
weight; quorum and approval are fixed constants there and per-proposal-type in the other file. There is no
single behaviour to port from both. **Resolution:** port vote parameters and weighting from
`voting_mechanism.py` (it honours the snapshot it creates) and the lifecycle from `proposal_manager.py`, then
remove the duplicate vote paths from `proposal_manager.py` so one specification remains.

**A second spec defect:** `governance_token.delegate(delegator, delegate, amount)` validates and records
`amount`, then `get_voting_power()` ignores it — it adds the delegator's *entire current balance* to the
delegate. So delegation is all-or-nothing in effect, the `min_delegation_amount = 1000` check applies to a
number that is never used, and delegated power changes retroactively when the delegator's balance moves.
Whether delegation should be partial-amount or all-or-nothing is open — see §3.3.

**Consequence for the roadmap:** quorum and approval thresholds must be expressed against a governance-set
`voting_supply` parameter, **never against the minted 1,000,000,000**. That removes the lost-wallet supply
figure from the critical path: it now affects only the initial value of one parameter, not the validator
logic.

### 3.3 Still open

Do not resolve any of these by assumption.

1. **Remaining HRV supply.** Two wallets were lost after the mint, so the amount actually left has to be read
   off another computer. Related and undocumented: the repo-root site states "lost wallets are treated as
   burned, reducing supply", but nothing in the sidechain docs says how a lost wallet is reflected on-chain.
   **This no longer blocks the validators** — see §3.2 and `onchain_design.md` §D — only the initial value
   of the `voting_supply` parameter, which governance can correct later.
2. **The QSTP request.** Funding is to be fiat, but `qstp_treasury_roadmap.md` previously specified ADA
   amounts (100,000 ADA / "$100,000 worth of ADA"). The amount and asset of the actual request must be
   restated before the document is used for an application. Note also that earlier drafts ran together two
   different funding routes — Project Catalyst (development costs) and QSTP (treasury backing).
3. **Three documents describe the treasury as holding fiat.** The decision is that it holds on-chain assets
   with fiat converted on entry (§3.2), but `corrected_hrv_valuation.md`, `qstp_treasury_roadmap.md` and
   `updated_qstp_treasury_summary.md` still say value comes from funding "the treasury" with "actual fiat"
   without saying it becomes a converted asset first. A reader is entitled to assume otherwise, which the
   chain cannot deliver. The wording pass is owed. See `onchain_design.md` §C.
4. **`website/`** — the separate repository (`Gynode/HARVEST-Docusaurus-Site`) holding a *built*
   sidechain-era site with a whitepaper. Adding it to this repo as-is would create a gitlink with no
   `.gitmodules`; absorbing it means deleting `website/.git` and discarding that history. Neither was done —
   it is ignored. Now that the repo-root site has been rewritten, decide whether `website/`'s whitepaper
   content should be folded into it, kept separate, or dropped.
5. **`treasury_manager.py`'s demo still claims a funded treasury.** Its `__main__` block prints a **$47.5M
   treasury** — 300,000,000 HRV at $0.10, 10M USDC, 5M ADA at $0.50, 5M DAI — with Compound and Yearn yield
   strategies and an `AssetType.LP_TOKEN`. Every part of that contradicts settled decisions: the treasury is
   unfunded, HRV has no value, and DAI/Compound/Yearn are not on Cardano. The documents were corrected on
   2026-09-18; this demo block was missed, so running the contract as §4 instructs still prints a funded
   treasury with a price. `onchain_design.md` gives the fix: reduce the demo to the true configuration and
   drop the non-Cardano assets.

---

## 4. Running things

```bash
# DAO contracts — each has an __main__ demo block
python blockchain/harvest_dao_package/harvest_dao/contracts/governance_token.py
python blockchain/harvest_dao_package/harvest_dao/contracts/proposal_manager.py
python blockchain/harvest_dao_package/harvest_dao/contracts/voting_mechanism.py
python blockchain/harvest_dao_package/harvest_dao/contracts/treasury_manager.py

# Prototype demos
python blockchain/blockchain_code/core_components/poa_consensus.py
python blockchain/blockchain_code/smart_contracts/hrv_token.py
python blockchain/blockchain_code/smart_contracts/nft_contract.py
python blockchain/blockchain_code/tools/harvest_cli.py --help

# DAO interface
cd blockchain/harvest_dao_package/harvest-dao-interface
pnpm install && pnpm dev

# Aiken — installed 2026-09-19 as v1.1.23 at C:\Users\gydan\.aiken\bin (user PATH)
aiken --version
aiken new harvest_dao && cd harvest_dao   # nothing has been created yet
aiken build      # compiles; emits plutus.json (CIP-57 blueprint)
aiken check      # runs the test blocks
```

Python standard library only — no `requirements.txt`, no virtualenv, no pinned versions anywhere in the
repository.

---

## 5. Repository rules

- **Remote:** `https://github.com/Gynode/HARVEST.git`, branch `main`.
- **`main` is a live GitHub Pages site.** Pushing to it runs the deploy workflow. Never push without the
  user's explicit go-ahead.
- **Deployment: the site is live and correct as of 2026-09-19.** `.github/workflows/static.yml` builds the site
  and force-pushes `build/` to the **`gh-pages`** branch (currently `7e97f12`, built from `8968651`). It does
  **not** use `actions/deploy-pages`, because the repository's Pages settings do not offer "GitHub Actions" as
  a source — the source is "Deploy from a branch", and **the user has now repointed it to `gh-pages` / `(root)`**.
  Verified against the live site: `https://gynode.github.io/HARVEST/` serves the Docusaurus build
  (`/assets/css/styles.64bc7f80.css`, `/assets/js/main.46f4128f.js`), with `/docs/introduction/`,
  `/docs/hrv-token/` and `/docs/status/` all returning 200 and rendering their headings.
- **Only `build/` is published.** A consequence worth knowing, because it changed on 2026-09-19: while Pages
  served `main` / `(root)`, Jekyll rendered the repository's markdown, so `AGENTS.md` and `CLAUDE.md` were
  publicly readable at `/HARVEST/AGENTS.html` and `/HARVEST/CLAUDE.html`. They no longer are, and neither is
  anything else outside `build/` — `blockchain/`, the project docs and the internal notes are all off the web.
- **Ignored on purpose** (see `.gitignore`): `website/`, `manus-website-update_node_handler_rewards/`,
  `*.zip`, and the usual Python/Node artifacts. The two site trees are ignored because they are builds, not
  source, and `website/` is a separate repository.
- **Scope:** HARVEST only. Never merge with other repositories or folders.
- When a document contradicts the code, the code wins — and record the contradiction in this file rather
  than quietly choosing.

---

## 6. Where the work actually is

The gap between the documents and reality is the whole story of this repo: the architecture, roadmap, and
user guides describe a finished sidechain; what exists is a PoA leader-selection demo, four simulation-grade
DAO contracts, a disconnected UI mockup, and zero tests.

**Everything in `blockchain/` is deliberately a stub, and the plan (stated 2026-09-18) is to fill it with
actual code.** One consequence is structural, not cosmetic: the stubs are **Python**, but the settled platform
is **Cardano/Plutus**, so they cannot be completed by filling in function bodies. The Python DAO contracts are
best treated as the *behavioural specification* — governance, delegation, voting power, quadratic voting,
proposal lifecycle, treasury approvals — to be reimplemented in Plutus (Haskell) or Aiken. Nothing written in
Python will execute on Cardano.

The documents are now in line with the settled decisions (§3.1, §3.2). **The on-chain design is settled, so
Aiken can be written** — that was the gate. The starting points are:

1. **Write the validators in Aiken.** Aiken was installed on 2026-09-19 (v1.1.23, via `aikup`), so this is
   unblocked. `cardano-cli` and `pnpm` are still missing, and are needed only from §5 onward — deploying to a
   testnet, and running the interface.
2. **Port the behaviour from the Python specification** rather than
   translating the Python. Per §3.2, port vote parameters from `voting_mechanism.py` and the lifecycle from
   `proposal_manager.py`, and do not reproduce `get_voting_power()`'s delegation bug.
3. **Build in this order**: the **bridge locking validator** first — the sidechain's HRV is a representation
   of locked CNT, so nothing touching HRV works without it and its design is already settled — then the
   governance validator, the treasury validator, and the parameter/config validator. Then node software,
   P2P, storage, and the Chain Follower.
4. **Somewhere along the way, two smaller jobs:** find the remaining HRV supply (§3.3, item 1 — no longer
   blocking, but the `voting_supply` parameter wants a real number), and fix `treasury_manager.py`'s demo,
   which still prints a funded $47.5M treasury with EVM assets and an HRV price (§3.3, item 5).
