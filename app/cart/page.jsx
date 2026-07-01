"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // showBuyModal holds either a shopId, 'all', or false
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyStep, setBuyStep] = useState(1);
  const [address, setAddress] = useState({ street: '', city: '', pincode: '' });
  const [locating, setLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.success) setCart(data.cart);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (itemId, qty) => {
    if (qty < 1) return;
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: qty })
      });
      if (res.ok) fetchCart();
    } catch (e) {
      console.error(e);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Item removed');
        fetchCart();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      showToast('Location not supported on this device');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data && data.address) {
            setAddress({
              street: data.address.road || data.address.suburb || data.display_name,
              city: data.address.city || data.address.town || data.address.state_district || '',
              pincode: data.address.postcode || ''
            });
            showToast('Location detected');
          }
        } catch (e) {
          console.error(e);
          showToast('Could not fetch location');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        showToast('Location permission denied');
      }
    );
  };

  // Group items by shopId
  const shopGroups = cart?.items?.reduce((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  }, {}) || {};

  const cartTotalAmount = cart?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const cartTotalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const totalShops = Object.keys(shopGroups).length;

  const handlePlaceOrder = async (target) => {
    setPlacingOrder(true);

    const isAll = target === 'all';
    const items = isAll ? cart.items : shopGroups[target];
    const totalAmount = isAll ? cartTotalAmount : items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    try {
      const basePayload = {
        isAll,
        shopId: isAll ? null : target,
        items: items.map(i => ({ itemId: i.itemId, shopId: i.shopId, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        totalAmount,
        deliveryAddress: address,
      };

      if (paymentMethod === 'cod') {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...basePayload, paymentMethod: 'cod' })
        });
        const data = await res.json();
        if (data.success) {
          setPlacedOrderId(data.order._id);
          setOrderSuccess(true);
          fetchCart();
        } else {
          showToast(data.message || 'Could not place order');
        }
      } else if (paymentMethod === 'online') {
        const resLoaded = await loadRazorpay();
        if (!resLoaded) {
          showToast('Payment SDK failed to load');
          setPlacingOrder(false);
          return;
        }

        const rzpRes = await fetch('/api/orders/razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount })
        });
        const rzpData = await rzpRes.json();

        if (!rzpData.success) {
          showToast('Failed to initialize payment');
          setPlacingOrder(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: "LocalBazaar",
          description: isAll ? "All Items Checkout" : "Cart Checkout",
          order_id: rzpData.orderId,
          theme: { color: "#00B259" },
          handler: async function (response) {
            const verifyRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...basePayload,
                paymentMethod: 'online',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPlacedOrderId(verifyData.order._id);
              setOrderSuccess(true);
              fetchCart();
            } else {
              showToast(verifyData.message || 'Payment verification failed');
            }
            setPlacingOrder(false);
          },
          modal: { ondismiss: () => setPlacingOrder(false) }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (e) {
      console.error(e);
      showToast('Something went wrong. Please try again.');
      setPlacingOrder(false);
    }
  };

  const openModal = (target) => {
    setShowBuyModal(target);
    setBuyStep(1);
    setOrderSuccess(false);
    setPaymentMethod('');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAFCFA] flex justify-center items-center">
      <div className="w-9 h-9 border-[3px] border-[#00B259] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFCFA] text-gray-900 font-inter pb-32">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-white border border-green-100 shadow-lg shadow-green-900/5 text-gray-700 text-sm font-semibold px-5 py-3 rounded-2xl flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00B259" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="font-black text-lg text-gray-900 tracking-tight">My Cart</h1>
            {cart?.items?.length > 0 && (
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                {cartTotalItems} item{cartTotalItems !== 1 ? 's' : ''} · {totalShops} shop{totalShops !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {cart?.items?.length > 0 && (
            <div className="ml-auto hidden sm:flex items-center gap-2 bg-green-50 border border-green-100 px-3.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B259]" />
              <span className="text-[11px] font-bold text-[#00B259] uppercase tracking-wider">₹{cartTotalAmount} total</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5 mt-6">
        {!cart || cart.items.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24 px-6 bg-white border border-gray-100 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00B259" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-bold text-base">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-1.5">Items you add from shops will show up here</p>
            <button
              onClick={() => router.push('/home')}
              className="mt-6 bg-[#00B259] hover:bg-[#009c4c] text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm shadow-sm shadow-green-900/10"
            >
              Browse Shops
            </button>
          </div>
        ) : (
          <>
            {/* Shop-wise groups */}
            {Object.keys(shopGroups).map(shopId => {
              const items = shopGroups[shopId];
              const shopName = items[0].shopName;
              const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
              const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

              return (
                <div key={shopId} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm shadow-gray-900/[0.02]">
                  {/* Shop header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                    <div className="w-9 h-9 rounded-xl bg-[#00B259] flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                      {shopName?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">{shopName}</h3>
                      <p className="text-[11px] text-gray-400 font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 space-y-4">
                    {items.map(item => (
                      <div key={item.itemId} className="flex gap-3.5">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-[72px] h-[72px] rounded-2xl object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-[72px] h-[72px] rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                            No image
                          </div>
                        )}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-gray-900 leading-tight truncate">{item.name}</h4>
                              <p className="text-xs text-gray-400 font-semibold mt-1">₹{item.price} / unit</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.itemId)}
                              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-1">
                              <button
                                onClick={() => updateQty(item.itemId, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#00B259] font-bold text-base"
                              >−</button>
                              <span className="text-sm font-bold w-4 text-center text-gray-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(item.itemId, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#00B259] font-bold text-base"
                              >+</button>
                            </div>
                            <p className="font-black text-sm text-gray-900">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shop footer */}
                  <div className="bg-green-50/50 px-5 py-4 border-t border-gray-50 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Subtotal</p>
                      <p className="font-black text-xl text-gray-900">₹{subtotal}</p>
                    </div>
                    <button
                      onClick={() => openModal(shopId)}
                      className="bg-[#00B259] hover:bg-[#009c4c] text-white font-bold px-5 sm:px-6 py-3 rounded-xl transition-colors text-sm shadow-sm shadow-green-900/10 flex-shrink-0"
                    >
                      Checkout →
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Checkout everything at once, if items span multiple shops */}
            {totalShops > 1 && (
              <div className="bg-white border border-green-100 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm shadow-green-900/[0.03]">
                <div>
                  <p className="text-sm font-bold text-gray-900">Checkout everything together</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {cartTotalItems} items from {totalShops} shops · ₹{cartTotalAmount}
                  </p>
                </div>
                <button
                  onClick={() => openModal('all')}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm flex-shrink-0"
                >
                  Checkout All
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky bottom summary (mobile-friendly quick checkout) */}
      {cart?.items?.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Cart total</p>
            <p className="font-black text-lg text-gray-900">₹{cartTotalAmount}</p>
          </div>
          <button
            onClick={() => openModal(totalShops > 1 ? 'all' : Object.keys(shopGroups)[0])}
            className="bg-[#00B259] hover:bg-[#009c4c] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm shadow-green-900/10"
          >
            {totalShops > 1 ? 'Checkout All →' : 'Checkout →'}
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-opacity duration-300 ${showBuyModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !orderSuccess && setShowBuyModal(false)} />

        <div className={`relative w-full sm:max-w-lg bg-white border-t sm:border border-gray-100 rounded-t-[28px] sm:rounded-3xl sm:mb-0 shadow-2xl shadow-gray-900/10 transition-transform duration-300 max-h-[92vh] overflow-y-auto ${showBuyModal ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="p-6">
            {!orderSuccess ? (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-black text-gray-900">
                    Checkout {showBuyModal === 'all' ? '· All Shops' : ''}
                  </h2>
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-colors ${buyStep >= 1 ? 'bg-[#00B259] text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
                    <span className={`text-[11px] font-bold ${buyStep >= 1 ? 'text-gray-800' : 'text-gray-400'}`}>Address</span>
                  </div>
                  <div className={`h-[2px] flex-1 rounded-full ${buyStep >= 2 ? 'bg-[#00B259]' : 'bg-gray-100'}`} />
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className={`text-[11px] font-bold ${buyStep >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>Payment</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-colors ${buyStep >= 2 ? 'bg-[#00B259] text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  </div>
                </div>

                {buyStep === 1 ? (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-gray-700">Delivery Address</h3>
                    <button
                      onClick={getLocation}
                      disabled={locating}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-green-200 text-[#00B259] bg-green-50/50 rounded-xl hover:bg-green-50 transition-colors text-sm font-bold disabled:opacity-60"
                    >
                      {locating ? (
                        <span className="w-4 h-4 border-2 border-[#00B259] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00B259" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                      )}
                      {locating ? 'Detecting location…' : 'Use Current Location'}
                    </button>

                    <div className="space-y-3">
                      <input
                        type="text" placeholder="Street / Building"
                        value={address.street}
                        onChange={e => setAddress({ ...address, street: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#00B259] focus:bg-white focus:ring-2 focus:ring-green-100 text-sm text-gray-800 placeholder:text-gray-400 transition-all"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text" placeholder="City"
                          value={address.city}
                          onChange={e => setAddress({ ...address, city: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#00B259] focus:bg-white focus:ring-2 focus:ring-green-100 text-sm text-gray-800 placeholder:text-gray-400 transition-all"
                        />
                        <input
                          type="text" placeholder="Pincode"
                          value={address.pincode}
                          onChange={e => setAddress({ ...address, pincode: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#00B259] focus:bg-white focus:ring-2 focus:ring-green-100 text-sm text-gray-800 placeholder:text-gray-400 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => { if (address.street && address.city && address.pincode) setBuyStep(2); else showToast('Please fill all fields'); }}
                      className="w-full bg-[#00B259] hover:bg-[#009c4c] text-white font-bold py-3.5 rounded-xl transition-colors mt-2 shadow-sm shadow-green-900/10"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => setBuyStep(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                      >
                        ←
                      </button>
                      <h3 className="font-bold text-sm text-gray-700">Select Payment Method</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`cursor-pointer flex items-center p-4 border rounded-xl transition-all ${paymentMethod === 'cod' ? 'border-[#00B259] bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                        <input type="radio" name="payment" value="cod" onChange={() => setPaymentMethod('cod')} className="hidden" />
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3.5 flex-shrink-0 ${paymentMethod === 'cod' ? 'bg-[#00B259] text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-gray-900">Cash on Delivery</div>
                          <div className="text-[11px] text-gray-400">Pay when your order arrives</div>
                        </div>
                        <div className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === 'cod' ? 'border-[#00B259]' : 'border-gray-300'}`}>
                          {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-[#00B259] rounded-full" />}
                        </div>
                      </label>

                      <label className={`cursor-pointer flex items-center p-4 border rounded-xl transition-all ${paymentMethod === 'online' ? 'border-[#00B259] bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                        <input type="radio" name="payment" value="online" onChange={() => setPaymentMethod('online')} className="hidden" />
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3.5 flex-shrink-0 ${paymentMethod === 'online' ? 'bg-[#00B259] text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-gray-900">Pay Online</div>
                          <div className="text-[11px] text-gray-400">Cards, UPI, wallets via Razorpay</div>
                        </div>
                        <div className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === 'online' ? 'border-[#00B259]' : 'border-gray-300'}`}>
                          {paymentMethod === 'online' && <div className="w-2.5 h-2.5 bg-[#00B259] rounded-full" />}
                        </div>
                      </label>
                    </div>

                    {paymentMethod && (
                      <div className="pt-4 border-t border-gray-50 mt-2">
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-gray-400 font-semibold">Amount payable</span>
                          <span className="font-black text-gray-900">
                            ₹{showBuyModal === 'all' ? cartTotalAmount : shopGroups[showBuyModal]?.reduce((a, i) => a + i.price * i.quantity, 0)}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePlaceOrder(showBuyModal)}
                          disabled={placingOrder}
                          className="w-full bg-[#00B259] hover:bg-[#009c4c] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm shadow-green-900/10"
                        >
                          {placingOrder && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {placingOrder ? 'Processing…' : (paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Pay')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-10 text-center">
                <div className="w-20 h-20 bg-green-50 border border-green-100 text-[#00B259] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h2>
                <p className="text-gray-400 text-sm mb-8">
                  Your order <span className="font-bold text-gray-700">#{placedOrderId.slice(-6).toUpperCase()}</span> has been confirmed.
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => { setShowBuyModal(false); router.push('/orders'); }}
                    className="w-full bg-[#00B259] hover:bg-[#009c4c] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm shadow-green-900/10"
                  >
                    View Orders
                  </button>
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}