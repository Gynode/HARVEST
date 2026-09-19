# The bridge — design

**Written 2026-09-19.** Status: **SETTLED.** All of A–F answered by the user on 2026-09-19; see the
"Decisions taken" table below. The sections keep the alternatives and the reasoning, because the trade-offs
that were declined are what a future reader needs in order to know when to revisit them.

## Decisions taken 2026-09-19

| | Decision |
|---|---|
| **A. Asset** | The lock script is parameterised by policy id — HRV, and separately the NFTs |
| **B. Locking vs releasing** | Locking is unilateral and trustless; releasing requires signatures |
| **C. Who signs a release** | **The user signs.** A single signing key — a custodial bridge, not a federated one. See §4 for what that means and why the validator is still built as M-of-N |
| **D. Replay protection** | Bind every attestation to the exact lock UTxO. Not a choice — the alternative is a bug |
| **E. Refund path** | **None.** Release only on an attested burn |
| **F. Does locked HRV vote** | **No.** Bridging forfeits mainnet voting power |

This is the design pass that `dao_deployment_steps.md` §6 said was missing. Nothing in the repository settled
the bridge — `harvest_blockchain_architecture.md` §4 states the *model* (lock on mainnet, represent on the
sidechain, burn to release) and stops there, and the roadmaps list "Cardano Mainnet Bridge Development" as a
task without saying what it produces. `onchain_design.md` covers the DAO only.

---

## 1. The problem, stated exactly

HRV is a Cardano native token on mainnet. The sidechain does not mint its own — it represents the locked
amount. So the bridge is a **two-way peg**, and it has to work in both directions:

| Direction | What must happen | Who can see what |
|---|---|---|
| **Cardano → sidechain** | HRV is locked by a mainnet Plutus script; an equal representation is credited on the sidechain | Mainnet sees the lock. **The sidechain cannot see mainnet by itself.** |
| **Sidechain → Cardano** | The representation is burned on the sidechain; the locked HRV is released on mainnet | The sidechain sees the burn. **Mainnet cannot see the sidechain at all.** |

**That asymmetry is the entire problem.** A Cardano validator is a pure function of one transaction: it sees
its own inputs, outputs, datum, redeemer and validity interval. It cannot query the sidechain, cannot read a
sidechain header, and cannot prove that a burn occurred. So "burning the representation releases the locked
HRV" is not something a mainnet script can do by itself. Something must *tell* it, and the only thing a script
can verify is a **signature**.

Every design question below follows from that one fact. This is a **federated peg**: its security is the
honesty of a named set of signers, not mathematics. That is worth saying in the first paragraph rather than
discovering later, because it is also true of most production bridges and is exactly what gets misdescribed
in the ones that fail catastrophically.

---

## 2. Settled: what is locked, and what the validator is made of

**A. The asset is a Cardano native token with a known policy id.** HRV, and separately the 3,125 NFTs. The
lock script is parameterised by the policy id, so one validator serves both — or two deployments, one per
policy.

**B. Locking is unilateral; releasing is not.**

- **Lock**: anyone may send HRV to the lock address. It needs no permission and no signature beyond the
  sender's own transaction. The datum records who is entitled to the return, the intended sidechain
  recipient, and the amount. This is the only part of the bridge that is fully trustless, because it is just
  a payment to a script.
- **Release**: spending a lock UTxO requires the attester signatures (question **C**). This is the trusted
  part.

**What the validator can enforce on release, and it should:**

1. The transaction spends a **specific lock UTxO** named in the attestation — not "an amount to an address".
2. The released asset is the locked asset, and the amount released is **at most** the amount that UTxO
   recorded.
3. The output goes to the address the datum authorised.
4. The attester threshold is met.
5. A validity interval, if a timelock is wanted on releases.

