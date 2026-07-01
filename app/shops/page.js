"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SHOP_CATEGORIES } from "../home/constants";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-50 animate-pulse flex flex-col items-center justify-center text-sm text-slate-400 gap-2">
      <div className="w-6 h-6 border-2 border-[#00B259] border-t-transparent rounded-full animate-spin"></div>
      Loading map assets…
    </div>
  ),
});

// ═══════════════════════════════════════════════════════════════════════════
function ShopCard({ shop, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-900/[0.06] hover:border-[#00B259]/30 hover:-translate-y-0.5 transition-all duration-300 flex cursor-pointer p-3 gap-4"
    >
      <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 relative flex-shrink-0 rounded-xl overflow-hidden border border-slate-100">
        {shop.thumbnail ? (
          <img src={shop.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={shop.name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50/50 text-2xl md:text-3xl">🏪</div>
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
      </div>
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div>
          <h4 className="font-bold text-slate-800 text-xs md:text-base group-hover:text-[#00B259] transition-colors line-clamp-1">
            {shop.name}
          </h4>
          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{shop.category}</p>
          {shop.distance != null && (
            <p className="text-[11px] md:text-xs font-bold text-[#00B259] flex items-center gap-1 mt-1.5 bg-emerald-50/60 px-2 py-0.5 rounded-md w-fit">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {shop.distance.toFixed(1)} km away
            </p>
          )}
        </div>
        <div className="flex justify-between items-center text-xs mt-1.5 pt-1.5 border-t border-slate-50">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold tracking-wide border ${
            shop.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${shop.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-400"}`} />
            {shop.isActive ? "Open now" : "Closed"}
          </span>
          <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs group-hover:bg-[#00B259] group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0">
            →
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
function ShopCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex p-3 gap-4 animate-pulse">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded-full w-3/4" />
          <div className="h-2 bg-slate-100 rounded-full w-1/3" />
          <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
        </div>
        <div className="h-4 bg-slate-100 rounded-full w-1/3" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
function ShopsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const urlCategory = searchParams.get("category");
  const urlSubcategory = searchParams.get("subcategory");

  const [currentCategory, setCurrentCategory] = useState(urlCategory || "");
  const [currentSubcategory, setCurrentSubcategory] = useState(urlSubcategory || "");

  const [shops, setShops] = useState([]);
  const [radius, setRadius] = useState(30);
  const [searching, setSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (urlCategory) setCurrentCategory(urlCategory);
    if (urlSubcategory !== null) setCurrentSubcategory(urlSubcategory || "");
  }, [urlCategory, urlSubcategory]);

  const fetchShops = useCallback(async (overrideCat = currentCategory, overrideSubcat = currentSubcategory) => {
    if (!lat || !lng || !overrideCat) return;

    setSearching(true);
    try {
      const p = new URLSearchParams({
        lat,
        lng,
        radius: radius.toString(),
        category: overrideCat
      });
      if (overrideSubcat) p.append("subcategory", overrideSubcat);

      const res = await fetch(`/api/shops?${p}`);
      const data = await res.json();
      if (data.success) {
        setShops(data.shops || []);
      } else {
        setShops([]);
      }
    } catch (e) {
      console.error(e);
      setShops([]);
    } finally {
      setSearching(false);
    }
  }, [lat, lng, radius, currentCategory, currentSubcategory]);

  useEffect(() => {
    fetchShops();
  }, [lat, lng, currentCategory, currentSubcategory]);

  const handleFilterUpdate = (cat, subcat) => {
    setCurrentCategory(cat);
    setCurrentSubcategory(subcat);
    setShops([]);

    const params = new URLSearchParams();
    if (lat) { params.append("lat", lat); params.append("lng", lng); }
    if (cat) params.append("category", cat);
    if (subcat) params.append("subcategory", subcat);

    router.replace(`/shops?${params.toString()}`, { scroll: false });
    fetchShops(cat, subcat);
  };

  const radiusPercent = Math.min(100, Math.max(0, ((radius - 1) / (500 - 1)) * 100));
  const catMeta = currentCategory ? SHOP_CATEGORIES[currentCategory] : null;

  return (
    <div className="min-h-screen bg-[#F6F8F6] text-slate-800 antialiased flex flex-col">

      {/* ── PREMIUM RESPONSIVE HEADER ── */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 sticky top-0 z-40 md:px-6 md:py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <button
              onClick={() => router.push("/")}
              className="text-xs font-bold text-slate-500 hover:text-[#00B259] flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="sm:hidden min-w-0 text-center flex-1">
              <h1 className="text-xs font-black tracking-tight text-slate-800 uppercase truncate">
                {catMeta ? `${catMeta.icon ? catMeta.icon + " " : ""}${catMeta.label}` : "Shops Near Me"}
              </h1>
            </div>

            {/* Mobile List/Map segmented toggle */}
            <div className="sm:hidden flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl p-0.5 flex">
              <button
                onClick={() => setShowMap(false)}
                disabled={!currentCategory}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-[10px] transition-all disabled:opacity-30 ${!showMap ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"}`}
              >
                List
              </button>
              <button
                onClick={() => setShowMap(true)}
                disabled={!currentCategory}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-[10px] transition-all disabled:opacity-30 ${showMap ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"}`}
              >
                Map
              </button>
            </div>
          </div>

          {/* Desktop title + result count */}
          <div className="hidden sm:block flex-1 min-w-0">
            <h1 className="text-sm font-black tracking-tight text-slate-900 truncate">
              {catMeta ? `${catMeta.icon ? catMeta.icon + " " : ""}${catMeta.label}` : "Shops Near Me"}
            </h1>
            {currentCategory && (
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                {searching ? "Searching…" : `${shops.length} shop${shops.length !== 1 ? "s" : ""} found within ${radius}km`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 w-full min-w-0 xs:grid-cols-2 sm:flex sm:items-center sm:justify-end sm:gap-3 sm:w-auto">
            <div className="relative w-full sm:w-48">
              <select
                value={currentCategory}
                onChange={(e) => handleFilterUpdate(e.target.value, "")}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl pl-3 pr-8 py-2.5 text-slate-700 outline-none focus:border-[#00B259] focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer appearance-none"
              >
                <option value="">Category (required)</option>
                {Object.keys(SHOP_CATEGORIES).map((key) => (
                  <option key={key} value={key}>{SHOP_CATEGORIES[key].icon ? `${SHOP_CATEGORIES[key].icon} ` : ""}{SHOP_CATEGORIES[key].label}</option>
                ))}
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {currentCategory && (
              <div className="relative w-full sm:w-52">
                <select
                  value={currentSubcategory}
                  onChange={(e) => handleFilterUpdate(currentCategory, e.target.value)}
                  className="w-full bg-emerald-50/70 border border-emerald-100 text-xs font-bold rounded-xl pl-3 pr-8 py-2.5 text-emerald-800 outline-none focus:border-[#00B259] focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer appearance-none"
                >
                  <option value="">All specialties</option>
                  {SHOP_CATEGORIES[currentCategory]?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowMap(!showMap)}
            disabled={!currentCategory}
            className={`hidden sm:flex text-xs font-bold px-4 py-2.5 rounded-xl items-center gap-2 transition-all duration-300 border disabled:opacity-30 disabled:pointer-events-none flex-shrink-0 ${
              showMap
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-950/10"
                : "bg-white text-[#00B259] border-slate-200 hover:border-emerald-300 shadow-sm"
            }`}
          >
            {showMap ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
                Show directory
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                View on map
              </>
            )}
          </button>
        </div>
      </header>

      {/* thin signature accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#00B259] via-emerald-300 to-transparent opacity-60" />

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto p-4 flex gap-6 h-[calc(100vh-127px)] md:h-[calc(100vh-84px)] overflow-hidden w-full flex-1">

        {/* DESKTOP VERTICAL DISTANCE DIAL */}
        {currentCategory && (
          <section className="hidden lg:flex flex-col items-center justify-between bg-white px-4 py-6 rounded-2xl border border-slate-100 shadow-sm h-full w-[88px] shrink-0">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider text-center [writing-mode:vertical-lr] rotate-180">
              Search radius
            </span>
            <div className="flex-1 my-6 relative flex justify-center w-full">
              <input
                type="range" min="1" max="500" value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="cursor-pointer accent-[#00B259] [&::-webkit-slider-thumb]:shadow-md"
                style={{ WebkitAppearance: 'slider-vertical', width: '8px', height: '100%' }}
              />
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <span className="text-xs font-black text-slate-900 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg shadow-sm w-full text-center">
                {radius}km
              </span>
              <button
                onClick={() => fetchShops()} disabled={searching}
                className="bg-[#00B259] hover:bg-[#009c4c] text-white px-2 py-2 rounded-xl shadow-sm shadow-green-900/10 text-[11px] font-bold disabled:opacity-50 w-full transition-colors"
              >
                {searching ? "…" : "Go"}
              </button>
            </div>
          </section>
        )}

        {/* CONTAINER FOR CONTENT / MAP */}
        <section className="flex-1 flex gap-6 h-full overflow-hidden w-full relative">

          {/* DIRECTORY LIST */}
          <div className={`flex flex-col gap-4 h-full transition-all duration-500 w-full ${showMap ? "lg:w-[45%] hidden lg:flex" : "flex"}`}>

            {/* Mobile distance card */}
            {currentCategory && (
              <div className="lg:hidden bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-[#00B259] tracking-wider">Search radius</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">{radius} km</span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range" min="1" max="500" value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="flex-1 accent-[#00B259] h-1.5 rounded-full"
                    style={{ background: `linear-gradient(to right, #00B259 0%, #00B259 ${radiusPercent}%, #e2e8f0 ${radiusPercent}%, #e2e8f0 100%)` }}
                  />
                  <button onClick={() => fetchShops()} disabled={searching} className="bg-[#00B259] hover:bg-[#009c4c] text-white font-bold text-xs px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors flex-shrink-0">
                    {searching ? "…" : "Apply"}
                  </button>
                </div>
              </div>
            )}

            {/* Active filters row (desktop, quick-clear chips) */}
            {currentCategory && (
              <div className="hidden lg:flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full">
                  {catMeta?.icon ? `${catMeta.icon} ` : ""}{catMeta?.label}
                  <button onClick={() => handleFilterUpdate("", "")} className="text-slate-400 hover:text-rose-500 ml-0.5">✕</button>
                </span>
                {currentSubcategory && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
                    {currentSubcategory.replace(/_/g, ' ')}
                    <button onClick={() => handleFilterUpdate(currentCategory, "")} className="text-emerald-400 hover:text-rose-500 ml-0.5">✕</button>
                  </span>
                )}
              </div>
            )}

            {/* Shop list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-6 custom-scrollbar">
              {!currentCategory ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 max-w-xl mx-auto flex flex-col items-center justify-center shadow-sm my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                    🧭
                  </div>
                  <h3 className="text-sm font-black text-slate-800">Pick a category to get started</h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                    Choose a category from the dropdown above to see shops near your location.
                  </p>
                </div>
              ) : searching && shops.length === 0 ? (
                <div className={`grid grid-cols-1 gap-3 ${showMap ? "sm:grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                  {Array.from({ length: 6 }).map((_, i) => <ShopCardSkeleton key={i} />)}
                </div>
              ) : shops.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center w-full">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                    🔍
                  </div>
                  <p className="text-sm text-slate-700 font-bold">No shops found in this category</p>
                  <p className="text-xs text-slate-400 mt-1">Try increasing the search radius above.</p>
                </div>
              ) : (
                <>
                  <p className="lg:hidden text-[11px] font-bold text-slate-400 px-1">
                    {shops.length} shop{shops.length !== 1 ? "s" : ""} found within {radius}km
                  </p>
                  <div className={`grid grid-cols-1 gap-3 ${showMap ? "sm:grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {shops.map((shop) => (
                      <ShopCard key={shop._id} shop={shop} onClick={() => router.push(`/shop/${shop._id}`)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* DYNAMIC MAP VIEW */}
          {showMap && currentCategory && (
            <div className="absolute inset-0 lg:static flex-1 h-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-lg shadow-slate-900/5 z-30 transition-all duration-500">
              <MapView userLoc={lat ? [Number(lat), Number(lng)] : null} shops={shops} onShopClick={(id) => router.push(`/shop/${id}`)} />
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default function ShopsListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6F8F6] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#00B259] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-semibold">Loading shop directory…</p>
      </div>
    }>
      <ShopsContent />
    </Suspense>
  );
}