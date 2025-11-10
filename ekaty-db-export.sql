Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "ekaty.db" at "file:/data/ekaty.db"

- Introspecting based on datasource defined in prisma/schema.prisma
✔ Introspected 9 models and wrote them into prisma/schema.prisma in 54ms
      
*** WARNING ***

These fields were enriched with `@map` information taken from the previous Prisma schema:
  - Model: "Ad", field: "restaurantId"
  - Model: "Ad", field: "ctaUrl"
  - Model: "Ad", field: "ctaText"
  - Model: "Ad", field: "startDate"
  - Model: "Ad", field: "endDate"
  - Model: "Ad", field: "createdAt"
  - Model: "Ad", field: "updatedAt"
  - Model: "ApiUsage", field: "requestCount"
  - Model: "ApiUsage", field: "updatedAt"
  - Model: "AuditLog", field: "entityId"
  - Model: "AuditLog", field: "userId"
  - Model: "AuditLog", field: "ipAddress"
  - Model: "AuditLog", field: "userAgent"
  - Model: "AuditLog", field: "createdAt"
  - Model: "ContactSubmission", field: "createdAt"
  - Model: "Favorite", field: "userId"
  - Model: "Favorite", field: "restaurantId"
  - Model: "Favorite", field: "createdAt"
  - Model: "Restaurant", field: "zipCode"
  - Model: "Restaurant", field: "cuisineTypes"
  - Model: "Restaurant", field: "priceLevel"
  - Model: "Restaurant", field: "logoUrl"
  - Model: "Restaurant", field: "reviewCount"
  - Model: "Restaurant", field: "sourceId"
  - Model: "Restaurant", field: "createdAt"
  - Model: "Restaurant", field: "updatedAt"
  - Model: "Restaurant", field: "lastVerified"
  - Model: "Restaurant", field: "adminOverrides"
  - Model: "Review", field: "restaurantId"
  - Model: "Review", field: "userId"
  - Model: "Review", field: "createdAt"
  - Model: "Review", field: "updatedAt"
  - Model: "Spin", field: "userId"
  - Model: "Spin", field: "restaurantId"
  - Model: "Spin", field: "spinParams"
  - Model: "Spin", field: "sessionId"
  - Model: "Spin", field: "createdAt"
  - Model: "User", field: "passwordHash"
  - Model: "User", field: "createdAt"
  - Model: "User", field: "updatedAt"

These models were enriched with `@@map` information taken from the previous Prisma schema:
  - "Ad"
  - "ApiUsage"
  - "AuditLog"
  - "ContactSubmission"
  - "Favorite"
  - "Restaurant"
  - "Review"
  - "Spin"
  - "User"

Run prisma generate to generate Prisma Client.

