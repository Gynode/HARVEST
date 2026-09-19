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

/// How a session's votes are weighted.
///
/// Two deliberate omissions, both recorded in `AGENTS.md` §3.2:
///
///   - **`RankedChoice`** is in the Python's `VotingType`, but
///     `_calculate_ranked_choice_result` just compares `yes_votes > no_votes` —
///     simple majority under another name, ignoring `ranked_choices` entirely.
///     Porting a stub would import a mechanism that does not exist, so it is
///     left out until it is designed.
///   - **`delegation_allowed`** is not a per-session switch either: delegation is
///     settled as all-or-nothing at the governance-token level
///     (`onchain_design.md` §3), not something a proposal turns on or off.
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
/// cannot change a vote. Keyed by the holder's credential hash.
///
/// **It deliberately does not carry the quorum denominator.** `voting_supply` is
/// a *governance-set* parameter (option D2), so it belongs in the governance
/// config datum and must be read from there by whatever validates a vote. If it
/// sat here it would be a field of the proposal — and the proposal is built by
/// its proposer, who could then set the denominator to whatever made their own
/// quorum easiest to reach. The denominator is passed to `voting.is_passed`
/// separately for exactly this reason: it is not a property of the snapshot.
pub type Snapshot {
  powers: Dict<ByteArray, VotingPower>,
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
  ///
  /// **This grows without bound, and that is a known limit of the design.** A
  /// transaction is capped at roughly 16KB, so a datum holding every voter's
  /// credential stops being spendable once the electorate is large enough —
  /// which would freeze the proposal with its voting window still open. It is
  /// acceptable while the electorate is the Node Handlers and a small holder
  /// set, and it is a second reason the Merkle-root migration in
  /// `onchain_design.md` §1 exists: the snapshot is one growing list, this is
  /// another, and both have to move together.
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
