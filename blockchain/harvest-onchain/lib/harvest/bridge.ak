//// The bridge lock — rules for releasing HRV locked on Cardano.
////
//// Design and reasoning: `blockchain/bridge_design.md`. The short version:
//// a Cardano validator cannot see the sidechain, so "burning the sidechain
//// representation releases the locked HRV" is not something a script can
//// establish by itself. Something must tell it, and the only thing a script can
//// verify is a signature. This is a **custodial** bridge: the user holds the
//// signing key, and settled 2026-09-19 that a single signature releases.
////
//// It is built as M-of-N anyway, with the attester set and threshold as
//// parameters, because raising the threshold to a committee then costs a new
//// datum rather than a new script.

use aiken/collection/dict.{Dict, is_empty, singleton}
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{VerificationKey, from_verification_key}
use cardano/assets.{AssetName, PolicyId, contains, from_asset, tokens}
use cardano/transaction.{NoDatum, Output}

/// What a lock records. Deliberately minimal.
///
/// **There is no `amount` field.** The amount is read from the UTxO's actual
/// value when the lock is released, not from the datum — so a lock cannot
/// claim to hold more than it does. A datum field would be a second source of
/// truth for the same fact, and the wrong one to trust.
///
/// `owner` is a key hash rather than a full address, so the validator cannot be
/// talked into paying a script and the check is a single equality.
pub type LockDatum {
  owner: VerificationKeyHash,
  /// Where to credit the representation on the sidechain. Opaque here — the
  /// sidechain decides its own address format, and the Chain Follower reads it.
  sidechain_recipient: ByteArray,
}

/// Whether enough attesters signed.
///
/// `threshold <= 0` is **false**, not vacuously true: a deployment configured
/// with a zero threshold would let anyone spend the lock, so a configuration
/// mistake must fail closed. An empty attester set is rejected for the same
/// reason. Every check here is written to fail closed.
///
/// **The count runs over `attesters`, not over `signatories`, and that
/// direction is load-bearing.** Counting matching signatories means a list that
/// names the same key twice counts twice, so a single signer could satisfy a
/// threshold of two — confirmed by test before it was fixed. The ledger's own
/// `extra_signatories` is a set, so today that cannot happen; a future design
/// carrying the signer list in a redeemer would be caller-supplied, and this is
/// the line that would have broken. Counting over `attesters` bounds each
/// attester's contribution to one.
///
/// The residual assumption is the mirror image, and it is a deployment one:
/// **`attesters` must not contain duplicates.** A duplicated entry there would
/// count twice, letting one signature satisfy a higher threshold. That list is a
/// script parameter, fixed and visible at deployment, which is why this is the
/// better place for the assumption to sit.
pub fn attester_threshold_met(
  signatories: List<VerificationKeyHash>,
  attesters: List<VerificationKeyHash>,
  threshold: Int,
) -> Bool {
  if threshold <= 0 || list.is_empty(attesters) {
    False
  } else {
    list.count(attesters, fn(kh) { list.has(signatories, kh) }) >= threshold
  }
}

/// Whether the locked tokens go back to the address the lock named.
///
/// **This is what limits the signer's power.** The attesters decide *when* a
/// release happens; they cannot redirect it. The transaction must contain an
/// output paying `owner` at least everything of `policy_id` that the lock UTxO
/// held, so a release sending the tokens anywhere else fails, whoever signed it.
///
/// The check is against the UTxO's real value, and an empty holding is rejected
/// so a lock containing none of the policy cannot be released as a no-op.
///
/// Two boundaries worth stating rather than discovering:
///
///   - **One output must carry the whole amount.** A release that split the
///     payout across two outputs to the owner would be rejected. That is
///     stricter than necessary, not wrong — and since whoever builds the release
///     transaction can simply not split it, the constraint costs a rebuild in an
///     unusual case rather than losing anything.
///   - **Only `policy_id` is protected.** Anything else sitting on the lock UTxO
///     — an asset sent there by mistake, say — is not required to go to the
///     owner, so the signer could direct it elsewhere. That is not a hole in the
///     custody model, because the signer could equally refuse to release at all;
///     it is a reason not to send anything to the lock address except the asset
///     being locked.
pub fn returns_to_owner(
  outputs: List<Output>,
  owner: VerificationKeyHash,
  policy_id: PolicyId,
  locked_tokens: Dict<AssetName, Int>,
) -> Bool {
  if is_empty(locked_tokens) {
    False
  } else {
    list.any(
      outputs,
      fn(output) {
        output.address.payment_credential == VerificationKey(owner) && contains(
          tokens(output.value, policy_id),
          locked_tokens,
        )
      },
    )
  }
}

