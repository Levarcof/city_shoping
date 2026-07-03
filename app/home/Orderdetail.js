"use client";
import { useState } from "react";

const STATUS_STYLES = {
  pending:    { bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-200",  dot: "bg-amber-400",  label: "Pending"    },
  confirmed:  { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200",   dot: "bg-blue-400",   label: "Confirmed"  },
  preparing:  { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", dot: "bg-violet-400", label: "Preparing"  },
  ready:      { bg: "bg-cyan-50",   text: "text-cyan-600",   border: "border-cyan-200",   dot: "bg-cyan-400",   label: "Ready"      },
  delivered:  { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200",  dot: "bg-green-400",  label: "Delivered"  },
  cancelled:  { bg: "bg-red-50",    text: "text-red-500",    border: "border-red-100",    dot: "bg-red-400",    label: "Cancelled"  },
};

const PAYMENT_STYLES = {
  paid:     { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", label: "Paid"     },
  pending:  { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", label: "Pending"  },
  failed:   { bg: "bg-red-50",   text: "text-red-500",   border: "border-red-100",   label: "Failed"   },
  refunded: { bg: "bg-gray-50",  text: "text-gray-500",  border: "border-gray-200",  label: "Refunded" },
};

const STATUS_OPTIONS  = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
const PAYMENT_OPTIONS = ["pending", "paid", "failed", "refunded"];

export default function OrderDetail({ order, onBack, onUpdated }) {
  const [savingField, setSavingField] = useState(null); 
  const [error, setError] = useState("");

  const s  = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
  const ps = PAYMENT_STYLES[order.paymentStatus] || PAYMENT_STYLES.pending;

  const date = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const itemsTotal = (order.items || []).reduce((sum, it) => sum + it.price * it.qty, 0);
  const deliveryFee = order.deliveryFee || 0;

  const updateOrder = async (field, value) => {
    setError("");
    setSavingField(field);
    try {
      const res = await fetch(`/api/update/order/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Update failed");
      onUpdated(data.order); 
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while updating the order");
    } finally {
      setSavingField(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="text-sm font-black text-gray-900">Order #{order._id?.slice(-6).toUpperCase()}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{date}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-semibold px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status + Payment editable cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Order status */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Order Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border mb-3 ${s.bg} ${s.text} ${s.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </span>
              <select
                value={order.status}
                disabled={savingField === "status"}
                onChange={(e) => updateOrder("status", e.target.value)}
                className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#00B259] disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{STATUS_STYLES[opt].label}</option>
                ))}
              </select>
              {savingField === "status" && <p className="text-[10px] text-gray-400 mt-1.5">Updating…</p>}
            </div>

            {/* Payment status */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Payment Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border mb-3 ${ps.bg} ${ps.text} ${ps.border}`}>
                {ps.label}
              </span>
              <select
                value={order.paymentStatus}
                disabled={savingField === "paymentStatus"}
                onChange={(e) => updateOrder("paymentStatus", e.target.value)}
                className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#00B259] disabled:opacity-50"
              >
                {PAYMENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{PAYMENT_STYLES[opt].label}</option>
                ))}
              </select>
              {savingField === "paymentStatus" && <p className="text-[10px] text-gray-400 mt-1.5">Updating…</p>}
              <p className="text-[10px] text-gray-400 mt-2">
                Method: <span className="font-bold text-gray-600">{order.paymentMethod || "N/A"}</span>
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
              Items ({order.items?.length || 0})
            </p>
            <div className="space-y-3">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] font-bold">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">₹{item.price} × {item.qty}</p>
                  </div>
                  <p className="text-xs font-black text-gray-900 flex-shrink-0">₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: customer, address, bill summary */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Customer</p>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#00B259] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                {order.customer?.name?.[0]?.toUpperCase() || "C"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{order.customer?.name || "Customer"}</p>
                <p className="text-[10px] text-gray-400 truncate">{order.customer?.phone || ""}</p>
              </div>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 mt-4">Delivery Address</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {order?.deliveryAddress?.city || order.customer?.address || "No address provided"}
            </p>
          </div>

          {/* Bill summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Bill Summary</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Items total</span>
                <span className="font-bold text-gray-700">₹{itemsTotal}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Delivery fee</span>
                  <span className="font-bold text-gray-700">₹{deliveryFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm pt-2 mt-1.5 border-t border-gray-100">
                <span className="font-black text-gray-900">Total</span>
                <span className="font-black text-[#00B259]">₹{itemsTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}