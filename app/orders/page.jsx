"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ----------------------------- Status config ---------------------------- */
const STATUS_CONFIG = {
  placed:    { label: 'Order Placed', dot: '#3b82f6', text: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   step: 0 },
  confirmed: { label: 'Confirmed',    dot: '#d97706', text: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  step: 1 },
  delivered: { label: 'Delivered',    dot: '#16a34a', text: 'text-[#16a34a]',  bg: 'bg-[#16a34a]/10', border: 'border-[#16a34a]/25', step: 2 },
  cancelled: { label: 'Cancelled',    dot: '#e11d48', text: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200',   step: -1 },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border whitespace-nowrap ${c.bg} ${c.text} ${c.border}`}>
      <span className="relative flex w-1.5 h-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ backgroundColor: c.dot }} />
        <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ backgroundColor: c.dot }} />
      </span>
      {c.label}
    </span>
  );
};

/* ------------------------------ Order card ------------------------------ */
const OrderCard = ({ order, onClick }) => {
  const itemPreview = order.items.slice(0, 4);
  const extraCount = order.items.length - 4;
  const shortId = order._id ? `#${String(order._id).slice(-8).toUpperCase()}` : 'Unknown';

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white border border-[#e3ece4] rounded-2xl p-4 sm:p-5
                 hover:border-[#16a34a]/40 hover:bg-[#fafdfa] transition-all duration-200
                 active:scale-[0.99] shadow-[0_1px_2px_rgba(16,24,17,0.04)]
                 hover:shadow-[0_8px_24px_-8px_rgba(22,163,74,0.18)]
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/40"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-[#0f1f13] text-sm sm:text-[15px] font-bold tracking-tight truncate">{shortId}</h3>
          <p className="text-[11px] sm:text-xs text-[#6b8570] mt-1 font-medium">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} &middot; {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Item Images Preview */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2.5 sm:space-x-0 sm:gap-2">
          {itemPreview.map((item, idx) => (
            <div key={idx} className="relative ring-2 ring-white sm:ring-0 rounded-xl">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-[#e3ece4]" />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#f0f7f1] border border-[#e3ece4] flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#9db6a2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          {extraCount > 0 && (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#f0f7f1] border border-[#e3ece4] flex items-center justify-center ring-2 ring-white sm:ring-0">
              <span className="text-xs font-bold text-[#16a34a]">+{extraCount}</span>
            </div>
          )}
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-[10px] text-[#6b8570] uppercase tracking-widest font-semibold">Total</p>
          <p className="text-lg sm:text-xl font-black text-[#0f1f13] tabular-nums">&#8377;{order.totalAmount}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-[#e3ece4]">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: order.paymentStatus === 'paid' ? '#16a34a' : order.paymentStatus === 'failed' ? '#e11d48' : '#d97706' }}
          />
          <span className="text-[11px] sm:text-xs text-[#6b8570] font-medium truncate">
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'} &middot; {order.paymentStatus}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#16a34a] text-xs font-semibold shrink-0 group-hover:gap-2 transition-all">
          <span className="hidden sm:inline">View details</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

/* ------------------------------ Skeleton --------------------------------- */
const OrderCardSkeleton = () => (
  <div className="bg-white border border-[#e3ece4] rounded-2xl p-4 sm:p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-[#eef4ef] rounded" />
        <div className="h-3 w-32 bg-[#eef4ef] rounded" />
      </div>
      <div className="h-6 w-20 bg-[#eef4ef] rounded-full" />
    </div>
    <div className="flex items-center gap-2 mb-4">
      <div className="w-14 h-14 bg-[#eef4ef] rounded-xl" />
      <div className="w-14 h-14 bg-[#eef4ef] rounded-xl" />
      <div className="w-14 h-14 bg-[#eef4ef] rounded-xl" />
      <div className="ml-auto h-6 w-16 bg-[#eef4ef] rounded" />
    </div>
    <div className="h-4 w-40 bg-[#eef4ef] rounded mt-3.5" />
  </div>
);

/* -------------------------------- Page ----------------------------------- */
export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/orders/my');
      const data = await res.json();
      if (data.success) setOrders(data.orders);
      else setError(true);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const totalSpend = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#0f1f13] font-sans pb-24 selection:bg-[#16a34a]/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#f7faf7]/90 backdrop-blur-md border-b border-[#e3ece4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
          <div className="min-w-0">
            <h1 className="font-black text-xl sm:text-2xl leading-none tracking-tight text-[#0f1f13]">My Orders</h1>
            <p className="text-xs sm:text-sm text-[#6b8570] mt-1.5 font-medium">
              {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
            </p>
          </div>

          {!loading && orders.length > 0 && (
            <div className="ml-auto flex items-center gap-2 text-right">
              <div className="px-3.5 py-2 rounded-xl bg-white border border-[#e3ece4] shadow-[0_1px_2px_rgba(16,24,17,0.04)]">
                <p className="text-[10px] text-[#6b8570] uppercase tracking-widest font-semibold">Total spent</p>
                <p className="text-sm font-black text-[#16a34a] tabular-nums">&#8377;{totalSpend.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {filters.map(f => {
            const count = f.key === 'all' ? orders.length : (counts[f.key] || 0);
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/40 ${
                  active
                    ? 'bg-[#16a34a] text-white border-[#16a34a] shadow-[0_2px_8px_-2px_rgba(22,163,74,0.5)]'
                    : 'bg-white border-[#e3ece4] text-[#6b8570] hover:border-[#16a34a]/30 hover:text-[#0f1f13]'
                }`}
              >
                {f.label}
                {!loading && count > 0 && (
                  <span className={`text-[10px] font-semibold ${active ? 'text-white/70' : 'text-[#9db6a2]'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-5">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white border border-[#e3ece4] flex items-center justify-center mb-5 shadow-[0_1px_2px_rgba(16,24,17,0.04)]">
              <svg className="w-9 h-9 text-rose-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold text-[#0f1f13] text-lg mb-1">Couldn't load your orders</p>
            <p className="text-[#6b8570] text-sm max-w-xs mb-5">Something went wrong while fetching your orders. Please try again.</p>
            <button
              onClick={fetchOrders}
              className="px-5 py-2.5 rounded-xl bg-[#16a34a] text-white text-sm font-bold hover:bg-[#15803d] transition-colors shadow-[0_2px_8px_-2px_rgba(22,163,74,0.5)]"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white border border-[#e3ece4] flex items-center justify-center mb-5 shadow-[0_1px_2px_rgba(16,24,17,0.04)]">
              <svg className="w-9 h-9 text-[#16a34a]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-bold text-[#0f1f13] text-lg mb-1">{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</p>
            <p className="text-[#6b8570] text-sm max-w-xs">
              {filter === 'all' ? 'Start exploring shops and place your first order.' : `You have no orders with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filtered.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={() => router.push(`/order/${order._id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}