**What it cannot enforce, ever:** that the sidechain representation in circulation is backed 1:1. Mainnet
cannot see the sidechain. If the attesters sign a release for a burn that never happened, the script will
happily pay out, and the locked HRV will be gone while the representation still exists. **The peg is exactly
as sound as the attester set, and no validator design changes that.** Stating it here prevents the far worse
failure of a document claiming otherwise.

---

## 3. Settled: the Chain Follower is the other half

`cardano_sidechain_research.md` describes the Toolkit's own components, and they answer the Cardano →
sidechain direction: **main-chain Plutus scripts** govern token movement, and a **Chain Follower** (currently
built on Cardano DB Sync) observes main-chain events and communicates them to the sidechain.

So the Cardano → sidechain direction is not a Plutus problem at all:

1. The user's lock transaction sits in a mainnet block.
2. Each Node Handler's Chain Follower observes it.
3. The Node Handlers include a corresponding **credit** transaction on the sidechain.

The trust here is the PoA assumption already made everywhere else: an honest majority of Node Handlers. If a
majority credit representations with no lock behind them, the sidechain's HRV is inflated — a real risk worth
recording, and the same assumption the sidechain's own block production already rests on.

**Consequence worth noting:** the follower is therefore load-bearing software, and a Node Handler that runs a
faulty or lagging follower credits wrongly. This is where the "Chain Follower" task in the roadmap actually
matters.

---

## 4. **[C] SETTLED — the user signs**

**Adopted: the user holds the signing key.** A single key authorises every release. This is a **custodial
bridge**, and it should be described that way in every document and on the site — not as federated, and not
as trustless. The honest one-line description is: *locked HRV is released when HARVEST signs for it.*

**Three consequences, stated once and plainly, because they are severe and two of them compound:**

1. **Whoever holds that key can release every locked HRV.** There is no quorum, no second signature, and no
   on-chain check that a burn ever happened — the script cannot check, since it cannot see the sidechain.
   Compromise of the key is total loss of the lock, and the transaction is irreversible.
2. **If the key is lost, everything locked is stuck permanently.** This compounds with **E**: with no refund
   path, there is no recovery that does not require the key. The two decisions together mean a single lost
   file is unrecoverable. That is worth knowing before the first HRV is locked, and it is the strongest
   argument for adding E3's emergency path later.
3. **It is a starting point that is cheap to keep and expensive to leave.** Fine while the value locked is
   small and the treasury is unfunded; the migration to a committee is a datum change, not a rewrite —
   *provided* the validator is built as M-of-N from the start, which is why it is (below).

**So the validator is built parameterised, with the attester set and threshold as data, and the current
configuration is one key and a threshold of one.** Switching to a committee then means changing the datum,
not rewriting the script. Hard-coding `N = 1` into the shape of the code would make a decision that now costs
nothing cost a redeployment later.

### The alternatives, kept for when this is revisited

| Option | Security | Cost |
|---|---|---|
| **C1. The Node Handlers**, M-of-N | Reuses the set that already observes the sidechain, so no new role and no new keys to distribute | **Concentrates power badly.** The same set would produce sidechain blocks, attest burns, *and* (per the DAO design) review proposals. A majority could fabricate a burn, drain the lock, and censor the evidence — and the sidechain's own history would show whatever they wrote |
| **C2. A separate bridge committee**, M-of-N | Separates bridge custody from block production, so compromising the validators does not by itself compromise the lock. Standard practice for federated pegs | New role, new keys, new operational burden, and a new set to actually recruit and hold accountable. On a project with no funded treasury, that is a real obstacle |
| **C3. Node Handlers now, separate later** | Ships something workable, with an explicit migration path | The migration is a script change and a re-lock, or a governance-gated validator swap — not free, and easy to never do |

**Recommendation: C3, with the threshold set high.** If the Node Handler set is the attester set, require a
supermajority rather than a bare majority — the PoA assumption is "honest majority", but for custody of
locked value the assumption should be tightened, because the consequence of a bad attestation is
unrecoverable. Concretely: if there are *n* Node Handlers, require `ceil(2n/3)`, not `floor(n/2) + 1`.

