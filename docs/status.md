---
title: Project status
sidebar_position: 6
---

# Project status

HARVEST is at the design stage. The architecture, roadmap and guides describe a finished system; almost none
of that software exists yet, and none of it is running.

This page exists so that nothing else on this site is mistaken for something you can use today.

## What exists

| Component | State |
|---|---|
| PoA consensus | Prototype — round-robin leader selection works; block signing and validation are placeholders |
| HRV and NFT contracts | Prototype — in-memory demonstration classes |
| DAO contracts | Specification-grade Python for governance, proposals, quadratic voting and treasury. Not deployable, and not on Cardano |
| On-chain validators | **Early.** A bridge locking script is written in Aiken with 10 tests, and the DAO's voting rules with 23. Nothing is deployed, and no governance or treasury validator exists |
| DAO web interface | UI mockup — renders fixed sample data and talks to no backend |

## What does not exist

- The HARVEST sidechain, and any node software to run on it
- The bridge, beyond its locking script — no relay, no chain follower, no way to move a token in either direction
- A governance or treasury validator
- A funded treasury

## About the design documents

The architecture and roadmap documents are written in the present tense, and one of them marks its phases as
complete. That reflects intent, not results. Where a design document and the code disagree, the code is what is
real — and at present the code is prototypes, plus the beginnings of the on-chain validators.

Some of it also predates the current model: earlier material described a different token arrangement and a
different, EVM-based deployment. Both have been superseded, and the references to them are being removed.

## Funding

**Funding is being sourced.** No funding has been secured, no source is named, and the DAO treasury is
unfunded. The target is 2027.

## Following along

Development happens in the open at
[github.com/Gynode/HARVEST](https://github.com/Gynode/HARVEST).
