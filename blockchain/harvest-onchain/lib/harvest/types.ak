//// Shared types for the HARVEST on-chain code.
////
//// Ported from the Python behavioural specification in
//// `blockchain/harvest_dao_package/harvest_dao/contracts/`, following the
//// decisions in `onchain_design.md`. The rules are ported, not the code — the
//// Python's float arithmetic, live-balance reads and ignored delegation amounts
//// are all deliberately absent.

use aiken/collection/dict.{Dict}

/// The kind of proposal, which selects its default voting parameters.
///
/// `parameter_change` is the one type that votes quadratically by default,
/// matching `voting_mechanism.py`'s `default_parameters`.
pub type ProposalType {
  TechnicalUpgrade
  FundingRequest
  GovernanceChange
  TreasuryManagement
  ParameterChange
  General
}

/// Where a proposal sits in its lifecycle.
///
/// `proposal_manager.py` is the specification for these transitions. `Draft` is
/// not currently reachable on-chain — proposals are created `Submitted` — but it
/// is kept so the on-chain states and the Python ones line up one for one.
pub type ProposalStatus {
  Draft
  Submitted
  UnderReview
  Voting
  Passed
  Rejected
  Executed
  Cancelled
}

/// How the votes cast in a session are weighted.
pub type VoteChoice {
  Yes
  No
  Abstain
}

/// How a session's votes are weighted, and what it takes to pass.
///
/// Note the absence of `delegation_allowed`: delegation is settled as
/// all-or-nothing at the governance-token level (see `onchain_design.md` §3), so
/// it is not a per-session switch.
pub type VotingType {
  SimpleMajority
  Supermajority
  Quadratic
  Weighted
}

/// A session's parameters.
///
/// Thresholds are integer percentages, never floats — the Python used `0.05` and
/// `0.51`, and carrying those as `5` and `51` is what keeps the on-chain
/// comparison exact. `voting_duration_ms` is milliseconds because that is the
/// unit of a Cardano validity interval, which is what enforces the window.
pub type VotingParameters {
  voting_type: VotingType,
  quorum_percent: Int,
  approval_percent: Int,
  voting_duration_ms: Int,
  quadratic_scaling_percent: Int,
  max_vote_weight: Option<Int>,
}

/// A holder's weight in a governance session, and where it came from.
///
/// `own` and `delegated_in` are recorded separately so the vote validator can
/// check the delegation registry against them; `own` is zero for an address
/// that has delegated its position away.
pub type VotingPower {
  own: Int,
  delegated_in: Int,
}

/// The frozen power set for one proposal, committed into its datum.
///
/// This is the source of truth settled in `onchain_design.md` §3 (option 3b):
/// power is fixed when the proposal is created, so transferring HRV afterwards
/// cannot change a vote. Keyed by the holder's credential hash, and paired with
/// `voting_supply` — the total these entries were built against, which is what
/// quorum divides by (option D2) instead of the minted 1,000,000,000.
pub type Snapshot {
  powers: Dict<ByteArray, VotingPower>,
  voting_supply: Int,
}

/// The running tally of a session.
pub type Tally {
  yes: Int,
  no: Int,
  abstain: Int,
}

/// A proposal, as it lives at the governance script address.
///
/// The tally is here rather than derived from a vote log because each vote
/// spends and recreates this datum: the tally *is* the accumulated state, and
/// there is nowhere else to keep it. `title` and `description` are deliberately
/// absent — they are off-chain (see `onchain_design.md` §1), with only the hash
/// committed so the metadata cannot be swapped after the fact.
pub type ProposalDatum {
  id: Int,
  proposer: ByteArray,
  proposal_type: ProposalType,
  status: ProposalStatus,
  metadata_hash: ByteArray,
  parameters: VotingParameters,
  snapshot: Snapshot,
  tally: Tally,
  /// Who has already voted, so no address votes twice.
  voters: List<ByteArray>,
  review_approvals: Int,
  review_rejections: Int,
  voting_start_ms: Option<Int>,
  voting_end_ms: Option<Int>,
  execution_time_ms: Option<Int>,
  /// A `funding_request`'s amount and recipient. `None` for other types.
  funding: Option<Funding>,
}

/// The payload of a funding request, checked by the treasury validator.
pub type Funding {
  amount: Int,
  recipient: ByteArray,
}
