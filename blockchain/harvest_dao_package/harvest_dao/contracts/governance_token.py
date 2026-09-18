"""
HARVEST DAO Governance Token Contract

This contract manages the HRV governance token for the HARVEST DAO.
It extends the existing HRV token functionality to include governance features
such as delegation, voting power calculation, and proposal participation.
"""

import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field


@dataclass
class Delegation:
    """Represents a delegation of voting power from one address to another."""
    delegator: str
    delegate: str
    amount: int
    timestamp: int


@dataclass
class VotingPowerSnapshot:
    """Represents voting power at a specific block/timestamp."""
    address: str
    voting_power: int
    block_number: int
    timestamp: int


class GovernanceToken:
    """
    HARVEST DAO Governance Token Contract
    
    This contract manages the governance aspects of the HRV token, including:
    - Delegation of voting power
    - Voting power calculations
    - Snapshot mechanisms for proposals
    - Governance participation tracking
    """
    
    def __init__(self, total_supply: int, initial_holder: str, blockchain_state):
        """
        Initialize the governance token contract.
        
        Args:
            total_supply: Total supply of HRV tokens (1 billion)
            initial_holder: Initial holder of all tokens
            blockchain_state: Reference to blockchain state for transaction recording
        """
        self.total_supply = total_supply
        self.balances: Dict[str, int] = {initial_holder: total_supply}
        self.delegations: Dict[str, str] = {}  # delegator -> delegate
        self.delegation_history: List[Delegation] = []
        self.voting_power_snapshots: Dict[int, Dict[str, int]] = {}  # block_number -> {address: voting_power}
        self.blockchain_state = blockchain_state
        self.current_block = 0
        
        # Governance parameters
        self.min_proposal_threshold = total_supply // 1000  # 0.1% of total supply
        self.min_delegation_amount = 1000  # Minimum HRV to delegate
        
    def get_balance(self, address: str) -> int:
        """Get the HRV balance of an address."""
        return self.balances.get(address, 0)
    
    def transfer(self, sender: str, recipient: str, amount: int) -> Tuple[bool, str]:
        """
        Transfer HRV tokens between addresses.
        
        Args:
            sender: Address sending tokens
            recipient: Address receiving tokens
            amount: Amount of tokens to transfer
            
        Returns:
            Tuple of (success, message)
        """
        if amount <= 0:
            return False, "Transfer amount must be positive"
        
        if self.balances.get(sender, 0) < amount:
            return False, "Insufficient balance"
        
        # Update balances
        self.balances[sender] = self.balances.get(sender, 0) - amount
        self.balances[recipient] = self.balances.get(recipient, 0) + amount
        
        # Record transaction
        transaction = {
            'type': 'governance_token_transfer',
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
            'timestamp': int(time.time())
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Successfully transferred {amount} HRV from {sender} to {recipient}"
    
    def delegate(self, delegator: str, delegate: str, amount: int) -> Tuple[bool, str]:
        """
        Delegate voting power to another address.
        
        Args:
            delegator: Address delegating voting power
            delegate: Address receiving delegated voting power
            amount: Amount of voting power to delegate
            
        Returns:
            Tuple of (success, message)
        """
        if amount < self.min_delegation_amount:
            return False, f"Minimum delegation amount is {self.min_delegation_amount} HRV"
        
        if self.balances.get(delegator, 0) < amount:
            return False, "Insufficient balance to delegate"
        
        if delegator == delegate:
            return False, "Cannot delegate to yourself"
        
        # Record delegation
        delegation = Delegation(
            delegator=delegator,
            delegate=delegate,
            amount=amount,
            timestamp=int(time.time())
        )
        self.delegation_history.append(delegation)
        
        # Update current delegation mapping
        self.delegations[delegator] = delegate
        
        # Record transaction
        transaction = {
            'type': 'voting_power_delegation',
            'delegator': delegator,
            'delegate': delegate,
            'amount': amount,
            'timestamp': int(time.time())
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Successfully delegated {amount} HRV voting power from {delegator} to {delegate}"
    
    def revoke_delegation(self, delegator: str) -> Tuple[bool, str]:
        """
        Revoke a delegation and return voting power to the delegator.
        
        Args:
            delegator: Address revoking delegation
            
        Returns:
            Tuple of (success, message)
        """
        if delegator not in self.delegations:
            return False, "No active delegation found"
        
        delegate = self.delegations[delegator]
        del self.delegations[delegator]
        
        # Record transaction
        transaction = {
            'type': 'delegation_revocation',
            'delegator': delegator,
            'former_delegate': delegate,
            'timestamp': int(time.time())
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Successfully revoked delegation from {delegator} to {delegate}"
    
    def get_voting_power(self, address: str, block_number: Optional[int] = None) -> int:
        """
        Calculate the voting power of an address at a specific block.
        
        Args:
            address: Address to calculate voting power for
            block_number: Block number for snapshot (current if None)
            
        Returns:
            Total voting power of the address
        """
        if block_number is None:
            block_number = self.current_block
        
        # Check if we have a snapshot for this block
        if block_number in self.voting_power_snapshots:
            return self.voting_power_snapshots[block_number].get(address, 0)
        
        # Calculate voting power
        # Own tokens
        own_power = self.balances.get(address, 0)
        
        # Delegated power (tokens delegated TO this address)
        delegated_power = 0
        for delegator, delegate in self.delegations.items():
            if delegate == address:
                delegated_power += self.balances.get(delegator, 0)
        
        # Subtract delegated away power (tokens delegated BY this address)
        delegated_away = 0
        if address in self.delegations:
            delegated_away = self.balances.get(address, 0)
        
        total_power = own_power + delegated_power - delegated_away
        return max(0, total_power)
    
    def create_voting_snapshot(self, block_number: int) -> Dict[str, int]:
        """
        Create a snapshot of voting power for all addresses at a specific block.
        
        Args:
            block_number: Block number for the snapshot
            
        Returns:
            Dictionary mapping addresses to their voting power
        """
        snapshot = {}
        
        # Get all unique addresses (token holders and delegates)
        all_addresses = set(self.balances.keys())
        all_addresses.update(self.delegations.values())
        
        for address in all_addresses:
            voting_power = self.get_voting_power(address, block_number)
            if voting_power > 0:
                snapshot[address] = voting_power
        
        # Store snapshot
        self.voting_power_snapshots[block_number] = snapshot
        self.current_block = max(self.current_block, block_number)
        
        return snapshot
    
    def can_create_proposal(self, address: str) -> Tuple[bool, str]:
        """
        Check if an address has enough voting power to create a proposal.
        
        Args:
            address: Address to check
            
        Returns:
            Tuple of (can_create, message)
        """
        voting_power = self.get_voting_power(address)
        
        if voting_power >= self.min_proposal_threshold:
            return True, f"Address has {voting_power} voting power (required: {self.min_proposal_threshold})"
        else:
            return False, f"Insufficient voting power: {voting_power} (required: {self.min_proposal_threshold})"
    
    def get_delegation_info(self, address: str) -> Dict:
        """
        Get delegation information for an address.
        
        Args:
            address: Address to get delegation info for
            
        Returns:
            Dictionary with delegation information
        """
        info = {
            'delegated_to': self.delegations.get(address),
            'delegated_from': [],
            'voting_power': self.get_voting_power(address),
            'token_balance': self.balances.get(address, 0)
        }
        
        # Find who delegated to this address
        for delegator, delegate in self.delegations.items():
            if delegate == address:
                info['delegated_from'].append({
                    'delegator': delegator,
                    'amount': self.balances.get(delegator, 0)
                })
        
        return info
    
    def get_top_voters(self, limit: int = 10) -> List[Tuple[str, int]]:
        """
        Get the top voters by voting power.
        
        Args:
            limit: Maximum number of voters to return
            
        Returns:
            List of (address, voting_power) tuples sorted by voting power
        """
        all_addresses = set(self.balances.keys())
        all_addresses.update(self.delegations.values())
        
        voters = []
        for address in all_addresses:
            voting_power = self.get_voting_power(address)
            if voting_power > 0:
                voters.append((address, voting_power))
        
        # Sort by voting power (descending)
        voters.sort(key=lambda x: x[1], reverse=True)
        
        return voters[:limit]


# Mock blockchain state for testing
class MockBlockchainStateForDAO:
    """Mock blockchain state for DAO contract testing."""
    
    def __init__(self):
        self.pending_transactions = []
    
    def add_pending_transaction(self, transaction):
        """Add a transaction to the pending pool."""
        self.pending_transactions.append(transaction)
        print(f"Added transaction: {transaction['type']}")


# Example usage and testing
if __name__ == "__main__":
    # Initialize mock blockchain state
    mock_chain = MockBlockchainStateForDAO()
    
    # Initialize governance token with 1 billion HRV
    governance_token = GovernanceToken(
        total_supply=1_000_000_000,
        initial_holder="HARVEST_Foundation",
        blockchain_state=mock_chain
    )
    
    print("HARVEST DAO Governance Token Contract Initialized")
    print(f"Total Supply: {governance_token.total_supply:,} HRV")
    print(f"Initial Holder: HARVEST_Foundation")
    print(f"Min Proposal Threshold: {governance_token.min_proposal_threshold:,} HRV")
    
    # Test token transfers
    print("\n--- Testing Token Transfers ---")
    success, msg = governance_token.transfer("HARVEST_Foundation", "Alice", 10_000_000)
    print(f"Transfer to Alice: {msg}")
    
    success, msg = governance_token.transfer("HARVEST_Foundation", "Bob", 5_000_000)
    print(f"Transfer to Bob: {msg}")
    
    success, msg = governance_token.transfer("HARVEST_Foundation", "Node_Handler_1", 20_000_000)
    print(f"Transfer to Node Handler 1: {msg}")
    
    # Test delegation
    print("\n--- Testing Delegation ---")
    success, msg = governance_token.delegate("Alice", "Node_Handler_1", 5_000_000)
    print(f"Alice delegates to Node Handler 1: {msg}")
    
    success, msg = governance_token.delegate("Bob", "Node_Handler_1", 3_000_000)
    print(f"Bob delegates to Node Handler 1: {msg}")
    
    # Test voting power calculation
    print("\n--- Voting Power Analysis ---")
    print(f"Alice voting power: {governance_token.get_voting_power('Alice'):,}")
    print(f"Bob voting power: {governance_token.get_voting_power('Bob'):,}")
    print(f"Node Handler 1 voting power: {governance_token.get_voting_power('Node_Handler_1'):,}")
    print(f"HARVEST Foundation voting power: {governance_token.get_voting_power('HARVEST_Foundation'):,}")
    
    # Test proposal creation eligibility
    print("\n--- Proposal Creation Eligibility ---")
    can_create, msg = governance_token.can_create_proposal("Alice")
    print(f"Alice can create proposal: {can_create} - {msg}")
    
    can_create, msg = governance_token.can_create_proposal("Node_Handler_1")
    print(f"Node Handler 1 can create proposal: {can_create} - {msg}")
    
    can_create, msg = governance_token.can_create_proposal("HARVEST_Foundation")
    print(f"HARVEST Foundation can create proposal: {can_create} - {msg}")
    
    # Create voting snapshot
    print("\n--- Creating Voting Snapshot ---")
    snapshot = governance_token.create_voting_snapshot(block_number=1)
    print("Voting power snapshot created for block 1:")
    for address, power in sorted(snapshot.items(), key=lambda x: x[1], reverse=True):
        print(f"  {address}: {power:,} voting power")
    
    # Get top voters
    print("\n--- Top Voters ---")
    top_voters = governance_token.get_top_voters(5)
    for i, (address, power) in enumerate(top_voters, 1):
        print(f"{i}. {address}: {power:,} voting power")
    
    print(f"\nTotal pending transactions: {len(mock_chain.pending_transactions)}")

