# HARVEST Blockchain Architecture and Specifications

> **Status:** design document. It describes intended architecture, not implemented software — see `AGENTS.md`
> at the repository root for what actually exists. The HRV model in §4 and §6.1 was settled on 2026-09-18.

## 1. Introduction

This document outlines the proposed architecture and specifications for the HARVEST sidechain, a new blockchain built on the Cardano ecosystem. HARVEST will leverage a Proof-of-Authority (PoA) consensus mechanism to ensure efficient, secure, and scalable operations, while maintaining minimal hardware requirements for its Node Handlers (Masters).

## 2. Architectural Overview

HARVEST will operate as a sidechain to the Cardano mainnet, utilizing the Cardano Sidechain Toolkit for seamless interoperability. The architecture is designed to provide a high-throughput, low-latency environment for HARVEST coin transactions and NFT minting and transfers, independent of the Cardano mainnet's transaction load, yet benefiting from its security and established infrastructure.

### 2.1. Core Components

The HARVEST sidechain architecture will consist of the following core components:

*   **Cardano Mainnet Integration**: This involves the use of Plutus scripts on the Cardano mainnet to manage the flow of assets (HARVEST coins and NFTs) between the mainnet and the sidechain. This ensures a secure and auditable bridge for cross-chain operations.
*   **HARVEST Sidechain Network**: This is the primary operational environment for HARVEST, where transactions are processed and blocks are generated. It will be a permissioned network, with block production controlled by authorized Node Handlers.
*   **Node Handlers (Masters)**: These are the authorized validators responsible for creating and validating new blocks on the HARVEST sidechain. Their identity and reputation are key to the PoA consensus mechanism.
*   **Chain Follower**: A component that observes the state of the Cardano mainnet, specifically monitoring the Plutus scripts for cross-chain transaction requests. This component will relay relevant information to the HARVEST sidechain.
*   **Sidechain-Specific Module**: This module within each Node Handler processes data received from the Chain Follower and ensures that transactions and block generation adhere to the HARVEST sidechain's specific rules and technical specifications.

### 2.2. Proof-of-Authority (PoA) Consensus in HARVEST

HARVEST will implement a PoA consensus mechanism, where a pre-selected set of trusted Node Handlers (Masters) are responsible for validating transactions and producing blocks. This approach offers several advantages for HARVEST:

*   **High Transaction Throughput**: By relying on a limited number of authorized validators, HARVEST can achieve significantly faster transaction processing speeds compared to public, permissionless blockchains.
*   **Predictable Block Times**: The fixed set of validators and their scheduled block production ensures consistent and predictable block generation intervals.
*   **Reduced Energy Consumption**: Unlike Proof-of-Work (PoW) systems, PoA does not require intensive computational power, leading to a more energy-efficient operation.
*   **Enhanced Security (within a permissioned context)**: The identity and reputation of Node Handlers provide a strong deterrent against malicious behavior. Any misbehavior can lead to the revocation of their authority.

## 3. Node Handler (Master) Specifications

To ensure accessibility and ease of participation for appointed Node Handlers, HARVEST will prioritize minimal hardware requirements. The focus will be on network stability and reliable operation rather than raw computational power.

### 3.1. Hardware Requirements

Node Handlers will require the following minimum hardware specifications:

*   **Processor (CPU)**: A modern dual-core processor (e.g., Intel Core i3 equivalent or better).
*   **Memory (RAM)**: 8 GB of RAM. This is sufficient for running the sidechain node software and handling transaction processing.
*   **Storage**: 250 GB SSD (Solid State Drive). An SSD is crucial for fast data access and synchronization, ensuring efficient block validation and propagation. The storage requirement is relatively low due to the permissioned nature of the chain and the absence of a need to store the entire Cardano mainnet history.
*   **Network Connectivity**: A stable internet connection with a minimum of 10 Mbps upload and download speed. Consistent connectivity is more important than extremely high bandwidth.

### 3.2. Software Requirements

Node Handlers will need to run the following software:

*   **Operating System**: Linux (Ubuntu 20.04 LTS or newer recommended) or a compatible Unix-like operating system. Windows and macOS may be supported with appropriate virtualization or WSL (Windows Subsystem for Linux).
*   **HARVEST Sidechain Node Software**: Custom-built software that implements the HARVEST sidechain protocol, including the PoA consensus logic and integration with the Chain Follower and Sidechain-Specific Module.
*   **Cardano DB Sync (or similar Chain Follower implementation)**: A component to monitor the Cardano mainnet for relevant events.

### 3.3. Operational Requirements

*   **Uptime**: Node Handlers are expected to maintain high uptime to ensure continuous block production and network stability. Redundancy measures are encouraged but not strictly required for individual Masters.
*   **Security**: Node Handlers must implement robust security practices to protect their systems from unauthorized access and cyber threats. This includes strong passwords, firewalls, and regular software updates.
*   **Identity Verification**: All appointed Node Handlers will undergo a rigorous identity verification process to establish trust and accountability within the PoA framework.

## 4. Interoperability with Cardano Mainnet

The HARVEST sidechain will maintain a secure and efficient bridge with the Cardano mainnet. This interoperability will primarily facilitate:

*   **HARVEST Coin Transfers**: HRV is a Cardano native token that **already exists on mainnet** — 1,000,000,000 were minted. The sidechain does **not** mint a second supply. Locking HRV in a designated Plutus script on mainnet makes the equivalent amount available as a representation on the sidechain; burning that representation releases the locked HRV on mainnet. Sidechain supply is therefore bounded by what is locked and can never exceed the mainnet supply. (Two wallets have since been lost, so the amount actually remaining on mainnet is not yet confirmed.)
*   **NFT Transfers**: Similarly, NFTs minted on Cardano can be locked on the mainnet and represented as wrapped NFTs on the HARVEST sidechain, allowing for faster and cheaper transactions. Unwrapping them on the sidechain will release the original NFTs on the mainnet.

