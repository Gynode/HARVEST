# CLAUDE.md — HARVEST

IMPORTANT: Read [AGENTS.md](AGENTS.md) before beginning any work in this repository. AGENTS.md carries the
detailed component-by-component state; this file is the short orientation.

**Scope constraint:** This repo (`HARVEST`) is self-contained — commits go ONLY to
`https://github.com/Gynode/HARVEST.git`. Never merge with other repositories or folders. The working
directory is `C:\HARVEST`.

**Memory system:** This project has a persistent memory at
`C:\Users\gydan\.claude\projects\C--HARVEST\memory\`. Use it to preserve session-to-session context
(project state, decisions, feedback). Write memory files as markdown with frontmatter (`name`,
`description`, `metadata.type`) and update `MEMORY.md` in that directory with a one-line pointer for each
new file.

## Project Overview

**HARVEST** — a permissioned **Proof-of-Authority (PoA) sidechain for the Cardano ecosystem**, plus the
**HARVEST DAO** that governs its treasury.

| Asset | Detail |
|-------|--------|
| **HRV coin** | Native currency of the sidechain. Preminted; supply figure is disputed — see "Open decisions". |
| **NFTs** | 3,125 designed NFTs, minted on the sidechain, bridged from Cardano. |
| **Node Handlers (Masters)** | Authorised validators. Round-robin block production, minimal hardware (dual-core, 8 GB RAM, 250 GB SSD, 10 Mbps). |
| **HARVEST DAO** | Governance over treasury, proposals, quadratic voting. QSTP (Qatar Science and Technology Park) funding strategy: $100K of ADA backing, targeted Q1 2026. |

**Current direction (decided 2026-09-18):** the sidechain + DAO work in `blockchain/` is the real HARVEST.
The RWA / Cardano-native-token narrative in the repo root and `docs/` (HRV as a CNT, CSWAP liquidity pool,
anti-whale smart-wallet launch) is **superseded** and kept only as history.

## State of the code — read this before trusting any document

The design documents in `blockchain/development_plan/` and `blockchain/documentation/` are **aspirational**,
written in the present tense as though the system exists. `blockchain/development_plan/todo.md` ticks off
Phases 1–6 as complete. **None of that reflects working software.** What actually exists:

- `blockchain/blockchain_code/` — illustrative Python prototypes. No networking, no persistence, no real
  cryptography. `poa_consensus.py` signs blocks with the literal string `"signed_by_leader"` and returns
  `True` from `validate_block()` unconditionally; `harvest_cli.py` prints `"(placeholder)"` for every
  command. Treat these as sketches of intent, not as a codebase to extend.
- `blockchain/harvest_dao_package/harvest_dao/contracts/` — the most substantive Python in the repo
  (`governance_token.py`, `proposal_manager.py`, `voting_mechanism.py`, `treasury_manager.py`). Well-typed,
  dataclass-based simulation logic that runs against a mock `blockchain_state`. Not Cardano, not Plutus, not
  deployable.
- `harvest-dao-interface/` — React 19 + Vite 6 + Tailwind 4 + shadcn/ui. Renders **hardcoded** data; there
  is not a single `fetch`/`axios`/API call in `src/`. A UI mockup.
- **Missing entirely:** Plutus/Aiken scripts, the Cardano bridge, the Chain Follower, a node daemon, the P2P
  layer, genesis, key/wallet management, and any test suite (`harvest_dao/tests/` and `harvest_dao/tools/`
  are empty directories; there is no test file anywhere in `blockchain/`).

## Layout

| Path | What it is |
|------|-----------|
| `blockchain/blockchain_code/` | Python prototypes: `core_components/`, `smart_contracts/`, `tools/` |
| `blockchain/harvest_dao_package/` | The DAO package — contracts, React interface, deployment steps, QSTP treasury docs |
| `blockchain/development_plan/` | Architecture, roadmap, Cardano sidechain research, `todo.md` |
| `blockchain/documentation/` | Technical documentation, Node Handler guide, user guide |
| `docs/`, `src/`, `static/`, `blog/` | The repo-root Docusaurus site — **superseded narrative** (see above) |
| `website/` | A **separate git repo** (`Gynode/HARVEST-Docusaurus-Site`), built sidechain-era site. Ignored by this repo; see "Open decisions". |
| `manus-website-update_node_handler_rewards/` | Another build of the same site. Ignored. |
| `blockchain.zip` | Archive of blockchain material. Ignored. |

## Commands

```bash
# Run a DAO contract demo (each contract has an __main__ block that exercises it)
python blockchain/harvest_dao_package/harvest_dao/contracts/governance_token.py
python blockchain/harvest_dao_package/harvest_dao/contracts/treasury_manager.py

# Run a prototype demo
python blockchain/blockchain_code/core_components/poa_consensus.py
python blockchain/blockchain_code/tools/harvest_cli.py --help

# DAO web interface (pnpm is the package manager — see packageManager field)
cd blockchain/harvest_dao_package/harvest-dao-interface && pnpm install && pnpm dev

# Repo-root Docusaurus site (Docusaurus 2.0.0-beta.18 / React 17 — old)
npm install && npm start
```

There is no build, lint, or test command for the project itself, because there is no build system, no
linter config, and no tests.

## Open decisions

These are unresolved and will mislead you if you assume an answer:

1. **HRV supply** — `blockchain/development_plan/harvest_blockchain_architecture.md` says
   **1,000,000,000** preminted. The DAO package says **50,000,000**. Nothing reconciles them.
2. **HRV value** — `corrected_hrv_valuation.md` states HRV has **$0** standalone value and is worth only its
   ADA backing ($100K / 50M = $0.002). But `updated_qstp_treasury_summary.md` and `qstp_treasury_roadmap.md`
   still price it at **$0.01 → $500,000** treasury. The "corrected" model never propagated.
3. **Chain platform** — the architecture docs specify Cardano/Plutus, but
   `dao_deployment_steps.md` assumes EVM/web3 (`HARVEST_RPC_URL`, `HARVEST_CHAIN_ID`,
   `DEPLOYER_PRIVATE_KEY`, `pip install web3`, `python3 governance_token.py` as a "deployment").
4. **The two site trees** — `website/` is a separate repo with its own history, and reference to it as-is
   from this repo would create a broken gitlink. Absorbing it (and deleting its `.git`) would discard that
   history, so it was left ignored. The superseded RWA site source sits at the repo root (it is the tip of
   `origin/main`). Neither has been restructured.
5. **GitHub Pages workflow** — `.github/workflows/static.yml` now builds the Docusaurus site and publishes
   `./build` only, so the `blockchain/` material is never published. It previously uploaded the whole repo
   (`path: '.'`), which would have published everything pushed. **That build step has never run** — verify it
   before the first push that touches `main`.

## Conventions

- Commits end with the `Co-Authored-By:` line given in the session's attribution instructions.
- Nothing is pushed to `main` without the user's say-so: `main` is a live GitHub Pages site.
- When a document contradicts the code, the code wins — and record the contradiction here rather than
  silently picking a side.
