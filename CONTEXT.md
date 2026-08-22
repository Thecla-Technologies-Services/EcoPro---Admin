# EcoPro Admin

The staff-facing dashboard for EcoSwap, a marketplace where people sell, swap
and donate second-hand goods. It reads and moderates what the marketplace
produces: listings, the money held between buyer and seller, partner
applications, and the accounts behind all three.

The API speaks a different vocabulary to the dashboard in several places. Where
they differ, the dashboard's term is the one below and the API's spelling is
listed under _Avoid_.

## Language

### People

**User**:
Someone with a marketplace account. Every listing, swap and wallet balance
belongs to one.
_Avoid_: customer, account, member

**Admin User**:
A member of staff with dashboard access, holding a Role. Kept apart from User
because they come from a different service and carry none of a User's balances
or listings.
_Avoid_: staff user, admin account

**Individual**:
A User trading on their own behalf.
_Avoid_: EcoWarrior, ecowarrior (the API's name for the same thing)

**NGO**:
A User registered as a charity, able to receive Donations.
_Avoid_: CharityPartner, charity

**Delivery Partner**:
A User who moves goods between other Users.
_Avoid_: LogisticsPartner, rider (except in Independent Rider, below)

**Independent Rider**:
A Delivery Partner working for themselves rather than for a logistics company.
Verified separately, and through a different queue.

**Customer Account Code**:
The human-readable identifier for a User, e.g. `SRL-1256741`. Distinct from the
account's id, which is a UUID.

### Listings and trade

**Listing**:
An item a User has offered to the marketplace.
_Avoid_: item, product, ad

**Listing Type**:
What the owner will accept for a Listing: Sell, Swap or Donate.

**Swap**:
A trade where two Users exchange goods rather than money.

**Order**:
A trade being carried out — the agreement plus its delivery.

**Delivery**:
The movement of goods for one Order, carried out by a Delivery Partner. Named
apart from the Order because the two can disagree: a Delivery can end Not
Delivered while the Order stands, and an Order can be Disputed over something
that has nothing to do with the movement.

**Flagged**:
A Listing an Admin User has marked as needing review. Distinct from a Listing
a User has reported, which is a Listing Report.

**CO₂ Impact**:
The emissions a Listing is reckoned to have saved by being reused rather than
replaced. Shown per Listing and totalled across the platform.

**Eco-Points**:
What a User earns for trading sustainably. A score, not a currency: they are not
spendable and do not appear in the Wallet balance.

### Money

**Wallet**:
A User's balance on the platform, together with the history of what moved
through it.

**Escrow**:
Money held by the platform between a buyer paying and a seller being credited.
Released when the Order completes, or when an Admin User forces it.

**Withdrawal Request**:
A User asking to move their Wallet balance to their bank. Pending until an Admin
User approves or rejects it.

**Dispute**:
A disagreement over an Order, raised by the buyer or the seller, that an Admin
User resolves.

**Donation**:
Goods or money given to an NGO through the platform. Material and monetary
donations are tracked separately.

### Review

**Verification Queue**:
The pending partner applications awaiting an Admin User's decision. Holds two
kinds — organizations and Independent Riders — from two endpoints, joined into
one list.

**Applicant**:
One entry in the Verification Queue, whether an organization or a rider.

**Review**:
An Admin User's decision on an Applicant: approve, or reject with a reason.

**Role**:
A named set of permissions an Admin User holds. Some are system roles and cannot
be edited.

**Campaign**:
A marketing banner promoted inside the marketplace app.
