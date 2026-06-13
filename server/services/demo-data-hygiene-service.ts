import { db } from "@/server/db/client";

export const LEGACY_DEMO_APPOINTMENT_IDS = ["APT-1042", "APT-1043", "APT-1044"];
export const LEGACY_DEMO_CUSTOMER_IDS = ["cust-marina", "cust-lucas", "cust-renata"];
export const LEGACY_DEMO_PET_IDS = ["pet-thor", "pet-maya", "pet-pingo"];
export const LEGACY_DEMO_CALENDAR_BLOCK_IDS = ["block-1", "block-2"];
export const LEGACY_DEMO_CART_IDS = ["CART-DEMO"];
export const LEGACY_DEMO_CART_KEYS = ["demo-cart"];
export const LEGACY_DEMO_ORDER_IDS = ["ORDER-01", "ORDER-02"];
export const LEGACY_DEMO_ORDER_NUMBERS = ["PED-3001", "PED-3002"];
export const LEGACY_DEMO_INVENTORY_MOVEMENT_IDS = ["INV-01", "INV-02"];
export const LEGACY_DEMO_PRODUCT_IDS = ["PROD-01", "PROD-02", "PROD-03"];
export const LEGACY_DEMO_VARIANT_IDS = ["VAR-01", "VAR-02", "VAR-03"];
export const LEGACY_DEMO_COUPON_IDS = ["CPN-LAIKAO10"];
export const LEGACY_DEMO_COUPON_CODES = ["LAIKAO10"];
export const LEGACY_DEMO_PROMOTION_IDS = ["promo-boasvindas"];
export const LEGACY_DEMO_PROMOTION_BANNER_IDS = ["promobn-boasvindas"];

declare global {
  // eslint-disable-next-line no-var
  var __laikaoDemoDataCleanupPromise: Promise<void> | undefined;
}

async function cleanup() {
  const prisma = db as any;

  await db.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: {
        OR: [
          { appointmentId: { in: LEGACY_DEMO_APPOINTMENT_IDS } },
          { orderId: { in: LEGACY_DEMO_ORDER_IDS } },
          { referenceId: { in: [...LEGACY_DEMO_APPOINTMENT_IDS, ...LEGACY_DEMO_ORDER_IDS] } }
        ]
      }
    });

    await tx.appointment.deleteMany({ where: { id: { in: LEGACY_DEMO_APPOINTMENT_IDS } } });
    await tx.calendarBlock.deleteMany({ where: { id: { in: LEGACY_DEMO_CALENDAR_BLOCK_IDS } } });
    await tx.inventoryMovement.deleteMany({ where: { id: { in: LEGACY_DEMO_INVENTORY_MOVEMENT_IDS } } });
    await tx.order.deleteMany({
      where: {
        OR: [{ id: { in: LEGACY_DEMO_ORDER_IDS } }, { orderNumber: { in: LEGACY_DEMO_ORDER_NUMBERS } }]
      }
    });
    await tx.cart.deleteMany({
      where: {
        OR: [{ id: { in: LEGACY_DEMO_CART_IDS } }, { cartKey: { in: LEGACY_DEMO_CART_KEYS } }]
      }
    });
    await tx.coupon.deleteMany({
      where: {
        OR: [{ id: { in: LEGACY_DEMO_COUPON_IDS } }, { code: { in: LEGACY_DEMO_COUPON_CODES } }]
      }
    });
    for (const productId of LEGACY_DEMO_PRODUCT_IDS) {
      const [cartItems, orderItems, inventoryMoves] = await Promise.all([
        tx.cartItem.count({ where: { productId } }),
        tx.orderItem.count({ where: { productId } }),
        tx.inventoryMovement.count({ where: { productId } })
      ]);

      if (cartItems + orderItems + inventoryMoves === 0) {
        await tx.product.deleteMany({ where: { id: productId } });
      }
    }
    await tx.pet.deleteMany({ where: { id: { in: LEGACY_DEMO_PET_IDS } } });
    await tx.customer.deleteMany({ where: { id: { in: LEGACY_DEMO_CUSTOMER_IDS } } });
  });

  await prisma.promotion.deleteMany({ where: { id: { in: LEGACY_DEMO_PROMOTION_IDS } } });
}

export async function cleanupLegacyDemoData() {
  if (!global.__laikaoDemoDataCleanupPromise) {
    global.__laikaoDemoDataCleanupPromise = cleanup();
  }

  await global.__laikaoDemoDataCleanupPromise;
}
