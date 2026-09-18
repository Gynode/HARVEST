---
title: The HRV token
sidebar_position: 2
---

# The HRV token

HRV is a **Cardano native token**. It is not an ERC20, and it is not a separate sidechain currency.

## Supply

**1,000,000,000 HRV were minted on Cardano mainnet.** That is the whole supply — the sidechain does not mint a
second one.

**The amount still in circulation is lower than that, and is being confirmed.** Two wallets holding HRV were
lost after the mint. Their contents cannot be spent unless the keys are recovered, but **how a lost wallet
should be treated on-chain has not been finalised** — so do not assume the supply has been reduced by their
balances. Read 1,000,000,000 as the amount minted, not as the amount in circulation today.

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

**HRV has no value today.** The DAO treasury is unfunded, and no price, exchange rate, or sale is offered.

Value, when and if there is any, would come from the treasury backing the token. It is not asserted for the
token itself. The intent is to fund the treasury with fiat; until that happens there is nothing behind HRV.

**Disregard any figure you find elsewhere** quoting a price per HRV, an exchange rate against ADA, or a
treasury worth a particular sum. That material predates the current model — including the earlier instruction
to buy HRV by sending ADA at a fixed rate, which is not how the project works.
