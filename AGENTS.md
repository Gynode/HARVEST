# AGENTS.md — HARVEST

Read this before doing any work in this repository. It is the honest inventory: what HARVEST is, what
actually exists on disk, and which documents in here cannot be trusted at face value.

Last verified: **2026-09-18**, against the working tree at `C:\HARVEST`.

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

### 2.5 The websites — two trees

- **Repo root** (`docs/`, `src/`, `static/`, `docusaurus.config.js`, `package.json`, `sidebars.js`) — a
  Docusaurus **source** site (Docusaurus `2.0.0-beta.18`, React 17), built and deployed to `gh-pages`.
  **Rewritten 2026-09-18** to describe the current direction: introduction, the HRV token, governance, the
  NFTs, Node Handlers, and project status.

  Its previous content was the superseded RWA narrative — `1 ADA = 1,000 HRV`, a smart-wallet launch, staking
  ADA in the HARVEST pool, a CSWAP liquidity pool — and the `How-to-Participate/` group holding it has been
  deleted, as has the `markdown-page` template page. Recoverable from git history. The `blog/` directory is
  disabled in the config because its only posts were the Docusaurus template's own.

  The rewrite deliberately **omits** two things it could have said: the reason the circulating supply is
  unconfirmed (the two lost wallets), and any figure for HRV's value. Supply is described as "being
  confirmed"; value as none, since the treasury is unfunded. If those should be stated publicly, that is the
  user's call.
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

### 3.2 Still open

Do not resolve any of these by assumption.

1. **Remaining HRV supply.** Two wallets were lost after the mint, so the amount actually left has to be read
   off another computer. Related and undocumented: the repo-root site states "lost wallets are treated as
   burned, reducing supply", but nothing in the sidechain docs says how a lost wallet is reflected on-chain.
2. **The QSTP request.** Funding is to be fiat, but `qstp_treasury_roadmap.md` previously specified ADA
   amounts (100,000 ADA / "$100,000 worth of ADA"). The amount and asset of the actual request must be
   restated before the document is used for an application. Note also that earlier drafts ran together two
   different funding routes — Project Catalyst (development costs) and QSTP (treasury backing).
3. **On-chain design.** What belongs in a validator versus off-chain; whether treasury custody is a Cardano
   native script or a Plutus validator; and where voting power's source of truth lives (a snapshot datum, or a
   validator reading the holder's UTxO). See `dao_deployment_steps.md` §2. All of these block writing any
   Aiken.
4. **`website/`** — the separate repository (`Gynode/HARVEST-Docusaurus-Site`) holding a *built*
   sidechain-era site with a whitepaper. Adding it to this repo as-is would create a gitlink with no
   `.gitmodules`; absorbing it means deleting `website/.git` and discarding that history. Neither was done —
   it is ignored. Now that the repo-root site has been rewritten, decide whether `website/`'s whitepaper
   content should be folded into it, kept separate, or dropped.
5. **The push to `main`, and one Pages setting.** The workflow is verified locally end to end: `npm ci &&
   npm run build` succeeds on Node 20, the built site serves, and the publish step was simulated against a
   local bare repository (77 files, `.nojekyll` included, `gh-pages` receiving a valid site root). It has never
   run in Actions. The Pages source must also be repointed from `main` to `gh-pages` — see §5.

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
```

Python standard library only — no `requirements.txt`, no virtualenv, no pinned versions anywhere in the
repository.

---

## 5. Repository rules

- **Remote:** `https://github.com/Gynode/HARVEST.git`, branch `main`.
- **`main` is a live GitHub Pages site.** Pushing to it runs the deploy workflow. Never push without the
  user's explicit go-ahead.
- **Deployment:** `.github/workflows/static.yml` builds the site and force-pushes `build/` to the **`gh-pages`**
  branch; Pages serves that branch. It does **not** use `actions/deploy-pages`, because the repository's Pages
  settings do not offer "GitHub Actions" as a source — the source is "Deploy from a branch", which must be
  pointed at `gh-pages` / `(root)`. Until it is, Pages keeps serving `main` / `(root)`, i.e. the README
  rendered by Jekyll. Only `build/` is published, so `blockchain/` and the project docs are never served.
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

The documents have now been brought into line with the settled decisions (§3.1). If you are picking up
development, the starting points are:

1. **Find the remaining HRV supply** (§3.2, item 1). Two wallets are lost and no governance parameter that
   references supply can be fixed until that is known.
2. **Settle the on-chain design** (§3.2, item 3) — validator/off-chain split, treasury custody, and the source
   of truth for voting power. This blocks writing any Aiken.
3. **Write the validators in Aiken**, porting the behaviour from the Python specification rather than
   translating the Python.
4. **Build outward**: the bridge locking validator first (nothing touching HRV works without it), then node
   software, P2P, storage, and the Chain Follower.
