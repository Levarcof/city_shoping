"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const STATUS_CONFIG = {
  placed: { label: 'Order Placed', step: 0 },
  confirmed: { label: 'Confirmed', step: 1 },
  delivered: { label: 'Delivered', step: 2 },
  cancelled: { label: 'Cancelled', step: -1 },
};

const PAYMENT_STATUS = {
  pending: { label: 'Pending', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
  paid: { label: 'Paid', bg: 'bg-[#16a34a]/10', border: 'border-[#16a34a]/25', text: 'text-[#16a34a]' },
  failed: { label: 'Failed', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
};

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const CopyIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CopyField = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-[#6b8570] text-sm shrink-0">{label}</span>
      <button
        onClick={handleCopy}
        className="group flex items-center gap-1.5 max-w-[65%] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/40 rounded-lg"
        title="Copy"
      >
        <span className="text-[11px] text-[#0f1f13] font-mono bg-[#f0f7f1] border border-[#e3ece4] px-2 py-1 rounded-lg truncate group-hover:border-[#16a34a]/40 transition-colors">
          {value}
        </span>
        <span className="shrink-0 text-[#9db6a2] group-hover:text-[#16a34a] transition-colors">
          {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
        </span>
      </button>
    </div>
  );
};

const OrderTracker = ({ status }) => {
  const isCancelled = status === 'cancelled';

  const steps = isCancelled
    ? [
        { key: 'placed', label: 'Placed', state: 'done' },
        { key: 'cancelled', label: 'Cancelled', state: 'cancelled' },
      ]
    : [
        { key: 'placed', label: 'Placed' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'delivered', label: 'Delivered' },
      ];

  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  const lineColor = isCancelled ? '#e11d48' : '#16a34a';
  const lineWidth = isCancelled ? 80 : (currentStep / 2) * 80;

  return (
    <div className="bg-white border border-[#e3ece4] rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,17,0.04)]">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-[#6b8570] uppercase tracking-widest font-bold">Order Progress</p>
        {isCancelled && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        )}
      </div>

      <div className="relative flex items-start justify-between">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#e3ece4] mx-[10%]" />
        <div
          className="absolute top-4 left-0 h-0.5 mx-[10%] transition-all duration-700 ease-out"
          style={{ width: `${lineWidth}%`, backgroundColor: lineColor }}
        />

        {steps.map((step, idx) => {
          const isCancelledStep = step.state === 'cancelled';
          const done = isCancelled ? true : idx <= currentStep;
          const active = isCancelled ? isCancelledStep : idx === currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500 ${
                  isCancelledStep
                    ? 'border-rose-500 bg-rose-500/15 ring-4 ring-rose-500/15'
                    : done
                    ? 'border-[#16a34a] bg-[#16a34a]/15'
                    : 'border-[#e3ece4] bg-[#f7faf7]'
                } ${active && !isCancelledStep ? 'ring-4 ring-[#16a34a]/15' : ''}`}
              >
                {isCancelledStep ? (
                  <XIcon className="w-3.5 h-3.5 text-rose-600" />
                ) : done ? (
                  <CheckIcon className="w-3.5 h-3.5 text-[#16a34a]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#e3ece4]" />
                )}
              </div>
              <p className={`text-[11px] font-bold text-center ${
                isCancelledStep ? 'text-rose-600' : done ? 'text-[#0f1f13]' : 'text-[#9db6a2]'
              }`}>{step.label}</p>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <p className="text-xs text-[#6b8570] mt-5 pt-4 border-t border-[#e3ece4] leading-relaxed">
          This order was cancelled and will not be processed further. If you were charged, any eligible refund will be credited back to your original payment method.
        </p>
      )}
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="bg-white border border-[#e3ece4] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,17,0.04)]">
    {title && (
      <div className="px-5 sm:px-6 py-3.5 border-b border-[#e3ece4] flex items-center gap-2">
        {icon}
        <p className="text-xs text-[#6b8570] uppercase tracking-widest font-bold">{title}</p>
      </div>
    )}
    <div className="p-5 sm:p-6">{children}</div>
  </div>
);

const DetailSkeleton = () => (
  <div className="min-h-screen bg-[#f7faf7]">
    <div className="sticky top-0 z-40 bg-[#f7faf7]/90 backdrop-blur-md border-b border-[#e3ece4] h-[73px]" />
    <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 animate-pulse">
      <div className="lg:col-span-2 space-y-4 sm:space-y-5">
        <div className="h-32 bg-white border border-[#e3ece4] rounded-2xl" />
        <div className="h-20 bg-white border border-[#e3ece4] rounded-2xl" />
        <div className="h-52 bg-white border border-[#e3ece4] rounded-2xl" />
      </div>
      <div className="space-y-4 sm:space-y-5">
        <div className="h-36 bg-white border border-[#e3ece4] rounded-2xl" />
        <div className="h-40 bg-white border border-[#e3ece4] rounded-2xl" />
      </div>
    </div>
  </div>
);

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
    setLoading(true);
    setError(null);
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

  if (loading) return <DetailSkeleton />;

  if (error || !order) return (
    <div className="min-h-screen bg-[#f7faf7] flex flex-col justify-center items-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white border border-[#e3ece4] flex items-center justify-center mb-2 shadow-[0_1px_2px_rgba(16,24,17,0.04)]">
        <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="font-bold text-[#0f1f13]">{error || 'Order not found'}</p>
      <button
        onClick={() => router.back()}
        className="px-5 py-2.5 rounded-xl bg-[#16a34a] text-white text-sm font-bold hover:bg-[#15803d] transition-colors shadow-[0_2px_8px_-2px_rgba(22,163,74,0.5)]"
      >
        Go back
      </button>
    </div>
  );

  const ps = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.pending;
  const itemTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shortId = String(order._id).slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#0f1f13] font-sans pb-28 selection:bg-[#16a34a]/20">
      <header className="sticky top-0 z-40 bg-[#f7faf7]/90 backdrop-blur-md border-b border-[#e3ece4]">
        <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-9 h-9 rounded-xl bg-white border border-[#e3ece4] flex items-center justify-center text-[#6b8570]
                       hover:text-[#0f1f13] hover:border-[#16a34a]/40 transition-colors shadow-[0_1px_2px_rgba(16,24,17,0.04)]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-lg sm:text-xl leading-none tracking-tight">Order Details</h1>
            <p className="text-xs text-[#6b8570] mt-1 truncate font-medium">#{shortId}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${ps.bg} ${ps.text} ${ps.border}`}>
            {ps.label}
          </div>
        </div>
      </header>

      <main className="max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">

        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <OrderTracker status={order.status} />

          <Section title="Shop">
            <div className="flex items-center gap-3">
              {order?.shop?.images ? (
                <img src={order.shop.images[0]} alt={order.shop.name} className="w-12 h-12 rounded-xl object-cover border border-[#e3ece4]" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#f0f7f1] border border-[#e3ece4] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#16a34a]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-[#0f1f13] text-[15px] truncate">{order.shop?.name || 'Unknown Shop'}</p>
                <p className="text-xs text-[#6b8570] mt-0.5">{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </Section>

          <Section title={`Items (${order.items.length})`}>
            <div className="space-y-4 sm:space-y-5 divide-y divide-[#eef4ef]">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(`/product/${String(item.itemId)}?shopId=${item.shop?._id}`)}
                  className={`flex items-center gap-3 sm:gap-4 cursor-pointer group ${idx > 0 ? 'pt-4 sm:pt-5' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl object-cover border border-[#e3ece4] group-hover:border-[#16a34a]/40 transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl bg-[#f0f7f1] border border-[#e3ece4] flex items-center justify-center group-hover:border-[#16a34a]/40 transition-colors">
                        <svg className="w-7 h-7 text-[#9db6a2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#16a34a] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                      {item.quantity}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0f1f13] text-sm group-hover:text-[#16a34a] transition-colors truncate">{item.name}</p>
                    <p className="text-xs text-[#6b8570] mt-0.5">&#8377;{item.price} &times; {item.quantity}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-[10px] text-[#16a34a]/80 font-semibold">View product</span>
                      <svg className="w-3 h-3 text-[#16a34a]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <p className="font-black text-[#0f1f13] text-[15px] flex-shrink-0">&#8377;{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </Section>

          {order.deliveryAddress && (
            <Section title="Delivery Address">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#0f1f13] font-semibold text-sm leading-relaxed">
                    {order.deliveryAddress.street}
                  </p>
                  <p className="text-[#6b8570] text-sm mt-0.5">
                    {order.deliveryAddress.city}{order.deliveryAddress.pincode ? ` — ${order.deliveryAddress.pincode}` : ''}
                  </p>
                </div>
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-4 sm:space-y-5 lg:sticky lg:top-24">
          <Section title="Bill Summary">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8570]">Item Total</span>
                <span className="text-[#0f1f13] font-semibold">&#8377;{itemTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8570]">Delivery Fee</span>
                <span className="text-[#16a34a] font-semibold">FREE</span>
              </div>
              <div className="h-px bg-[#e3ece4]" />
              <div className="flex justify-between items-center">
                <span className="font-black text-[#0f1f13]">
                  {order.status === 'cancelled' ? 'Total' : 'Total Paid'}
                </span>
                <span className="font-black text-[#16a34a] text-lg">&#8377;{order.totalAmount}</span>
              </div>
            </div>
          </Section>

          <Section title="Payment">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#6b8570] text-sm">Method</span>
                <div className="flex items-center gap-2">
                  {order.paymentMethod === 'cod' ? (
                    <>
                      <svg className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-[#0f1f13]">Cash on Delivery</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-sm font-semibold text-[#0f1f13]">Online Payment</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6b8570] text-sm">Payment Status</span>
                <span className={`text-sm font-bold ${ps.text}`}>{ps.label}</span>
              </div>
              {order.razorpayOrderId && (
                <CopyField label="Razorpay Order" value={order.razorpayOrderId} />
              )}
              {order.razorpayPaymentId && (
                <CopyField label="Payment ID" value={order.razorpayPaymentId} />
              )}
            </div>
          </Section>

          <div className="text-center pb-2">
            <p className="text-[10px] text-[#9db6a2] uppercase tracking-widest font-bold">Order ID</p>
            <p className="text-[#9db6a2] text-xs font-mono mt-1 break-all">{order._id}</p>
          </div>
        </div>
      </main>
    </div>
  );
}