"use client";
import { useEffect, useState, useCallback, useMemo, useRef, memo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
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

/* ═══════════════════════════════════ icons ═══════════════════════════════════ */
const StorefrontIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const PinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const CompassIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M15.3 8.7l-2 4.6-4.6 2 2-4.6 4.6-2z" />
  </svg>
);
const SearchOffIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
  </svg>
);
const CloseIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const BackIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const ChevronIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ListIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
  </svg>
);
const MapIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

/* ═══════════════════════════════════ shop card ═══════════════════════════════════ */
const ShopCard = memo(function ShopCard({ shop, index }) {
  return (
    <Link
      href={`/shop/${shop._id}`}
      prefetch
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
      className="card-anim group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-900/[0.06] hover:border-[#00B259]/30 hover:-translate-y-0.5 transition-all duration-300 flex p-3 gap-4"
    >
      <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 relative flex-shrink-0 rounded-xl overflow-hidden border border-slate-100">
        {shop.thumbnail ? (
          <img
            src={shop.thumbnail}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={shop.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50/50">
            <StorefrontIcon className="w-7 h-7 md:w-8 md:h-8 text-[#00B259]/30" />
          </div>
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
              <PinIcon className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
              {shop.distance.toFixed(1)} km away
            </p>
          )}
        </div>
        <div className="flex justify-between items-center text-xs mt-1.5 pt-1.5 border-t border-slate-50">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold tracking-wide border ${
            shop.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${shop.isActive ? "bg-emerald-500 motion-safe:animate-pulse" : "bg-rose-400"}`} />
            {shop.isActive ? "Open now" : "Closed"}
          </span>
          <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#00B259] group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0">
            <ArrowRightIcon className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
});

/* ═══════════════════════════════════ skeleton ═══════════════════════════════════ */
const ShopCardSkeleton = memo(function ShopCardSkeleton() {
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
});

/* ═══════════════════════════════════ main content ═══════════════════════════════════ */
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

  // session-only response cache + in-flight request guard, so switching
  // between categories/subcategories you've already seen is instant and
  // rapid changes don't pile up redundant network requests.
  const cacheRef = useRef(new Map());
  const abortRef = useRef(null);

  useEffect(() => {
    if (urlCategory) setCurrentCategory(urlCategory);
    if (urlSubcategory !== null) setCurrentSubcategory(urlSubcategory || "");
  }, [urlCategory, urlSubcategory]);

  const fetchShops = useCallback(async (overrideCat = currentCategory, overrideSubcat = currentSubcategory) => {
    if (!lat || !lng || !overrideCat) return;

    const cacheKey = `${lat}|${lng}|${radius}|${overrideCat}|${overrideSubcat}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setShops(cached);
      setSearching(false);
      return;
    }

    // cancel any in-flight request before starting a new one, so a slow
    // earlier response can never overwrite a newer one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    try {
      const p = new URLSearchParams({
        lat,
        lng,
        radius: radius.toString(),
        category: overrideCat
      });
      if (overrideSubcat) p.append("subcategory", overrideSubcat);

      const res = await fetch(`/api/shops?${p}`, { signal: controller.signal });
      const data = await res.json();
      if (data.success) {
        cacheRef.current.set(cacheKey, data.shops || []);
        setShops(data.shops || []);
      } else {
        setShops([]);
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
        setShops([]);
      }
      return;
    } finally {
      if (abortRef.current === controller) setSearching(false);
    }
  }, [lat, lng, radius, currentCategory, currentSubcategory]);

  // single source of truth for fetching: category/subcategory changes flow
  // through here only, so a filter change never fires two requests at once
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
    // fetchShops runs automatically from the effect above once state updates
  };

  const radiusPercent = Math.min(100, Math.max(0, ((radius - 1) / (500 - 1)) * 100));
  const categoryKeys = useMemo(() => Object.keys(SHOP_CATEGORIES), []);
  const catMeta = useMemo(() => (currentCategory ? SHOP_CATEGORIES[currentCategory] : null), [currentCategory]);

  return (
    <div className="min-h-screen bg-[#F6F8F6] text-slate-800 antialiased flex flex-col">

      {/* ── HEADER ── */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 sticky top-0 z-40 md:px-6 md:py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <button
              onClick={() => router.push("/")}
              aria-label="Go back"
              className="text-xs font-bold text-slate-500 hover:text-[#00B259] flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all flex-shrink-0"
            >
              <BackIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="sm:hidden min-w-0 text-center flex-1">
              <h1 className="text-xs font-black tracking-tight text-slate-800 uppercase truncate">
                {catMeta ? `${catMeta.icon ? catMeta.icon + " " : ""}${catMeta.label}` : "Shops Near Me"}
              </h1>
            </div>

            {/* Mobile List/Map segmented toggle — opens the same map used on desktop */}
            <div className="sm:hidden flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl p-0.5 flex" role="tablist" aria-label="View mode">
              <button
                onClick={() => setShowMap(false)}
                disabled={!currentCategory}
                aria-pressed={!showMap}
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-[10px] transition-all disabled:opacity-30 ${!showMap ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"}`}
              >
                <ListIcon className="w-3 h-3" /> List
              </button>
              <button
                onClick={() => setShowMap(true)}
                disabled={!currentCategory}
                aria-pressed={showMap}
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-[10px] transition-all disabled:opacity-30 ${showMap ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"}`}
              >
                <MapIcon className="w-3 h-3" /> Map
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
                {categoryKeys.map((key) => (
                  <option key={key} value={key}>{SHOP_CATEGORIES[key].icon ? `${SHOP_CATEGORIES[key].icon} ` : ""}{SHOP_CATEGORIES[key].label}</option>
                ))}
              </select>
              <ChevronIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
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
                <ChevronIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-500 pointer-events-none" />
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
            {showMap ? (<><ListIcon className="w-3.5 h-3.5" /> Show directory</>) : (<><MapIcon className="w-3.5 h-3.5" /> View on map</>)}
          </button>
        </div>
      </header>

      {/* thin signature accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#00B259] via-emerald-300 to-transparent opacity-60" />

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto p-4 flex gap-6 h-[calc(100vh-127px)] md:h-[calc(100vh-84px)] overflow-hidden w-full flex-1 min-h-0">

        {/* DESKTOP VERTICAL DISTANCE DIAL */}
        {currentCategory && (
          <section className="hidden lg:flex flex-col items-center justify-between bg-white px-4 py-6 rounded-2xl border border-slate-100 shadow-sm h-full w-[88px] shrink-0">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider text-center [writing-mode:vertical-lr] rotate-180">
              Search radius
            </span>
            {/* standard horizontal range, rotated — robust across every browser, unlike the
                non-standard -webkit-appearance:slider-vertical (Firefox never supported it) */}
            <div className="flex-1 my-6 flex items-center justify-center w-full">
              <input
                type="range" min="1" max="500" value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                aria-label="Search radius in kilometers"
                className="cursor-pointer accent-[#00B259] w-36 -rotate-90"
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
        <section className="flex-1 flex gap-6 h-full overflow-hidden w-full relative min-h-0">

          {/* DIRECTORY LIST */}
          <div className={`flex flex-col gap-4 h-full min-h-0 transition-all duration-500 w-full ${showMap ? "lg:w-[45%] hidden lg:flex" : "flex"}`}>

            {/* Mobile distance card */}
            {currentCategory && (
              <div className="lg:hidden bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm space-y-2.5 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-[#00B259] tracking-wider">Search radius</span>
                  <span className="text-xs  font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">{radius} km</span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range" min="1" max="30" value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    aria-label="Search radius in kilometers"
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
              <div className="hidden lg:flex items-center gap-2 flex-wrap flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full">
                  {catMeta?.icon ? `${catMeta.icon} ` : ""}{catMeta?.label}
                  <button onClick={() => handleFilterUpdate("", "")} aria-label="Clear category filter" className="text-slate-400 hover:text-rose-500 ml-0.5">
                    <CloseIcon className="w-2.5 h-2.5" />
                  </button>
                </span>
                {currentSubcategory && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
                    {currentSubcategory.replace(/_/g, ' ')}
                    <button onClick={() => handleFilterUpdate(currentCategory, "")} aria-label="Clear specialty filter" className="text-emerald-400 hover:text-rose-500 ml-0.5">
                      <CloseIcon className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Shop list */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 pb-6 custom-scrollbar">
              {!currentCategory ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 max-w-xl mx-auto flex flex-col items-center justify-center shadow-sm my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
                    <CompassIcon className="w-6 h-6 text-amber-500" />
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
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                    <SearchOffIcon className="w-6 h-6 text-slate-400" />
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
                    {shops.map((shop, i) => (
                      <ShopCard key={shop._id} shop={shop} index={i} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* DYNAMIC MAP VIEW — same component powers both mobile (full-screen overlay,
              toggled via the List/Map pill above) and desktop (side-by-side panel) */}
          {showMap && currentCategory && (
            <div className="absolute inset-0 lg:static flex-1 h-full min-h-0 rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-lg shadow-slate-900/5 z-30 transition-all duration-500">
              <MapView userLoc={lat ? [Number(lat), Number(lng)] : null} shops={shops} onShopClick={(id) => router.push(`/shop/${id}`)} />
            </div>
          )}

        </section>
      </main>

      <style jsx global>{`
        .card-anim {
          animation: shopCardIn 0.45s ease backwards;
        }
        @keyframes shopCardIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .card-anim { animation: none !important; }
        }
      `}</style>
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