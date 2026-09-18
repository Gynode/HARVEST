# HARVEST DAO Deployment Steps

## Phase 1: Pre-Deployment Setup

### 1.1 Environment Preparation
```bash
# Extract the DAO package
# unzip harvest_dao_complete_package.zip
cd harvest_dao_package/

# Verify Python environment
python3 --version  # Should be 3.11+
pip3 install web3 cryptography
```

### 1.2 Network Configuration
```bash
# Configure HARVEST sidechain connection
export HARVEST_RPC_URL="your_harvest_sidechain_rpc_url"
export HARVEST_CHAIN_ID="your_chain_id"
export DEPLOYER_PRIVATE_KEY="your_deployer_private_key"
```

## Phase 2: Smart Contract Deployment

### 2.1 Deploy Governance Token Contract
```bash
cd contracts/
python3 governance_token.py

# Expected output:
# HARVEST DAO Governance Token Contract Initialized
# Total Supply: 1,000,000,000 HRV
# Contract Address: 0x...
```

### 2.2 Deploy Proposal Manager
```bash
python3 proposal_manager.py

# Expected output:
# HARVEST DAO Proposal Manager Initialized
# Contract Address: 0x...
```

### 2.3 Deploy Voting Mechanism
```bash
python3 voting_mechanism.py

# Expected output:
# HARVEST DAO Voting Mechanism Initialized
# Contract Address: 0x...
```

### 2.4 Deploy Treasury Manager
```bash
python3 treasury_manager.py

# Expected output:
# HARVEST DAO Treasury Manager Initialized
# Contract Address: 0x...
```

### 2.5 Verify Deployments
```bash
cd ../tests/
python3 test_governance_token.py
python3 test_proposal_manager.py
python3 test_voting_mechanism.py
python3 test_treasury_manager.py

# All tests should pass
```

## Phase 3: Initial Configuration

### 3.1 Add Node Handlers
```python
# Run this script to add your existing Node Handlers
from contracts.proposal_manager import ProposalManager

proposal_manager = ProposalManager()

# Add your Node Handlers (replace with actual addresses)
node_handlers = [
    "0x1234567890123456789012345678901234567890",  # Node Handler 1
    "0x2345678901234567890123456789012345678901",  # Node Handler 2
    "0x3456789012345678901234567890123456789012",  # Node Handler 3
]

for handler in node_handlers:
    proposal_manager.add_node_handler(handler)
    print(f"Added Node Handler: {handler}")
```

### 3.2 Setup Treasury Committee
```python
# Run this script to setup treasury committee
from contracts.treasury_manager import TreasuryManager

treasury_manager = TreasuryManager()

# Add treasury committee members (replace with actual addresses)
committee_members = [
    "0x4567890123456789012345678901234567890123",  # Treasury Admin 1
    "0x5678901234567890123456789012345678901234",  # Treasury Admin 2
    "0x6789012345678901234567890123456789012345",  # Treasury Admin 3
]

for member in committee_members:
    treasury_manager.add_committee_member(member)
    print(f"Added Treasury Committee Member: {member}")
```

