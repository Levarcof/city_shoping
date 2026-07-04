"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

function ProductDetailInner() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');

  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState('');

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyStep, setBuyStep] = useState(1);
  const [address, setAddress] = useState({ street: '', city: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (shopId && id) fetchProduct();
    else if (!shopId) {
      setLoading(false);
    }
  }, [shopId, id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/shops/${shopId}`);
      const data = await res.json();
      if (data.success && data.shop) {
        setShop(data.shop);
        const item = data.shop.items.find(i => String(i._id) === String(id));
        setProduct(item || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      const payload = {
        shopId: shop._id,
        itemId: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.image,
        shopName: shop.name
      };
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) showToast('Added to cart ✓');
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data?.address) {
            setAddress({
              street: data.address.road || data.address.suburb || data.display_name,
              city: data.address.city || data.address.town || data.address.state_district || '',
              pincode: data.address.postcode || ''
            });
            showToast('Location detected ✓');
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
  };

  // Gate for the "Buy Now" flow: the shop must exist and be open
  // (isActive === true) in addition to the product being in stock.
  // Kept as a single source of truth so the desktop button, the
  // mobile sticky-bar button, and the modal opener all agree.
  const canBuyNow = !!product?.inStock && !!shop?.isActive;

  const handlePlaceOrder = async () => {
    // Safety net: even if the modal was somehow opened, refuse to place
    // an order for a shop that is closed.
    if (!shop?.isActive) {
      showToast('Ye shop abhi band hai, order place nahi ho sakta');
      setShowBuyModal(false);
      return;
    }

    setPlacingOrder(true);
    const totalAmount = product.price * qty;
    console.log("The id of shop :", shop._id);

    try {
      if (paymentMethod === 'cod') {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopId: shop._id,
            items: [{ itemId: product._id, shop: shop._id, name: product.name, price: product.price, quantity: qty, image: product.image }],
            totalAmount,
            deliveryAddress: address,
            paymentMethod: 'cod'
          })
        });
        const data = await res.json();
        if (data.success) {
          setPlacedOrderId(data.order._id);
          setOrderSuccess(true);
        } else {
          showToast(data.message || 'Order failed');
          setPlacingOrder(false);
        }
      } else if (paymentMethod === 'online') {
        const resLoaded = await loadRazorpay();
        if (!resLoaded) {
          showToast('Razorpay SDK not getting load');
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
          showToast('Payment not getting initialize');
          setPlacingOrder(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'LocalBazaar',
          description: 'Order Payment',
          order_id: rzpData.orderId,
          theme: { color: '#00B259' },
          handler: async function (response) {
            const verifyRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shopId: shop._id,
                items: [{ itemId: product._id, shop: shop._id, name: product.name, price: product.price, quantity: qty, image: product.image }],
                totalAmount,
                deliveryAddress: address,
                paymentMethod: 'online',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPlacedOrderId(verifyData.order._id);
              setOrderSuccess(true);
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
      setPlacingOrder(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAFCFA] flex flex-col justify-center items-center gap-4">
      <div className="w-10 h-10 rounded-full border-[3px] border-green-100 border-t-[#00B259] animate-spin" />
      <p className="text-gray-400 text-sm font-semibold">Loading product…</p>
    </div>
  );

  if (!shopId) return (
    <div className="min-h-screen bg-[#FAFCFA] flex flex-col justify-center items-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-1 text-2xl">⚠️</div>
      <p className="font-bold text-gray-900">Shop ID missing</p>
      <p className="text-gray-400 text-sm">URL not heve ?shopId= parameter</p>
      <button onClick={() => router.back()} className="text-sm text-[#00B259] font-bold underline underline-offset-2">Go back</button>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#FAFCFA] flex flex-col justify-center items-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-1">
        <svg className="w-8 h-8 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="font-bold text-gray-900">Product not found</p>
      <p className="text-gray-400 text-xs font-mono mt-1">ID: {id}</p>
      <button onClick={() => router.back()} className="text-sm text-[#00B259] font-bold underline underline-offset-2 mt-2">Go back</button>
    </div>
  );

  const totalAmount = product.price * qty;

  return (
    <div className="min-h-screen bg-[#FAFCFA] text-gray-900 font-sans pb-32">

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-white border border-green-100 shadow-lg shadow-green-900/5 text-gray-700 text-sm font-semibold px-5 py-3 rounded-2xl flex items-center gap-2.5 whitespace-nowrap">
          <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00B259" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          {toast}
        </div>
      )}

      <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3.5 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-black text-gray-900 truncate max-w-[55%] text-center">{product.name}</p>
        <button
          onClick={() => router.push('/cart')}
          className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

        <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            {product.image ? (
              <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300 bg-gray-50">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold">No image</span>
              </div>
            )}
          </div>

          {shop && (
            <div
              onClick={() => router.push(`/shop/${shop._id}`)}
              className="hidden lg:flex bg-white border border-gray-100 rounded-2xl p-4 items-center gap-4 cursor-pointer hover:border-green-200 hover:shadow-sm transition-all group"
            >
              {shop.thumbnail ? (
                <img src={shop.thumbnail} className="w-12 h-12 rounded-xl object-cover border border-gray-100" alt={shop.name} />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#00B259] flex items-center justify-center text-white font-black">
                  {shop.name?.[0]?.toUpperCase() || 'S'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Sold by</p>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="font-bold text-gray-900 group-hover:text-[#00B259] transition-colors truncate">{shop.name}</p>
                  <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${shop.isActive ? 'bg-green-50 text-[#00B259] border-green-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${shop.isActive ? 'bg-[#00B259]' : 'bg-rose-400'}`} />
                    {shop.isActive ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-[#00B259] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}

          {shop && !shop.isActive && (
            <div className="hidden lg:flex items-center gap-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              This shop is currently closed. Buy Now will be available once it reopens.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm shadow-gray-900/[0.02]">
            <div className="flex justify-between items-start gap-3 mb-3">
              <h1 className="text-xl sm:text-2xl font-black leading-tight text-gray-900 flex-1">{product.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 mt-1 border ${product.inStock ? 'bg-green-50 text-[#00B259] border-green-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-[#00B259]">₹{product.price}</span>
              {product.unit && <span className="text-sm text-gray-400 font-semibold">/ {product.unit}</span>}
            </div>

            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm shadow-gray-900/[0.02]">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Quantity</p>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl px-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#00B259] font-bold text-lg transition-colors"
              >−</button>
              <span className="font-black text-lg w-8 text-center text-gray-900">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#00B259] font-bold text-lg transition-colors"
              >+</button>
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-2 gap-3">
            <button
              onClick={addToCart}
              disabled={!product.inStock}
              className="bg-white border border-green-200 hover:bg-green-50 text-[#00B259] font-bold py-3.5 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <button
              onClick={() => { setBuyStep(1); setShowBuyModal(true); }}
              disabled={!canBuyNow}
              title={!shop?.isActive ? 'Shop is currently closed' : undefined}
              className="bg-[#00B259] hover:bg-[#009c4c] text-white font-black py-3.5 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-green-900/10"
            >
              {shop && !shop.isActive ? 'Shop Closed' : 'Buy Now'}
            </button>
          </div>

          {shop && (
            <div
              onClick={() => router.push(`/shop/${shop._id}`)}
              className="lg:hidden bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-green-200 hover:shadow-sm transition-all group"
            >
              {shop.thumbnail ? (
                <img src={shop.thumbnail} className="w-12 h-12 rounded-xl object-cover border border-gray-100" alt={shop.name} />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#00B259] flex items-center justify-center text-white font-black">
                  {shop.name?.[0]?.toUpperCase() || 'S'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Sold by</p>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="font-bold text-gray-900 group-hover:text-[#00B259] transition-colors truncate">{shop.name}</p>
                  <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${shop.isActive ? 'bg-green-50 text-[#00B259] border-green-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${shop.isActive ? 'bg-[#00B259]' : 'bg-rose-400'}`} />
                    {shop.isActive ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-[#00B259] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}

          {shop && !shop.isActive && (
            <div className="lg:hidden flex items-center gap-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              This shop is currently closed. Buy Now will be available once it reopens.
            </div>
          )}
        </div>
      </main>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3.5 grid grid-cols-2 gap-3">
        <button
          onClick={addToCart}
          disabled={!product.inStock}
          className="bg-white border border-green-200 hover:bg-green-50 text-[#00B259] font-bold py-3.5 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add to Cart
        </button>
        <button
          onClick={() => { setBuyStep(1); setShowBuyModal(true); }}
          disabled={!canBuyNow}
          title={!shop?.isActive ? 'Shop is currently closed' : undefined}
          className="bg-[#00B259] hover:bg-[#009c4c] text-white font-black py-3.5 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-green-900/10"
        >
          {shop && !shop.isActive ? 'Shop Closed' : 'Buy Now'}
        </button>
      </div>

      <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${showBuyModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => !orderSuccess && setShowBuyModal(false)}
        />

        <div className={`relative w-full sm:max-w-lg bg-white border-t sm:border border-gray-100 rounded-t-[28px] sm:rounded-3xl shadow-2xl shadow-gray-900/10 transition-transform duration-300 max-h-[92vh] overflow-y-auto ${showBuyModal ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="px-6 pb-8 pt-4 sm:pt-6">
            {!orderSuccess ? (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-black text-gray-900">Checkout</h2>
                  <button onClick={() => setShowBuyModal(false)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

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
                    <button
                      onClick={getLocation}
                      className="w-full py-3 border border-dashed border-green-200 text-[#00B259] bg-green-50/50 rounded-xl hover:bg-green-50 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00B259" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                     Use Current Location
                    </button>

                    <input
                      type="text"
                      placeholder="Street / Building / Area"
                      value={address.street}
                      onChange={e => setAddress({ ...address, street: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 focus:border-[#00B259] focus:bg-white focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 outline-none text-sm text-gray-800 transition-all placeholder:text-gray-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 focus:border-[#00B259] focus:bg-white focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 outline-none text-sm text-gray-800 transition-all placeholder:text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={address.pincode}
                        onChange={e => setAddress({ ...address, pincode: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 focus:border-[#00B259] focus:bg-white focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 outline-none text-sm text-gray-800 transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (address.street && address.city && address.pincode) setBuyStep(2);
                        else showToast('Sabhi fields fill karo');
                      }}
                      className="w-full bg-[#00B259] hover:bg-[#009c4c] text-white font-bold py-3.5 rounded-xl transition-colors mt-2 shadow-sm shadow-green-900/10"
                    >
                      Go to Payment  →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button onClick={() => setBuyStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors text-sm mb-2 font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                      </svg>
                      change Address
                    </button>

                    <div className="flex flex-col gap-3">
                      {[
                        { value: 'cod', label: 'Cash on Delivery', desc: 'Pay after delivery' },
                        { value: 'online', label: 'Online Payment', desc: 'Pay now online' },
                      ].map(opt => (
                        <label
                          key={opt.value}
                          className={`cursor-pointer flex items-center p-4 border rounded-xl transition-all ${paymentMethod === opt.value ? 'border-[#00B259] bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                          <input type="radio" name="payment" value={opt.value} onChange={() => setPaymentMethod(opt.value)} className="hidden" />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${paymentMethod === opt.value ? 'border-[#00B259]' : 'border-gray-300'}`}>
                            {paymentMethod === opt.value && <div className="w-2.5 h-2.5 bg-[#00B259] rounded-full" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{opt.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {paymentMethod && (
                      <div className="pt-4 border-t border-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-400 text-sm font-semibold">Total Amount</span>
                          <span className="font-black text-[#00B259] text-xl">₹{totalAmount}</span>
                        </div>
                        <button
                          onClick={handlePlaceOrder}
                          disabled={placingOrder}
                          className="w-full bg-[#00B259] hover:bg-[#009c4c] text-white font-black py-3.5 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm shadow-green-900/10"
                        >
                          {placingOrder ? (
                            <>
                              <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                              Processing…
                            </>
                          ) : (
                            paymentMethod === 'cod' ? 'Order Place Karo' : `₹${totalAmount} Pay Karo`
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-10 text-center">
                <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-[#00B259]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed! 🎉</h2>
                <p className="text-gray-400 text-sm mb-6">Order <span className="font-bold text-gray-700">#{placedOrderId.slice(-6).toUpperCase()}</span> confirm ho gaya hai</p>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full bg-[#00B259] hover:bg-[#009c4c] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-green-900/10"
                >
                 Show your order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFCFA] flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 rounded-full border-[3px] border-green-100 border-t-[#00B259] animate-spin" />
        <p className="text-gray-400 text-sm font-semibold">Loading…</p>
      </div>
    }>
      <ProductDetailInner />
    </Suspense>
  );
}