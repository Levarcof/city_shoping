"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SHOP_CATEGORIES } from "./constants";
import { Toast, Spinner, PageLoader } from "./SharedUI";
import ProductsTab from "./ProductsTab.js";
import OrdersTab from "./OrdersTab";
import AddProductPage from "./AddProductPage";
import ShopDetailTab from "./ShopDetailTab";
const u = {}

function LockToggle({ isOpen, onToggle }) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    setTimeout(() => { setAnimating(false); onToggle(); }, 600);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isOpen ? "Shop is Open — click to close" : "Shop is Closed — click to open"}
      className={`relative flex flex-col items-center gap-1 group transition-all duration-300 ${animating ? "scale-110" : "scale-100"}`}
    >
      {animating && (
        <span className={`absolute inset-0 rounded-full animate-ping opacity-40 ${isOpen ? "bg-green-400" : "bg-red-400"}`} />
      )}

      <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
        ${isOpen
          ? "bg-green-500/10 border-green-500/40 shadow-[0_0_16px_rgba(34,197,94,0.3)]"
          : "bg-red-500/10 border-red-500/30"
        } ${animating ? "rotate-12" : "rotate-0"}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="transition-all duration-500">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"
            fill={isOpen ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}
            stroke={isOpen ? "#22c55e" : "#ef4444"}
            strokeWidth="1.8"
          />
          <path
            d={isOpen
              ? "M8 11V7a4 4 0 0 1 7.9-1"        
              : "M8 11V7a4 4 0 0 1 8 0v4"        
            }
            stroke={isOpen ? "#22c55e" : "#ef4444"}
            strokeWidth="1.8"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <circle cx="12" cy="16" r="1.2" fill={isOpen ? "#22c55e" : "#ef4444"} />
        </svg>
      </div>

      <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isOpen ? "text-green-400" : "text-red-400"}`}>
        {animating ? "..." : isOpen ? "Open" : "Closed"}
      </span>
    </button>
  );
}

function Sidebar({ activeTab, setActiveTab, shopName, userName, userImage }) {
  const router = useRouter();
  const NAV = [
    {
      id: "shop", label: "Shop Detail",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>,
    },
    {
      id: "products", label: "Products",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    },
    {
      id: "orders", label: "Orders",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>,
    },
    {
      id: "add", label: "Add Product",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 z-40 py-6 px-4">
      <div className="flex items-center gap-2.5 mb-6 px-1">
        <div className="w-8 h-8 rounded-lg bg-[#00B259] flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span className="text-sm font-black tracking-tight text-gray-900">LocalMart</span>
      </div>

      <div className="bg-[#F0FAF4] border border-green-100 rounded-xl p-3 mb-6">
        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-0.5">Your Shop</p>
        <p className="text-sm font-black text-gray-900 truncate">{shopName || "My Shop"}</p>
        <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{userName || "Owner"}</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 w-full text-left group
                ${isActive
                  ? "bg-[#00B259] text-white shadow-sm"
                  : item.id === "add"
                    ? "text-[#00B259] border border-green-100 hover:bg-green-50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
            >
              <span className={`flex-shrink-0 ${isActive ? "text-white" : item.id === "add" ? "text-[#00B259]" : "text-gray-400 group-hover:text-gray-700"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => router.push("/profile")}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white hover:border-green-200 hover:shadow-sm transition-all duration-200 group"
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#00B259] flex items-center justify-center font-black text-white text-sm overflow-hidden ring-2 ring-white shadow-sm">
              {userImage ? (
                <img src={userImage} alt={userName || "user"} className="w-full h-full object-cover" />
              ) : (
                <span>{(userName || "O").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-black text-gray-900 truncate">{userName || "Owner"}</p>
            <p className="text-[10px] text-gray-400 font-medium truncate">Shop Owner</p>
          </div>

          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-[#00B259] group-hover:translate-x-0.5 transition-all flex-shrink-0">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ activeTab, setActiveTab, router }) {
  const NAV = [
    {
      id: "shop", label: "Shop",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    },
    {
      id: "products", label: "Products",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /></svg>,
    },
    {
      id: "add", label: "Add",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
      isCenter: true,
    },
    {
      id: "orders", label: "Orders",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>,
    },
    {
      id: "profile", label: "Profile",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
      isRoute: true,
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
      <nav className="flex items-center justify-between max-w-md mx-auto">
        {NAV.map((item) => {
          const isActive = activeTab === item.id;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <span
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-200 ${isActive
                      ? "bg-[#00B259] text-white scale-105 shadow-green-300/50"
                      : "bg-[#00B259] text-white hover:scale-105"
                    }`}
                >
                  {item.icon}
                </span>
                <span className={`text-[9px] font-black mt-1 ${isActive ? "text-[#00B259]" : "text-gray-400"}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          if (item.isRoute) {
            return (
              <button
                key={item.id}
                onClick={() => router.push("/profile")}
                className="flex flex-col items-center justify-center px-3 py-1 rounded-xl outline-none relative"
              >
                <span className="text-gray-400">{item.icon}</span>
                <span className="text-[9px] font-bold mt-0.5 text-gray-400">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center px-3 py-1 rounded-xl outline-none relative"
            >
              {isActive && <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#00B259]" />}
              <span className={`transition-all ${isActive ? "text-[#00B259]" : "text-gray-400"}`}>{item.icon}</span>
              <span className={`text-[9px] font-bold mt-0.5 ${isActive ? "text-[#00B259]" : "text-gray-400"}`}>{item.label}</span>
            </button>
          );
        })}
         

      </nav>

    </footer>
  );
}


export default function OwnerHome({ user }) {
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
const [activeTab, setActiveTab] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ownerActiveTab") || "products";
  }
  return "products";
});
  u.image = user?.image || "";

  useEffect(() => { fetchMyShop(); }, []); 
  useEffect(() => {
  if (typeof window !== "undefined") {
    localStorage.setItem("ownerActiveTab", activeTab);
  }
}, [activeTab]);

  const fetchMyShop = async () => {
    try {
      const res = await fetch(`/api/myShop/${user.id}`);
      const data = await res.json();
      if (data.success) setShop(data.shop);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const showToast = useCallback((msg) => {
    setToast(msg); setTimeout(() => setToast(""), 3000);
  }, []);

  const toggleStatus = useCallback(async () => {
    if (!shop) return;
    const prev = shop.isActive;
    setShop((s) => ({ ...s, isActive: !s.isActive }));
    try {
      const res = await fetch(`/api/shops/${shop._id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (!data.success) { setShop((s) => ({ ...s, isActive: prev })); showToast("Toggle failed"); }
      else showToast(data.isActive ? "✓ Shop is now Open" : "✕ Shop is now Closed");
    } catch { setShop((s) => ({ ...s, isActive: prev })); showToast("Network error"); }
  }, [shop, showToast]);

  const handleProductAdded = useCallback((newItem) => {
    setShop((s) => ({ ...s, items: [...(s.items || []), newItem] }));
    setActiveTab("products");
    showToast("Product added!");
  }, [showToast]);

  const handleDeleteProduct = useCallback(async (itemId) => {
    try {
      const res = await fetch(`/api/products/${shop._id}/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setShop((s) => ({ ...s, items: s.items.filter((i) => i._id !== itemId) }));
        showToast("Product removed");
      }
    } catch { showToast("Delete failed"); }
  }, [shop, showToast]);

  if (loading) return <PageLoader text="Loading your dashboard…" />;

  if (!shop) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">🏪</div>
      <p className="text-gray-500 font-semibold text-sm">No shop linked to this account</p>
      <button onClick={() => router.push("/register")} className="bg-[#00B259] hover:bg-green-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
        Register your shop
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6F4] font-sans antialiased pb-24 md:pb-0">
      <Toast msg={toast} />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shopName={shop.name}
        userName={user?.name}
        userImage={user?.image}
      />

      <div className="md:ml-56 flex flex-col min-h-screen">

        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex md:hidden items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00B259] flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black text-gray-900 leading-tight">{shop.name}</h1>
              <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">
                {SHOP_CATEGORIES[shop.category]?.label || "Shop"}
                {shop.location?.city ? ` · ${shop.location.city}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
              ${shop.isActive
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-red-50 text-red-500 border-red-100"
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${shop.isActive ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
              {shop.isActive ? "Open" : "Closed"}
            </div>

            <LockToggle isOpen={shop.isActive} onToggle={toggleStatus} />
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6">
          {activeTab === "products" && (
            <ProductsTab
              shop={shop}
              onDelete={handleDeleteProduct}
              onAddClick={() => setActiveTab("add")}
              onShopUpdated={(updatedShop) => setShop(updatedShop)}
              showToast={showToast}
            />
          )}
          {activeTab === "orders" && (
            <OrdersTab shopId={shop._id} />
          )}
          {activeTab === "add" && (
            <AddProductPage
              shopId={shop._id}
              onSuccess={handleProductAdded}
              onCancel={() => setActiveTab("products")}
            />
          )}
          {activeTab === "shop" && (
            <ShopDetailTab
              shop={shop}
              showToast={showToast}
              onShopUpdated={(updatedShop) => setShop(updatedShop)}
            />
          )}
        </main>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} router={router} />
    </div>
  );
}