### 3.3 Fund Initial Treasury (Corrected HRV Valuation Model)
```python
# Corrected treasury setup - HRV gets value from ADA backing only
from contracts.treasury_manager import TreasuryManager

treasury_manager = TreasuryManager()

# Phase 1: Current Bootstrap (2025) - HRV coins have NO standalone value
treasury_manager.add_asset("HRV", 50_000_000, 0.00)  # 50M HRV coins, no backing = $0 value
print("✅ Added 50M HRV coins to treasury (governance function only)")
print("💰 Current treasury value: $0 (HRV has no backing yet)")
print("🗳️  HRV function: Governance voting and proposal rights only")

# Note: Project Catalyst 100K ADA (if approved) is for DEVELOPMENT COSTS:
# - Developer payments, smart contract audits, AI credits, operational expenses
# NOT for DAO treasury backing!

# Phase 2: QSTP Enhancement (Q1 2026) - ADA backing gives HRV value!
print("\n🚀 QSTP Funding Roadmap (Q1 2026):")
print("- Joining Qatar Science and Technology Park")
print("- AI & Blockchain business: Compu-AId & ALSYS")
print("- Budget request: $100,000 worth of ADA for treasury backing")

# Calculate HRV value with ADA backing
ada_backing_usd = 100_000  # $100K worth of ADA
hrv_supply = 50_000_000    # 50M HRV coins
hrv_value_per_coin = ada_backing_usd / hrv_supply  # $0.002 per HRV

print(f"\n💰 HRV Valuation with QSTP ADA Backing:")
print(f"- ADA backing: ${ada_backing_usd:,}")
print(f"- HRV supply: {hrv_supply:,} coins")
print(f"- HRV value per coin: ${hrv_value_per_coin:.4f} (0.2 cents)")
print(f"- Total treasury value: ${ada_backing_usd:,} (all from ADA backing)")

# Current growth strategy (until QSTP)
print("\n🎯 Current Treasury Growth Strategy (2025):")
print("- Build community governance with HRV coins")
print("- Establish voting mechanisms and proposal processes")
print("- Prepare for ADA backing through QSTP application")
print("- No monetary value until backing is secured")

# Enhanced strategy with QSTP
print("\n🌟 Enhanced Strategy with QSTP (2026+):")
print("- $100K ADA backing gives HRV coins real value")
print("- Additional backing increases HRV value proportionally")
print("- ADA staking generates yield to grow backing pool")
print("- Partnership revenues add to backing assets")

# Treasury backing growth scenarios
print("\n📈 HRV Value Growth Scenarios:")
print("- $200K backing → $0.004 per HRV (double value)")
print("- $500K backing → $0.01 per HRV (5x value)")
print("- $1M backing → $0.02 per HRV (10x value)")

# Set up preparation for QSTP funding
treasury_manager.prepare_qstp_funding_proposal()
print("✅ Prepared QSTP funding proposal templates")

# Future yield strategies (post-QSTP)
ada_amount = ada_backing_usd / 0.50  # ~200K ADA at $0.50
staking_amount = ada_amount * 0.8    # Stake 80%
annual_yield = staking_amount * 0.052  # 5.2% APY

print(f"⏳ QSTP yield strategy: Stake {staking_amount:,.0f} ADA @ 5.2% APY")
print(f"⏳ Expected annual yield: {annual_yield:,.0f} ADA (${annual_yield * 0.50:,.0f})")
print("⏳ Yield increases backing pool, raising HRV value over time")
```

**Corrected Understanding:**
- **2025**: HRV coins = governance rights only, $0 treasury value
- **Q1 2026**: $100K ADA backing gives HRV coins $0.002 value each
- **2026+**: Growing backing pool increases HRV value proportionally

**HRV is a governance token backed by treasury assets, not a standalone currency!** This is a much more honest and sustainable model. 💪

## Phase 4: Web Interface Deployment

### 4.1 Setup Interface Environment
```bash
cd ../harvest-dao-interface/
npm install
# or
pnpm install
```

### 4.2 Configure Environment Variables
```bash
# Create .env file
cat > .env << EOF
VITE_HARVEST_RPC_URL=your_harvest_sidechain_rpc_url
VITE_GOVERNANCE_CONTRACT_ADDRESS=deployed_governance_contract_address
VITE_PROPOSAL_CONTRACT_ADDRESS=deployed_proposal_contract_address
VITE_VOTING_CONTRACT_ADDRESS=deployed_voting_contract_address
VITE_TREASURY_CONTRACT_ADDRESS=deployed_treasury_contract_address
VITE_CHAIN_ID=your_chain_id
EOF
```

### 4.3 Test Locally
```bash
npm run dev
# or
pnpm run dev

# Open http://localhost:5173 to test the interface
```

### 4.4 Build for Production
```bash
npm run build
# or
pnpm run build

# This creates a 'dist' folder with production files
```

### 4.5 Deploy to Web Server

