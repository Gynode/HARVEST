"""
HARVEST DAO Treasury Management Contract

This contract manages the HARVEST DAO treasury, including asset diversification,
yield generation, and execution of approved funding proposals.
"""

import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from enum import Enum


class AssetType(Enum):
    """Types of assets that can be held in the treasury."""
    HRV = "hrv"
    STABLECOIN = "stablecoin"
    L1_TOKEN = "l1_token"
    YIELD_BEARING = "yield_bearing"
    LP_TOKEN = "lp_token"


@dataclass
class Asset:
    """Represents an asset in the treasury."""
    symbol: str
    asset_type: AssetType
    balance: int
    value_usd: float
    last_updated: int


@dataclass
class Transaction:
    """Represents a treasury transaction."""
    id: int
    transaction_type: str
    asset_symbol: str
    amount: int
    counterparty: str
    timestamp: int
    proposal_id: Optional[int] = None
    description: str = ""


@dataclass
class YieldStrategy:
    """Represents a yield generation strategy."""
    name: str
    asset_symbol: str
    protocol: str
    apy: float
    risk_level: str  # "low", "medium", "high"
    allocated_amount: int
    is_active: bool = True


class TreasuryManager:
    """
    HARVEST DAO Treasury Management Contract
    
    This contract manages the DAO's treasury including:
    - Asset diversification and allocation
    - Yield generation strategies
    - Execution of approved funding proposals
    - Treasury reporting and analytics
    """
    
    def __init__(self, proposal_manager, blockchain_state):
        """
        Initialize the treasury manager.
        
        Args:
            proposal_manager: Reference to the proposal manager contract
            blockchain_state: Reference to blockchain state for transaction recording
        """
        self.proposal_manager = proposal_manager
        self.blockchain_state = blockchain_state
        
        # Treasury assets
        self.assets: Dict[str, Asset] = {}
        self.transactions: List[Transaction] = []
        self.next_transaction_id = 1
        
        # Yield strategies
        self.yield_strategies: Dict[str, YieldStrategy] = {}
        
        # Treasury committee (multi-sig signers)
        self.treasury_committee = set()
        self.required_signatures = 3  # Minimum signatures required for transactions
        
        # Asset allocation targets (percentages)
        self.allocation_targets = {
            AssetType.HRV: 0.30,          # 30% in HRV tokens
            AssetType.STABLECOIN: 0.40,   # 40% in stablecoins
            AssetType.L1_TOKEN: 0.20,     # 20% in L1 tokens (ADA, ETH)
            AssetType.YIELD_BEARING: 0.10  # 10% in yield-bearing assets
        }
        
        # Risk management parameters
        self.max_single_asset_allocation = 0.50  # Max 50% in any single asset
        self.min_stable_reserve = 0.25  # Minimum 25% in stable assets
        self.max_yield_allocation = 0.30  # Max 30% in yield strategies
        
        # Operating expenses reserve (2 years)
        self.operating_expenses_monthly = 50_000  # USD equivalent
        self.required_reserve_months = 24
        
    def add_treasury_committee_member(self, address: str) -> Tuple[bool, str]:
        """
        Add a member to the treasury committee.
        
        Args:
            address: Address of the committee member
            
        Returns:
            Tuple of (success, message)
        """
        if address in self.treasury_committee:
            return False, "Address is already a treasury committee member"
        
        self.treasury_committee.add(address)
        
        # Record transaction
        transaction = {
            'type': 'treasury_committee_member_added',
            'address': address,
            'timestamp': int(time.time())
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Successfully added {address} to treasury committee"
    
    def remove_treasury_committee_member(self, address: str) -> Tuple[bool, str]:
        """
        Remove a member from the treasury committee.
        
        Args:
            address: Address of the committee member
            
        Returns:
            Tuple of (success, message)
        """
        if address not in self.treasury_committee:
            return False, "Address is not a treasury committee member"
        
        if len(self.treasury_committee) <= self.required_signatures:
            return False, "Cannot remove member: would fall below required signatures"
        
        self.treasury_committee.remove(address)
        
        # Record transaction
        transaction = {
            'type': 'treasury_committee_member_removed',
            'address': address,
            'timestamp': int(time.time())
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Successfully removed {address} from treasury committee"
    
    def add_asset(
        self,
        symbol: str,
        asset_type: AssetType,
        initial_balance: int,
        value_usd: float
    ) -> Tuple[bool, str]:
        """
        Add a new asset to the treasury.
        
        Args:
            symbol: Asset symbol (e.g., "HRV", "USDC", "ADA")
            asset_type: Type of the asset
            initial_balance: Initial balance of the asset
            value_usd: USD value of the asset
            
        Returns:
            Tuple of (success, message)
        """
        if symbol in self.assets:
            return False, f"Asset {symbol} already exists in treasury"
        
        asset = Asset(
            symbol=symbol,
            asset_type=asset_type,
            balance=initial_balance,
            value_usd=value_usd,
            last_updated=int(time.time())
        )
        
        self.assets[symbol] = asset
        
        # Record transaction
        self._record_transaction(
            transaction_type="asset_added",
            asset_symbol=symbol,
            amount=initial_balance,
            counterparty="treasury_initialization",
            description=f"Added {symbol} to treasury"
        )
        
        return True, f"Successfully added {symbol} to treasury with balance {initial_balance}"
    
    def update_asset_balance(
        self,
        symbol: str,
        new_balance: int,
        value_usd: float
    ) -> Tuple[bool, str]:
        """
        Update the balance and value of an asset.
        
        Args:
            symbol: Asset symbol
            new_balance: New balance of the asset
            value_usd: New USD value of the asset
            
        Returns:
            Tuple of (success, message)
        """
        if symbol not in self.assets:
            return False, f"Asset {symbol} not found in treasury"
        
        old_balance = self.assets[symbol].balance
        self.assets[symbol].balance = new_balance
        self.assets[symbol].value_usd = value_usd
        self.assets[symbol].last_updated = int(time.time())
        
        # Record transaction if balance changed
        if new_balance != old_balance:
            change = new_balance - old_balance
            transaction_type = "balance_increase" if change > 0 else "balance_decrease"
            
            self._record_transaction(
                transaction_type=transaction_type,
                asset_symbol=symbol,
                amount=abs(change),
                counterparty="balance_update",
                description=f"Balance updated from {old_balance} to {new_balance}"
            )
        
        return True, f"Updated {symbol} balance to {new_balance}"
    
    def execute_funding_proposal(
        self,
        proposal_id: int,
        executor: str
    ) -> Tuple[bool, str]:
        """
        Execute a funding proposal by transferring assets from treasury.
        
        Args:
            proposal_id: ID of the approved funding proposal
            executor: Address executing the proposal
            
        Returns:
            Tuple of (success, message)
        """
        # Get proposal details
        proposal = self.proposal_manager.get_proposal(proposal_id)
        
        if not proposal:
            return False, "Proposal not found"
        
        if proposal.status.value != "passed":
            return False, "Proposal has not been approved"
        
        if proposal.proposal_type.value != "funding_request":
            return False, "Proposal is not a funding request"
        
        if not proposal.requested_amount or not proposal.recipient_address:
            return False, "Invalid funding proposal: missing amount or recipient"
        
        # Check if executor is authorized (treasury committee member)
        if executor not in self.treasury_committee:
            return False, "Only treasury committee members can execute funding proposals"
        
        # Check if treasury has sufficient HRV balance
        hrv_asset = self.assets.get("HRV")
        if not hrv_asset:
            return False, "HRV asset not found in treasury"
        
        if hrv_asset.balance < proposal.requested_amount:
            return False, f"Insufficient HRV balance: {hrv_asset.balance} < {proposal.requested_amount}"
        
        # Execute transfer
        hrv_asset.balance -= proposal.requested_amount
        hrv_asset.last_updated = int(time.time())
        
        # Record transaction
        self._record_transaction(
            transaction_type="funding_transfer",
            asset_symbol="HRV",
            amount=proposal.requested_amount,
            counterparty=proposal.recipient_address,
            proposal_id=proposal_id,
            description=f"Funding transfer for proposal: {proposal.title}"
        )
        
        return True, f"Successfully transferred {proposal.requested_amount} HRV to {proposal.recipient_address}"
    
    def add_yield_strategy(
        self,
        name: str,
        asset_symbol: str,
        protocol: str,
        apy: float,
        risk_level: str,
        allocated_amount: int
    ) -> Tuple[bool, str]:
        """
        Add a yield generation strategy.
        
        Args:
            name: Name of the strategy
            asset_symbol: Asset to be used in the strategy
            protocol: DeFi protocol name
            apy: Annual percentage yield
            risk_level: Risk level ("low", "medium", "high")
            allocated_amount: Amount to allocate to this strategy
            
        Returns:
            Tuple of (success, message)
        """
        if name in self.yield_strategies:
            return False, f"Yield strategy {name} already exists"
        
        if asset_symbol not in self.assets:
            return False, f"Asset {asset_symbol} not found in treasury"
        
        if risk_level not in ["low", "medium", "high"]:
            return False, "Risk level must be 'low', 'medium', or 'high'"
        
        # Check allocation limits
        total_yield_allocation = sum(s.allocated_amount for s in self.yield_strategies.values())
        total_treasury_value = self.get_total_treasury_value_usd()
        
        if (total_yield_allocation + allocated_amount) > (total_treasury_value * self.max_yield_allocation):
            return False, f"Allocation would exceed maximum yield allocation limit"
        
        # Check asset availability
        asset = self.assets[asset_symbol]
        if asset.balance < allocated_amount:
            return False, f"Insufficient {asset_symbol} balance for allocation"
        
        # Create strategy
        strategy = YieldStrategy(
            name=name,
            asset_symbol=asset_symbol,
            protocol=protocol,
            apy=apy,
            risk_level=risk_level,
            allocated_amount=allocated_amount
        )
        
        self.yield_strategies[name] = strategy
        
        # Update asset balance (move to yield strategy)
        asset.balance -= allocated_amount
        asset.last_updated = int(time.time())
        
        # Record transaction
        self._record_transaction(
            transaction_type="yield_strategy_allocation",
            asset_symbol=asset_symbol,
            amount=allocated_amount,
            counterparty=protocol,
            description=f"Allocated to yield strategy: {name}"
        )
        
        return True, f"Successfully added yield strategy {name} with {allocated_amount} {asset_symbol}"
    
    def remove_yield_strategy(self, name: str) -> Tuple[bool, str]:
        """
        Remove a yield strategy and return assets to treasury.
        
        Args:
            name: Name of the strategy to remove
            
        Returns:
            Tuple of (success, message)
        """
        if name not in self.yield_strategies:
            return False, f"Yield strategy {name} not found"
        
        strategy = self.yield_strategies[name]
        
        # Return assets to treasury (assuming no loss for simplicity)
        asset = self.assets[strategy.asset_symbol]
        asset.balance += strategy.allocated_amount
        asset.last_updated = int(time.time())
        
        # Record transaction
        self._record_transaction(
            transaction_type="yield_strategy_withdrawal",
            asset_symbol=strategy.asset_symbol,
            amount=strategy.allocated_amount,
            counterparty=strategy.protocol,
            description=f"Withdrew from yield strategy: {name}"
        )
        
        # Remove strategy
        del self.yield_strategies[name]
        
        return True, f"Successfully removed yield strategy {name}"
    
    def rebalance_portfolio(self) -> Tuple[bool, str]:
        """
        Rebalance the treasury portfolio according to target allocations.
        
        Returns:
            Tuple of (success, message)
        """
        total_value = self.get_total_treasury_value_usd()
        
        if total_value == 0:
            return False, "Treasury has no assets to rebalance"
        
        rebalancing_actions = []
        
        # Calculate current allocations by asset type
        current_allocations = {}
        for asset_type in AssetType:
            current_allocations[asset_type] = 0
        
        for asset in self.assets.values():
            current_allocations[asset.asset_type] += asset.value_usd
        
        # Convert to percentages
        for asset_type in current_allocations:
            current_allocations[asset_type] /= total_value
        
        # Identify rebalancing needs
        for asset_type, target_allocation in self.allocation_targets.items():
            current_allocation = current_allocations[asset_type]
            difference = target_allocation - current_allocation
            
            if abs(difference) > 0.05:  # 5% threshold for rebalancing
                action = "increase" if difference > 0 else "decrease"
                rebalancing_actions.append(f"{action} {asset_type.value} allocation by {abs(difference):.2%}")
        
        if not rebalancing_actions:
            return True, "Portfolio is already well-balanced"
        
        # Record rebalancing recommendation
        self._record_transaction(
            transaction_type="rebalancing_analysis",
            asset_symbol="PORTFOLIO",
            amount=0,
            counterparty="treasury_manager",
            description=f"Rebalancing needed: {'; '.join(rebalancing_actions)}"
        )
        
        return True, f"Rebalancing analysis complete. Actions needed: {'; '.join(rebalancing_actions)}"
    
    def get_treasury_report(self) -> Dict:
        """
        Generate a comprehensive treasury report.
        
        Returns:
            Dictionary containing treasury analytics
        """
        total_value_usd = self.get_total_treasury_value_usd()
        
        # Asset breakdown
        asset_breakdown = {}
        for symbol, asset in self.assets.items():
            asset_breakdown[symbol] = {
                'balance': asset.balance,
                'value_usd': asset.value_usd,
                'percentage': (asset.value_usd / total_value_usd * 100) if total_value_usd > 0 else 0,
                'asset_type': asset.asset_type.value,
                'last_updated': asset.last_updated
            }
        
        # Asset type allocation
        type_allocation = {}
        for asset_type in AssetType:
            type_value = sum(asset.value_usd for asset in self.assets.values() 
                           if asset.asset_type == asset_type)
            target_percentage = self.allocation_targets.get(asset_type, 0.0) * 100
            type_allocation[asset_type.value] = {
                'value_usd': type_value,
                'percentage': (type_value / total_value_usd * 100) if total_value_usd > 0 else 0,
                'target_percentage': target_percentage
            }
        
        # Yield strategies
        yield_summary = {}
        total_yield_value = 0
        for name, strategy in self.yield_strategies.items():
            strategy_value = strategy.allocated_amount * self.assets[strategy.asset_symbol].value_usd / self.assets[strategy.asset_symbol].balance
            total_yield_value += strategy_value
            yield_summary[name] = {
                'asset': strategy.asset_symbol,
                'protocol': strategy.protocol,
                'allocated_amount': strategy.allocated_amount,
                'value_usd': strategy_value,
                'apy': strategy.apy,
                'risk_level': strategy.risk_level,
                'is_active': strategy.is_active
            }
        
        # Operating expenses coverage
        stable_assets_value = sum(asset.value_usd for asset in self.assets.values() 
                                if asset.asset_type in [AssetType.STABLECOIN])
        months_covered = stable_assets_value / self.operating_expenses_monthly if self.operating_expenses_monthly > 0 else 0
        
        # Recent transactions
        recent_transactions = []
        for tx in self.transactions[-10:]:  # Last 10 transactions
            recent_transactions.append({
                'id': tx.id,
                'type': tx.transaction_type,
                'asset': tx.asset_symbol,
                'amount': tx.amount,
                'counterparty': tx.counterparty,
                'timestamp': tx.timestamp,
                'description': tx.description
            })
        
        return {
            'total_value_usd': total_value_usd,
            'asset_breakdown': asset_breakdown,
            'asset_type_allocation': type_allocation,
            'yield_strategies': yield_summary,
            'total_yield_value_usd': total_yield_value,
            'operating_expenses': {
                'monthly_usd': self.operating_expenses_monthly,
                'stable_assets_value_usd': stable_assets_value,
                'months_covered': months_covered,
                'required_months': self.required_reserve_months
            },
            'treasury_committee_size': len(self.treasury_committee),
            'required_signatures': self.required_signatures,
            'recent_transactions': recent_transactions,
            'total_transactions': len(self.transactions)
        }
    
    def get_total_treasury_value_usd(self) -> float:
        """Calculate the total USD value of the treasury."""
        total_value = sum(asset.value_usd for asset in self.assets.values())
        
        # Add yield strategy values
        for strategy in self.yield_strategies.values():
            if strategy.asset_symbol in self.assets:
                asset_price = self.assets[strategy.asset_symbol].value_usd / max(1, self.assets[strategy.asset_symbol].balance)
                total_value += strategy.allocated_amount * asset_price
        
        return total_value
    
    def _record_transaction(
        self,
        transaction_type: str,
        asset_symbol: str,
        amount: int,
        counterparty: str,
        proposal_id: Optional[int] = None,
        description: str = ""
    ):
        """Record a treasury transaction."""
        transaction = Transaction(
            id=self.next_transaction_id,
            transaction_type=transaction_type,
            asset_symbol=asset_symbol,
            amount=amount,
            counterparty=counterparty,
            timestamp=int(time.time()),
            proposal_id=proposal_id,
            description=description
        )
        
        self.transactions.append(transaction)
        self.next_transaction_id += 1
        
        # Record on blockchain
        blockchain_transaction = {
            'type': 'treasury_transaction',
            'transaction_id': transaction.id,
            'transaction_type': transaction_type,
            'asset_symbol': asset_symbol,
            'amount': amount,
            'counterparty': counterparty,
            'proposal_id': proposal_id,
            'description': description,
            'timestamp': transaction.timestamp
        }
        self.blockchain_state.add_pending_transaction(blockchain_transaction)


# Example usage and testing
if __name__ == "__main__":
    from governance_token import GovernanceToken, MockBlockchainStateForDAO
    from proposal_manager import ProposalManager, ProposalType
    
    # Initialize mock blockchain state
    mock_chain = MockBlockchainStateForDAO()
    
    # Initialize governance token
    governance_token = GovernanceToken(
        total_supply=1_000_000_000,
        initial_holder="HARVEST_Foundation",
        blockchain_state=mock_chain
    )
    
    # Initialize proposal manager
    proposal_manager = ProposalManager(governance_token, mock_chain)
    
    # Initialize treasury manager
    treasury_manager = TreasuryManager(proposal_manager, mock_chain)
    
    print("HARVEST DAO Treasury Manager Initialized")
    
    # Add treasury committee members
    print("\n--- Adding Treasury Committee Members ---")
    committee_members = ["Treasury_Admin_1", "Treasury_Admin_2", "Treasury_Admin_3", "Node_Handler_1"]
    for member in committee_members:
        success, msg = treasury_manager.add_treasury_committee_member(member)
        print(f"Add {member}: {msg}")
    
    # Add initial assets to treasury
    print("\n--- Adding Initial Assets ---")
    initial_assets = [
        ("HRV", AssetType.HRV, 300_000_000, 0.10),  # 300M HRV at $0.10 each
        ("USDC", AssetType.STABLECOIN, 10_000_000, 1.00),  # 10M USDC
        ("ADA", AssetType.L1_TOKEN, 5_000_000, 0.50),  # 5M ADA at $0.50 each
        ("DAI", AssetType.STABLECOIN, 5_000_000, 1.00),  # 5M DAI
    ]
    
    for symbol, asset_type, balance, price in initial_assets:
        value_usd = balance * price
        success, msg = treasury_manager.add_asset(symbol, asset_type, balance, value_usd)
        print(f"Add {symbol}: {msg}")
    
    # Add yield strategies
    print("\n--- Adding Yield Strategies ---")
    yield_strategies = [
        ("USDC_Compound", "USDC", "Compound", 4.5, "low", 2_000_000),
        ("ADA_Staking", "ADA", "Cardano_Staking", 5.2, "low", 1_000_000),
        ("DAI_Yearn", "DAI", "Yearn", 6.8, "medium", 1_500_000),
    ]
    
    for name, asset, protocol, apy, risk, amount in yield_strategies:
        success, msg = treasury_manager.add_yield_strategy(name, asset, protocol, apy, risk, amount)
        print(f"Add {name}: {msg}")
    
    # Generate treasury report
    print("\n--- Treasury Report ---")
    report = treasury_manager.get_treasury_report()
    
    print(f"Total Treasury Value: ${report['total_value_usd']:,.2f}")
    print(f"Total Yield Value: ${report['total_yield_value_usd']:,.2f}")
    print(f"Operating Expenses Coverage: {report['operating_expenses']['months_covered']:.1f} months")
    
    print("\nAsset Breakdown:")
    for symbol, data in report['asset_breakdown'].items():
        print(f"  {symbol}: {data['balance']:,} (${data['value_usd']:,.2f}, {data['percentage']:.1f}%)")
    
    print("\nAsset Type Allocation:")
    for asset_type, data in report['asset_type_allocation'].items():
        print(f"  {asset_type}: {data['percentage']:.1f}% (target: {data['target_percentage']:.1f}%)")
    
    print("\nYield Strategies:")
    for name, data in report['yield_strategies'].items():
        print(f"  {name}: {data['allocated_amount']:,} {data['asset']} @ {data['apy']}% APY ({data['risk_level']} risk)")
    
    # Test portfolio rebalancing
    print("\n--- Portfolio Rebalancing Analysis ---")
    success, msg = treasury_manager.rebalance_portfolio()
    print(f"Rebalancing: {msg}")
    
    print(f"\nTotal treasury transactions: {len(treasury_manager.transactions)}")
    print(f"Total blockchain transactions: {len(mock_chain.pending_transactions)}")

