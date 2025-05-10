# API Endpoints

## Authentication

```
POST /api/auth/register         - Register new user
POST /api/auth/verify-otp       - Verify OTP code
POST /api/auth/login            - Login user
POST /api/auth/refresh-token    - Refresh authentication token
POST /api/auth/reset-password   - Request password reset
POST /api/auth/set-password     - Set new password
GET  /api/auth/me               - Get current user profile
PUT  /api/auth/me               - Update user profile
```

## Properties

```
GET    /api/properties                   - List properties (with filters)
GET    /api/properties/nearby            - Get properties near location
POST   /api/properties                   - Create new property listing
GET    /api/properties/:id               - Get property details
PUT    /api/properties/:id               - Update property
DELETE /api/properties/:id               - Delete/hide property
GET    /api/properties/:id/viewings      - Get property viewings
POST   /api/properties/:id/images        - Upload property images
DELETE /api/properties/:id/images/:imgId - Delete property image
```

## Tenant Operations

```
GET    /api/tenant/subscription          - Get current subscription
POST   /api/tenant/subscription          - Purchase subscription
GET    /api/tenant/viewings              - List tenant's viewings
POST   /api/tenant/viewings              - Book a new viewing
PUT    /api/tenant/viewings/:id          - Update viewing (reschedule)
DELETE /api/tenant/viewings/:id          - Cancel viewing
POST   /api/tenant/viewings/:id/feedback - Submit viewing feedback
GET    /api/tenant/saved-properties      - Get saved properties
POST   /api/tenant/saved-properties/:id  - Save property
DELETE /api/tenant/saved-properties/:id  - Remove saved property
```

## Landlord Operations

```
GET    /api/landlord/properties          - Get landlord properties
GET    /api/landlord/earnings            - Get earnings summary
GET    /api/landlord/withdrawals         - List withdrawal history
POST   /api/landlord/withdrawals         - Request withdrawal
GET    /api/landlord/viewings            - Get all property viewings
PUT    /api/landlord/viewings/:id        - Update viewing status
GET    /api/landlord/agents              - List connected agents
POST   /api/landlord/agents/invite       - Invite agent
POST   /api/landlord/agents/match        - Request agent matching
DELETE /api/landlord/agents/:id          - Remove agent connection
```

## Agent Operations

```
GET    /api/agent/properties             - Get properties managed
GET    /api/agent/landlords              - Get connected landlords
GET    /api/agent/viewings               - Get scheduled viewings
PUT    /api/agent/viewings/:id           - Update viewing status
GET    /api/agent/earnings               - Get earnings summary
POST   /api/agent/withdrawals            - Request withdrawal
GET    /api/agent/withdrawals            - List withdrawal history
POST   /api/agent/availability           - Set availability times
```

## Payments

```
POST   /api/payments/initialize          - Initialize payment
POST   /api/payments/verify              - Verify payment
GET    /api/payments/history             - Get payment history
POST   /api/payments/webhook             - Payment gateway webhook
```

## Admin Operations

```
GET    /api/admin/users                  - List all users
PUT    /api/admin/users/:id              - Update user
GET    /api/admin/properties             - List all properties
PUT    /api/admin/properties/:id         - Approve/reject property
GET    /api/admin/transactions           - List all transactions
GET    /api/admin/withdrawals            - List all withdrawal requests
PUT    /api/admin/withdrawals/:id        - Process withdrawal
GET    /api/admin/stats                  - Platform statistics
```

## Notifications

```
GET    /api/notifications                - Get user notifications
PUT    /api/notifications/:id            - Mark notification as read
DELETE /api/notifications/:id            - Delete notification
PUT    /api/notifications/read-all       - Mark all as read
```
