"""
HARVEST DAO Voting Mechanism Contract

This contract implements advanced voting mechanisms for the HARVEST DAO,
including quadratic voting, delegation, and various voting strategies.
"""

import time
import math
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from enum import Enum


class VotingType(Enum):
    """Types of voting mechanisms available."""
    SIMPLE_MAJORITY = "simple_majority"
    SUPERMAJORITY = "supermajority"
    QUADRATIC = "quadratic"
    WEIGHTED = "weighted"
    RANKED_CHOICE = "ranked_choice"


class VoteChoice(Enum):
    """Available vote choices."""
    YES = "yes"
    NO = "no"
    ABSTAIN = "abstain"


@dataclass
class VotingParameters:
    """Parameters for a voting session."""
    voting_type: VotingType
    quorum_threshold: float  # Percentage of total supply
    approval_threshold: float  # Percentage of votes cast
    voting_duration: int  # Duration in seconds
    delegation_allowed: bool = True
    quadratic_scaling: float = 1.0  # Scaling factor for quadratic voting
    max_vote_weight: Optional[int] = None  # Maximum weight per voter


@dataclass
class VoteRecord:
    """Detailed record of a vote."""
    voter: str
    proposal_id: int
    vote_choice: VoteChoice
    raw_voting_power: int
    effective_voting_power: float
    delegation_chain: List[str]
    timestamp: int
    vote_weight: float = 1.0
    
    # For ranked choice voting
    ranked_choices: Optional[List[str]] = None


@dataclass
class VotingSession:
    """Represents an active voting session."""
    proposal_id: int
    voting_parameters: VotingParameters
    start_time: int
    end_time: int
    snapshot_block: int
    
    # Vote tallies
    yes_votes: float = 0.0
    no_votes: float = 0.0
    abstain_votes: float = 0.0
    total_votes_cast: float = 0.0
    unique_voters: int = 0
    
    # Voting records
    votes: List[VoteRecord] = field(default_factory=list)
    voter_participation: Dict[str, bool] = field(default_factory=dict)
    
    # Results
    is_finalized: bool = False
    result: Optional[str] = None
    quorum_met: bool = False
    approval_met: bool = False


