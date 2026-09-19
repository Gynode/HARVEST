//// Voting rules for the HARVEST DAO.
////
//// Ported from `voting_mechanism.py`, which `onchain_design.md` §B settles as
//// the specification for vote parameters and weighting. Two deliberate
//// departures from it:
////
////  1. **No floats.** The Python used `math.sqrt(raw) * 0.5` and
////     `ratio >= 0.51`. Floats do not exist in Plutus, so percentages are
////     integers and approval is compared by cross-multiplication, which is
////     exact rather than merely close.
////  2. **Quorum divides by `voting_supply`, not `total_supply`.** See
////     `onchain_design.md` §D — the minted 1,000,000,000 is the one number the
////     two lost wallets make unreliable, so no threshold is computed from it.

use aiken/math
use harvest/types

/// The default parameters for a proposal type.
///
/// Values match `VotingMechanism.default_parameters` in `voting_mechanism.py`.
/// Durations are converted from the Python's seconds to milliseconds, which is
/// the unit of a Cardano validity interval.
pub fn default_parameters(
  proposal_type: types.ProposalType,
) -> types.VotingParameters {
  when proposal_type is {
    types.TechnicalUpgrade ->
      types.VotingParameters {
        voting_type: types.Supermajority,
        quorum_percent: 10,
        approval_percent: 67,
        voting_duration_ms: 7 * 24 * 3600 * 1000,
        quadratic_scaling_percent: 100,
        max_vote_weight: None,
      }
    types.FundingRequest ->
      types.VotingParameters {
        voting_type: types.SimpleMajority,
        quorum_percent: 5,
        approval_percent: 51,
        voting_duration_ms: 5 * 24 * 3600 * 1000,
        quadratic_scaling_percent: 100,
        max_vote_weight: None,
      }
    types.GovernanceChange ->
      types.VotingParameters {
        voting_type: types.Supermajority,
        quorum_percent: 15,
        approval_percent: 75,
        voting_duration_ms: 10 * 24 * 3600 * 1000,
        quadratic_scaling_percent: 100,
        max_vote_weight: None,
      }
    types.ParameterChange ->
      types.VotingParameters {
        voting_type: types.Quadratic,
        quorum_percent: 8,
        approval_percent: 60,
        voting_duration_ms: 5 * 24 * 3600 * 1000,
        quadratic_scaling_percent: 50,
        max_vote_weight: None,
      }
    // `treasury_management` is a valid `ProposalType` in `proposal_manager.py`,
    // but `VotingMechanism.default_parameters` has no entry for it — so the
    // Python's `.get(proposal_type, default_parameters["general"])` falls back to
    // `General`. These are the General values, not the funding-request ones.
    types.TreasuryManagement ->
      types.VotingParameters {
        voting_type: types.SimpleMajority,
        quorum_percent: 3,
        approval_percent: 51,
        voting_duration_ms: 3 * 24 * 3600 * 1000,
        quadratic_scaling_percent: 100,
        max_vote_weight: None,
      }
    types.General ->
      types.VotingParameters {
        voting_type: types.SimpleMajority,
        quorum_percent: 3,
        approval_percent: 51,
        voting_duration_ms: 3 * 24 * 3600 * 1000,
        quadratic_scaling_percent: 100,
        max_vote_weight: None,
      }
  }
}

/// Weight a raw voting power according to the session's voting type.
///
/// Quadratic weighting is the integer square root scaled by a percentage —
/// `scaling = 100` reproduces the Python's `1.0`, `50` its `0.5`. The square
/// root is floored, which slightly favours small holders relative to exact
/// arithmetic; that is the standard quadratic-voting rounding and it is noted
/// here because it is a real, if tiny, governance effect.
pub fn effective_voting_power(
  raw: Int,
  parameters: types.VotingParameters,
) -> Int {
  if raw <= 0 {
    0
  } else {
    when parameters.voting_type is {
      types.Quadratic ->
        // A non-positive scaling yields zero weight, never a negative one: a
        // negative weight would *decrement* a tally, and a proposal that can be
        // voted backwards is worse than one that cannot be voted at all.
        if parameters.quadratic_scaling_percent <= 0 {
          0
        } else {
          when math.sqrt(raw) is {
            Some(root) -> root * parameters.quadratic_scaling_percent / 100
            None -> 0
          }
        }
      types.Weighted ->
        when parameters.max_vote_weight is {
          Some(cap) ->
            // Same reasoning as the scaling above: a non-positive cap would
            // otherwise become the returned weight.
            if cap <= 0 {
              0
            } else if raw > cap {
              cap
            } else {
              raw
            }
          None -> raw
        }
      _ -> raw
    }
  }
}

