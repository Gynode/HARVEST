# On-chain design — the decisions that block the Aiken validators

**Written 2026-09-19.** Status: **ALL SETTLED** — A, B, C, D, §2's three questions, and the delegation
sub-decision. Nothing in this document blocks the Aiken work any more.

## Decisions taken 2026-09-19

| | Decision |
|---|---|
| **A. Host ledger** | **Cardano (A1).** Validators and DAO state on Cardano. The sidechain consumes governance decisions through the Chain Follower; it does not decide. |
| **B. Specification** | **`voting_mechanism.py` for vote parameters and weighting** — per-type quorum and approval, snapshot-honoured power. **`proposal_manager.py` for the lifecycle only.** The duplicate vote paths in `proposal_manager.py` are to be removed so there is one specification. |
| **C. Fiat and the treasury** | **On-chain treasury only, with fiat converted on entry (C1).** One treasury: a script address holding ADA and native tokens. Fiat is converted off-chain into an on-chain asset before it reaches the treasury. |
| **D. Quorum basis** | **A governance-set `voting_supply` parameter (D2).** No threshold is ever computed against the minted 1,000,000,000. |
| **§2.1 On/off-chain split** | **On-chain:** proposal lifecycle, snapshot commitment, tally, treasury authorisation, parameters. **Off-chain:** proposal text, snapshot construction, UI, reporting. |
| **§2.2 Treasury custody** | **Validator + committee signatures (2c).** The Aiken validator enforces the proposal check *and* requires M-of-N committee signatures via `tx.extra_signatories`. Timelock via `tx.validity_range`. |
| **§2.3 Voting power** | **Snapshot committed in the proposal datum (3b).** Power is frozen at proposal creation and read directly by the validator — no proof needed, nothing to trust at this electorate size. Merkle root (3c) is the migration path. |
| **§2.3b Delegation** | **All-or-nothing (3b-i).** Delegating hands over the whole position, as Cardano's own stake delegation does. `amount` and `min_delegation_amount` are removed from the ported rules, not reproduced. |

Each decision's reasoning is in its section below. `dao_deployment_steps.md` §2 is updated to match.

`dao_deployment_steps.md` §2 listed three questions as blocking. Working through the Python specification to
answer them turned up four further problems — two of them contradictions inside the specification itself,
one of them a contradiction between the specification and the settled token model, and one of them a
question nobody had asked yet that has to be answered before the other three mean anything.

The order below is the order they have to be settled in. **A is not currently on any list, and B–D block
"port the behaviour" even after §2's three questions are answered.**

| # | Question | Status |
|---|----------|--------|
| **A** | Which ledger hosts the DAO — Cardano, or the HARVEST sidechain? | **SETTLED — Cardano (A1)** |
| **B** | The Python spec contains two contradictory voting implementations. Which is the specification? | **SETTLED — `voting_mechanism.py` for parameters, `proposal_manager.py` for lifecycle** |
| **C** | Does the on-chain treasury hold fiat? It cannot. | **SETTLED — on-chain only, fiat converted on entry (C1)** |
| **D** | How is quorum denominated, given the supply is unknown? | **SETTLED — governance-set `voting_supply` (D2)** |
| **1** | What is on-chain versus off-chain? | **SETTLED** |
| **2** | Treasury custody: native script or Plutus validator? | **SETTLED — validator + committee sigs (2c)** |
| **3** | Voting power's source of truth | **SETTLED — snapshot in the proposal datum (3b)** |
| **3b** | Delegation: partial-amount or all-or-nothing? | **SETTLED — all-or-nothing** |

---

## A. Which ledger hosts the DAO?

Never asked. It is prior to the other three, because "what is on-chain" has no answer until "on-chain
*where*" does.

HARVEST has two ledgers: Cardano mainnet, where the HRV CNT was minted, and the sidechain, whose Node
Handlers produce the blocks.

| Option | Consequence |
|--------|-------------|
| **A1. Cardano** — validators on Cardano, DAO state at a Cardano script address | Voting power is read directly from the HRV CNT, which lives here. The treasury that holds HRV is a Cardano script. The sidechain *consumes* governance decisions through the Chain Follower. No bridge trust for governance. |
| **A2. The sidechain** — governance runs on the PoA chain | Cheap and fast, no Cardano fees to vote. But the HRV CNT is not on the sidechain: the sidechain holds a *representation*. Every treasury action on real HRV becomes a bridge message, so the DAO's security reduces to the honesty of the Node Handler set — the very thing governance exists to constrain. |
| **A3. Split** — treasury + token on Cardano, proposal/voting on the sidechain | Requires a trusted mapping between sidechain votes and Cardano spends. Two sources of truth for the same decision. |

