"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const formatCategory = (cat) =>
  cat ? cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';

const isShopOpenNow = (openTime, closeTime, closedOn = [] , active) => {
  if(!active){
    return false;
  }
  if (!openTime || !closeTime) return null;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const today = days[now.getDay()];
  if (closedOn.includes(today)) return false;

  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  return closeMinutes > openMinutes
    ? nowMinutes >= openMinutes && nowMinutes < closeMinutes
    : nowMinutes >= openMinutes || nowMinutes < closeMinutes; 
};

const StarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.062 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
  </svg>
);
const HeartIcon = ({ className, filled }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const StorefrontIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const PinIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CheckBadgeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);
const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const ShopCard = ({ shop, onUnsave, removing, index }) => {
  const router = useRouter();
  const thumb = shop.thumbnail || shop.images?.[0];
  console.log("Active status : " ,shop.isActive )
  const open = isShopOpenNow(shop.openTime, shop.closeTime, shop.closedOn , shop.isActive );

  return (
    <div
      onClick={() => router.push(`/shop/${shop._id}`)}
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      className="card-anim group cursor-pointer bg-white border border-[#e5ece6] rounded-2xl overflow-hidden
                 hover:border-[#16a34a]/50 transition-all duration-300 active:scale-[0.98]
                 shadow-[0_1px_2px_rgba(15,31,19,0.04)]
                 hover:shadow-[0_12px_28px_-10px_rgba(22,163,74,0.28)] hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] bg-[#eef5f0] overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={shop.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <StorefrontIcon className="w-8 h-8 sm:w-9 sm:h-9 text-[#16a34a]/25" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />

        <button
          onClick={(e) => { e.stopPropagation(); onUnsave(shop._id); }}
          disabled={removing}
          aria-label="Remove from saved"
          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-sm border border-[#e5ece6]
                     flex items-center justify-center text-rose-500 hover:bg-white hover:scale-105 transition-all shadow-sm
                     disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/40"
        >
          {removing ? (
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
          ) : (
            <HeartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" filled />
          )}
        </button>

        {shop.isVerified && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 inline-flex items-center gap-1 pl-1 pr-2 py-1 rounded-full text-[8.5px] sm:text-[10px] font-bold
                            bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white shadow-sm">
            <CheckBadgeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Verified
          </span>
        )}

        {open !== null && (
          <span className={`absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8.5px] sm:text-[10px] font-bold backdrop-blur-sm ${
            open ? 'bg-white/95 text-[#15803d]' : 'bg-black/40 text-white'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-[#16a34a] motion-safe:animate-pulse' : 'bg-white/70'}`} />
            {open ? 'Open now' : 'Closed'}
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-3.5 lg:p-4">
        <h3 className="font-bold text-[#0f1f13] text-[12.5px] sm:text-[14.5px] leading-snug line-clamp-2 min-h-[2.4em] sm:min-h-[2.2em]">
          {shop.name}
        </h3>

        <div className="flex items-center justify-between gap-1.5 mt-1.5 sm:mt-2">
          {shop.category ? (
            <span className="inline-block max-w-[65%] truncate bg-[#eef6f0] text-[#15803d] text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wide px-1.5 sm:px-2 py-[3px] sm:py-1 rounded-md">
              {formatCategory(shop.category)}
            </span>
          ) : <span />}

          {shop.avgRating > 0 && (
            <span className="flex items-center gap-0.5 sm:gap-1 shrink-0 bg-amber-50 border border-amber-100 text-amber-700 text-[9.5px] sm:text-xs font-bold px-1.5 sm:px-2 py-[3px] sm:py-1 rounded-md">
              <StarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              {shop.avgRating.toFixed(1)}
            </span>
          )}
        </div>

        {(shop.location?.city || shop.location?.pincode) && (
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#5b7462] mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-[#f0f4f0]">
            <PinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">
              {shop.location?.city}{shop.location?.pincode ? ` · ${shop.location.pincode}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const CardSkeleton = () => (
  <div className="bg-white border border-[#e5ece6] rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-[#eef4ef]" />
    <div className="p-2.5 sm:p-3.5 lg:p-4 space-y-2">
      <div className="h-3 sm:h-3.5 w-4/5 bg-[#eef4ef] rounded" />
      <div className="h-3 sm:h-3.5 w-2/5 bg-[#eef4ef] rounded" />
      <div className="h-2.5 sm:h-3 w-3/5 bg-[#eef4ef] rounded mt-3" />
    </div>
  </div>
);

export default function SavedShopsPage() {
  const router = useRouter();
  const [savedShops, setSavedShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/savedShop/save', { credentials: 'include' });
        const contentType = res.headers.get('content-type') || '';

        if (!res.ok || !contentType.includes('application/json')) {
          if (!cancelled) showToast('Could not load saved shops');
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        if (data.success) {
          setSavedShops(data.savedShops || []);
        } else {
          showToast(data.message || 'Could not load saved shops');
        }
      } catch (e) {
        console.error('[savedShops] fetch failed:', e);
        if (!cancelled) showToast('Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleUnsave = async (shopId) => {
    setRemovingId(shopId);
    const prev = savedShops;
    setSavedShops((cur) => cur.filter((s) => s._id !== shopId)); 

    try {
      const res = await fetch(`/api/savedShop/delete/${shopId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        setSavedShops(prev); 
        showToast(data.message || 'Could not remove shop');
      } else {
        showToast('Removed from saved shops');
      }
    } catch (e) {
      setSavedShops(prev);
      showToast('Something went wrong');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] bg-[radial-gradient(circle_at_15%_0%,rgba(22,163,74,0.06),transparent_50%)] text-[#0f1f13] font-sans pb-16 selection:bg-[#16a34a]/20">
      {toast && (
        <div className="toast-anim fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-[#0f1f13] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
          {toast}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#f7faf7]/85 backdrop-blur-md border-b border-[#e5ece6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(22,163,74,0.5)] shrink-0">
            <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" filled />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-lg sm:text-2xl leading-none tracking-tight truncate">Saved Shops</h1>
            <p className="text-[11px] sm:text-sm text-[#5b7462] mt-1 font-medium">
              {loading ? 'Loading…' : `${savedShops.length} shop${savedShops.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-5 sm:mt-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : savedShops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border border-[#e5ece6] flex items-center justify-center mb-6 shadow-[0_8px_24px_-12px_rgba(15,31,19,0.15)]">
              <div className="absolute inset-0 rounded-3xl bg-[#16a34a]/5" />
              <HeartIcon className="w-9 h-9 sm:w-10 sm:h-10 text-[#16a34a]/35 relative" />
            </div>
            <p className="font-bold text-[#0f1f13] text-base sm:text-lg mb-1.5">No saved shops yet</p>
            <p className="text-[#5b7462] text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
              Tap the heart icon on any shop to save it here for quick access later.
            </p>
            <button
              onClick={() => router.push('/home')}
              className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#16a34a] text-white text-xs sm:text-sm font-bold hover:bg-[#15803d] transition-all shadow-[0_4px_14px_-4px_rgba(22,163,74,0.5)] hover:shadow-[0_6px_18px_-4px_rgba(22,163,74,0.6)]"
            >
              Browse Shops
              <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {savedShops.map((shop, i) => (
              <ShopCard
                key={shop._id}
                shop={shop}
                index={i}
                onUnsave={handleUnsave}
                removing={removingId === shop._id}
              />
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .card-anim {
          animation: fadeInUp 0.5s ease backwards;
        }
        .toast-anim {
          animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .card-anim, .toast-anim { animation: none !important; }
        }
      `}</style>
    </div>
  );
}