**Option A: Deploy to Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Deploy to Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option C: Deploy to Your Server**
```bash
# Upload dist folder to your web server
scp -r dist/* user@your-server:/var/www/dao.harvest.com/
```

## Phase 5: Integration with Existing HARVEST Infrastructure

### 5.1 Update HARVEST Node Configuration
```json
// Add to your existing HARVEST node config
{
  "governance": {
    "enabled": true,
    "contracts": {
      "governance_token": "deployed_governance_contract_address",
      "proposal_manager": "deployed_proposal_contract_address",
      "voting_mechanism": "deployed_voting_contract_address",
      "treasury_manager": "deployed_treasury_contract_address"
    },
    "node_handler_key": "your_node_handler_private_key"
  }
}
```

### 5.2 Update Website Navigation
```html
<!-- Add to your existing HARVEST website -->
<nav>
  <a href="https://harvest.com">Home</a>
  <a href="https://dao.harvest.com">DAO Governance</a>
  <a href="https://harvest.com/explorer">Explorer</a>
</nav>
```

### 5.3 API Integration (Optional)
```python
# Add to your existing HARVEST backend
from harvest_dao.contracts.governance_token import GovernanceToken
from harvest_dao.contracts.proposal_manager import ProposalManager

def get_user_voting_power(user_address):
    governance = GovernanceToken()
    return governance.get_voting_power(user_address)

def get_active_proposals():
    proposals = ProposalManager()
    return proposals.get_active_proposals()
```

## Phase 6: Security and Testing

### 6.1 Security Checklist
- [ ] All private keys are securely stored
- [ ] Multi-signature wallets are properly configured
- [ ] Timelock mechanisms are active
- [ ] Access controls are properly set
- [ ] All contracts have been tested

### 6.2 Functional Testing
```bash
# Test complete governance workflow
cd tests/
python3 integration_test.py

# Test web interface
# 1. Connect wallet
# 2. Create a test proposal
# 3. Cast votes
# 4. Verify treasury operations
```

### 6.3 Load Testing
```bash
# Test with multiple concurrent users
# Verify performance under load
# Check gas optimization
```

## Phase 7: Launch Preparation

### 7.1 Community Preparation
- [ ] Announce DAO launch to community
- [ ] Prepare governance documentation
- [ ] Create tutorial videos
- [ ] Set up community support channels

### 7.2 Initial Governance Setup
```python
# Create first governance proposal
proposal_manager.submit_proposal(
    title="DAO Launch Proposal",
    description="Official launch of HARVEST DAO governance",
    execution_data="0x",  # No execution needed
    proposer="your_address"
)
```

### 7.3 Monitor Launch
- [ ] Monitor contract events
- [ ] Track user adoption
- [ ] Monitor treasury operations
- [ ] Collect community feedback

## Phase 8: Post-Launch Operations

### 8.1 Regular Maintenance
```bash
# Weekly checks
python3 scripts/health_check.py

# Monthly treasury reports
python3 scripts/treasury_report.py

# Quarterly governance review
python3 scripts/governance_metrics.py
```

### 8.2 Upgrades and Improvements
- Monitor community feedback
- Plan governance parameter adjustments
- Implement new features based on usage
- Regular security reviews

## Troubleshooting

### Common Issues

**Contract Deployment Fails**
```bash
# Check gas limits and network connection
# Verify deployer account has sufficient funds
# Check for network congestion
```

**Interface Won't Connect**
```bash
# Verify environment variables
# Check wallet network configuration
# Confirm contract addresses are correct
```

**Voting Not Working**
```bash
# Verify user has HRV tokens
# Check if proposal is in voting phase
# Confirm wallet is connected to correct network
```

## Support Contacts

- Technical Issues: Check documentation in `docs/`
- Integration Help: Review deployment guide
- Community Support: HARVEST Discord/Telegram

## Success Metrics

After deployment, monitor:
- [ ] Number of active governance participants
- [ ] Proposal submission rate
- [ ] Voting participation percentage
- [ ] Treasury performance
- [ ] Community engagement levels

Your HARVEST DAO is now ready for launch! 🚀

