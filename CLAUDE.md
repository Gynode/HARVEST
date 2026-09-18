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
| **HRV coin** | **Minted on Cardano mainnet as a Cardano Native Token (CNT): 1,000,000,000.** This is the *only* HRV — the sidechain represents the locked CNT and does not mint its own. Two wallets have since been lost — remaining supply unconfirmed. |
| **NFTs** | 3,125 designed NFTs, minted on the sidechain, bridged from Cardano. |
| **Node Handlers (Masters)** | Authorised validators. Round-robin block production, minimal hardware (dual-core, 8 GB RAM, 250 GB SSD, 10 Mbps). |
| **HARVEST DAO** | Governance over treasury, proposals, quadratic voting. The treasury is **unfunded** — it still has to be funded with actual fiat, so HRV has no value yet. QSTP (Qatar Science and Technology Park) entry targeted Q1 2026. |
| **Platform** | **Cardano / Plutus**, eUTxO, via the Cardano Sidechain Toolkit. On-chain code in **Aiken**. |

**Current direction (decided 2026-09-18):** the sidechain + DAO work in `blockchain/` is the real HARVEST,
built on Cardano/Plutus. The RWA *positioning* in the repo root and `docs/` (CSWAP liquidity pool,
anti-whale smart-wallet launch, annual revaluation) is superseded and kept only as history — though its
central claim holds: HRV genuinely is a Cardano native token.

## State of the code — read this before trusting any document

**Everything in `blockchain/` is a deliberate stub, and the plan is to fill it with actual code.** Because the
platform is Cardano/Plutus, that is not a matter of filling in function bodies: the stubs are Python, and
nothing in Python runs on Cardano. Treat the Python DAO contracts as the behavioural specification to
reimplement in **Aiken**.

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

## Decisions taken (2026-09-18)

Settled by the user. These override whatever the older documents say.

1. **Platform — Cardano/Plutus.** `dao_deployment_steps.md` was an EVM/web3 procedure and contradicted this;
   it has been rewritten for Cardano.
2. **On-chain language — Aiken.** Compiles to Plutus Core, same ledger as Plutus Tx.
3. **HRV supply — 1,000,000,000, minted on Cardano mainnet as a Cardano Native Token.** The
   **50,000,000** figure in the DAO package and treasury docs is stale.
4. **One HRV, no second supply.** The CNT is locked on mainnet under a Plutus script and the sidechain
   represents the locked amount; it does not mint its own HRV. Sidechain supply is bounded by what is locked.
5. **HRV value — none yet.** The treasury is unfunded and still has to be funded with actual fiat. The
   backing-derived shape is right, but the backing is **fiat**, not ADA — the **$0.01 / $0.002 / $500,000**
   figures were wrong and have been removed.

**The stale documents have been rewritten** (2026-09-18): the six files in `harvest_dao_package/`, plus §4,
§6.1 and §7 of `harvest_blockchain_architecture.md` and the supply lines in the two technical documentation
files. Status banners were added to the three documents in `blockchain/documentation/`. `CHANGELOG.md` records
what was void.

**The site content was rewritten (2026-09-18)** from the superseded RWA narrative to the current direction:
introduction, HRV token, governance, NFTs, Node Handlers, project status. The `How-to-Participate/` group
(`1 ADA = 1,000 HRV`, smart-wallet launch, staking ADA, CSWAP liquidity pool) and the `markdown-page` template
page were deleted; `blog` is disabled because its only posts were the Docusaurus template's. The rewrite
deliberately does not state *why* the circulating supply is unconfirmed, and quotes no HRV value.

**Deployment is via a `gh-pages` branch, not `actions/deploy-pages`.** The workflow builds the site and force-
pushes `build/` to `gh-pages`, so the repo's Pages source stays "Deploy from a branch" and the only thing to
change is the branch name. This was chosen because GitHub's Pages settings did not offer "GitHub Actions" as a
source in this repository. Only `build/` is ever published, so `blockchain/` can never be served.

**The Docusaurus build was also broken and is now fixed.** `sidebars.js` named two doc ids that do not exist
in this repo (the whitepaper belongs to the *other* site) while the working autogenerated config sat in the
same file with its `module.exports` commented out; the navbar and homepage linked to `/docs/intro` when the
doc's id is `introduction`. With `onBrokenLinks: 'throw'` those were fatal, so **`main` has never been
buildable** — which also means the old `path: '.'` workflow could never have published a working site.

## Still open

1. **Remaining HRV supply** — two wallets were lost after the mint, so the amount actually left has to be
   read off another computer. Related and undecided: the repo-root site states "lost wallets are treated as
   burned, reducing supply", but nothing says how a lost wallet is reflected on-chain. **No governance
   parameter that references supply should be fixed until this is known.**
2. **The QSTP request** — funding is to be fiat, but the roadmap previously specified ADA amounts. The
   amount and asset of the actual request must be restated before it is used for an application.
3. **`website/`** — the separate repo (`Gynode/HARVEST-Docusaurus-Site`) holding a *built* sidechain-era site
   with a whitepaper. Adding it as-is would create a gitlink with no `.gitmodules`; absorbing it would discard
   its history. It is ignored. Now that the repo-root site has been rewritten to the current direction, decide
   whether that whitepaper should be folded in, kept separate, or dropped.
4. **On-chain design** — what belongs in a validator versus off-chain, the treasury custody model
   (native script or Plutus validator), and the source of truth for voting power. See
   `dao_deployment_steps.md` §2; these block writing any Aiken.
5. **The push to `main` itself, and one Pages setting.** Nothing has been pushed. The workflow now builds the
   site and pushes the output to the **`gh-pages` branch**, so the setting to change is
   **Settings → Pages → Source: "Deploy from a branch" → Branch: `gh-pages` / `(root)`**. Until that changes,
   Pages keeps serving `main` / `(root)`, which Jekyll renders as the repository README — not this site.

## Conventions

- Commits end with the `Co-Authored-By:` line given in the session's attribution instructions.
- Nothing is pushed to `main` without the user's say-so: `main` is a live GitHub Pages site.
- When a document contradicts the code, the code wins — and record the contradiction here rather than
  silently picking a side.
