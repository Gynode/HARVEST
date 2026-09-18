"""
HARVEST DAO Proposal Management Contract

This contract manages the lifecycle of governance proposals in the HARVEST DAO,
including proposal creation, review, voting, and execution.
"""

import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from enum import Enum


class ProposalType(Enum):
    """Types of proposals that can be submitted to the DAO."""
    TECHNICAL_UPGRADE = "technical_upgrade"
    FUNDING_REQUEST = "funding_request"
    GOVERNANCE_CHANGE = "governance_change"
    TREASURY_MANAGEMENT = "treasury_management"
    PARAMETER_CHANGE = "parameter_change"
    GENERAL = "general"


class ProposalStatus(Enum):
    """Status of a proposal in its lifecycle."""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    VOTING = "voting"
    PASSED = "passed"
    REJECTED = "rejected"
    EXECUTED = "executed"
    CANCELLED = "cancelled"


@dataclass
class Vote:
    """Represents a vote on a proposal."""
    voter: str
    proposal_id: int
    vote: str  # "yes", "no", "abstain"
    voting_power: int
    timestamp: int


@dataclass
class Proposal:
    """Represents a governance proposal."""
    id: int
    title: str
    description: str
    proposer: str
    proposal_type: ProposalType
    status: ProposalStatus
    created_at: int
    voting_start: Optional[int] = None
    voting_end: Optional[int] = None
    execution_time: Optional[int] = None
    
    # Voting results
    yes_votes: int = 0
    no_votes: int = 0
    abstain_votes: int = 0
    total_voting_power: int = 0
    
    # Review feedback
    node_handler_reviews: List[Dict] = field(default_factory=list)
    
    # Execution parameters
    execution_data: Optional[Dict] = None
    
    # Financial parameters (for funding requests)
    requested_amount: Optional[int] = None
    recipient_address: Optional[str] = None