class VotingMechanism:
    """
    HARVEST DAO Voting Mechanism Contract
    
    This contract implements various voting mechanisms:
    - Simple majority voting
    - Supermajority voting
    - Quadratic voting
    - Weighted voting
    - Ranked choice voting
    - Delegation support
    """
    
    def __init__(self, governance_token, proposal_manager, blockchain_state):
        """
        Initialize the voting mechanism.
        
        Args:
            governance_token: Reference to the governance token contract
            proposal_manager: Reference to the proposal manager contract
            blockchain_state: Reference to blockchain state for transaction recording
        """
        self.governance_token = governance_token
        self.proposal_manager = proposal_manager
        self.blockchain_state = blockchain_state
        
        # Active voting sessions
        self.voting_sessions: Dict[int, VotingSession] = {}
        
        # Default voting parameters for different proposal types
        self.default_parameters = {
            "technical_upgrade": VotingParameters(
                voting_type=VotingType.SUPERMAJORITY,
                quorum_threshold=0.10,  # 10% quorum
                approval_threshold=0.67,  # 67% approval
                voting_duration=7 * 24 * 3600,  # 7 days
                delegation_allowed=True
            ),
            "funding_request": VotingParameters(
                voting_type=VotingType.SIMPLE_MAJORITY,
                quorum_threshold=0.05,  # 5% quorum
                approval_threshold=0.51,  # 51% approval
                voting_duration=5 * 24 * 3600,  # 5 days
                delegation_allowed=True
            ),
            "governance_change": VotingParameters(
                voting_type=VotingType.SUPERMAJORITY,
                quorum_threshold=0.15,  # 15% quorum
                approval_threshold=0.75,  # 75% approval
                voting_duration=10 * 24 * 3600,  # 10 days
                delegation_allowed=True
            ),
            "parameter_change": VotingParameters(
                voting_type=VotingType.QUADRATIC,
                quorum_threshold=0.08,  # 8% quorum
                approval_threshold=0.60,  # 60% approval
                voting_duration=5 * 24 * 3600,  # 5 days
                delegation_allowed=True,
                quadratic_scaling=0.5
            ),
            "general": VotingParameters(
                voting_type=VotingType.SIMPLE_MAJORITY,
                quorum_threshold=0.03,  # 3% quorum
                approval_threshold=0.51,  # 51% approval
                voting_duration=3 * 24 * 3600,  # 3 days
                delegation_allowed=True
            )
        }
    
    def start_voting_session(
        self,
        proposal_id: int,
        custom_parameters: Optional[VotingParameters] = None
    ) -> Tuple[bool, str]:
        """
        Start a voting session for a proposal.
        
        Args:
            proposal_id: ID of the proposal
            custom_parameters: Custom voting parameters (optional)
            
        Returns:
            Tuple of (success, message)
        """
        if proposal_id in self.voting_sessions:
            return False, "Voting session already exists for this proposal"
        
        # Get proposal details
        proposal = self.proposal_manager.get_proposal(proposal_id)
        if not proposal:
            return False, "Proposal not found"
        
        # Determine voting parameters
        if custom_parameters:
            parameters = custom_parameters
        else:
            proposal_type = proposal.proposal_type.value
            parameters = self.default_parameters.get(proposal_type, self.default_parameters["general"])
        
        # Create voting session
        current_time = int(time.time())
        snapshot_block = self.governance_token.current_block + 1
        
        # Create voting power snapshot
        self.governance_token.create_voting_snapshot(snapshot_block)
        
        session = VotingSession(
            proposal_id=proposal_id,
            voting_parameters=parameters,
            start_time=current_time,
            end_time=current_time + parameters.voting_duration,
            snapshot_block=snapshot_block
        )
        
        self.voting_sessions[proposal_id] = session
        
        # Record transaction
        transaction = {
            'type': 'voting_session_started',
            'proposal_id': proposal_id,
            'voting_type': parameters.voting_type.value,
            'start_time': current_time,
            'end_time': session.end_time,
            'snapshot_block': snapshot_block,
            'timestamp': current_time
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Voting session started for proposal {proposal_id}"
    
    def cast_vote(
        self,
        voter: str,
        proposal_id: int,
        vote_choice: VoteChoice,
        ranked_choices: Optional[List[str]] = None
    ) -> Tuple[bool, str]:
        """
        Cast a vote in a voting session.
        
        Args:
            voter: Address of the voter
            proposal_id: ID of the proposal
            vote_choice: Vote choice (yes/no/abstain)
            ranked_choices: Ranked choices for ranked choice voting
            
        Returns:
            Tuple of (success, message)
        """
        if proposal_id not in self.voting_sessions:
            return False, "No active voting session for this proposal"
        
        session = self.voting_sessions[proposal_id]
        
        # Check voting period
        current_time = int(time.time())
        if current_time < session.start_time or current_time > session.end_time:
            return False, "Voting period is not active"
        
        # Check if voter already voted
        if voter in session.voter_participation:
            return False, "Voter has already participated in this voting session"
        
        # Get voting power at snapshot
        raw_voting_power = self.governance_token.get_voting_power(voter, session.snapshot_block)
        if raw_voting_power == 0:
            return False, "Voter has no voting power"
        
        # Calculate effective voting power based on voting type
        effective_voting_power = self._calculate_effective_voting_power(
            raw_voting_power,
            session.voting_parameters
        )
        
        # Get delegation chain
        delegation_chain = self._get_delegation_chain(voter)
        
        # Create vote record
        vote_record = VoteRecord(
            voter=voter,
            proposal_id=proposal_id,
            vote_choice=vote_choice,
            raw_voting_power=raw_voting_power,
            effective_voting_power=effective_voting_power,
            delegation_chain=delegation_chain,
            timestamp=current_time,
            ranked_choices=ranked_choices
        )
        
        # Add vote to session
        session.votes.append(vote_record)
        session.voter_participation[voter] = True
        session.unique_voters += 1
        
        # Update vote tallies
        if vote_choice == VoteChoice.YES:
            session.yes_votes += effective_voting_power
        elif vote_choice == VoteChoice.NO:
            session.no_votes += effective_voting_power
        elif vote_choice == VoteChoice.ABSTAIN:
            session.abstain_votes += effective_voting_power
        
        session.total_votes_cast += effective_voting_power
        
        # Record transaction
        transaction = {
            'type': 'vote_cast',
            'proposal_id': proposal_id,
            'voter': voter,
            'vote_choice': vote_choice.value,
            'raw_voting_power': raw_voting_power,
            'effective_voting_power': effective_voting_power,
            'voting_type': session.voting_parameters.voting_type.value,
            'timestamp': current_time
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Vote cast successfully with {effective_voting_power:.2f} effective voting power"
    
    def finalize_voting_session(self, proposal_id: int) -> Tuple[bool, str]:
        """
        Finalize a voting session and determine the result.
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Tuple of (success, message)
        """
        if proposal_id not in self.voting_sessions:
            return False, "No voting session found for this proposal"
        
        session = self.voting_sessions[proposal_id]
        
        if session.is_finalized:
            return False, "Voting session is already finalized"
        
        current_time = int(time.time())
        if current_time <= session.end_time:
            return False, "Voting period has not ended yet"
        
        # Calculate quorum
        total_supply = self.governance_token.total_supply
        quorum_required = total_supply * session.voting_parameters.quorum_threshold
        session.quorum_met = session.total_votes_cast >= quorum_required
        
        # Calculate approval
        if session.voting_parameters.voting_type == VotingType.RANKED_CHOICE:
            session.result, session.approval_met = self._calculate_ranked_choice_result(session)
        else:
            decisive_votes = session.yes_votes + session.no_votes
            if decisive_votes > 0:
                approval_ratio = session.yes_votes / decisive_votes
                session.approval_met = approval_ratio >= session.voting_parameters.approval_threshold
                session.result = "passed" if session.quorum_met and session.approval_met else "rejected"
            else:
                session.approval_met = False
                session.result = "rejected"
        
        session.is_finalized = True
        
        # Record transaction
        transaction = {
            'type': 'voting_session_finalized',
            'proposal_id': proposal_id,
            'result': session.result,
            'yes_votes': session.yes_votes,
            'no_votes': session.no_votes,
            'abstain_votes': session.abstain_votes,
            'total_votes_cast': session.total_votes_cast,
            'unique_voters': session.unique_voters,
            'quorum_met': session.quorum_met,
            'approval_met': session.approval_met,
            'timestamp': current_time
        }
        self.blockchain_state.add_pending_transaction(transaction)
        
        return True, f"Voting session finalized. Result: {session.result}"
    
    def _calculate_effective_voting_power(
        self,
        raw_voting_power: int,
        parameters: VotingParameters
    ) -> float:
        """
        Calculate effective voting power based on voting type.
        
        Args:
            raw_voting_power: Raw voting power from token holdings
            parameters: Voting parameters
            
        Returns:
            Effective voting power
        """
        if parameters.voting_type == VotingType.QUADRATIC:
            # Quadratic voting: effective power = sqrt(raw_power) * scaling
            effective_power = math.sqrt(raw_voting_power) * parameters.quadratic_scaling
        elif parameters.voting_type == VotingType.WEIGHTED:
            # Weighted voting with maximum cap
            if parameters.max_vote_weight:
                effective_power = min(raw_voting_power, parameters.max_vote_weight)
            else:
                effective_power = raw_voting_power
        else:
            # Simple majority, supermajority: 1:1 ratio
            effective_power = float(raw_voting_power)
        
        return effective_power
    
    def _get_delegation_chain(self, voter: str) -> List[str]:
        """
        Get the delegation chain for a voter.
        
        Args:
            voter: Address of the voter
            
        Returns:
            List of addresses in the delegation chain
        """
        chain = [voter]
        current = voter
        
        # Follow delegation chain (prevent infinite loops)
        max_depth = 10
        depth = 0
        
        while depth < max_depth:
            delegation_info = self.governance_token.get_delegation_info(current)
            delegated_to = delegation_info.get('delegated_to')
            
            if not delegated_to or delegated_to in chain:
                break
            
            chain.append(delegated_to)
            current = delegated_to
            depth += 1
        
        return chain
    
    def _calculate_ranked_choice_result(self, session: VotingSession) -> Tuple[str, bool]:
        """
        Calculate the result for ranked choice voting.
        
        Args:
            session: Voting session
            
        Returns:
            Tuple of (result, approval_met)
        """
        # Simplified ranked choice implementation
        # In a real implementation, this would be more sophisticated
        
        if session.yes_votes > session.no_votes:
            return "passed", True
        else:
            return "rejected", False
    
    def get_voting_session(self, proposal_id: int) -> Optional[VotingSession]:
        """Get a voting session by proposal ID."""
        return self.voting_sessions.get(proposal_id)
    
    def get_voter_participation_rate(self, proposal_id: int) -> float:
        """
        Calculate voter participation rate for a proposal.
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Participation rate as a percentage
        """
        if proposal_id not in self.voting_sessions:
            return 0.0
        
        session = self.voting_sessions[proposal_id]
        total_eligible_voters = len(self.governance_token.voting_power_snapshots.get(session.snapshot_block, {}))
        
        if total_eligible_voters == 0:
            return 0.0
        
        return (session.unique_voters / total_eligible_voters) * 100
    
    def get_voting_analytics(self, proposal_id: int) -> Dict:
        """
        Get comprehensive voting analytics for a proposal.
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Dictionary containing voting analytics
        """
        if proposal_id not in self.voting_sessions:
            return {}
        
        session = self.voting_sessions[proposal_id]
        
        # Vote distribution
        total_votes = session.yes_votes + session.no_votes + session.abstain_votes
        vote_distribution = {
            'yes_percentage': (session.yes_votes / total_votes * 100) if total_votes > 0 else 0,
            'no_percentage': (session.no_votes / total_votes * 100) if total_votes > 0 else 0,
            'abstain_percentage': (session.abstain_votes / total_votes * 100) if total_votes > 0 else 0
        }
        
        # Voting power analysis
        voting_powers = [vote.raw_voting_power for vote in session.votes]
        avg_voting_power = sum(voting_powers) / len(voting_powers) if voting_powers else 0
        max_voting_power = max(voting_powers) if voting_powers else 0
        min_voting_power = min(voting_powers) if voting_powers else 0
        
        # Delegation analysis
        delegated_votes = sum(1 for vote in session.votes if len(vote.delegation_chain) > 1)
        delegation_rate = (delegated_votes / session.unique_voters * 100) if session.unique_voters > 0 else 0
        
        # Time analysis
        vote_times = [vote.timestamp for vote in session.votes]
        if vote_times:
            earliest_vote = min(vote_times)
            latest_vote = max(vote_times)
            voting_duration_used = latest_vote - earliest_vote
        else:
            voting_duration_used = 0
        
        return {
            'proposal_id': proposal_id,
            'voting_type': session.voting_parameters.voting_type.value,
            'is_finalized': session.is_finalized,
            'result': session.result,
            'quorum_met': session.quorum_met,
            'approval_met': session.approval_met,
            'participation_rate': self.get_voter_participation_rate(proposal_id),
            'vote_distribution': vote_distribution,
            'voting_power_analysis': {
                'average': avg_voting_power,
                'maximum': max_voting_power,
                'minimum': min_voting_power,
                'total_cast': session.total_votes_cast
            },
            'delegation_analysis': {
                'delegated_votes': delegated_votes,
                'delegation_rate': delegation_rate
            },
            'time_analysis': {
                'start_time': session.start_time,
                'end_time': session.end_time,
                'duration_seconds': session.voting_parameters.voting_duration,
                'duration_used_seconds': voting_duration_used
            },
            'vote_counts': {
                'yes': session.yes_votes,
                'no': session.no_votes,
                'abstain': session.abstain_votes,
                'total': total_votes,
                'unique_voters': session.unique_voters
            }
        }


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
    
    # Initialize voting mechanism
    voting_mechanism = VotingMechanism(governance_token, proposal_manager, mock_chain)
    
    print("HARVEST DAO Voting Mechanism Initialized")
    
    # Setup test scenario
    print("\n--- Setting up Test Scenario ---")
    
    # Transfer tokens to voters
    governance_token.transfer("HARVEST_Foundation", "Alice", 50_000_000)
    governance_token.transfer("HARVEST_Foundation", "Bob", 30_000_000)
    governance_token.transfer("HARVEST_Foundation", "Charlie", 20_000_000)
    governance_token.transfer("HARVEST_Foundation", "Dave", 10_000_000)
    
    # Add Node Handlers
    for i in range(1, 4):
        proposal_manager.add_node_handler(f"Node_Handler_{i}")
    
    # Submit a test proposal
    success, msg, proposal_id = proposal_manager.submit_proposal(
        proposer="Alice",
        title="Implement Quadratic Voting for Parameter Changes",
        description="Proposal to implement quadratic voting mechanism for all parameter change proposals to reduce whale influence.",
        proposal_type=ProposalType.GOVERNANCE_CHANGE
    )
    print(f"Submit proposal: {msg}")
    
    if success:
        # Add Node Handler reviews
        for i in range(1, 4):
            proposal_manager.submit_node_handler_review(
                reviewer=f"Node_Handler_{i}",
                proposal_id=proposal_id,
                recommendation="approve",
                comments=f"Approved by Node Handler {i}"
            )
        
        # Start voting session with custom parameters
        print("\n--- Starting Voting Session ---")
        custom_params = VotingParameters(
            voting_type=VotingType.QUADRATIC,
            quorum_threshold=0.08,
            approval_threshold=0.60,
            voting_duration=5 * 24 * 3600,
            delegation_allowed=True,
            quadratic_scaling=1.0
        )
        
        success, msg = voting_mechanism.start_voting_session(proposal_id, custom_params)
        print(f"Start voting: {msg}")
        
        if success:
            # Cast votes
            print("\n--- Casting Votes ---")
            
            # Alice votes yes (50M tokens -> sqrt(50M) = ~7071 effective power)
            success, msg = voting_mechanism.cast_vote("Alice", proposal_id, VoteChoice.YES)
            print(f"Alice votes: {msg}")
            
            # Bob votes yes (30M tokens -> sqrt(30M) = ~5477 effective power)
            success, msg = voting_mechanism.cast_vote("Bob", proposal_id, VoteChoice.YES)
            print(f"Bob votes: {msg}")
            
            # Charlie votes no (20M tokens -> sqrt(20M) = ~4472 effective power)
            success, msg = voting_mechanism.cast_vote("Charlie", proposal_id, VoteChoice.NO)
            print(f"Charlie votes: {msg}")
            
            # Dave abstains (10M tokens -> sqrt(10M) = ~3162 effective power)
            success, msg = voting_mechanism.cast_vote("Dave", proposal_id, VoteChoice.ABSTAIN)
            print(f"Dave votes: {msg}")
            
            # Get voting session details
            session = voting_mechanism.get_voting_session(proposal_id)
            print(f"\n--- Voting Session Status ---")
            print(f"Yes votes: {session.yes_votes:.2f}")
            print(f"No votes: {session.no_votes:.2f}")
            print(f"Abstain votes: {session.abstain_votes:.2f}")
            print(f"Total votes cast: {session.total_votes_cast:.2f}")
            print(f"Unique voters: {session.unique_voters}")
            
            # Simulate end of voting period
            session.end_time = int(time.time()) - 1
            
            # Finalize voting
            print("\n--- Finalizing Voting ---")
            success, msg = voting_mechanism.finalize_voting_session(proposal_id)
            print(f"Finalize voting: {msg}")
            
            # Get comprehensive analytics
            print("\n--- Voting Analytics ---")
            analytics = voting_mechanism.get_voting_analytics(proposal_id)
            
            print(f"Result: {analytics['result']}")
            print(f"Quorum met: {analytics['quorum_met']}")
            print(f"Approval met: {analytics['approval_met']}")
            print(f"Participation rate: {analytics['participation_rate']:.1f}%")
            
            print("\nVote Distribution:")
            dist = analytics['vote_distribution']
            print(f"  Yes: {dist['yes_percentage']:.1f}%")
            print(f"  No: {dist['no_percentage']:.1f}%")
            print(f"  Abstain: {dist['abstain_percentage']:.1f}%")
            
            print("\nVoting Power Analysis:")
            power = analytics['voting_power_analysis']
            print(f"  Average: {power['average']:,.0f}")
            print(f"  Maximum: {power['maximum']:,.0f}")
            print(f"  Minimum: {power['minimum']:,.0f}")
            print(f"  Total Cast: {power['total_cast']:,.2f}")
    
    print(f"\nTotal blockchain transactions: {len(mock_chain.pending_transactions)}")

