"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SHOP_CATEGORIES } from "@/app/constants/shopCategories";

// 👉 adjust these paths to match where your existing tab components/pages live
import CartPage from "@/app/cart/page";
import OrdersPage from "@/app/orders/page";
// import FavouritesPage from "@/app/favourites/page";
import ProfilePage from "@/app/profile/page";

// Wrapper needed because useSearchParams() requires a Suspense boundary
export default function CustomerHome({ user }) {
  return (
    <Suspense fallback={null}>
      <CustomerHomeInner user={user} />
    </Suspense>
  );
}

function CustomerHomeInner({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loc, setLoc] = useState({ lat: null, lng: null });
  const [locErr, setLocErr] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // NEW: active tab now comes from the URL (?tab=cart), not just local state.
  // This is what makes it survive a page refresh.
  const [activeNav, setActiveNav] = useState(searchParams.get("tab") || "home");

  // Keep activeNav in sync if the URL changes from outside (e.g. browser back/forward)
  useEffect(() => {
    setActiveNav(searchParams.get("tab") || "home");
  }, [searchParams]);

  const GOODS_ITEMS = [
    { key: "food_grocery", subkey: "sabzi_fruit", label: "Fruits", img: "https://images.pexels.com/photos/5677921/pexels-photo-5677921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" },
    { key: "hobby_other", subkey: "flower_florist", label: "Flowers", img: "https://tse2.mm.bing.net/th/id/OIP.E9J0rwYCOlgANrXXXC4vLwHaEo?pid=Api&P=0&h=180" },
    { key: "food_grocery", subkey: "bakery", label: "Bakery", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=60" },
    { key: "food_grocery", subkey: "dairy", label: "Dairy", img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&auto=format&fit=crop&q=60" },
    { key: "fashion_apparel", subkey: "general_clothes", label: "Clothes", img: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=150&auto=format&fit=crop&q=60" },
    { key: "electronics_hardware", subkey: "electronics", label: "Electronics", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&auto=format&fit=crop&q=60" },
    { key: "food_grocery", subkey: "kirana", label: "Grocery", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&auto=format&fit=crop&q=60" },
    { key: "health_beauty", subkey: "medical_store", label: "Medicines", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=60" },
  ];

  // NEW: "path" is kept only as a fallback/reference — it's no longer used for navigation
  const NAV_LINKS = [
    {
      id: "home", label: "Home", path: "/",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      id: "cart", label: "Cart", path: "/cart",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    },
    {
      id: "orders", label: "Orders", path: "/orders",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    },
    {
      id: "favourite", label: "Saved", path: "/favourites",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    },
    {
      id: "profile", label: "Profile", path: "/profile",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
  ];

  const CATEGORY_COLORS = [
    "bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100/60",
    "bg-violet-50 border-violet-100 hover:border-violet-300 hover:bg-violet-100/60",
    "bg-amber-50 border-amber-100 hover:border-amber-300 hover:bg-amber-100/60",
    "bg-sky-50 border-sky-100 hover:border-sky-300 hover:bg-sky-100/60",
    "bg-rose-50 border-rose-100 hover:border-rose-300 hover:bg-rose-100/60",
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setLocErr("Location permission denied.")
      );
    }
  }, []);

  const handleCategorySelect = (catKey, subCatKey = "") => {
    const params = new URLSearchParams();
    if (loc.lat !== null && loc.lng !== null) {
      params.set("lat", String(loc.lat));
      params.set("lng", String(loc.lng));
    }
    params.set("category", catKey);
    if (subCatKey && subCatKey.trim() !== "") {
      params.set("subcategory", subCatKey);
    }
    router.push(`/shops?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    if (loc.lat && loc.lng) {
      params.append("lat", loc.lat.toString());
      params.append("lng", loc.lng.toString());
    }
    params.append("query", searchQuery.trim());
    router.push(`/shops?${params.toString()}`);
  };

  // NEW: this is what nav clicks call now — updates local state immediately
  // AND writes ?tab=... into the URL so a refresh reopens the same tab.
  const handleNavSelect = (id) => {
    setActiveNav(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isHome = activeNav === "home";

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-gray-900 pb-20 md:pb-0 font-sans antialiased">

      {/* ══════════════════════════════════
          DESKTOP SIDEBAR — fixed left, always visible
      ══════════════════════════════════ */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 z-40 py-7 px-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#00B259] flex items-center justify-center shadow-sm flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="text-base font-black tracking-tight text-gray-900">LocalMart</span>
        </div>

        {/* User card */}
        {/* <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-7 border border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-[#00B259] flex items-center justify-center font-black text-white text-sm overflow-hidden flex-shrink-0">
           
               <img src={user.image} alt="user" className="w-full h-full object-cover" />
            
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate leading-tight">{user?.name || "Nivedha"}</p>
            <p className="text-[11px] text-gray-400 truncate">Nearby delivery</p>
          </div>
        </div> */}

        {/* Nav — now switches tabs instead of navigating */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_LINKS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavSelect(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 w-full text-left group
                  ${isActive ? "bg-[#00B259] text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
              >
                <span className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-700"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Notifications — kept as a real navigation since it's not a bottom-nav tab */}
        <button
          onClick={() => router.push("/notifications")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all w-full text-left mt-3 border-t border-gray-100 pt-4"
        >
          <span className="relative flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00B259] border-2 border-white" />
          </span>
          <span>Notifications</span>
        </button>
      </aside>

      {/* ══════════════════════════════════
          MAIN CONTENT — offset by sidebar
      ══════════════════════════════════ */}
      <div className="md:ml-60 flex flex-col min-h-screen">

        {/* Top bars only make sense for the Home tab — other tabs (Cart/Orders/etc.)
            already carry their own header. Hide these on non-home tabs to avoid
            double headers. */}
        {isHome && (
          <>
            {/* ── DESKTOP TOP BAR ── */}
            <header className="hidden md:flex sticky top-0 z-30 bg-white border-b border-gray-100 px-8 py-3.5 items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">Good morning,</p>
                <h2 className="text-sm font-black text-gray-900 leading-tight">{user?.name || "Nivedha"} 👋</h2>
              </div>
              <div className="flex items-center gap-2.5">
                <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00B259] border-2 border-white" />
                </button>
                <div
                  onClick={() => handleNavSelect("profile")}
                  className="w-9 h-9 rounded-xl bg-[#00B259] flex items-center justify-center font-black text-white text-sm cursor-pointer overflow-hidden"
                >
                     <img src={user.image} alt="user" className="w-full h-full object-cover" />
                   
                </div>
              </div>
            </header>

            {/* ── MOBILE TOP BAR ── */}
            <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#00B259] flex items-center justify-center flex-shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <span className="text-sm font-black text-gray-900">LocalMart</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00B259] border border-white" />
                </button>
                <div
                  onClick={() => handleNavSelect("profile")}
                  className="w-8 h-8 rounded-xl bg-[#00B259] flex items-center justify-center font-black text-white text-xs overflow-hidden cursor-pointer"
                >
                   <img src={user.image} alt="user" className="w-full h-full object-cover" />
                </div>
              </div>
            </header>
          </>
        )}

        {/* ══════════════════════════════════
            TAB CONTENT — swaps based on activeNav
        ══════════════════════════════════ */}
        {isHome && (
          <main className="flex-1 px-4 md:px-8 py-5 md:py-7 space-y-7">

            {/* ══════════════════════════════════
                HERO BANNER
            ══════════════════════════════════ */}
            <section
              className="relative w-full rounded-2xl overflow-hidden cursor-pointer"
              style={{ height: "clamp(180px, 30vw, 340px)" }}
              onClick={() => handleCategorySelect("food_grocery")}
            >
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=85"
                alt="Fresh Foods"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end md:justify-center px-5 md:px-10 pb-5 md:pb-0 z-10">
                <div className="max-w-md space-y-2 md:space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-[#00B259] text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                    Fresh deliveries near you
                  </div>

                  <h1 className="text-xl md:text-4xl font-black text-white leading-tight tracking-tight">
                    Organic &amp; Local<br className="hidden md:block" />
                    <span className="text-emerald-300"> at your door</span>
                  </h1>

                  <p className="hidden md:block text-white/70 text-sm font-medium max-w-xs leading-relaxed">
                    Premium produce from trusted local shops. Up to 50% off today.
                  </p>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleCategorySelect("food_grocery"); }}
                    className="inline-flex items-center gap-1.5 bg-white text-[#00B259] text-xs md:text-sm font-black px-4 md:px-5 py-2 md:py-2.5 rounded-xl hover:bg-emerald-50 active:scale-95 transition-all shadow-md"
                  >
                    Shop now
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 hidden md:flex items-center gap-6 bg-black/30 backdrop-blur-sm px-8 py-2.5 rounded-tl-2xl z-10">
                {[
                  { value: "200+", label: "Local shops" },
                  { value: "28 min", label: "Avg delivery" },
                  { value: "50K+", label: "Customers" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-white font-black text-sm leading-none">{s.value}</p>
                    <p className="text-white/50 text-[10px] mt-0.5 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ══════════════════════════════════
                QUICK PICKS
            ══════════════════════════════════ */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm md:text-base font-black text-gray-900 tracking-tight">Quick picks</h2>
                  <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-0.5">Source essentials instantly</p>
                </div>
                <button className="text-[11px] text-[#00B259] font-bold hover:underline">See all</button>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 md:gap-4">
                {GOODS_ITEMS.map((item) => (
                  <button
                    key={`${item.subkey}-${item.label}`}
                    type="button"
                    onClick={() => handleCategorySelect(item.key, item.subkey)}
                    className="flex flex-col items-center gap-2 group outline-none"
                  >
                    <div className="relative w-[62px] h-[62px] md:w-[72px] md:h-[72px] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-[#00B259]/40 group-hover:scale-105 transition-all duration-200 mx-auto">
                      <img
                        src={item.img}
                        alt={item.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] md:text-[11px] font-bold text-gray-600 group-hover:text-[#00B259] transition-colors text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* ══════════════════════════════════
                EXPLORE CATEGORIES
            ══════════════════════════════════ */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm md:text-base font-black text-gray-900 tracking-tight">Explore categories</h2>
                  <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-0.5">Best local stores by type</p>
                </div>
                <button className="text-[11px] text-[#00B259] font-bold hover:underline">See all</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {Object.entries(SHOP_CATEGORIES).map(([key, cat], i) => (
                  <div
                    key={key}
                    onClick={() => handleCategorySelect(key)}
                    className={`group ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} border rounded-2xl p-4 md:p-5 flex flex-col gap-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
                  >
                    <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm border border-white">
                      {cat.icon || "🏪"}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-800 text-xs md:text-sm group-hover:text-[#00B259] transition-colors leading-tight line-clamp-1">
                        {cat.label}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {cat.subcategories?.length || 0} types
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>
        )}

        {/* Other tabs render their existing page components directly —
            each one manages its own layout/header internally. */}
        {activeNav === "cart" && <CartPage />}
        {activeNav === "orders" && <OrdersPage />}
        {activeNav === "favourite" && <FavouritesPage />}
        {activeNav === "profile" && <ProfilePage />}
      </div>

      {/* ══════════════════════════════════
          MOBILE BOTTOM NAV — always visible, switches tabs
      ══════════════════════════════════ */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 px-2 pt-2 pb-safe md:hidden shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
        <nav className="flex items-center justify-around max-w-md mx-auto pb-1">
          {NAV_LINKS.map((navItem) => {
            const isActive = activeNav === navItem.id;
            return (
              <button
                key={navItem.id}
                onClick={() => handleNavSelect(navItem.id)}
                className="flex flex-col items-center justify-center px-3 py-1 rounded-xl outline-none relative min-w-[48px]"
              >
                {isActive && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#00B259]" />
                )}
                <span className={`transition-all duration-150 ${isActive ? "text-[#00B259]" : "text-gray-400"}`}>
                  {navItem.icon}
                </span>
                <span className={`text-[9px] font-bold mt-0.5 ${isActive ? "text-[#00B259]" : "text-gray-400"}`}>
                  {navItem.label}
                </span>
              </button>
            );
          })}
        </nav>
      </footer>

    </div>
  );
}