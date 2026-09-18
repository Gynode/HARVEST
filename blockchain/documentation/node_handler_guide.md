# HARVEST Node Handler Guide

> **Status:** no HARVEST node software exists yet, so there is nothing to install. This guide describes the
> intended setup and operating model for a Node Handler — read it as specification. See `AGENTS.md` at the
> repository root for what actually exists.

This guide provides comprehensive instructions for setting up, configuring, and maintaining a HARVEST Node Handler (Master). As a Node Handler, you play a crucial role in the security and operation of the HARVEST sidechain, responsible for validating transactions and producing blocks.

## 1. Introduction to HARVEST Node Handlers

HARVEST operates on a Proof-of-Authority (PoA) consensus mechanism, where a select group of authorized Node Handlers are responsible for maintaining the network. Your participation ensures the integrity, performance, and decentralization (within the PoA framework) of the HARVEST sidechain.

### 1.1. Responsibilities of a Node Handler

*   **Block Production**: Generating new blocks at scheduled intervals.
*   **Transaction Validation**: Verifying the authenticity and validity of transactions.
*   **Network Synchronization**: Maintaining a synchronized copy of the HARVEST blockchain.
*   **Uptime and Performance**: Ensuring high availability and efficient operation of your node.
*   **Security**: Protecting your node infrastructure from unauthorized access and cyber threats.

## 2. System Requirements

To run a HARVEST Node Handler, your system must meet the following minimum specifications:

### 2.1. Hardware Requirements

*   **Processor (CPU)**: Modern dual-core processor (e.g., Intel Core i3 equivalent or better).
*   **Memory (RAM)**: 8 GB RAM.
*   **Storage**: 250 GB SSD (Solid State Drive) for optimal performance.
*   **Network Connectivity**: Stable internet connection with a minimum of 10 Mbps upload and download speed.

### 2.2. Software Requirements

*   **Operating System**: Linux (Ubuntu 20.04 LTS or newer recommended). Other Unix-like systems may be compatible. Windows and macOS users should consider using a virtual machine or WSL.
*   **HARVEST Sidechain Node Software**: The official HARVEST node software package.
*   **Cardano DB Sync (or equivalent Chain Follower)**: For mainnet integration and monitoring.

## 3. Setting Up Your Node Handler

This section guides you through the process of installing and configuring the HARVEST node software.

### 3.1. Prerequisites

Before proceeding, ensure your system meets the hardware and software requirements. It is recommended to perform a fresh installation of your chosen operating system.

### 3.2. Installation Steps

1.  **Download HARVEST Node Software**: Obtain the latest release of the HARVEST node software from the official HARVEST GitHub repository (link to be provided).
2.  **Install Dependencies**: Install any required system dependencies (e.g., Python, specific libraries) as outlined in the software's `README.md` file.
3.  **Configure Node**: Edit the `config.toml` (or similar configuration file) to set up your node's parameters, including network ports, data directory, and logging preferences.
4.  **Generate Keys**: Generate your unique cryptographic key pair. Your public key will be used to identify your node on the network, and your private key will be used to sign blocks. **Securely back up your private key! Loss of this key will result in loss of control over your Node Handler.**
5.  **Register as Node Handler**: Follow the instructions to register your public key with the HARVEST network. This typically involves a transaction on the HARVEST sidechain or a multi-signature process by existing Node Handlers.

### 3.3. Running the Node

Once configured, you can start your HARVEST node:

```bash
./harvest-node start
```

Monitor the logs to ensure your node is synchronizing with the network and participating in block production.

## 4. Maintaining Your Node Handler

Regular maintenance is essential for the optimal performance and security of your Node Handler.

### 4.1. Monitoring Node Health

*   **Logs**: Regularly review your node's logs for any errors, warnings, or unusual activity.
*   **Resource Usage**: Monitor CPU, memory, disk I/O, and network usage to ensure your node has sufficient resources.
*   **Synchronization Status**: Verify that your node is always synchronized with the latest block on the HARVEST blockchain.

### 4.2. Software Updates

Stay informed about new releases of the HARVEST node software. Updates often include performance improvements, bug fixes, and critical security patches. Follow the official update procedures to minimize downtime.

### 4.3. Security Best Practices

*   **Firewall**: Configure a firewall to restrict incoming connections to only necessary ports.
*   **SSH Security**: If using SSH for remote access, disable password authentication and use strong SSH keys. Consider IP whitelisting.
*   **Regular Backups**: Periodically back up your node's data directory, especially your private keys (if stored on the node).
*   **Physical Security**: Ensure the physical security of the server hosting your Node Handler.
*   **Principle of Least Privilege**: Run the node software with the minimum necessary user privileges.

## 5. Troubleshooting Common Issues

*   **Node Not Starting**: Check configuration files, port conflicts, and ensure all dependencies are installed.
*   **Synchronization Issues**: Verify network connectivity, check for firewall blocks, and ensure correct peer configurations.
*   **Block Production Failures**: Review logs for errors related to key signing, transaction processing, or leader election.

For further assistance, refer to the HARVEST technical documentation or join the official HARVEST community channels.