**The number of signers also bounds the design:** with `k` attesters, a release transaction needs `k`
signatures, and every one of them must be a Cardano key whose hash is in the validator's datum. So the
attester set is a datum the script is parameterised by or reads, and *changing* it is itself a governance
action requiring the same threshold — otherwise whoever can change the set can steal the lock. That
bootstrapping problem (the set authorises changes to itself) has no clean answer on-chain; it should be a
DAO proposal type, which is a reason for the DAO and the bridge to share a governance root.

---

## 5. **[D] Settled by necessity — replay protection, and the one mistake to avoid**

This one is not a judgement call: binding the attestation to the exact UTxO is the only design that is safe,
and the alternative is not a trade-off but a bug. It is written out at length because the failure is silent.

Cardano's eUTxO model gives most of this for free: **a UTxO can be spent once.** A released lock UTxO cannot
be released again, so the same lock cannot be drained twice. That is a genuine advantage over account-based
chains, where replay is a standing hazard.

But it is not sufficient, and the gap is easy to fall into:

- An attestation that says *"release 1,000 HRV to addr1…"* can be replayed against a **different** lock UTxO
  that happens to hold 1,000 HRV. The attesters signed a statement about an amount, and the transaction
  satisfies a different instance of it.
- Therefore **the attestation must bind to a specific UTxO by output reference** (transaction id + index),
  and the validator must check that the UTxO being spent is exactly the one named. Not the amount, not the
  recipient — the UTxO.
- The same applies to any message the attesters sign: bind to the exact thing being acted on, plus a domain
  separator, so a signature for one purpose cannot be reused for another.

**Recommendation: D1 — bind every attestation to the exact lock UTxO it releases, and check that binding
explicitly in the validator, with a test that a replayed attestation against a different UTxO fails.** This
is the single highest-value test in the whole bridge, because the failure is silent, total, and
unrecoverable.

---

## 6. **[E] SETTLED — no refund path**

This looks like an obvious safety feature and is actually a trap.

If a depositor can unilaterally reclaim their locked HRV after a timeout, then someone who locked, received
the representation, and *kept* it can wait out the timeout and reclaim — holding both. **Unilateral refund is
a double-spend**, unless it is conditioned on proof that the representation was destroyed, which is the same
attestation a release needs.

| Option | Consequence |
|---|---|
| **E1. No refund ever.** Release only on an attested burn | Sound and simple. But if the sidechain permanently dies, the locked HRV is **stuck forever** — the real, unavoidable cost of a federated peg |
| **E2. Refund after a long timelock, unconditionally** | Gives an escape hatch, and opens the double-spend above. Rejected unless the sidechain's representation is also frozen at that point, which mainnet cannot verify |
| **E3. Emergency release by a higher threshold** — e.g. 90% of attesters plus a long timelock | A governance-gated escape hatch for a dead sidechain. The double-spend risk is real but is now a *decision* made by named people, on the record, rather than an automatic hole |

**Adopted: E1 — no refund path.** The lock script has exactly two ways out: an attested release, and nothing
else. That keeps the always-available surface minimal — the smaller it is, the less there is to get wrong —
and it means the dangerous action cannot happen automatically.

**The cost, which belongs in the user-facing documentation rather than only here: if the sidechain dies,
locked HRV does not come back on its own.** Combined with §4's single signing key, the full statement is: the
only thing that can ever move locked HRV is a signature from the HARVEST key, and if that key is lost the HRV
is unrecoverable. Both halves of that sentence should appear wherever bridging is offered.

---

## 7. **[F] SETTLED — locked HRV does not vote**

Cross-cutting, and easy to miss because it belongs to neither design alone.

Voting power is read from a holder's HRV on Cardano (settled in `onchain_design.md` §3 — a snapshot in the
proposal datum). **Locked HRV sits in the lock script's UTxOs, not in the holder's.** So a holder who bridges
their HRV to the sidechain loses their mainnet voting power the moment the lock confirms.

