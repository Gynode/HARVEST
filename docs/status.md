---
title: Project status
sidebar_position: 6
---

# Project status

HARVEST is at the design stage. The architecture, roadmap and guides describe a finished system; the software
does not exist yet.

This page exists so that nothing else on this site is mistaken for something you can use today.

## What exists

| Component | State |
|---|---|
| PoA consensus | Prototype — round-robin leader selection works; block signing and validation are placeholders |
| HRV and NFT contracts | Prototype — in-memory demonstration classes |
| DAO contracts | Specification-grade Python for governance, proposals, quadratic voting and treasury. Not deployable, and not on Cardano |
| DAO web interface | UI mockup — renders fixed sample data and talks to no backend |

## What does not exist

- The HARVEST sidechain, and any node software to run on it
- The Cardano bridge — no locking script, no relay
- On-chain validators, which are to be written in Aiken
- Any test suite
- A funded treasury

## About the design documents

The architecture and roadmap documents are written in the present tense, and one of them marks its phases as
complete. That reflects intent, not results. Where a design document and the code disagree, the code is what is
real — and at present the code is prototypes.

Some of it also predates the current model: earlier material described a different token arrangement and a
different, EVM-based deployment. Both have been superseded, and the references to them are being removed.

## Funding

A **Cardano Catalyst** grant application is in progress. No funding has been secured, and the DAO treasury is
unfunded.

## Following along

Development happens in the open at
[github.com/Gynode/HARVEST](https://github.com/Gynode/HARVEST).