This architecture ensures that HARVEST benefits from the security and liquidity of the Cardano ecosystem while providing a specialized, high-performance environment for its specific use cases.




## 5. HARVEST PoA Consensus Mechanism Details

The HARVEST PoA consensus mechanism will be a round-robin based system among the appointed Node Handlers. This ensures fair distribution of block production responsibilities and prevents any single Node Handler from dominating the network.

### 5.1. Block Production Schedule

*   **Fixed Interval**: Blocks will be generated at a fixed, predictable interval (e.g., every 5 seconds). This ensures consistent transaction finality.
*   **Leader Election**: A deterministic algorithm will be used to select the current leader (block producer) from the list of active Node Handlers. This algorithm will be based on the current block height and the ordered list of Node Handlers, ensuring that each Node Handler gets a turn to produce blocks.
*   **Block Signing**: The elected leader Node Handler will be responsible for collecting transactions, creating a new block, and signing it with their unique private key. This signature serves as the 


proof of authority.

### 5.2. Block Validation

Upon receiving a new block, other Node Handlers will:

*   **Verify Signature**: Confirm the block was signed by the currently elected leader.
*   **Validate Transactions**: Re-execute all transactions within the block to ensure their validity and adherence to HARVEST's rules.
*   **Consensus**: If the block is valid, they will add it to their local blockchain. If an invalid block is detected, it will be rejected, and the misbehaving Node Handler may be flagged for review or removal from the authorized list.

### 5.3. Node Handler Management

*   **Onboarding**: New Node Handlers will be added to the authorized list through a secure, multi-signature process involving existing Node Handlers or a designated governance body.
*   **Offboarding**: Node Handlers can be removed from the authorized list due to inactivity, malicious behavior, or voluntary resignation, also through a secure governance process.
*   **Monitoring**: A monitoring system will track the performance and behavior of Node Handlers, including uptime, block production success rate, and transaction validation accuracy.

## 6. HARVEST Coin (HRV) and NFT Integration

### 6.1. HRV Coin Utility

1,000,000,000 HRV were minted on Cardano mainnet as a Cardano native token, and it is that token — represented on the sidechain as described in §4 — that serves as the sidechain's native currency. Its primary utilities will include:

*   **Transaction Fees**: All transactions on the HARVEST sidechain will incur a small fee payable in HRV, ensuring network sustainability and preventing spam.
*   **Governance**: HRV holders may have a role in future governance decisions related to the HARVEST sidechain, such as proposing and voting on protocol upgrades or changes to Node Handler parameters.
*   **In-App Purchases/Rewards**: HRV can be integrated into decentralized applications (dApps) built on HARVEST for various purposes, such as purchasing in-game items, accessing premium features, or rewarding user participation.

### 6.2. NFT Integration

The 3125 designed NFTs will be minted and managed on the HARVEST sidechain. The sidechain's architecture will support:

*   **Efficient Minting**: Low-cost and fast minting of NFTs, making it accessible for creators and users.
*   **Seamless Transfers**: Quick and inexpensive transfer of NFTs between users.
*   **Royalty Enforcement**: Smart contract mechanisms to enforce creator royalties on secondary sales of NFTs.
*   **Metadata Storage**: Secure and decentralized storage of NFT metadata, ensuring the integrity and persistence of digital assets.

## 7. Smart Contract Platform

HARVEST will support smart contracts to enable the development of decentralized applications (dApps) on its sidechain. The choice of smart contract language and execution environment will prioritize security, efficiency, and compatibility with the Cardano ecosystem.

*   **Language**: Plutus, written in **Aiken** (settled 2026-09-18) — an eUTxO-based language that compiles to Plutus Core and targets the same ledger. The "EVM-compatible environment" alternative previously floated here is closed; this is a Cardano project, and there is no ERC20 or `0x` address anywhere in it.
*   **Execution Environment**: The smart contract execution environment will be optimized for performance and low transaction fees and execution-unit costs, aligning with the goal of an efficient sidechain.

## 8. Security Considerations

While PoA offers inherent security advantages, additional measures will be implemented to ensure the robustness of the HARVEST sidechain:

*   **Code Audits**: All core blockchain components and smart contracts will undergo rigorous security audits by independent third parties.
*   **Multi-Signature Wallets**: Critical operations, such as Node Handler management and large asset transfers, will require multi-signature approvals.
*   **Regular Updates**: The HARVEST sidechain software will be regularly updated to address vulnerabilities and incorporate security enhancements.
*   **Disaster Recovery**: A comprehensive disaster recovery plan will be in place to ensure the continuity of the HARVEST sidechain in the event of unforeseen circumstances.

## 9. Future Enhancements

Potential future enhancements for the HARVEST sidechain include:

*   **Decentralized Governance**: Transitioning towards a more decentralized governance model where HRV holders have a greater say in the evolution of the sidechain.
*   **Additional Cross-Chain Bridges**: Exploring bridges to other blockchain networks to further enhance interoperability.
*   **Layer 2 Scaling Solutions**: Investigating additional Layer 2 solutions on top of the HARVEST sidechain to further boost scalability for specific use cases.

This architectural design provides a solid foundation for the HARVEST sidechain, combining the strengths of Cardano's ecosystem with the efficiency and predictability of a Proof-of-Authority consensus mechanism. The focus on minimal hardware requirements for Node Handlers ensures a practical and accessible network for its appointed Masters.

