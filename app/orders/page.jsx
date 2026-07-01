"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const StatusBadge = ({ status }) => {
  const config = {
    placed:    { label: 'Order Placed',  dot: 'bg-blue-400',   text: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20' },
    confirmed: { label: 'Confirmed',     dot: 'bg-amber-400',  text: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20' },
    delivered: { label: 'Delivered',     dot: 'bg-[#22c55e]',  text: 'text-[#22c55e]',  bg: 'bg-[#22c55e]/10',  border: 'border-[#22c55e]/20' },
    cancelled: { label: 'Cancelled',     dot: 'bg-red-400',    text: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20' },
  };
  const c = config[status] || config.placed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {c.label}
    </span>
  );
};

const OrderCard = ({ order, onClick }) => {
  const itemPreview = order.items.slice(0, 3);
  const extraCount = order.items.length - 3;

  return (
    <div
      onClick={onClick}
      className="group bg-[#0f1a12] border border-[#1a2e1e] rounded-2xl p-5 cursor-pointer
                 hover:border-[#22c55e]/40 hover:bg-[#111d14] transition-all duration-200
                 active:scale-[0.99] shadow-sm hover:shadow-[0_0_0_1px_rgba(34,197,94,0.1)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* {order.shop?.image ? (
            <img
              src={order.shop.image}
              alt={order.shop.name}
              className="w-11 h-11 rounded-xl object-cover border border-[#1e3022]"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-[#1a2e1e] border border-[#1e3022] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#22c55e]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )} */}
          <div>
            <h3 className=" text-white text-[10px] md:text-[15px] leading-tight">{order._id|| 'Unknown Shop'}</h3>
            <p className="text-xs text-[#4a6650] mt-0.5">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Item Images Preview */}
      <div className="flex items-center gap-2 mb-4">
        {itemPreview.map((item, idx) => (
          <div key={idx} className="relative">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-[#1e3022]" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#1a2e1e] border border-[#1e3022] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#4a6650]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
              </div>
            )}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="w-14 h-14 rounded-xl bg-[#1a2e1e] border border-[#1e3022] flex items-center justify-center">
            <span className="text-xs font-bold text-[#22c55e]">+{extraCount}</span>
          </div>
        )}
        <div className="ml-auto text-right">
          <p className="text-xs text-[#4a6650] uppercase tracking-widest font-semibold">Total</p>
          <p className="text-xl font-black text-white">₹{order.totalAmount}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3.5 border-t border-[#1a2e1e]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-[#22c55e]' : order.paymentStatus === 'failed' ? 'bg-red-400' : 'bg-amber-400'}`} />
          <span className="text-xs text-[#4a6650] font-medium">
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'} · {order.paymentStatus}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#22c55e] text-xs font-semibold group-hover:gap-2 transition-all">
          View details
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/my');
      const data = await res.json();
       console.log("ORDER DATA:", JSON.stringify(data.order?.items, null, 2)); 
      if (data.success) setOrders(data.orders);
    } catch (e) {
      console.error(e);
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

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="min-h-screen bg-[#080e09] flex flex-col justify-center items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-[#22c55e]/20 border-t-[#22c55e] animate-spin" />
      <p className="text-[#4a6650] text-sm">Fetching your orders…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080e09] text-white font-sans pb-24">
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
          <div>
            <h1 className="font-black text-lg leading-none">My Orders</h1>
            <p className="text-xs text-[#4a6650] mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f.key
                  ? 'bg-[#22c55e] text-black'
                  : 'bg-[#0f1a12] border border-[#1a2e1e] text-[#4a6650] hover:border-[#22c55e]/30 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#0f1a12] border border-[#1a2e1e] flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-[#22c55e]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-bold text-white text-lg mb-1">{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</p>
            <p className="text-[#4a6650] text-sm max-w-xs">
              {filter === 'all' ? 'Start exploring shops and place your first order.' : `You have no orders with status "${filter}".`}
            </p>
          </div>
        ) : (
          filtered.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              onClick={() => router.push(`/order/${order._id}`)}
            />
          ))
        )}
      </main>
    </div>
  );
}