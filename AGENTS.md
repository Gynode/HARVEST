# AGENTS.md — HARVEST

Read this before doing any work in this repository. It is the honest inventory: what HARVEST is, what
actually exists on disk, and which documents in here cannot be trusted at face value.

Last verified: **2026-09-18**, against the working tree at `C:\HARVEST`.

---

## 1. What HARVEST is

HARVEST is a permissioned **Proof-of-Authority (PoA) sidechain for the Cardano ecosystem**, and the
**HARVEST DAO** that governs its treasury.

- **HRV coin** — **already minted on Cardano mainnet as a Cardano Native Token (CNT): 1,000,000,000.** It is
  also the sidechain's native currency, used for transaction fees, governance and in-app rewards. Two wallets
  have since been lost, so the amount actually remaining is unconfirmed — see §3.
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
via the Cardano Sidechain Toolkit). The treasury is unfunded — it still has to be funded with actual fiat, so
**HRV has no value today**.

The **RWA positioning is superseded**, but not everything it claimed was wrong. It lives in the repo root's
Docusaurus site (`docs/intro.md`, `docs/How-to-Participate/`) and in the `Gynode/HARVEST` history of
Mar–May 2025: HRV as a Cardano Native Token backed by real-world assets, Shari'ah-aligned, launched through
an anti-whale smart wallet (send ADA, receive HRV at a fixed rate), revalued roughly annually through a CSWAP
liquidity pool, with lost wallets treated as burned. The token half of that is true — HRV is minted on
Cardano as a CNT. Superseded is the *positioning around it*: the CSWAP pool, the smart-wallet launch, the
annual revaluation. Do not build against those without asking.

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

### 2.5 The websites — two trees, both superseded narrative

- **Repo root** (`docs/`, `src/`, `static/`, `blog/`, `docusaurus.config.js`, `package.json`, `sidebars.js`) —
  a Docusaurus **source** site (Docusaurus `2.0.0-beta.18`, React 17). This is the tip of `origin/main`. It
  carries the superseded RWA narrative. Its content set is `docs/intro.md` plus a `How-to-Participate/` group
  (buy-harvest, stake-ADA, liquidity-pool, further-development).
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

These override every older document. Where a file below is named as *wrong*, it is known-stale and has **not**
been rewritten yet — treat it as a defect to fix, not as a source of truth.

1. **Platform = Cardano/Plutus.** eUTxO, via the Cardano Sidechain Toolkit.
   **Wrong:** `dao_deployment_steps.md`, which is an EVM/web3 procedure (`pip3 install web3 cryptography`,
   `HARVEST_RPC_URL`, `HARVEST_CHAIN_ID`, `DEPLOYER_PRIVATE_KEY`, and running the Python contract files as
   though that deployed them). There is still no Plutus, Aiken or Haskell source in the repository — the
   contracts remain Python simulations.
2. **HRV supply = 1,000,000,000, minted on Cardano mainnet as a Cardano Native Token.**
   **Wrong:** the DAO package and treasury docs, which use **50,000,000** — a factor of 20 out.
3. **HRV value = none yet.** The treasury is unfunded and must be funded with actual fiat.
   `corrected_hrv_valuation.md` has the right *shape* (HRV alone is worth $0.00; value comes only from
   backing), but the backing is **fiat, not ADA**.
   **Wrong:** `updated_qstp_treasury_summary.md` ("50M HRV Coins @ $0.01 = $500,000") and
   `qstp_treasury_roadmap.md` ("Value: $500,000, At conservative $0.01/HRV"). `CHANGELOG.md` asserts both the
   correction and the $500K figure at once.

### 3.2 Still open

Do not resolve any of these by assumption.

1. **Remaining HRV supply.** Two wallets were lost after the mint, so the amount actually left has to be read
   off another computer. Related and undocumented: the repo-root site states "lost wallets are treated as
   burned, reducing supply", but nothing in the sidechain docs says how a lost wallet is reflected on-chain.
2. **CNT versus sidechain HRV.** HRV already exists as a Cardano native token, yet
   `harvest_blockchain_architecture.md` §4 has the sidechain *minting* its own HRV against assets locked in a
   mainnet Plutus script. Is the sidechain HRV the CNT bridged, or a second representation of the same
   billion? Nothing in the repository says. **Settle this before writing any bridge code** — the whole token
   model depends on it.
3. **Site trees.** `website/` is a separate repository. Adding it to this repo as-is would create a gitlink
   with no `.gitmodules`; absorbing it means deleting `website/.git` and discarding that history. Neither was
   done — it is ignored instead. Decide before touching the site.
4. **GitHub Pages.** `.github/workflows/static.yml` triggers on push to `main` and previously uploaded the
   entire repository (`path: '.'`). It now installs Node, runs `npm ci && npm run build`, and publishes
   `./build` only. **This build has never been executed** — the first push to `main` will run it, and
   Docusaurus 2.0.0-beta.18 on a current Node may or may not build cleanly. Verify before pushing.

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
- **`main` is a live GitHub Pages site.** Pushing to it runs the Pages workflow. Never push without the
  user's explicit go-ahead.
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

If you are picking up development, the real starting points are:

1. **Pin down the token model** — the remaining supply after the lost wallets, and whether the sidechain HRV
   is the CNT bridged or a second representation (§3.2, items 1–2). Everything else is built on this.
2. **Fix the documents that now contradict the settled decisions** (§3.1): `dao_deployment_steps.md` (EVM),
   the DAO and treasury docs (50M HRV, $0.01, $500K), and `CHANGELOG.md`.
3. **Establish a test suite around the DAO contracts**, which are the only code worth keeping.
4. Only then build outward: Plutus/Aiken contracts, node software, P2P, storage, the Cardano bridge, and the
   Chain Follower.