/// The whole release rule, as one testable predicate.
///
/// Both halves must hold. With a single attester and a threshold of one this
/// reduces to "the user signed, and the tokens go back to the locker" — but the
/// shape is the committee shape, so tightening it later is configuration, not a
/// rewrite.
pub fn release_is_valid(
  signatories: List<VerificationKeyHash>,
  attesters: List<VerificationKeyHash>,
  threshold: Int,
  outputs: List<Output>,
  owner: VerificationKeyHash,
  policy_id: PolicyId,
  locked_tokens: Dict<AssetName, Int>,
) -> Bool {
  attester_threshold_met(signatories, attesters, threshold) && returns_to_owner(
    outputs,
    owner,
    policy_id,
    locked_tokens,
  )
}

// ---------------------------------------------------------------------------
// Tests
//
// Note for whoever edits this: `dict.from_pairs` and `dict.from_ascending_pairs`
// crash the Aiken 1.1.23 compiler outright — no diagnostic, just exit 1 — so the
// fixtures build dicts with `singleton`. See AGENTS.md §2.5.
// ---------------------------------------------------------------------------

const owner_a = #"11111111111111111111111111111111111111111111111111111111"

const owner_b = #"22222222222222222222222222222222222222222222222222222222"

const signer_1 = #"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

const signer_2 = #"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

const hrv = #"cccccccccccccccccccccccccccccccccccccccccccccccccccccccc"

const other_policy = #"dddddddddddddddddddddddddddddddddddddddddddddddddddddddd"

const no_name = #""

fn locked(qty: Int) -> Dict<AssetName, Int> {
  singleton(no_name, qty)
}

fn paying(to: VerificationKeyHash, policy: PolicyId, qty: Int) -> List<Output> {
  [
    Output {
      address: from_verification_key(to),
      value: from_asset(policy, no_name, qty),
      datum: NoDatum,
      reference_script: None,
    },
  ]
}

test a_single_signer_meeting_the_threshold_releases() {
  release_is_valid(
    [signer_1],
    [signer_1],
    1,
    paying(owner_a, hrv, 1_000),
    owner_a,
    hrv,
    locked(1_000),
  )
}

test an_unconfigured_signer_cannot_release() {
  // signer_2 is not in the attester set.
  release_is_valid(
    [signer_2],
    [signer_1],
    1,
    paying(owner_a, hrv, 1_000),
    owner_a,
    hrv,
    locked(1_000),
  ) == False
}

test a_committee_needs_the_threshold_not_just_one() {
  let paid = paying(owner_a, hrv, 1_000)
  // Two attesters, threshold two: one signature is not enough, two is.
  release_is_valid(
    [signer_1],
    [signer_1, signer_2],
    2,
    paid,
    owner_a,
    hrv,
    locked(1_000),
  ) == False && release_is_valid(
    [signer_1, signer_2],
    [signer_1, signer_2],
    2,
    paid,
    owner_a,
    hrv,
    locked(1_000),
  )
}

test repeated_signatories_cannot_stand_in_for_distinct_attesters() {
  // One signer listed twice must not satisfy a threshold of two. The ledger's
  // own `extra_signatories` is a set so this cannot arise today, but the rule
  // should not depend on that — a future design that carries the signer list in
  // a redeemer would be caller-supplied, and this is where it would break.
  attester_threshold_met([signer_1, signer_1], [signer_1, signer_2], 2) == False
}

test a_zero_threshold_fails_closed() {
  // A misconfigured deployment must not become an open lock.
  attester_threshold_met([signer_1], [signer_1], 0) == False && attester_threshold_met(
    [signer_1],
    [signer_1],
    -1,
  ) == False && attester_threshold_met([signer_1], [], 1) == False
}

test a_signer_cannot_redirect_the_release() {
  // The heart of the trust limit: the attester signed, but the tokens are not
  // going back to the locker.
  release_is_valid(
    [signer_1],
    [signer_1],
    1,
    paying(owner_b, hrv, 1_000),
    owner_a,
    hrv,
    locked(1_000),
  ) == False
}

test a_release_paying_only_part_of_the_lock_fails() {
  release_is_valid(
    [signer_1],
    [signer_1],
    1,
    paying(owner_a, hrv, 999),
    owner_a,
    hrv,
    locked(1_000),
  ) == False
}

test a_release_paying_more_than_locked_is_allowed() {
  // Over-paying the owner cannot happen by accident — the transaction would not
  // balance — and it is not a failure mode worth rejecting.
  release_is_valid(
    [signer_1],
    [signer_1],
    1,
    paying(owner_a, hrv, 1_001),
    owner_a,
    hrv,
    locked(1_000),
  )
}

test tokens_of_another_policy_do_not_count() {
  // Paying the owner in some other token is not returning the lock.
  release_is_valid(
    [signer_1],
    [signer_1],
    1,
    paying(owner_a, other_policy, 1_000),
    owner_a,
    hrv,
    locked(1_000),
  ) == False
}

test an_empty_lock_cannot_be_released() {
  // A lock holding none of the policy is not a lock, whatever its datum says.
  release_is_valid(
    [signer_1],
    [signer_1],
    1,
    paying(owner_a, hrv, 0),
    owner_a,
    hrv,
    locked(0),
  ) == False
}
