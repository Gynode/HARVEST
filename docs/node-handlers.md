---
title: Node Handlers
sidebar_position: 5
---

# Node Handlers

Node Handlers — also called Masters — are the validators that keep the HARVEST sidechain running.

This page describes the role as designed. **No node software exists yet, so there is nothing to install and no
way to take part.**

## What the role involves

- Producing blocks when it is your turn
- Validating the transactions in blocks produced by others
- Keeping a synchronised copy of the chain
- Staying online, and keeping your keys secure

## Consensus

HARVEST uses **Proof-of-Authority**. Block producers are a known, authorised set rather than anonymous miners
or stakers, which means blocks are produced on a fixed schedule at a predictable interval.

The right to produce a block rotates through the authorised set in round-robin order, so no single handler can
dominate block production. A handler that misbehaves can have its authority revoked, and a handler that is
unavailable can be removed from the set.

Because authority rests on identity rather than on computation or stake, the hardware requirement is low.
There is nothing to mine.

## Requirements (design target)

| | |
|---|---|
| CPU | Modern dual-core, Intel Core i3 equivalent or better |
| Memory | 8 GB RAM |
| Storage | 250 GB SSD |
| Network | Stable connection, 10 Mbps up and down |
| OS | Linux, Ubuntu 20.04 LTS or newer recommended |

An SSD matters more than raw processing power, and a stable connection matters more than a fast one.

## Becoming a Node Handler

Handlers are appointed rather than elected through open competition, and appointment goes through a
multi-signature process. There is no application process today.