**Adopted: A1.** The decisive argument is custody. The treasury will hold HRV, and HRV is a Cardano
native token — so the treasury address is a Cardano script regardless of where voting happens. If voting
happens on the sidechain, then a Cardano script must accept an instruction that originated off-Cardano, and
the only thing that can authorise it is the PoA validator set. That makes the Node Handlers the final
authority over the treasury, which is the opposite of what a DAO is for. Under A1 the sidechain's role is to
read and obey, not to decide.

This also fits the settled model: the sidechain *represents* locked HRV (a representation, per
`corrected_hrv_valuation.md`), and representations do not govern the thing they represent.

**Blocked until answered:** everything else. Under A2 or A3 the validators would be written for a different
chain, with a bridge in the trust path.

---

## B. The specification contradicts itself

`proposal_manager.py` and `voting_mechanism.py` each implement a complete voting system, and they disagree.
`dao_deployment_steps.md` §3 says to port "proposal lifecycle and Node Handler review (`proposal_manager.py`)"
and "quadratic voting with quorum (`voting_mechanism.py`)" as though they were two halves. They are not —
they are two whole implementations that overlap.

| | `proposal_manager.py` | `voting_mechanism.py` |
|---|---|---|
| Voting power read at | **current block** — `get_voting_power(voter)`, no block argument | **the snapshot** — `get_voting_power(voter, session.snapshot_block)` |
| Quorum | 5% of `total_supply`, fixed | 3–15%, per proposal type |
| Approval | 51% of decisive votes, fixed | 51–75%, per proposal type |
| Weighting | linear | linear, quadratic, weighted, ranked-choice |
| `start_voting` creates a snapshot? | **yes — and then never reads it** | yes, and reads it |

The snapshot row is not a style difference. `proposal_manager.start_voting()` goes to the trouble of calling
`create_voting_snapshot()`, and then `cast_vote()` reads live balances anyway. So under that file a voter can
transfer HRV away after the snapshot and still vote the old weight, or acquire HRV after the snapshot and
vote with it. The snapshot is computed and discarded.

**Why this blocks the port:** quadratic weighting, quorum and approval are *different numbers per proposal
type* in one file and *fixed constants* in the other. There is no single behaviour to port. Writing the
Aiken against both would produce a validator that disagrees with both.

**Adopted:** treat `voting_mechanism.py` as the specification for vote parameters and weighting
(per-type parameters, snapshot-based power, quadratic where configured), and `proposal_manager.py` as the
specification for the *lifecycle* (submission → Node Handler review → voting → timelock → execution). The
overlap resolves in favour of `voting_mechanism.py` because it is the file that honours the snapshot. Then
delete or demote the duplicate vote paths so there is one specification.

**A second defect in the same area,** in `governance_token.py`: `delegate(delegator, delegate, amount)`
validates and records `amount`, and `get_voting_power()` then ignores it — it adds the delegator's **entire
current balance** to the delegate and subtracts the delegator's **entire balance**. Three consequences:

1. Delegation is all-or-nothing in effect, whatever `amount` was passed — so `min_delegation_amount = 1000`
   is enforced on a number that does not exist.
2. Delegated power is *dynamic*: if a delegator's balance changes after delegating, the delegate's power
   changes with it, mid-vote.
3. A delegator who spends their balance down silently reduces the power of whoever they delegated to.

**Decision needed:** partial-amount delegation, or all-or-nothing position delegation? Cardano's own stake
delegation is all-or-nothing per stake key, which argues for the simpler rule — but then the `amount`
parameter and `min_delegation_amount` must be removed rather than ported, and the minimum expressed some
other way.

---

## C. The treasury cannot hold fiat, and the model says it must — **SETTLED: C1**

`corrected_hrv_valuation.md` settles that value comes from funding the treasury "with **actual fiat**". A
Plutus validator cannot custody fiat. Neither can a Cardano native script. A script address holds ADA and
native tokens — HRV, and CNT stablecoins such as USDM or DJED — and nothing else. There is no mechanism by
which a validator holds a bank balance.

So one of these has to be true, and they are not the same design:

