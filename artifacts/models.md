# Housing App - Data Models

## User

```javascript
{
  id: String,
  name: String,
  email: String,
  phone: String,
  verified: Boolean,
  role: Enum["tenant", "landlord", "agent", "admin"],
  profileImage: String,
  dateJoined: Date,
  isActive: Boolean,
}
```

## Tenant (extends User)

```javascript
{
  viewingsPurchased: Number,
  viewingsRemaining: Number,
  currentSubscriptionStart: Date,
  currentSubscriptionEnd: Date,
  viewingHistory: [ViewingId],
  savedProperties: [PropertyId],
  paymentMethods: [PaymentMethodId]
}
```

## Landlord (extends User)

```javascript
{
  properties: [PropertyId],
  agentOption: Enum["with_agent", "no_agent", "platform_assigned"],
  preferredAgents: [AgentId],
  earnings: {
    total: Number,
    available: Number,
    pending: Number,
    lastWithdrawal: {
      amount: Number,
      date: Date
    }
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String
  }
}
```

## Agent (extends User)

```javascript
{
  specializations: [String],
  workingAreas: [GeoArea],
  associatedLandlords: [LandlordId],
  properties: [PropertyId],
  ratings: Number,
  reviews: [ReviewId],
  earnings: {
    total: Number,
    available: Number,
    pending: Number,
    lastWithdrawal: {
      amount: Number,
      date: Date
    }
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String
  }
}
```

## Property

```javascript
{
  id: String,
  title: String,
  description: String,
  landlordId: String,
  agentId: String,
  propertyType: Enum["apartment", "house", "duplex", "bungalow", "self_contained"],
  bedrooms: Number,
  bathrooms: Number,
  size: Number, // in square meters
  features: [String],
  address: {
    street: String,
    city: String,
    state: String,
    fullAddress: String,
    location: {
      type: "Point",
      coordinates: [Number, Number] // [longitude, latitude]
    }
  },
  price: {
    amount: Number,
    currency: String,
    paymentFrequency: Enum["monthly", "yearly"]
  },
  images: [String], // URLs to property images
  availabilityDate: Date,
  dateCreated: Date,
  lastUpdated: Date,
  status: Enum["available", "booked", "rented", "hidden"],
  viewings: [ViewingId]
}
```

## Viewing

```javascript
{
  id: String,
  propertyId: String,
  tenantId: String,
  agentId: String,
  landlordId: String,
  scheduledDate: Date,
  scheduledTime: Date,
  status: Enum["pending", "confirmed", "completed", "canceled", "no_show"],
  isFarDistance: Boolean, // For additional fee calculation
  additionalFee: Number,
  cancellationTime: Date,
  feedback: {
    tenantRating: Number,
    tenantComment: String,
    agentRating: Number,
    agentComment: String
  },
  createdAt: Date
}
```

## Transaction

```javascript
{
  id: String,
  type: Enum["subscription_payment", "viewing_fee", "agent_payment", "landlord_payment", "early_withdrawal_fee", "listing_fee"],
  amount: Number,
  currency: String,
  paymentStatus: Enum["pending", "completed", "failed", "refunded"],
  paymentMethod: String,
  paymentDetails: Object,
  userId: String,
  relatedEntityId: String, // Could be viewingId, propertyId, etc.
  description: String,
  createdAt: Date,
  transactionReference: String,
  platformFee: Number
}
```

## Withdrawal

```javascript
{
  id: String,
  userId: String,
  userRole: Enum["agent", "landlord"],
  amount: Number,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  status: Enum["pending", "processing", "completed", "failed"],
  penaltyFee: Number,
  isEarlyWithdrawal: Boolean,
  requestDate: Date,
  processedDate: Date,
  transactionReference: String
}
```

## Subscription

```javascript
{
  id: String,
  tenantId: String,
  startDate: Date,
  endDate: Date,
  baseViewings: Number,
  extraViewingsPurchased: Number,
  totalAmountPaid: Number,
  status: Enum["active", "expired"],
  transactionId: String
}
```
