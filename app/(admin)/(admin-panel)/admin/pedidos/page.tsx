import { FilterBar } from "@/components/admin/filter-bar";
import { OrderDetailDrawer } from "@/components/admin/order-detail-drawer";
import { DataTable } from "@/components/data-display/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { OperationalStatusPill } from "@/components/status/operational-status-pill";
import { PaymentStatusPill } from "@/components/status/payment-status-pill";
import { MetricCard } from "@/components/admin/metric-card";
import { inventoryStateLabels } from "@/domains/orders/constants";
import { getCommerceOrderDetail, listCommerceAdminOrders } from "@/domains/orders/queries";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listCommerceAdminOrders();
  const orderDetails = await Promise.all(orders.map((order) => getCommerceOrderDetail(order.id)));
  const detailsById = new Map(orderDetails.filter(Boolean).map((detail) => [detail!.order.id, detail!]));
  const pendingOrders = orders.filter((order) => order.paymentStatus === "pending").length;
  const reservedOrders = orders.filter((order) => order.inventoryState === "reserved").length;
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid").length;
  const totalCents = orders.reduce((sum, order) => sum + order.totalCents, 0);

  const headers = ["Pedido", "Cliente", "Total", "Status", "Pagamento", "Separação", "Estoque", "Ação"];
  const rows = orders.map((order) => [
    <div key={`${order.id}-id`}>
      <p className="font-semibold text-ink-900">{order.orderNumber}</p>
      <p className="text-xs text-stone-500">{order.itemCount} itens</p>
    </div>,
    <p key={`${order.id}-customer`} className="text-sm text-stone-500">
      {order.customerName}
    </p>,
    <p key={`${order.id}-total`} className="font-semibold text-ink-900">
      {order.totalLabel}
    </p>,
    <OperationalStatusPill key={`${order.id}-status`} status={order.status} />,
    <PaymentStatusPill key={`${order.id}-payment`} status={order.paymentStatus} />,
    <OperationalStatusPill key={`${order.id}-fulfillment`} status={order.fulfillmentStatus} />,
    <p key={`${order.id}-inventory`} className="text-sm font-medium text-stone-500">
      {inventoryStateLabels[order.inventoryState]}
    </p>,
    detailsById.get(order.id) ? (
      <OrderDetailDrawer key={`${order.id}-action`} detail={detailsById.get(order.id)!} />
    ) : (
      <span key={`${order.id}-empty`} className="text-sm text-stone-500">
        Sem detalhe
      </span>
    )
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Pedidos</p>
        <h1 className="page-title">Pedidos da loja, do pagamento à entrega.</h1>
        <p className="text-sm text-stone-500">Acompanhe cada pedido em um lugar só: pagamento, separação, estoque e status. O que mudar aqui reflete no site na hora.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard item={{ label: "Total de pedidos", value: String(orders.length), helper: "Pedidos reais registrados na loja.", tone: "neutral" }} />
        <MetricCard item={{ label: "Aguardando pagamento", value: String(pendingOrders), helper: "Pedidos ainda sem confirmação de pagamento.", tone: "warning" }} />
        <MetricCard item={{ label: "Pedidos pagos", value: String(paidOrders), helper: "Pedidos com pagamento confirmado.", tone: "success" }} />
        <MetricCard item={{ label: "Valor em pedidos", value: `R$ ${(totalCents / 100).toFixed(2).replace(".", ",")}`, helper: `${reservedOrders} com estoque reservado.`, tone: "neutral" }} />
      </div>
      <FilterBar placeholder="Buscar por pedido ou cliente" primaryFilterLabel="Status do pedido" />

      {orders.length === 0 ? (
        <EmptyState
          title="Nenhum pedido ainda"
          description="Quando uma compra for finalizada no checkout, o pedido aparece aqui com cliente, pagamento, separação e estoque."
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <DataTable headers={headers} rows={rows} />
          </div>

          <div className="grid gap-4 lg:hidden">
            {orders.map((order) => {
              const detail = detailsById.get(order.id);

              return (
                <article key={order.id} className="surface-default space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{order.orderNumber}</p>
                      <p className="text-xs text-stone-500">{order.customerName}</p>
                    </div>
                    <PaymentStatusPill status={order.paymentStatus} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <OperationalStatusPill status={order.status} />
                    <OperationalStatusPill status={order.fulfillmentStatus} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-stone-500">Total</span>
                      <span className="font-semibold text-ink-900">{order.totalLabel}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-stone-500">Estoque</span>
                      <span className="font-medium text-ink-900">{inventoryStateLabels[order.inventoryState]}</span>
                    </div>
                  </div>
                  {detail ? <OrderDetailDrawer detail={detail} /> : null}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