| Option | What the treasury validator is |
|--------|-------------------------------|
| **C1. On-chain treasury, fiat converted on entry** | Fiat arrives off-chain, is converted to ADA/a stablecoin CNT, and the validator custodies that. The validator is a pure custody-and-authorisation script. The "backing" is whatever on-chain asset the fiat became — so the backing is exposed to the stablecoin issuer, not the currency. |
| **C2. The treasury is off-chain; the DAO records it** | The DAO's validators govern only on-chain assets. The fiat treasury is a legal/off-chain entity, and the DAO's on-chain state is a set of *decisions* about it, enforced by the committee in the real world. The validator can authorise a payment; nothing makes the payment happen. |
| **C3. Both** — an on-chain treasury for on-chain assets and an off-chain one for fiat | Honest, but "the treasury" now names two things and every document must say which. |

**Adopted: C1 — one treasury, on-chain, with fiat converted on entry.** The validators govern a single script
address holding ADA and native tokens. Fiat is converted off-chain into an on-chain asset before it reaches the
treasury, and only that asset is ever custodied on-chain.

**Two consequences to hold onto, because they are the cost of C1 and neither is obvious from the word
"backed":**

1. **The backing is whatever the fiat became.** If fiat is converted into a stablecoin CNT, then HRV is backed
   by that issuer's promise, not by the currency that was paid in. The validator cannot tell the difference; a
   depeg or a freeze is not visible to it.
2. **The conversion is the trust hole.** "Fund the treasury with fiat" is, in C1, a two-step process whose
   first step is off-chain, unverifiable by any script, and performed by whoever holds the fiat. The on-chain
   half is trustless; the off-chain half is not, and it is the half where the money actually enters.

Neither argues against C1 — they argue for stating it plainly, which is why they are recorded here rather than
left as an assumption. The failure mode this avoids is the expensive one: a validator believed to hold
$100,000 that holds nothing.

**A documentation obligation follows:** `corrected_hrv_valuation.md`, `qstp_treasury_roadmap.md` and
`updated_qstp_treasury_summary.md` say value comes from funding "the treasury" with "actual fiat" without
saying that the on-chain treasury holds a converted asset. Until they say so, "30% of the treasury is backed"
has no defined referent — and a reader is entitled to assume the treasury holds fiat, which it cannot.

---

## D. Quorum is denominated against the one number that is unknown — **SETTLED: D2**

Both specifications compute quorum as a fraction of `total_supply = 1,000,000,000`:

- `proposal_manager.py`: `quorum_required = int(total_supply * 0.05)` = **50,000,000 HRV**
- `voting_mechanism.py`: `quorum_required = total_supply * quorum_threshold` (3–15%)

That is the minted supply, and it is the number the two lost wallets make unreliable. If a large share of the
1,000,000,000 is in wallets nobody can sign from, then a fixed 50,000,000-HRV quorum may be **unreachable**,
and the DAO cannot pass anything — a governance failure that looks like apathy.

This is the one place where the lost-wallet question reaches into the code, and the good news is that it can
be designed out rather than waited on:

| Option | Effect |
|--------|--------|
| **D1. Denominator = the snapshot's own total** — quorum is a share of the voting power that exists in the snapshot, not of 1,000,000,000 | Self-consistent, and immune to the lost-wallet figure. But a shrinking snapshot makes quorum easier over time, so it is gameable by non-participation. |
| **D2. A governance-set `voting_supply` parameter** in the config datum, adjustable by governance as wallets are confirmed lost | Explicit and auditable. The unknown becomes a parameter with a known update path, and the value can be set once the figure is read off the other machine. |
| **D3. Absolute numbers** — quorum is "N HRV", set by governance | Simplest on-chain; no division, no rounding. Needs a governance process to set N. |

**Adopted: D2**, with the snapshot total as its initial value — so D1 is where `voting_supply` starts and D2 is
how it moves. `voting_supply` can be corrected by governance when the lost wallets are resolved. Practically:
**express quorum and approval thresholds against `voting_supply`, never against `total_supply`, in the
validators.**

**Consequence — this is the important part:** the remaining-HRV-supply question **does not block the
validators.** It blocks only the *initial numeric values* in the config datum, which are set at deployment
and updatable afterwards. The on-chain logic can be written, tested and reviewed before the figure is known.
This is a change from how `AGENTS.md` §6 and `dao_deployment_steps.md` §6 currently read, which say the
supply question blocks the work.

