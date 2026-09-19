//// The bridge lock script — holds HRV (and, separately, NFTs) on Cardano
//// while the sidechain carries a representation of it.
////
//// Design: `blockchain/bridge_design.md`. Rules and their tests: `lib/harvest/bridge.ak`.
//// This file is only the on-chain shell around them.
////
//// **This script is custodial.** It releases when `threshold` of `attesters`
//// sign. Settled 2026-09-19 as a single key: the deployment should be applied
//// with a one-element `attesters` list and `threshold` of 1. It is written as
//// M-of-N so that raising it to a committee later is a new deployment
//// parameter rather than a rewritten script.
////
//// **There is no refund path.** A lock can only leave through an attested
//// release. If the signing key is lost, the locked assets are unrecoverable —
//// that is the accepted cost of the design, and it belongs in whatever
//// documentation offers bridging to users.
////
//// Two properties the rules enforce, worth stating here because they are what
//// make the custody survivable:
////
////   - The attesters choose *when* a release happens, not *to whom*. The
////     transaction must pay the lock's recorded owner everything of `policy_id`
////     the lock held, so a release cannot redirect the assets.
////   - A lock holding none of `policy_id` cannot be released.

use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{PolicyId, tokens}
use cardano/transaction.{OutputReference, Transaction, resolve_input}
use harvest/bridge.{LockDatum}

validator lock(
  attesters: List<VerificationKeyHash>,
  threshold: Int,
  policy_id: PolicyId,
) {
  spend(
    datum: Option<LockDatum>,
    _redeemer: Data,
    own_ref: OutputReference,
    tx: Transaction,
  ) {
    // A lock with no datum is not a lock this script will release.
    expect Some(lock_datum) = datum

    // The value actually sitting in the UTxO being spent — not a number the
    // datum claims, so a malformed lock cannot overstate what it holds.
    let spent = resolve_input(tx.inputs, own_ref)

    bridge.release_is_valid(
      tx.extra_signatories,
      attesters,
      threshold,
      tx.outputs,
      lock_datum.owner,
      policy_id,
      tokens(spent.value, policy_id),
    )
  }

  else(_) {
    fail
  }
}
