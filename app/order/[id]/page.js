"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

/* ─── Status config ─── */
const STATUS_CONFIG = {
  placed: { label: 'Order Placed', color: '#3b82f6', step: 0 },
  confirmed: { label: 'Confirmed', color: '#f59e0b', step: 1 },
  delivered: { label: 'Delivered', color: '#22c55e', step: 2 },
  cancelled: { label: 'Cancelled', color: '#ef4444', step: -1 },
};

const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'bg-amber-400/10', border: 'border-amber-400/20', text: 'text-amber-400' },
  paid: { label: 'Paid', color: '#22c55e', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/20', text: 'text-[#22c55e]' },
  failed: { label: 'Failed', color: '#ef4444', bg: 'bg-red-400/10', border: 'border-red-400/20', text: 'text-red-400' },
};

/* ─── Order Progress Tracker ─── */
const OrderTracker = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-red-400">Order Cancelled</p>
          <p className="text-xs text-red-400/60 mt-0.5">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'placed', label: 'Placed', icon: '📋' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
  ];
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;

  return (
    <div className="bg-[#0f1a12] border border-[#1a2e1e] rounded-2xl p-5">
      <p className="text-xs text-[#4a6650] uppercase tracking-widest font-bold mb-5">Order Progress</p>
      <div className="relative flex items-start justify-between">
        {/* connecting line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#1a2e1e] mx-[10%]" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-[#22c55e] mx-[10%] transition-all duration-700 ease-out"
          style={{ width: `${(currentStep / 2) * 80}%` }}
        />

        {steps.map((step, idx) => {
          const done = idx <= currentStep;
          const active = idx === currentStep;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500
                  ${done ? 'border-[#22c55e] bg-[#22c55e]/20' : 'border-[#1a2e1e] bg-[#080e09]'}
                  ${active ? 'ring-4 ring-[#22c55e]/20' : ''}`}
              >
                {done ? (
                  idx < currentStep ? (
                    <svg className="w-3.5 h-3.5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`w-2 h-2 rounded-full bg-[#22c55e] ${active ? 'animate-pulse' : ''}`} />
                  )
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#1a2e1e]" />
                )}
              </div>
              <p className={`text-[11px] font-bold text-center ${done ? 'text-white' : 'text-[#4a6650]'}`}>{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Section wrapper ─── */
const Section = ({ title, children }) => (
  <div className="bg-[#0f1a12] border border-[#1a2e1e] rounded-2xl overflow-hidden">
    {title && (
      <div className="px-5 py-3.5 border-b border-[#1a2e1e]">
        <p className="text-xs text-[#4a6650] uppercase tracking-widest font-bold">{title}</p>
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

/* ─── Main Page ─── */
export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
      else setError(data.message || 'Order not found');
    } catch (e) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080e09] flex flex-col justify-center items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-[#22c55e]/20 border-t-[#22c55e] animate-spin" />
      <p className="text-[#4a6650] text-sm">Loading order details…</p>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-[#080e09] flex flex-col justify-center items-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#0f1a12] border border-[#1a2e1e] flex items-center justify-center mb-2">
        <svg className="w-8 h-8 text-red-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="font-bold text-white">{error || 'Order not found'}</p>
      <button onClick={() => router.back()} className="text-sm text-[#22c55e] underline underline-offset-2">Go back</button>
    </div>
  );

  const ps = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.pending;

  return (
    <div className="min-h-screen bg-[#080e09] text-white font-sans pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#080e09]/90 backdrop-blur-md border-b border-[#1a2e1e]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-[#0f1a12] border border-[#1a2e1e] flex items-center justify-center text-[#4a6650] hover:text-white hover:border-[#22c55e]/40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-lg leading-none">Order Details</h1>
            <p className="text-xs text-[#4a6650] mt-0.5 truncate">#{order._id}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${ps.bg} ${ps.text} ${ps.border}`}>
            {ps.label}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-5 space-y-4">

        {/* Order Tracker */}
        <OrderTracker status={order.status} />

        {/* Shop Info */}
        <Section title="Shop">
          <div className="flex items-center gap-3">
            {order.shop?.image ? (
              <img src={order.shop.image} alt={order.shop.name} className="w-12 h-12 rounded-xl object-cover border border-[#1e3022]" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#1a2e1e] border border-[#1e3022] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#22c55e]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div>
              <p className="font-bold text-white text-[15px]">{order.shop?.name || 'Unknown Shop'}</p>
              <p className="text-xs text-[#4a6650] mt-0.5">{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </Section>

        {/* Items */}
        <Section title={`Items (${order.items.length})`}>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
               console.log("shop id:", item.shop?._id);
                  router.push(`/product/${String(item.itemId)}?shopId=${item.shop?._id}`)
                }}
                className="flex items-center gap-4 cursor-pointer group"
              >
                <div className="relative flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[72px] h-[72px] rounded-xl object-cover border border-[#1e3022] group-hover:border-[#22c55e]/40 transition-colors"
                    />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-xl bg-[#1a2e1e] border border-[#1e3022] flex items-center justify-center group-hover:border-[#22c55e]/40 transition-colors">
                      <svg className="w-7 h-7 text-[#4a6650]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#22c55e] text-black text-[10px] font-black flex items-center justify-center">
                    {item.quantity}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm group-hover:text-[#22c55e] transition-colors truncate">{item.name}</p>
                  <p className="text-xs text-[#4a6650] mt-0.5">₹{item.price} × {item.quantity}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-[#22c55e]/60 font-medium">View product</span>
                    <svg className="w-3 h-3 text-[#22c55e]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <p className="font-black text-white text-[15px] flex-shrink-0">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Bill Summary */}
        <Section title="Bill Summary">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#4a6650]">Item Total</span>
              <span className="text-white font-semibold">₹{order.items.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#4a6650]">Delivery Fee</span>
              <span className="text-[#22c55e] font-semibold">FREE</span>
            </div>
            <div className="h-px bg-[#1a2e1e]" />
            <div className="flex justify-between">
              <span className="font-black text-white">Total Paid</span>
              <span className="font-black text-[#22c55e] text-lg">₹{order.totalAmount}</span>
            </div>
          </div>
        </Section>

        {/* Payment Info */}
        <Section title="Payment">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#4a6650] text-sm">Method</span>
              <div className="flex items-center gap-2">
                {order.paymentMethod === 'cod' ? (
                  <>
                    <svg className="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Cash on Delivery</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Online Payment</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#4a6650] text-sm">Payment Status</span>
              <span className={`text-sm font-bold ${ps.text}`}>{ps.label}</span>
            </div>
            {order.razorpayOrderId && (
              <div className="flex justify-between items-start">
                <span className="text-[#4a6650] text-sm">Razorpay Order</span>
                <span className="text-xs text-white font-mono bg-[#1a2e1e] px-2 py-1 rounded-lg max-w-[60%] truncate">{order.razorpayOrderId}</span>
              </div>
            )}
            {order.razorpayPaymentId && (
              <div className="flex justify-between items-start">
                <span className="text-[#4a6650] text-sm">Payment ID</span>
                <span className="text-xs text-white font-mono bg-[#1a2e1e] px-2 py-1 rounded-lg max-w-[60%] truncate">{order.razorpayPaymentId}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <Section title="Delivery Address">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-relaxed">
                  {order.deliveryAddress.street}
                </p>
                <p className="text-[#4a6650] text-sm mt-0.5">
                  {order.deliveryAddress.city}{order.deliveryAddress.pincode ? ` — ${order.deliveryAddress.pincode}` : ''}
                </p>
              </div>
            </div>
          </Section>
        )}

        {/* Order ID */}
        <div className="text-center pb-4">
          <p className="text-[10px] text-[#2a3e2e] uppercase tracking-widest font-bold">Order ID</p>
          <p className="text-[#2a3e2e] text-xs font-mono mt-1">{order._id}</p>
        </div>
      </main>
    </div>
  );
}