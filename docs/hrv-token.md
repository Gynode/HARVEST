---
title: The HRV token
sidebar_position: 2
---

# The HRV token

HRV is a **Cardano native token**. It is not an ERC20, and it is not a separate sidechain currency.

## Supply

**1,000,000,000 HRV were minted on Cardano mainnet.** That is the whole supply — the sidechain does not mint a
second one.

The circulating figure is still being confirmed, so read 1,000,000,000 as the amount minted rather than as the
amount in circulation today.

## How it moves between the two chains

HRV is not bridged by minting something new. Instead:

1. HRV is **locked** on Cardano mainnet under a Plutus script.
2. The sidechain makes the equivalent amount available, representing that locked token.
3. Returning the representation to the bridge **releases the original** HRV on mainnet.

That gives a hard limit: **sidechain supply can never exceed what is locked on mainnet.** If nothing is locked,
nothing is represented.

## What HRV is for

- Transaction fees on the sidechain
- Governance — voting power and proposal thresholds are denominated in HRV
- Rewards within applications built on HARVEST

## Value

**HRV has no value today.** The DAO treasury is unfunded, and the intent is to fund it with fiat.

Value, when and if there is any, comes from the treasury backing the token. It is not asserted for the token
itself. Any figure you find elsewhere quoting a price per HRV, or a treasury worth a particular sum, predates
the current model and should be disregarded.
