# HARVEST

A permissioned **Proof-of-Authority (PoA) sidechain for the Cardano ecosystem**, and the **HARVEST DAO**
that governs its treasury. Built on Cardano/Plutus; on-chain code in **Aiken**.

- **HRV coin** — a Cardano native token, **1,000,000,000 minted on mainnet**. It is the only HRV: the sidechain
  represents the locked token rather than minting its own. Used for transaction fees, governance and rewards.
- **3,125 NFTs** — minted on the sidechain, bridged to and from Cardano.
- **Node Handlers (Masters)** — authorised validators producing blocks in round-robin order on minimal
  hardware (dual-core CPU, 8 GB RAM, 250 GB SSD, 10 Mbps).
- **HARVEST DAO** — proposals with Node Handler review, quadratic voting, and a multi-signature treasury. The
  treasury is **unfunded** and is to be funded with actual fiat, so HRV has no value yet.

## Status

**Design stage.** The architecture, roadmap and user guides in `blockchain/` describe a finished sidechain.
The code does not implement one yet:

| Component | State |
|-----------|-------|
| PoA consensus | Prototype — round-robin leader selection works; block signing and validation are placeholders |
| HRV / NFT contracts | Prototype — in-memory Python demonstration classes |
| DAO contracts | Specification-grade Python (governance, proposals, quadratic voting, treasury), not deployable — on-chain code is to be written in **Aiken** |
| DAO web interface | UI mockup — React 19 + Vite + shadcn/ui, rendering hardcoded data |
| Node software, P2P, storage, Cardano bridge, Chain Follower | Not started |
| Tests | None |

Read **[AGENTS.md](AGENTS.md)** for the full, honest inventory — including the contradictions between the
documents that still need resolving. Contributors using Claude Code should also read
**[CLAUDE.md](CLAUDE.md)**.

## Layout

```
blockchain/
  blockchain_code/          Python prototypes (consensus, contracts, tools)
  harvest_dao_package/      DAO contracts, React interface, deployment steps, QSTP treasury docs
  development_plan/         Architecture, roadmap, Cardano sidechain research
  documentation/            Technical documentation, Node Handler guide, user guide
docs/ src/ static/ blog/    Repo-root Docusaurus site (superseded narrative — see AGENTS.md §1)
website/                    Separate repository: the built sidechain-era site
```

## Running the code

```bash
# DAO contract demos
python blockchain/harvest_dao_package/harvest_dao/contracts/governance_token.py

# Prototype demos
python blockchain/blockchain_code/core_components/poa_consensus.py

# DAO web interface
cd blockchain/harvest_dao_package/harvest-dao-interface && pnpm install && pnpm dev
```

Python standard library only — there are no dependencies to install, and no test, lint or build command,
because no test suite, linter or build system exists yet.