---

## 1. What is on-chain versus off-chain (`§2`, item 1)

The eUTxO constraint that decides this: **a validator sees only the transaction it is validating.** It cannot
enumerate the UTxOs at an address, cannot query a balance, and cannot read global state. Everything it knows
arrives as datum, redeemer, or the transaction's own inputs and outputs.

| | On-chain | Off-chain |
|---|---|---|
| Proposal lifecycle — status, review count, voting window, timelock | ● | |
| Voting-power snapshot commitment | ● | |
| Vote tally | ● at this scale | ○ later, as a Merkle root |
| Treasury spend authorisation | ● | |
| Governance parameters (thresholds, periods, `voting_supply`) | ● | |
| Proposal title, description, discussion | | ● |
| Snapshot construction (who holds what) | | ● verified on-chain via the commitment |
| Voter UI, indexing, reporting, treasury analytics | | ● |

**The concurrency fact that shapes everything:** state in eUTxO lives in UTxOs, so a proposal is a UTxO at
the governance script address, threaded by a **state NFT** so there is exactly one canonical proposal per id.
Every vote spends that UTxO and recreates it with the tally incremented. **Therefore one vote per block, per
proposal** — two votes in one block conflict and one fails. That is tolerable for a few hundred voters and
not for a hundred thousand. Batching (one transaction carrying many votes, submitted by an aggregator) lifts
the limit, at the cost of the aggregator being able to censor — which is acceptable only if an unbatched vote
path stays open.

**A consequence that is easy to miss:** on Cardano the voter pays the fee, in ADA. A holder with HRV and no
ADA cannot vote. Either the DAO subsidises voting (a faucet, or a batched submission where the aggregator
pays), or voting is effectively restricted to ADA holders. Worth deciding deliberately rather than by default.

**Adopted:** on-chain lifecycle, snapshot commitment, tally and treasury authorisation; off-chain
proposal text, snapshot construction and presentation. Design the proposal datum so the tally can become a
Merkle root later **without changing the script address** — the address is fixed at deploy time and moving it
means migrating the state NFT.

---

## 2. Treasury custody: native script or Plutus validator (`§2`, item 2)

A Cardano **native script** supports `sig`, `all`, `any`, `atLeast`, and `after`/`before` slots — so
multi-signature *and* timelocks are both available, cheaply, with no Plutus execution cost and with support
in every wallet.

What a native script cannot do is the thing the DAO needs. It cannot read a datum and it cannot inspect the
transaction. So it can express "3 of 5 committee keys signed", and cannot express "…and this spend pays
proposal 7's approved recipient exactly proposal 7's approved amount". Without that, a passed proposal is not
what authorises a payment — three committee members are. That is a multi-signature wallet with extra steps.

| Option | Verdict |
|--------|---------|
| **2a. Native script only** | Cannot tie a spend to a proposal. Rejected — unless the intent is a committee multisig, in which case say so and drop the on-chain governance pretence. |
| **2b. Plutus validator only** | Full control: can check the proposal UTxO is spent in the same transaction, that its datum says `Passed`, that the recipient and amount match, and that the timelock has elapsed. Costs execution units and a script address. |
| **2c. Both** — validator enforces the proposal, and *also* requires M-of-N committee keys via `tx.extra_signatories` | Belt and braces: the committee cannot be bypassed, and the committee alone cannot bypass a proposal. |

**Adopted: 2c.** The validator is where the proposal check lives; the committee signatures are the
second factor. Timelocks are `tx.validity_range` checked against a deadline stored in the proposal datum —
not a native script `after`, so the timelock and the proposal check stay in one place.

Note this is where **C** bites: a script address can hold ADA and native tokens. Whatever the treasury
custodies must be an on-chain asset.

---

## 3. Voting power's source of truth (`§2`, item 3)

Called in `dao_deployment_steps.md` "the central design question of the whole DAO". It is, and the reason is
the eUTxO constraint above: **a validator cannot see how much HRV an address holds.**