Options:

- **F1. Locked HRV does not vote.** Simple, and arguably correct — the holder chose to move it. But it means
  bridging is disincentivised, and a large bridger loses governance voice.
- **F2. The sidechain representation votes, on the sidechain.** But governance is on Cardano (settled), so
  this needs the vote to cross the bridge — another attested message.
- **F3. The snapshot counts locked HRV to the address recorded in the lock datum**, read from the lock
  script's UTxOs at snapshot time. No bridge message needed: the lock UTxOs are on Cardano and the snapshot
  is constructed from Cardano state. **This is the cleanest**, and it needs no new trust — but it is only
  correct if the snapshot builder reads the lock address as well as ordinary addresses, and it means a
  bridge-in-flight period where HRV counts in neither place or in both.

**Adopted: F1 — locked HRV does not vote.** The snapshot builder reads ordinary holder addresses only and does
**not** read the lock script, so bridging forfeits mainnet voting power for as long as the HRV stays locked.

This is the simpler design, and it is also the one that makes the snapshot logic smaller and easier to audit —
which is worth something, since the snapshot is where voting power is decided. The cost to record honestly:
**bridging taxes governance voice**, so a holder who moves a large position to the sidechain loses their say on
the DAO that governs the treasury. If that turns out to suppress bridging, this is the decision to revisit, and
F3 is the alternative.

One consequence that falls out cleanly and is worth noting: because governance deliberately ignores the lock,
there is no in-flight period where locked HRV is double-counted or counted in neither place. That ambiguity
disappears rather than needing to be handled.

---

## 8. What this means for the build order

`dao_deployment_steps.md` §6 currently says "settle the bridge design first or build against a placeholder",
and `AGENTS.md` §6 lists the bridge locking validator first. **Neither holds**, and this document is the
reason that can now be said concretely rather than as a hunch:

- The bridge's own design is now settled (this file), so this is no longer an argument from absence.
- The DAO's design is settled **and** half-implemented — `lib/harvest/voting.ak`, 17 tests.
- The HRV CNT already exists on Cardano, where the DAO lives, so the DAO validators do not depend on the
  bridge. They interact with it in exactly one place, **F** — and F is settled as "locked HRV does not vote",
  which means the interaction is *nothing*: the snapshot builder does not read the lock script at all.

So the DAO validators and the bridge are independent, and either can go first. **The DAO still should**, for
one reason that has nothing to do with dependency: the bridge's release path moves real HRV on mainnet under
a single key, and that key should not authorise anything until the DAO exists to eventually replace it.

**When the rest of the bridge is built, the order is:** ~~the lock script~~ (done — see below) → the
attestation format → the Chain Follower's observation logic → the sidechain credit/debit transactions.

### Built 2026-09-19

`validators/lock.ak` and `lib/harvest/bridge.ak` implement the spend path: attester threshold, and the
return-to-owner rule. **26 tests pass across the Aiken project** (17 voting, 9 bridge), and `aiken build`
emits `plutus.json` with `lock.lock.spend` in it.

Three properties the rules enforce, each with a test that fails if it is removed:

- A threshold of zero, or an empty attester set, **fails closed** — a misconfigured deployment must not
  become an open lock.
- A signature from someone outside the attester set releases nothing.
- A release paid to any address other than the lock's recorded owner fails, however many attesters signed.

Two deliberate choices worth noting. **The release rule takes `List<Output>` rather than a transaction**, so
it is a pure function of what it decides on and is unit-testable without constructing a ledger context — the
validator is a thin shell that resolves the spent UTxO and calls it. And **`LockDatum` has no `amount`
field**: the amount released is read from the UTxO's real value, so a lock cannot claim to hold more than it
does. A datum field would be a second source of truth for the same fact, and the wrong one to trust.

Still to build: the attestation format, the Chain Follower's observation logic, and the sidechain
credit/debit transactions. Nothing on the Cardano side is left except deployment.