/// The weight a proposal needs to reach quorum, given a voting supply.
///
/// Rounded **up**, so that truncation can never quietly lower the bar.
///
/// A non-positive supply or percentage yields 0, which is an *arithmetic*
/// answer, not a policy one — `0` here would be trivially satisfied by any
/// tally. **`quorum_met` is what refuses that case**, and it is the only
/// function callers should use to decide whether quorum is reached. Calling
/// this directly and comparing is a way to introduce a fail-open bug.
pub fn quorum_required(voting_supply: Int, quorum_percent: Int) -> Int {
  if voting_supply <= 0 || quorum_percent <= 0 {
    0
  } else {
    ( voting_supply * quorum_percent + 99 ) / 100
  }
}

/// Whether enough weight was cast to reach quorum.
///
/// Abstentions count toward quorum, matching `finalize_voting_session` in
/// `voting_mechanism.py`, which adds abstain into `total_votes_cast`. They do
/// not count toward approval — see `approval_met`.
pub fn quorum_met(
  total_cast: Int,
  voting_supply: Int,
  quorum_percent: Int,
) -> Bool {
  // A degenerate configuration fails closed. Without this guard, a zero
  // percentage or a zero supply makes `quorum_required` return 0 and every
  // tally — including an empty one — would satisfy quorum.
  if voting_supply <= 0 || quorum_percent <= 0 {
    False
  } else {
    total_cast >= quorum_required(voting_supply, quorum_percent)
  }
}

/// Whether the decisive votes approve, abstentions excluded.
///
/// `yes / (yes + no) >= approval_percent / 100`, rearranged to
/// `yes * 100 >= approval_percent * (yes + no)` so the comparison is exact.
/// No decisive votes means no approval, as in the Python.
///
/// A non-positive `approval_percent` also fails closed, and that guard is
/// load-bearing rather than defensive: with a zero threshold the inequality
/// becomes `yes * 100 >= 0`, which holds even when `yes` is zero — so a
/// proposal with no support at all, and any number of votes against it, would
/// be recorded as approved.
pub fn approval_met(yes: Int, no: Int, approval_percent: Int) -> Bool {
  let decisive = yes + no
  if decisive <= 0 || approval_percent <= 0 {
    False
  } else {
    yes * 100 >= approval_percent * decisive
  }
}

/// Add a weighted vote to a tally.
pub fn add_vote(
  tally: types.Tally,
  choice: types.VoteChoice,
  weight: Int,
) -> types.Tally {
  when choice is {
    types.Yes -> types.Tally { ..tally, yes: tally.yes + weight }
    types.No -> types.Tally { ..tally, no: tally.no + weight }
    types.Abstain -> types.Tally { ..tally, abstain: tally.abstain + weight }
  }
}

/// The total weight cast, including abstentions.
pub fn total_cast(tally: types.Tally) -> Int {
  tally.yes + tally.no + tally.abstain
}

