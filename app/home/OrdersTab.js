"use client";
import { useEffect, useState } from "react";
import OrderDetail from "./Orderdetail";

const STATUS_STYLES = {
  pending: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-400", label: "Pending" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", dot: "bg-blue-400", label: "Confirmed" },
  preparing: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", dot: "bg-violet-400", label: "Preparing" },
  ready: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200", dot: "bg-cyan-400", label: "Ready" },
  delivered: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", dot: "bg-green-400", label: "Delivered" },
  cancelled: { bg: "bg-red-50", text: "text-red-500", border: "border-red-100", dot: "bg-red-400", label: "Cancelled" },
};

// NOTE: onClick + cursor-pointer added so the card is clickable
function OrderCard({ order, onClick }) {
  const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
  const date = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-green-200 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-black text-gray-900">#{order._id?.slice(-6).toUpperCase()}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{date}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${s.bg} ${s.text} ${s.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2.5 py-3 border-t border-b border-gray-50 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#00B259] flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
          {order.customer?.name?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{order.customer?.name || "Customer"}</p>
          <p className="text-[10px] text-gray-400 truncate">{order.customer?.phone || ""}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm font-black text-[#00B259]">₹{order.total || 0}</p>
          <p className="text-[10px] text-gray-400">{order.items?.length || 0} items</p>
        </div>
      </div>

      {/* Items preview */}
      {order.items?.slice(0, 2).map((item, idx) => (
        <div key={idx} className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
          <span className="truncate max-w-[60%]">{item.name}</span>
          <span className="font-semibold text-gray-700">×{item.qty} · ₹{item.price * item.qty}</span>
        </div>
      ))}
      {(order.items?.length || 0) > 2 && (
        <p className="text-[10px] text-gray-400 mt-1">+{order.items.length - 2} more items</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function OrdersTab({ shopId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  // NEW: which order is currently open in detail view (null = list view)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const SELECTED_ORDER_KEY = "owner_selected_order";

  useEffect(() => {
    console.log("shopId:", shopId);
    if (!shopId) return;
    fetch(`/api/orders/shop/${shopId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;

        const fetchedOrders = d.orders || [];

        setOrders(fetchedOrders);

        const savedId = localStorage.getItem(SELECTED_ORDER_KEY);

        if (savedId) {
          const foundOrder = fetchedOrders.find(
            (o) => o._id === savedId
          );

          if (foundOrder) {
            setSelectedOrder(foundOrder);
          } else {
            localStorage.removeItem(SELECTED_ORDER_KEY);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shopId]);

  const FILTERS = ["all", "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // NEW: called by OrderDetail after a successful status / payment status update
  // keeps the list in sync without needing to refetch everything
  const handleOrderUpdated = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o
      )
    );

    setSelectedOrder(updatedOrder);

    localStorage.setItem(SELECTED_ORDER_KEY, updatedOrder._id);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#00B259] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // NEW: when an order is selected, show the detail view instead of the list
  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null);
          localStorage.removeItem(SELECTED_ORDER_KEY);
        }}
        onUpdated={handleOrderUpdated}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-gray-900">Orders</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">{orders.length} total orders received</p>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map((f) => {
          const s = STATUS_STYLES[f];
          const count = f === "all" ? orders.length : orders.filter((o) => o.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border
                ${filter === f
                  ? f === "all"
                    ? "bg-[#00B259] text-white border-[#00B259]"
                    : `${s.bg} ${s.text} ${s.border}`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
            >
              {f === "all" ? "All" : STATUS_STYLES[f].label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                ${filter === f ? (f === "all" ? "bg-white/20 text-white" : "bg-white/60") : "bg-gray-100 text-gray-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl bg-white">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
            </svg>
          </div>
          <p className="text-gray-500 font-bold text-sm">No orders yet</p>
          <p className="text-gray-400 text-xs mt-1">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onClick={() => {
                setSelectedOrder(order);
                localStorage.setItem(SELECTED_ORDER_KEY, order._id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}