| Option | How it works | Why not |
|--------|--------------|---------|
| **3a. Live UTxO read** — power = HRV in the vote transaction's inputs | No snapshot needed; trivially verifiable | The voter must spend **every** HRV UTxO they own in the vote, or their power is understated. Power can be borrowed and returned within the single atomic transaction. Power changes mid-vote. Addresses that voted can be re-funded and vote again unless the tally tracks voters. |
| **3b. Snapshot committed on-chain** — at proposal creation, the power set is frozen and its commitment stored in the proposal datum; the vote validator reads it | Matches the spec's intent (`create_voting_snapshot` exists in both files); power is fixed for the proposal's life; token transfers cannot alter a vote | Someone must construct the snapshot off-chain, so the commitment has to be verified, not trusted |
| **3c. Merkle root** — 3b, with the snapshot as a Merkle root and each voter supplying a proof | Same guarantees as 3b at any scale, and a voter's power stays private | More machinery; a voter needs a proof to vote, so a proof service must exist |

**Adopted: 3b now, 3c when scale demands it.** The electorate today is the Node Handlers plus a small
holder set, so an explicit `{address → power}` map in the proposal datum is simplest and fully verifiable —
and Aiken's stdlib has a Merkle tree module for when the map outgrows the transaction size limit. The datum
shape should be chosen once, with that migration in mind.

**How the commitment is verified** — this is the part that has to be got right, because an unverified
snapshot is just a trusted third party with extra steps:

- **If the snapshot is small:** store the map itself in the datum. Then no proof is needed and there is
  nothing to trust — the validator reads the power directly. This is why 3b is recommended at this scale.
- **If the snapshot is a Merkle root:** for the commitment to be trustworthy, the root must be *checkable*
  against the ledger. The practical construction is for the snapshot to be taken at a Cardano **epoch
  boundary**, so the root can be recomputed from chain history by anyone. Absent that, the root is an
  assertion by whoever posted it, and the DAO trusts that party.

**Delegation, given B:** voting power is own + delegated-in − delegated-away. Two sub-decisions:

1. **Where delegation lives — the on-chain registry.** A UTxO threaded by its own state NFT, updated by a
   delegation transaction, read as a *reference input* (CIP-31) when the snapshot is committed. It keeps the
   snapshot verifiable and makes delegation a first-class on-chain fact, at the cost of one delegation update
   per block — fine at this scale. The rejected alternative, signed delegations folded into the snapshot
   off-chain, is cheaper and makes the snapshot trusted.
2. **Partial or all-or-nothing — all-or-nothing.** Delegating hands over the whole position, as Cardano's own
   stake delegation does. Consequently **`amount` and `min_delegation_amount` are not ported**: they described
   something that does not happen, and reproducing them would carry a parameter that does nothing into the
   validator. `min_delegation_amount = 1000` in particular has no meaning once there is no amount — if a
   minimum position to delegate is wanted, it belongs on the balance, not on a delegation size.

---

## What is unblocked now

Everything is settled, so **Aiken can be written.** Aiken itself was installed on 2026-09-19 (v1.1.23, via
`aikup`), which was the other thing standing in the way.

**D** means the lost-wallet supply figure is not on the critical path — a change from how `AGENTS.md` §6 and
`dao_deployment_steps.md` §6 previously read.

The build order is:

1. **The bridge locking validator** — the sidechain's HRV is a representation of locked CNT, so nothing
   touching HRV works without it. Also the only piece whose design is already settled (§3.1 of `AGENTS.md`).
2. **The governance validator** — proposal lifecycle, Node Handler review, snapshot commitment, tally,
   quorum against `voting_supply`.
3. **The treasury validator** — the proposal check, committee signatures, timelock, spend.
4. **The config/parameter validator** — governance updates to thresholds and `voting_supply`.
5. Node software, P2P, storage, Chain Follower.

Each is a separate script with its own tests. `harvest_dao/tests/` is empty and Aiken's `test` blocks are
where the property tests in `dao_deployment_steps.md` §4 belong.

## Also found, and separate from all of the above

`treasury_manager.py`'s `__main__` block prints a **$47.5M treasury** — 300,000,000 HRV at $0.10, 10M USDC,
5M ADA at $0.50, 5M DAI — with Compound and Yearn yield strategies and `AssetType.LP_TOKEN`. Every part of
that contradicts settled decisions: the treasury is **unfunded**, HRV has **no value**, DAI and Compound and
Yearn are not on Cardano, and the asset list is EVM. The documents were corrected on 2026-09-18; this demo
block was not, so running the contract as `AGENTS.md` §4 instructs still prints a funded treasury with a
price. It is a demo, not a claim about the world — but it is the kind of demo that gets screenshotted.

Fix it by reducing the demo to the true configuration (empty treasury, HRV at no price) and dropping the
non-Cardano assets.
