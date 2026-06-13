import { formatCurrency } from "@/lib/formatters";
import { CartView } from "@/domains/orders/types";
import {
  getCartRecordByKey,
  listAdminOrderRows,
  listInventoryMovementRecords,
  listOrderRecords
} from "@/server/repositories/commerce-repository";
import { validateCartStock } from "@/domains/orders/policies";
import { getOrderDetailByIdWithRelations } from "@/server/repositories/order-repository";

export async function getCartView(cartKey: string) {
  const cart = await getCartRecordByKey(cartKey);
  if (!cart) {
    return null;
  }

  const issues = validateCartStock(cart).issues;

  return {
    ...cart,
    subtotalLabel: formatCurrency(cart.subtotalCents / 100),
    discountLabel: formatCurrency(cart.discountCents / 100),
    totalLabel: formatCurrency(cart.totalCents / 100),
    issues,
    hasPriceChanges: cart.items.some((item) => item.priceChanged),
    hasStockIssues: cart.items.some((item) => item.availableQuantity < item.quantity)
  } satisfies CartView;
}

export async function getCheckoutPreview(cartKey: string) {
  const cart = await getCartView(cartKey);
  if (!cart) {
    return null;
  }

  const stockValidation = validateCartStock(cart);

  return {
    cart,
    readiness: {
      canCheckout: cart.items.length > 0 && stockValidation.valid,
      issues: [
        ...(cart.items.length === 0 ? ["Carrinho vazio."] : []),
        ...stockValidation.issues
      ]
    }
  };
}

export async function listCommerceAdminOrders() {
  return listAdminOrderRows();
}

export async function getCommerceOrderDetail(id: string) {
  return getOrderDetailByIdWithRelations(id);
}

export async function getCommerceInventorySnapshot() {
  const [orders, movements] = await Promise.all([listOrderRecords(), listInventoryMovementRecords()]);

  const pendingOrders = orders.filter((order) => order.paymentStatus === "pending").length;
  const reservedUnits = movements
    .filter((movement: (typeof movements)[number]) => movement.movementType === "reserve")
    .reduce((total: number, movement: (typeof movements)[number]) => total + movement.quantity, 0);

  return {
    pendingOrders,
    reservedUnits,
    movementCount: movements.length
  };
}