class ProposalManager:
    """
    HARVEST DAO Proposal Management Contract
    
    This contract manages the complete lifecycle of governance proposals:
    - Proposal submission and validation
    - Node Handler review process
    - Community voting
    - Proposal execution
    """
    
    def __init__(self, governance_token, blockchain_state):
        """
        Initialize the proposal manager.
        
        Args:
            governance_token: Reference to the governance token contract
            blockchain_state: Reference to blockchain state for transaction recording
        """
        self.governance_token = governance_token
        self.blockchain_state = blockchain_state
        
        # Proposal storage
        self.proposals: Dict[int, Proposal] = {}
        self.next_proposal_id = 1
        self.votes: Dict[int, List[Vote]] = {}  # proposal_id -> votes
        
        # Node Handlers (authorized reviewers)
        self.node_handlers = set()
        
        # Governance parameters
        self.review_period = 7 * 24 * 3600  # 7 days in seconds
        self.voting_period = 5 * 24 * 3600  # 5 days in seconds
        self.execution_delay = 2 * 24 * 3600  # 2 days timelock
        self.quorum_threshold = 0.05  # 5% of total supply
        self.approval_threshold = 0.51  # 51% of votes cast
        
    def add_node_handler(self, address: str) -> Tuple[bool, str]:
        """
        Add a Node Handler to the authorized reviewers list.
        
        Args:
            address: Address of the Node Handler
            
        Returns:
            Tuple of (success, message)
        """
        if address in self.node_handlers:
            return False, "Address is already a Node Handler"
        
        self.node_handlers.add(address)
        
        # Record transaction
        transaction = {
            'type': 'node_handler_added',
            'address': address,
            'timestamp': int(time.time())
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Successfully added {address} as Node Handler"
    
    def remove_node_handler(self, address: str) -> Tuple[bool, str]:
        """
        Remove a Node Handler from the authorized reviewers list.
        
        Args:
            address: Address of the Node Handler
            
        Returns:
            Tuple of (success, message)
        """
        if address not in self.node_handlers:
            return False, "Address is not a Node Handler"
        
        self.node_handlers.remove(address)
        
        # Record transaction
        transaction = {
            'type': 'node_handler_removed',
            'address': address,
            'timestamp': int(time.time())
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Successfully removed {address} as Node Handler"
    
    def submit_proposal(
        self,
        proposer: str,
        title: str,
        description: str,
        proposal_type: ProposalType,
        execution_data: Optional[Dict] = None,
        requested_amount: Optional[int] = None,
        recipient_address: Optional[str] = None
    ) -> Tuple[bool, str, Optional[int]]:
        """
        Submit a new governance proposal.
        
        Args:
            proposer: Address of the proposer
            title: Title of the proposal
            description: Detailed description of the proposal
            proposal_type: Type of the proposal
            execution_data: Data needed for proposal execution
            requested_amount: Amount requested (for funding proposals)
            recipient_address: Recipient address (for funding proposals)
            
        Returns:
            Tuple of (success, message, proposal_id)
        """
        # Check if proposer can create proposals
        can_create, msg = self.governance_token.can_create_proposal(proposer)
        if not can_create:
            return False, f"Proposer cannot create proposals: {msg}", None
        
        # Validate proposal data
        if not title or not description:
            return False, "Title and description are required", None
        
        if proposal_type == ProposalType.FUNDING_REQUEST:
            if not requested_amount or not recipient_address:
                return False, "Funding requests must specify amount and recipient", None
        
        # Create proposal
        proposal = Proposal(
            id=self.next_proposal_id,
            title=title,
            description=description,
            proposer=proposer,
            proposal_type=proposal_type,
            status=ProposalStatus.SUBMITTED,
            created_at=int(time.time()),
            execution_data=execution_data,
            requested_amount=requested_amount,
            recipient_address=recipient_address
        )
        
        # Store proposal
        self.proposals[self.next_proposal_id] = proposal
        self.votes[self.next_proposal_id] = []
        
        # Record transaction
        transaction = {
            'type': 'proposal_submitted',
            'proposal_id': self.next_proposal_id,
            'proposer': proposer,
            'title': title,
            'proposal_type': proposal_type.value,
            'timestamp': int(time.time())
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        proposal_id = self.next_proposal_id
        self.next_proposal_id += 1
        
        return True, f"Proposal {proposal_id} submitted successfully", proposal_id
    
    def submit_node_handler_review(
        self,
        reviewer: str,
        proposal_id: int,
        recommendation: str,
        comments: str
    ) -> Tuple[bool, str]:
        """
        Submit a Node Handler review for a proposal.
        
        Args:
            reviewer: Address of the reviewing Node Handler
            proposal_id: ID of the proposal being reviewed
            recommendation: "approve", "reject", or "needs_changes"
            comments: Review comments
            
        Returns:
            Tuple of (success, message)
        """
        if reviewer not in self.node_handlers:
            return False, "Only Node Handlers can submit reviews"
        
        if proposal_id not in self.proposals:
            return False, "Proposal not found"
        
        proposal = self.proposals[proposal_id]
        
        if proposal.status != ProposalStatus.SUBMITTED:
            return False, "Proposal is not in submitted status"
        
        # Check if this Node Handler already reviewed
        for review in proposal.node_handler_reviews:
            if review['reviewer'] == reviewer:
                return False, "Node Handler has already reviewed this proposal"
        
        # Add review
        review = {
            'reviewer': reviewer,
            'recommendation': recommendation,
            'comments': comments,
            'timestamp': int(time.time())
        }
        proposal.node_handler_reviews.append(review)
        
        # Update proposal status if needed
        if len(proposal.node_handler_reviews) >= len(self.node_handlers) // 2 + 1:
            proposal.status = ProposalStatus.UNDER_REVIEW
        
        # Record transaction
        transaction = {
            'type': 'node_handler_review',
            'proposal_id': proposal_id,
            'reviewer': reviewer,
            'recommendation': recommendation,
            'timestamp': int(time.time())
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Review submitted for proposal {proposal_id}"
    
    def start_voting(self, proposal_id: int, initiator: str) -> Tuple[bool, str]:
        """
        Start the voting period for a proposal.
        
        Args:
            proposal_id: ID of the proposal
            initiator: Address initiating the vote
            
        Returns:
            Tuple of (success, message)
        """
        if proposal_id not in self.proposals:
            return False, "Proposal not found"
        
        proposal = self.proposals[proposal_id]
        
        if proposal.status not in [ProposalStatus.SUBMITTED, ProposalStatus.UNDER_REVIEW]:
            return False, "Proposal is not ready for voting"
        
        # Check if enough Node Handler reviews (at least majority approval)
        approve_count = sum(1 for review in proposal.node_handler_reviews 
                          if review['recommendation'] == 'approve')
        
        if approve_count < len(self.node_handlers) // 2 + 1:
            return False, "Proposal needs majority Node Handler approval to proceed to voting"
        
        # Start voting
        current_time = int(time.time())
        proposal.status = ProposalStatus.VOTING
        proposal.voting_start = current_time
        proposal.voting_end = current_time + self.voting_period
        
        # Create voting power snapshot
        snapshot_block = self.governance_token.current_block + 1
        self.governance_token.create_voting_snapshot(snapshot_block)
        proposal.total_voting_power = sum(self.governance_token.voting_power_snapshots[snapshot_block].values())
        
        # Record transaction
        transaction = {
            'type': 'voting_started',
            'proposal_id': proposal_id,
            'voting_start': proposal.voting_start,
            'voting_end': proposal.voting_end,
            'snapshot_block': snapshot_block,
            'timestamp': current_time
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Voting started for proposal {proposal_id}"
    
    def cast_vote(
        self,
        voter: str,
        proposal_id: int,
        vote: str
    ) -> Tuple[bool, str]:
        """
        Cast a vote on a proposal.
        
        Args:
            voter: Address of the voter
            proposal_id: ID of the proposal
            vote: "yes", "no", or "abstain"
            
        Returns:
            Tuple of (success, message)
        """
        if proposal_id not in self.proposals:
            return False, "Proposal not found"
        
        proposal = self.proposals[proposal_id]
        
        if proposal.status != ProposalStatus.VOTING:
            return False, "Proposal is not in voting status"
        
        current_time = int(time.time())
        if current_time < proposal.voting_start or current_time > proposal.voting_end:
            return False, "Voting period is not active"
        
        if vote not in ["yes", "no", "abstain"]:
            return False, "Vote must be 'yes', 'no', or 'abstain'"
        
        # Check if voter already voted
        for existing_vote in self.votes[proposal_id]:
            if existing_vote.voter == voter:
                return False, "Voter has already voted on this proposal"
        
        # Get voting power at snapshot
        voting_power = self.governance_token.get_voting_power(voter)
        
        if voting_power == 0:
            return False, "Voter has no voting power"
        
        # Record vote
        vote_obj = Vote(
            voter=voter,
            proposal_id=proposal_id,
            vote=vote,
            voting_power=voting_power,
            timestamp=current_time
        )
        self.votes[proposal_id].append(vote_obj)
        
        # Update proposal vote counts
        if vote == "yes":
            proposal.yes_votes += voting_power
        elif vote == "no":
            proposal.no_votes += voting_power
        elif vote == "abstain":
            proposal.abstain_votes += voting_power
        
        # Record transaction
        transaction = {
            'type': 'vote_cast',
            'proposal_id': proposal_id,
            'voter': voter,
            'vote': vote,
            'voting_power': voting_power,
            'timestamp': current_time
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Vote '{vote}' cast for proposal {proposal_id} with {voting_power} voting power"
    
    def finalize_voting(self, proposal_id: int) -> Tuple[bool, str]:
        """
        Finalize voting for a proposal and determine the result.
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Tuple of (success, message)
        """
        if proposal_id not in self.proposals:
            return False, "Proposal not found"
        
        proposal = self.proposals[proposal_id]
        
        if proposal.status != ProposalStatus.VOTING:
            return False, "Proposal is not in voting status"
        
        current_time = int(time.time())
        if current_time <= proposal.voting_end:
            return False, "Voting period has not ended yet"
        
        # Calculate results
        total_votes_cast = proposal.yes_votes + proposal.no_votes + proposal.abstain_votes
        quorum_required = int(self.governance_token.total_supply * self.quorum_threshold)
        
        # Check quorum
        if total_votes_cast < quorum_required:
            proposal.status = ProposalStatus.REJECTED
            result = "rejected due to insufficient quorum"
        else:
            # Check approval threshold (excluding abstain votes)
            decisive_votes = proposal.yes_votes + proposal.no_votes
            if decisive_votes == 0:
                proposal.status = ProposalStatus.REJECTED
                result = "rejected due to no decisive votes"
            else:
                approval_ratio = proposal.yes_votes / decisive_votes
                if approval_ratio >= self.approval_threshold:
                    proposal.status = ProposalStatus.PASSED
                    proposal.execution_time = current_time + self.execution_delay
                    result = "passed"
                else:
                    proposal.status = ProposalStatus.REJECTED
                    result = "rejected by vote"
        
        # Record transaction
        transaction = {
            'type': 'voting_finalized',
            'proposal_id': proposal_id,
            'result': result,
            'yes_votes': proposal.yes_votes,
            'no_votes': proposal.no_votes,
            'abstain_votes': proposal.abstain_votes,
            'total_votes': total_votes_cast,
            'quorum_required': quorum_required,
            'timestamp': current_time
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Proposal {proposal_id} {result}"
    
    def execute_proposal(self, proposal_id: int, executor: str) -> Tuple[bool, str]:
        """
        Execute a passed proposal after the timelock period.
        
        Args:
            proposal_id: ID of the proposal
            executor: Address executing the proposal
            
        Returns:
            Tuple of (success, message)
        """
        if proposal_id not in self.proposals:
            return False, "Proposal not found"
        
        proposal = self.proposals[proposal_id]
        
        if proposal.status != ProposalStatus.PASSED:
            return False, "Proposal has not passed"
        
        current_time = int(time.time())
        if current_time < proposal.execution_time:
            return False, f"Proposal cannot be executed until {proposal.execution_time}"
        
        # Execute based on proposal type
        execution_result = self._execute_proposal_logic(proposal)
        
        if execution_result[0]:
            proposal.status = ProposalStatus.EXECUTED
            
            # Record transaction
            transaction = {
                'type': 'proposal_executed',
                'proposal_id': proposal_id,
                'executor': executor,
                'execution_result': execution_result[1],
                'timestamp': current_time
            }
            self.blockchain_state.add_pending_transaction(transaction)
            
            return True, f"Proposal {proposal_id} executed successfully: {execution_result[1]}"
        else:
            return False, f"Proposal execution failed: {execution_result[1]}"
    
    def _execute_proposal_logic(self, proposal: Proposal) -> Tuple[bool, str]:
        """
        Execute the actual logic of a proposal based on its type.
        
        Args:
            proposal: The proposal to execute
            
        Returns:
            Tuple of (success, message)
        """
        if proposal.proposal_type == ProposalType.FUNDING_REQUEST:
            # In a real implementation, this would interact with the treasury contract
            return True, f"Funding of {proposal.requested_amount} HRV to {proposal.recipient_address}"
        
        elif proposal.proposal_type == ProposalType.TECHNICAL_UPGRADE:
            # In a real implementation, this would trigger system upgrades
            return True, "Technical upgrade implemented"
        
        elif proposal.proposal_type == ProposalType.GOVERNANCE_CHANGE:
            # In a real implementation, this would update governance parameters
            return True, "Governance parameters updated"
        
        elif proposal.proposal_type == ProposalType.TREASURY_MANAGEMENT:
            # In a real implementation, this would execute treasury operations
            return True, "Treasury management action executed"
        
        elif proposal.proposal_type == ProposalType.PARAMETER_CHANGE:
            # In a real implementation, this would update system parameters
            return True, "System parameters updated"
        
        else:
            return True, "General proposal executed"
    
    def get_proposal(self, proposal_id: int) -> Optional[Proposal]:
        """Get a proposal by ID."""
        return self.proposals.get(proposal_id)
    
    def get_proposal_votes(self, proposal_id: int) -> List[Vote]:
        """Get all votes for a proposal."""
        return self.votes.get(proposal_id, [])
    
    def get_proposals_by_status(self, status: ProposalStatus) -> List[Proposal]:
        """Get all proposals with a specific status."""
        return [p for p in self.proposals.values() if p.status == status]
    
    def get_proposals_by_proposer(self, proposer: str) -> List[Proposal]:
        """Get all proposals by a specific proposer."""
        return [p for p in self.proposals.values() if p.proposer == proposer]


# Example usage and testing
if __name__ == "__main__":
    from governance_token import GovernanceToken, MockBlockchainStateForDAO
    
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
    
    print("HARVEST DAO Proposal Manager Initialized")
    
    # Add Node Handlers
    print("\n--- Adding Node Handlers ---")
    for i in range(1, 4):
        success, msg = proposal_manager.add_node_handler(f"Node_Handler_{i}")
        print(f"Add Node Handler {i}: {msg}")
    
    # Setup some token holders
    print("\n--- Setting up Token Holders ---")
    governance_token.transfer("HARVEST_Foundation", "Alice", 10_000_000)
    governance_token.transfer("HARVEST_Foundation", "Bob", 5_000_000)
    governance_token.transfer("HARVEST_Foundation", "Charlie", 15_000_000)
    
    # Submit a proposal
    print("\n--- Submitting Proposal ---")
    success, msg, proposal_id = proposal_manager.submit_proposal(
        proposer="Alice",
        title="Increase Node Handler Rewards",
        description="Proposal to increase the reward rate for Node Handlers by 20% to incentivize more participation.",
        proposal_type=ProposalType.PARAMETER_CHANGE,
        execution_data={"parameter": "node_handler_reward_rate", "new_value": 1.2}
    )
    print(f"Submit proposal: {msg}")
    
    if success:
        # Node Handler reviews
        print("\n--- Node Handler Reviews ---")
        for i in range(1, 4):
            success, msg = proposal_manager.submit_node_handler_review(
                reviewer=f"Node_Handler_{i}",
                proposal_id=proposal_id,
                recommendation="approve",
                comments=f"Review from Node Handler {i}: Proposal looks good for network security."
            )
            print(f"Node Handler {i} review: {msg}")
        
        # Start voting
        print("\n--- Starting Voting ---")
        success, msg = proposal_manager.start_voting(proposal_id, "Node_Handler_1")
        print(f"Start voting: {msg}")
        
        if success:
            # Cast votes
            print("\n--- Casting Votes ---")
            success, msg = proposal_manager.cast_vote("Alice", proposal_id, "yes")
            print(f"Alice votes: {msg}")
            
            success, msg = proposal_manager.cast_vote("Bob", proposal_id, "yes")
            print(f"Bob votes: {msg}")
            
            success, msg = proposal_manager.cast_vote("Charlie", proposal_id, "no")
            print(f"Charlie votes: {msg}")
            
            # Get proposal details
            proposal = proposal_manager.get_proposal(proposal_id)
            print(f"\n--- Proposal {proposal_id} Status ---")
            print(f"Title: {proposal.title}")
            print(f"Status: {proposal.status.value}")
            print(f"Yes votes: {proposal.yes_votes:,}")
            print(f"No votes: {proposal.no_votes:,}")
            print(f"Abstain votes: {proposal.abstain_votes:,}")
            
            # Simulate time passing and finalize voting
            proposal.voting_end = int(time.time()) - 1  # Make voting period end
            
            print("\n--- Finalizing Voting ---")
            success, msg = proposal_manager.finalize_voting(proposal_id)
            print(f"Finalize voting: {msg}")
            
            # Execute proposal if passed
            if proposal.status == ProposalStatus.PASSED:
                proposal.execution_time = int(time.time()) - 1  # Make execution time pass
                
                print("\n--- Executing Proposal ---")
                success, msg = proposal_manager.execute_proposal(proposal_id, "Node_Handler_1")
                print(f"Execute proposal: {msg}")
    
    print(f"\nTotal pending transactions: {len(mock_chain.pending_transactions)}")