/// Whether a session's tally passes — quorum and approval together.
///
/// Both must hold. `voting_mechanism.py` computes them the same way and then
/// requires both; the one thing it does that this does not is decide the result
/// from the *current* time, which on-chain belongs to the validity interval
/// rather than to an arithmetic check.
pub fn is_passed(
  tally: types.Tally,
  parameters: types.VotingParameters,
  voting_supply: Int,
) -> Bool {
  quorum_met(total_cast(tally), voting_supply, parameters.quorum_percent) && approval_met(
    tally.yes,
    tally.no,
    parameters.approval_percent,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

/// A simple-majority, linear session, for tests that are not about weighting.
fn linear_params() -> types.VotingParameters {
  types.VotingParameters {
    voting_type: types.SimpleMajority,
    quorum_percent: 5,
    approval_percent: 51,
    voting_duration_ms: 5 * 24 * 3600 * 1000,
    quadratic_scaling_percent: 100,
    max_vote_weight: None,
  }
}

fn quadratic_params(scaling_percent: Int) -> types.VotingParameters {
  types.VotingParameters {
    voting_type: types.Quadratic,
    quorum_percent: 8,
    approval_percent: 60,
    voting_duration_ms: 5 * 24 * 3600 * 1000,
    quadratic_scaling_percent: scaling_percent,
    max_vote_weight: None,
  }
}

test linear_weighting_is_identity() {
  effective_voting_power(1_234_567, linear_params()) == 1_234_567
}

test quadratic_weighting_is_the_square_root() {
  // sqrt(10_000) = 100, and scaling 100 means unscaled.
  effective_voting_power(10_000, quadratic_params(100)) == 100
}

test quadratic_weighting_floors_the_root() {
  // sqrt(10) = 3.16…, so the integer root is 3: rounding favours the voter.
  effective_voting_power(10, quadratic_params(100)) == 3
}

test quadratic_weighting_scales_by_percentage() {
  // The Python's 0.5 factor, as 50 percent.
  effective_voting_power(10_000, quadratic_params(50)) == 50
}

test zero_and_negative_power_weight_to_zero() {
  effective_voting_power(0, quadratic_params(100)) == 0 && effective_voting_power(
    -5,
    linear_params(),
  ) == 0
}

test weighted_weighting_respects_the_cap() {
  let capped = types.VotingParameters {
    voting_type: types.Weighted,
    quorum_percent: 5,
    approval_percent: 51,
    voting_duration_ms: 0,
    quadratic_scaling_percent: 100,
    max_vote_weight: Some(1_000),
  }
  effective_voting_power(500, capped) == 500 && effective_voting_power(
    5_000,
    capped,
  ) == 1_000
}

test quorum_rounds_up_so_truncation_cannot_lower_it() {
  // 5% of 1,000,000,001 is 50,000,000.05 — rounding down would lose the .05 and
  // let a tally one short of the true bar through.
  quorum_required(1_000_000_001, 5) == 50_000_001 && quorum_required(
    1_000_000_000,
    5,
  ) == 50_000_000
}

test quorum_of_nothing_is_zero_not_negative() {
  quorum_required(0, 5) == 0 && quorum_required(1_000, 0) == 0
}

test approval_at_the_threshold_passes() {
  // 51 of 100 is exactly 51 percent, and the Python used `>=`.
  approval_met(51, 49, 51) == True
}

test approval_one_vote_short_fails() {
  approval_met(50, 50, 51) == False
}

test abstentions_do_not_count_toward_approval() {
  // 100 yes, 0 no, 10,000 abstain: approval is unanimous among decisive votes,
  // however many abstained.
  approval_met(100, 0, 51) == True
}

test approval_needs_some_decisive_vote() {
  approval_met(0, 0, 51) == False
}

test abstentions_do_count_toward_quorum() {
  // 5% of 1,000 is 50. An abstention of 50 reaches quorum; 49 does not.
  quorum_met(50, 1_000, 5) == True && quorum_met(49, 1_000, 5) == False
}

test tally_accumulates_by_choice() {
  let tally = types.Tally { yes: 0, no: 0, abstain: 0 }
  let tally = add_vote(tally, types.Yes, 10)
  let tally = add_vote(tally, types.No, 3)
  let tally = add_vote(tally, types.Abstain, 7)
  tally.yes == 10 && tally.no == 3 && tally.abstain == 7 && total_cast(tally) == 20
}

test a_session_needs_both_quorum_and_approval() {
  // Quorum met, approval met.
  is_passed(types.Tally { yes: 60, no: 40, abstain: 0 }, linear_params(), 1_000) == True && // Quorum met, approval short.
  is_passed(types.Tally { yes: 50, no: 50, abstain: 0 }, linear_params(), 1_000) == False && // Approval met, quorum short.
  is_passed(types.Tally { yes: 10, no: 1, abstain: 0 }, linear_params(), 1_000) == False
}

test the_python_demos_own_scenario_fails_quorum() {
  // voting_mechanism.py's demo: Alice 50M yes, Bob 30M yes, Charlie 20M no,
  // Dave 10M abstain, quadratic at scaling 1.0, quorum 8 percent.
  //
  // Weighted quadratically the four votes come to about 20,182 — while the
  // quorum, computed against the minted 1,000,000,000, is 80,000,000. The
  // demo's own scenario cannot pass. That is the defect `onchain_design.md` §D
  // exists to fix: with `voting_supply` set to the 110,000,000 actually in
  // holders' hands, quorum is 8,800,000 — still not met here, but a bar that
  // participation can actually clear rather than one that arithmetic forbids.
  let alice = effective_voting_power(50_000_000, quadratic_params(100))
  let bob = effective_voting_power(30_000_000, quadratic_params(100))
  let charlie = effective_voting_power(20_000_000, quadratic_params(100))
  let dave = effective_voting_power(10_000_000, quadratic_params(100))
  let tally = types.Tally { yes: alice + bob, no: charlie, abstain: dave }
  quorum_met(total_cast(tally), 1_000_000_000, 8) == False && quorum_met(
    total_cast(tally),
    110_000_000,
    8,
  ) == False && approval_met(tally.yes, tally.no, 60) == True
}

// --- Degenerate configurations must fail closed, not fail open ---
// These encode the intended behaviour; run them before assuming they pass.

test zero_quorum_percent_does_not_waive_quorum() {
  quorum_met(0, 1_000_000, 0) == False
}

test zero_voting_supply_does_not_waive_quorum() {
  quorum_met(0, 0, 5) == False
}

test zero_approval_percent_cannot_approve_an_unanimous_no() {
  // Zero yes votes must never be an approval, whatever the threshold.
  approval_met(0, 1, 0) == False
}

test a_negative_scaling_cannot_produce_negative_weight() {
  effective_voting_power(10_000, quadratic_params(-50)) >= 0
}

test a_negative_cap_cannot_produce_negative_weight() {
  let capped = types.VotingParameters {
    voting_type: types.Weighted,
    quorum_percent: 5,
    approval_percent: 51,
    voting_duration_ms: 0,
    quadratic_scaling_percent: 100,
    max_vote_weight: Some(-1),
  }
  effective_voting_power(500, capped) >= 0
}

test treasury_management_falls_back_to_general_like_the_python() {
  // The Python has no `treasury_management` entry and falls back to `general`.
  // Porting it as the funding-request values would silently change what it takes
  // to move treasury money.
  let tm = default_parameters(types.TreasuryManagement)
  let g = default_parameters(types.General)
  tm.quorum_percent == g.quorum_percent && tm.approval_percent == g.approval_percent && tm.voting_duration_ms == g.voting_duration_ms && tm.quorum_percent == 3
}

test default_parameters_match_the_python() {
  default_parameters(types.ParameterChange).voting_type == types.Quadratic && default_parameters(
    types.ParameterChange,
  ).quorum_percent == 8 && default_parameters(types.ParameterChange).approval_percent == 60 && default_parameters(
    types.ParameterChange,
  ).quadratic_scaling_percent == 50 && default_parameters(
    types.GovernanceChange,
  ).quorum_percent == 15 && default_parameters(types.GovernanceChange).approval_percent == 75 && default_parameters(
    types.TechnicalUpgrade,
  ).approval_percent == 67 && default_parameters(types.General).quorum_percent == 3 && default_parameters(
    types.General,
  ).voting_duration_ms == 3 * 24 * 3600 * 1000
}
