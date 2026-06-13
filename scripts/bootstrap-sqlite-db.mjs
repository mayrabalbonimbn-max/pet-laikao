import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function resolveSqliteDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error("Only SQLite file URLs are supported by this local bootstrap script.");
  }

  const filePath = databaseUrl.replace("file:", "");
  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.join(process.cwd(), "prisma", filePath.replace(/^\.\//, ""));
}

const tableStatements = [
  `PRAGMA foreign_keys = ON;`,
  `CREATE TABLE IF NOT EXISTS "AppointmentService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL UNIQUE,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "Pet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "size" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "scheduledStartAt" DATETIME NOT NULL,
    "scheduledEndAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "paymentOption" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amountDueCents" INTEGER NOT NULL,
    "amountPaidCents" INTEGER NOT NULL,
    "amountBalanceCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("serviceId") REFERENCES "AppointmentService" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "AppointmentHold" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "customerId" TEXT,
    "petId" TEXT,
    "slotReference" TEXT NOT NULL,
    "scheduledStartAt" DATETIME NOT NULL,
    "scheduledEndAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "releasedAt" DATETIME,
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "AppointmentService" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "AppointmentTimeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "AvailabilityRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT,
    "weekday" INTEGER NOT NULL,
    "startsAt" TEXT NOT NULL,
    "endsAt" TEXT NOT NULL,
    "slotIntervalMinutes" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("serviceId") REFERENCES "AppointmentService" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "CalendarBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("serviceId") REFERENCES "AppointmentService" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "parentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT 0,
    "imageLabel" TEXT NOT NULL,
    "mainImageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "supplierId" TEXT,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "sku" TEXT NOT NULL UNIQUE,
    "priceCents" INTEGER NOT NULL,
    "compareAtCents" INTEGER,
    "costCents" INTEGER NOT NULL DEFAULT 0,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "minimumStock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "imageThumbUrl" TEXT NOT NULL,
    "imageThumbPath" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "minSubtotalCents" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartKey" TEXT NOT NULL UNIQUE,
    "customerId" TEXT,
    "couponId" TEXT,
    "status" TEXT NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "lineTotalCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "cartId" TEXT,
    "customerId" TEXT,
    "couponId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "fulfillmentStatus" TEXT NOT NULL,
    "inventoryState" TEXT NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "OrderTimeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "lineTotalCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "InventoryMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "unitCostCents" INTEGER,
    "totalCostCents" INTEGER,
    "notes" TEXT,
    "resultingStockQuantity" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "FinancialCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "direction" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "FinancialEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "occurredOn" DATETIME NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isRecurringFixed" BOOLEAN NOT NULL DEFAULT 0,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "AdminCalendarEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "colorToken" TEXT NOT NULL,
    "customerName" TEXT,
    "petName" TEXT,
    "notes" TEXT,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "impactAvailability" BOOLEAN NOT NULL DEFAULT 0,
    "isAllDay" BOOLEAN NOT NULL DEFAULT 0,
    "sourceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("serviceId") REFERENCES "AppointmentService" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT,
    "orderId" TEXT,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "providerCheckoutId" TEXT,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "providerStatus" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL UNIQUE,
    "checkoutUrl" TEXT,
    "rawPayload" TEXT,
    "expiresAt" DATETIME,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "IntegrationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "idempotencyKey" TEXT,
    "payload" TEXT NOT NULL,
    "responsePayload" TEXT,
    "headers" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "lastLoginAt" DATETIME,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "AdminSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "highlightedOnHome" BOOLEAN NOT NULL DEFAULT 0,
    "ctaLabel" TEXT,
    "ctaLink" TEXT,
    "campaignTag" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "PromotionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promotionId" TEXT NOT NULL,
    "productId" TEXT,
    "serviceId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "customPriceLabel" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "AppointmentService" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "PromotionBanner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promotionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "mobileImageUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaLink" TEXT,
    "placement" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`
];

const indexStatements = [
  `CREATE INDEX IF NOT EXISTS "Appointment_serviceId_scheduledStartAt_idx" ON "Appointment"("serviceId", "scheduledStartAt");`,
  `CREATE INDEX IF NOT EXISTS "Appointment_status_scheduledStartAt_idx" ON "Appointment"("status", "scheduledStartAt");`,
  `CREATE INDEX IF NOT EXISTS "Appointment_paymentStatus_idx" ON "Appointment"("paymentStatus");`,
  `CREATE INDEX IF NOT EXISTS "AppointmentHold_status_expiresAt_idx" ON "AppointmentHold"("status", "expiresAt");`,
  `CREATE INDEX IF NOT EXISTS "AppointmentHold_serviceId_scheduledStartAt_status_idx" ON "AppointmentHold"("serviceId", "scheduledStartAt", "status");`,
  `CREATE INDEX IF NOT EXISTS "AppointmentHold_slotReference_status_idx" ON "AppointmentHold"("slotReference", "status");`,
  `CREATE INDEX IF NOT EXISTS "AppointmentTimeline_appointmentId_createdAt_idx" ON "AppointmentTimeline"("appointmentId", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "AvailabilityRule_serviceId_weekday_active_idx" ON "AvailabilityRule"("serviceId", "weekday", "active");`,
  `CREATE INDEX IF NOT EXISTS "CalendarBlock_serviceId_startsAt_endsAt_idx" ON "CalendarBlock"("serviceId", "startsAt", "endsAt");`,
  `CREATE INDEX IF NOT EXISTS "Category_parentId_active_idx" ON "Category"("parentId", "active");`,
  `CREATE INDEX IF NOT EXISTS "Category_displayOrder_active_idx" ON "Category"("displayOrder", "active");`,
  `CREATE INDEX IF NOT EXISTS "Product_categoryId_active_idx" ON "Product"("categoryId", "active");`,
  `CREATE INDEX IF NOT EXISTS "Product_status_featured_idx" ON "Product"("status", "featured");`,
  `CREATE INDEX IF NOT EXISTS "ProductVariant_productId_active_idx" ON "ProductVariant"("productId", "active");`,
  `CREATE INDEX IF NOT EXISTS "ProductVariant_stockQuantity_reservedQuantity_idx" ON "ProductVariant"("stockQuantity", "reservedQuantity");`,
  `CREATE INDEX IF NOT EXISTS "ProductVariant_supplierId_idx" ON "ProductVariant"("supplierId");`,
  `CREATE INDEX IF NOT EXISTS "Coupon_active_startsAt_endsAt_idx" ON "Coupon"("active", "startsAt", "endsAt");`,
  `CREATE INDEX IF NOT EXISTS "Cart_customerId_status_idx" ON "Cart"("customerId", "status");`,
  `CREATE INDEX IF NOT EXISTS "Cart_couponId_idx" ON "Cart"("couponId");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_variantId_key" ON "CartItem"("cartId", "variantId");`,
  `CREATE INDEX IF NOT EXISTS "CartItem_productId_idx" ON "CartItem"("productId");`,
  `CREATE INDEX IF NOT EXISTS "Order_cartId_idx" ON "Order"("cartId");`,
  `CREATE INDEX IF NOT EXISTS "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "Order_paymentStatus_createdAt_idx" ON "Order"("paymentStatus", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "Order_fulfillmentStatus_createdAt_idx" ON "Order"("fulfillmentStatus", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "OrderTimeline_orderId_createdAt_idx" ON "OrderTimeline"("orderId", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");`,
  `CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");`,
  `CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx" ON "OrderItem"("variantId");`,
  `CREATE INDEX IF NOT EXISTS "InventoryMovement_variantId_createdAt_idx" ON "InventoryMovement"("variantId", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "InventoryMovement_referenceType_referenceId_createdAt_idx" ON "InventoryMovement"("referenceType", "referenceId", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "InventoryMovement_movementType_createdAt_idx" ON "InventoryMovement"("movementType", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "Supplier_active_name_idx" ON "Supplier"("active", "name");`,
  `CREATE INDEX IF NOT EXISTS "FinancialCategory_direction_active_idx" ON "FinancialCategory"("direction", "active");`,
  `CREATE INDEX IF NOT EXISTS "FinancialEntry_occurredOn_direction_idx" ON "FinancialEntry"("occurredOn", "direction");`,
  `CREATE INDEX IF NOT EXISTS "FinancialEntry_categoryId_occurredOn_idx" ON "FinancialEntry"("categoryId", "occurredOn");`,
  `CREATE INDEX IF NOT EXISTS "FinancialEntry_entryType_status_idx" ON "FinancialEntry"("entryType", "status");`,
  `CREATE INDEX IF NOT EXISTS "AdminCalendarEvent_startsAt_endsAt_idx" ON "AdminCalendarEvent"("startsAt", "endsAt");`,
  `CREATE INDEX IF NOT EXISTS "AdminCalendarEvent_category_startsAt_idx" ON "AdminCalendarEvent"("category", "startsAt");`,
  `CREATE INDEX IF NOT EXISTS "AdminCalendarEvent_impactAvailability_startsAt_endsAt_idx" ON "AdminCalendarEvent"("impactAvailability", "startsAt", "endsAt");`,
  `CREATE INDEX IF NOT EXISTS "AdminCalendarEvent_serviceId_startsAt_idx" ON "AdminCalendarEvent"("serviceId", "startsAt");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");`,
  `CREATE INDEX IF NOT EXISTS "Payment_appointmentId_createdAt_idx" ON "Payment"("appointmentId", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "Payment_orderId_createdAt_idx" ON "Payment"("orderId", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "Payment_referenceType_referenceId_createdAt_idx" ON "Payment"("referenceType", "referenceId", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "Payment_purpose_createdAt_idx" ON "Payment"("purpose", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "IntegrationLog_paymentId_createdAt_idx" ON "IntegrationLog"("paymentId", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "IntegrationLog_provider_eventType_createdAt_idx" ON "IntegrationLog"("provider", "eventType", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "IntegrationLog_eventId_provider_idx" ON "IntegrationLog"("eventId", "provider");`,
  `CREATE INDEX IF NOT EXISTS "AdminSession_userId_expiresAt_idx" ON "AdminSession"("userId", "expiresAt");`,
  `CREATE INDEX IF NOT EXISTS "AdminSession_expiresAt_revokedAt_idx" ON "AdminSession"("expiresAt", "revokedAt");`,
  `CREATE INDEX IF NOT EXISTS "Promotion_active_status_startsAt_endsAt_idx" ON "Promotion"("active", "status", "startsAt", "endsAt");`,
  `CREATE INDEX IF NOT EXISTS "Promotion_highlightedOnHome_priority_idx" ON "Promotion"("highlightedOnHome", "priority");`,
  `CREATE INDEX IF NOT EXISTS "PromotionItem_promotionId_displayOrder_active_idx" ON "PromotionItem"("promotionId", "displayOrder", "active");`,
  `CREATE INDEX IF NOT EXISTS "PromotionItem_productId_idx" ON "PromotionItem"("productId");`,
  `CREATE INDEX IF NOT EXISTS "PromotionItem_serviceId_idx" ON "PromotionItem"("serviceId");`,
  `CREATE INDEX IF NOT EXISTS "PromotionBanner_promotionId_placement_displayOrder_active_idx" ON "PromotionBanner"("promotionId", "placement", "displayOrder", "active");`,
  `CREATE INDEX IF NOT EXISTS "PromotionBanner_placement_active_startsAt_endsAt_idx" ON "PromotionBanner"("placement", "active", "startsAt", "endsAt");`,
  `CREATE INDEX IF NOT EXISTS "ProductImage_productId_displayOrder_idx" ON "ProductImage"("productId", "displayOrder");`,
  `CREATE INDEX IF NOT EXISTS "ProductImage_productId_isPrimary_idx" ON "ProductImage"("productId", "isPrimary");`
];

function addColumnIfMissing(sqlite, table, column, definition) {
  const rows = sqlite.prepare(`PRAGMA table_info("${table}")`).all();
  if (!rows.some((row) => row.name === column)) {
    sqlite.exec(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition};`);
  }
}

loadEnvFile();

const databasePath = resolveSqliteDatabasePath();
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const sqlite = new Database(databasePath);

try {
  sqlite.exec("BEGIN");
  for (const statement of tableStatements) {
    sqlite.exec(statement);
  }
  addColumnIfMissing(sqlite, "Payment", "orderId", "TEXT");
  addColumnIfMissing(sqlite, "ProductVariant", "supplierId", "TEXT");
  addColumnIfMissing(sqlite, "ProductVariant", "costCents", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(sqlite, "ProductVariant", "minimumStock", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(sqlite, "InventoryMovement", "unitCostCents", "INTEGER");
  addColumnIfMissing(sqlite, "InventoryMovement", "totalCostCents", "INTEGER");
  addColumnIfMissing(sqlite, "InventoryMovement", "notes", "TEXT");
  addColumnIfMissing(sqlite, "InventoryMovement", "resultingStockQuantity", "INTEGER");
  addColumnIfMissing(sqlite, "PromotionBanner", "imagePath", "TEXT");
  addColumnIfMissing(sqlite, "PromotionBanner", "imageThumbUrl", "TEXT");
  addColumnIfMissing(sqlite, "PromotionBanner", "imageThumbPath", "TEXT");
  addColumnIfMissing(sqlite, "PromotionBanner", "imageAlt", "TEXT");
  addColumnIfMissing(sqlite, "PromotionBanner", "imageMimeType", "TEXT");
  addColumnIfMissing(sqlite, "PromotionBanner", "imageSizeBytes", "INTEGER");
  addColumnIfMissing(sqlite, "PromotionBanner", "imageWidth", "INTEGER");
  addColumnIfMissing(sqlite, "PromotionBanner", "imageHeight", "INTEGER");
  for (const statement of indexStatements) {
    sqlite.exec(statement);
  }
  sqlite.exec("COMMIT");
  console.log(`SQLite schema ensured at ${databasePath}`);
} catch (error) {
  sqlite.exec("ROLLBACK");
  throw error;
} finally {
  sqlite.close();
}
