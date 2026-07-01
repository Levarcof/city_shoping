"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { SHOP_CATEGORIES } from "@/app/constants/shopCategories";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const FALLBACK_IMG =
  "https://www.backdropsandfloors.com/assets/images/Serene_Seeds_Flower_Shop_LB_Jessica_Ruth_Photography.jpg";

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
const IC = {
  Back: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  ),
  Heart: ({ on }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? "#ef4444" : "none"} stroke={on ? "#ef4444" : "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Phone: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  WA: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  ),
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Cart: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Pin: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Tag: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  ChevR: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function ShopDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Products");
  const [filter, setFilter] = useState("");
  const [toast, setToast] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState({});
  const [activeImg, setActiveImg] = useState(0);
  const touchStartX = useRef(0);

  const toast$ = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => { if (id) fetchShop(); }, [id]);
  useEffect(() => { setActiveImg(0); }, [id]);

  const fetchShop = async () => {
    try {
      const res = await fetch(`/api/shops/${id}`);
      const data = await res.json();
      if (data.success) setShop(data.shop);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addToCart = async (e, item) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: shop._id, itemId: item._id, name: item.name,
          price: item.price, quantity: 1, image: item.image, shopName: shop.name,
        }),
      });
      if (res.ok) {
        setAdded(p => ({ ...p, [item._id]: true }));
        toast$(`${item.name} added to cart`);
        setTimeout(() => setAdded(p => ({ ...p, [item._id]: false })), 2000);
      }
    } catch (e) { console.error(e); }
  };

  /* Loading */
  if (loading) return (
    <div style={S.page}>
      <div style={S.spinWrap}>
        <div style={S.spinner} />
        <p style={S.spinLabel}>Loading shop…</p>
      </div>
    </div>
  );

  /* 404 */
  if (!shop) return (
    <div style={{ ...S.page, alignItems: "center", justifyContent: "center", gap: 12, padding: "0 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48 }}>🏪</div>
      <h2 style={{ color: "#111", fontWeight: 700, fontSize: 20, margin: 0 }}>Shop not found</h2>
      <p style={{ color: "#888", fontSize: 14, margin: 0 }}>This link may be invalid or the shop was removed.</p>
      <button onClick={() => router.back()} style={S.btnOutlineGreen}>Go back</button>
    </div>
  );

  const items = filter
    ? shop.items?.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()) || i.category === filter)
    : shop.items;

  const tel = `tel:${shop.phone}`;
  const wa = `https://wa.me/${shop.whatsapp?.replace(/[^0-9]/g, "")}`;

  // Supports a `shop.images` array (recommended) and falls back to the single thumbnail.
  const galleryImages = shop.images?.length ? shop.images : (shop.thumbnail ? [shop.thumbnail] : [FALLBACK_IMG]);
  const hasMultipleImages = galleryImages.length > 1;

  const nextImg = (e) => { e?.stopPropagation(); setActiveImg(p => (p + 1) % galleryImages.length); };
  const prevImg = (e) => { e?.stopPropagation(); setActiveImg(p => (p - 1 + galleryImages.length) % galleryImages.length); };
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 45) { dx < 0 ? nextImg() : prevImg(); }
  };

  return (
    <div style={S.page}>
      {/* ── CSS resets & utilities */}
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#f7f9f7}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        button{font-family:inherit}
        button:focus-visible{outline:2px solid #22c55e;outline-offset:2px}
        @media (prefers-reduced-motion: reduce){
          *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
        }

        .tab-indicator{position:absolute;bottom:0;left:0;right:0;height:3px;background:#22c55e;border-radius:3px 3px 0 0}
        .card-hover{transition:box-shadow .18s,border-color .18s,transform .18s}
        .card-hover:hover{box-shadow:0 10px 28px rgba(0,0,0,.10);border-color:#d1fae5!important;transform:translateY(-3px)}
        .btn-green:hover{background:#16a34a!important}
        .btn-green:active{transform:scale(0.97)}
        .btn-wa:hover{background:#1da851!important}
        .chip-active{background:#dcfce7;border-color:#86efac;color:#15803d}
        .chip-idle{background:#fff;border-color:#e5e7eb;color:#6b7280}
        .chip-idle:hover{border-color:#bbf7d0;color:#16a34a}
        .prod-card:hover .prod-img{transform:scale(1.05)}
        .add-btn:active{transform:scale(.96)}
        ::-webkit-scrollbar{display:none}
        scrollbar-width:none;
        .line2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .truncate1{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}

        /* Shared responsive container — keeps header / tabs / content aligned and lets
           the page use real desktop width instead of sitting in a narrow centered column. */
        .container{width:100%;max-width:900px;margin:0 auto}
        @media (min-width:1024px){.container{max-width:1180px}}
        @media (min-width:1440px){.container{max-width:1360px}}

        .header-row{display:flex;padding:0 16px}
        @media (min-width:768px){.header-row{padding:0 24px}}
        @media (min-width:1024px){.header-row{padding:0 40px}}

        .main-pad{padding:20px 16px 44px}
        @media (min-width:768px){.main-pad{padding:26px 24px 52px}}
        @media (min-width:1024px){.main-pad{padding:34px 40px 60px}}

        .tab-panel{animation:fadeIn .2s ease}
        .narrow-col{max-width:720px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:14px}

        /* Hero gallery */
        .hero-main{position:relative;width:100%;aspect-ratio:4/3;background:#eef2f0;overflow:hidden}
        @media (min-width:640px){.hero-main{aspect-ratio:16/9}}
        @media (min-width:1024px){.hero-main{aspect-ratio:21/8}}

        .hero-arrow{position:absolute;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:50%;border:none;background:rgba(15,23,20,.4);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;transition:background .15s}
        .hero-arrow:hover{background:rgba(15,23,20,.6)}

        .thumb-strip{display:flex;gap:8px;overflow-x:auto;padding:2px 0}
        .thumb-btn{width:58px;height:58px;flex-shrink:0;border-radius:12px;overflow:hidden;border:2px solid transparent;padding:0;cursor:pointer;background:#f3f4f6;transition:border-color .15s,transform .15s}
        .thumb-btn:hover{transform:translateY(-1px)}
        .thumb-btn img{width:100%;height:100%;object-fit:cover;display:block}
        .thumb-active{border-color:#22c55e}
        @media (min-width:768px){.thumb-btn{width:74px;height:74px}}

        /* Product grid — auto-fill lets columns actually spread across the wide
           container instead of clumping in the middle on desktop. */
        .prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
        @media (min-width:640px){.prod-grid{grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px}}
        @media (min-width:1024px){.prod-grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:22px}}

        .map-box{height:280px}
        @media (min-width:768px){.map-box{height:360px}}
        @media (min-width:1024px){.map-box{height:440px}}
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 200, display: "flex", alignItems: "center", gap: 8,
          background: "#fff", border: "1.5px solid #bbf7d0", borderRadius: 14,
          padding: "10px 18px", boxShadow: "0 8px 32px rgba(0,0,0,.12)",
          fontSize: 13, fontWeight: 600, color: "#15803d", whiteSpace: "nowrap",
          animation: "slideDown .25s ease both",
        }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e" }}>
            <IC.Check />
          </span>
          {toast.msg}
        </div>
      )}

      {/* ── HEADER (stylish brand navbar) ── */}
      <header style={S.header}>
        <div className="container header-row" style={S.headerInner}>
          <button onClick={() => router.back()} style={S.iconBtn} aria-label="Back">
            <IC.Back />
          </button>

          <div style={S.headerBrand}>
            <span style={S.headerAvatar}>{shop.name?.charAt(0)?.toUpperCase() || "S"}</span>
            <div style={S.headerTextCol}>
              <span style={S.headerName} className="truncate1">{shop.name}</span>
              <span style={S.headerSub} className="truncate1">{SHOP_CATEGORIES[shop.category]?.label || shop.category}</span>
            </div>
          </div>

          <button
            onClick={() => { setWishlisted(p => !p); toast$(wishlisted ? "Removed from wishlist" : "Saved to wishlist"); }}
            style={{ ...S.iconBtn, color: wishlisted ? "#ef4444" : "#6b7280" }}
            aria-label="Wishlist"
          >
            <IC.Heart on={wishlisted} />
          </button>
        </div>
      </header>

      {/* ── HERO IMAGE GALLERY ── */}
      <div className="hero-main" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <img
          src={galleryImages[activeImg]}
          alt={`${shop.name} photo ${activeImg + 1}`}
          style={S.heroImg}
        />
        <div style={S.heroOverlay} />

        <span style={S.catBadge}>
          <IC.Tag /> {SHOP_CATEGORIES[shop.category]?.label || shop.category}
        </span>
        <span style={{ ...S.statusPill, background: shop.isActive ? "#dcfce7" : "#fee2e2", color: shop.isActive ? "#15803d" : "#dc2626" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: shop.isActive ? "#22c55e" : "#ef4444", boxShadow: shop.isActive ? "0 0 6px #22c55e" : "none" }} />
          {shop.isActive ? "Open Now" : "Closed"}
        </span>

        {hasMultipleImages && (
          <>
            <span style={S.heroCounter}>{activeImg + 1} / {galleryImages.length}</span>
            <button className="hero-arrow" style={{ left: 12 }} onClick={prevImg} aria-label="Previous photo">
              <span style={{ display: "flex", transform: "rotate(180deg)" }}><IC.ChevR /></span>
            </button>
            <button className="hero-arrow" style={{ right: 12 }} onClick={nextImg} aria-label="Next photo">
              <IC.ChevR />
            </button>
          </>
        )}
      </div>

      {/* ── THUMBNAIL STRIP (shows every photo) ── */}
      {hasMultipleImages && (
        <div style={S.galleryPanel}>
          <div className="thumb-strip">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`thumb-btn ${activeImg === i ? "thumb-active" : ""}`}
                aria-label={`View photo ${i + 1}`}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB BAR ── */}
      <div style={S.tabBar}>
        <div className="container header-row" style={S.tabInner}>
          {["Products", "About", "Location"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              ...S.tabBtn,
              color: activeTab === t ? "#16a34a" : "#9ca3af",
              fontWeight: activeTab === t ? 700 : 600,
            }}>
              {t}
              {activeTab === t && <span className="tab-indicator" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <main className="container main-pad">

        {/* ════ PRODUCTS ════ */}
        {activeTab === "Products" && (
          <div className="tab-panel">
            {/* Filter chips */}
            {shop.subcategories?.length > 0 && (
              <div style={S.chipRow}>
                <button onClick={() => setFilter("")} className={!filter ? "chip-active" : "chip-idle"} style={S.chip}>
                  All
                </button>
                {shop.subcategories.map(sub => (
                  <button key={sub} onClick={() => setFilter(sub)} className={filter === sub ? "chip-active" : "chip-idle"} style={S.chip}>
                    {sub.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            )}

            {/* Count */}
            <p style={S.countLabel}>{items?.length || 0} item{items?.length !== 1 ? "s" : ""}</p>

            {/* Grid — uses full container width, no more desktop centering */}
            <div className="prod-grid">
              {items?.map(item => {
                const hasDiscount = item.mrp && item.mrp > item.price;
                const discountPct = hasDiscount ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
                return (
                  <div
                    key={item._id}
                    onClick={() => router.push(`/product/${item._id}?shopId=${shop._id}`)}
                    className="card-hover prod-card"
                    style={S.prodCard}
                  >
                    {/* Image — object-fit:contain so the full product is always visible */}
                    <div style={S.prodImgWrap}>
                      {item.image
                        ? <img src={item.image} alt={item.name} className="prod-img" style={S.prodImg} />
                        : <div style={S.prodNoImg}>No image</div>
                      }
                      {hasDiscount && <span style={S.discountBadge}>{discountPct}% OFF</span>}
                      <span style={{
                        ...S.stockBadge,
                        background: item.inStock ? "#dcfce7" : "#fee2e2",
                        color: item.inStock ? "#15803d" : "#dc2626",
                      }}>
                        {item.inStock ? "In Stock" : "Sold Out"}
                      </span>
                    </div>
                    {/* Info */}
                    <div style={S.prodInfo}>
                      {item.category && <span style={S.prodCat}>{item.category.replace(/_/g, " ")}</span>}
                      <p style={S.prodName} className="line2">{item.name}</p>
                      <p style={S.prodPrice}>
                        <span style={{ fontWeight: 800, color: "#111" }}>₹{item.price}</span>
                        {hasDiscount && <span style={S.mrpText}>₹{item.mrp}</span>}
                        <span style={{ color: "#9ca3af", fontWeight: 500 }}> / {item.unit}</span>
                      </p>
                      <button
                        onClick={e => addToCart(e, item)}
                        disabled={!item.inStock}
                        className="add-btn"
                        style={{
                          ...S.addBtn,
                          ...(added[item._id]
                            ? { background: "#dcfce7", borderColor: "#86efac", color: "#15803d" }
                            : item.inStock
                            ? { background: "#f0fdf4", borderColor: "#bbf7d0", color: "#16a34a" }
                            : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#d1d5db", cursor: "not-allowed" }),
                        }}
                      >
                        {added[item._id] ? <><IC.Check /> Added</> : <><IC.Cart /> Add</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty */}
            {(!items || items.length === 0) && (
              <div style={S.emptyState}>
                <div style={{ fontSize: 44, lineHeight: 1 }}>📦</div>
                <p style={{ fontWeight: 700, color: "#111", fontSize: 15 }}>No products found</p>
                <p style={{ color: "#9ca3af", fontSize: 13 }}>Try a different filter or check back later.</p>
              </div>
            )}
          </div>
        )}

        {/* ════ ABOUT ════ */}
        {activeTab === "About" && (
          <div className="tab-panel narrow-col">

            {/* Description */}
            <div style={S.card}>
              <div style={S.cardHead}>
                <IC.Info /><span>About {shop.name}</span>
              </div>
              <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
                {shop.description || "No description provided for this shop."}
              </p>
            </div>

            {/* Details table */}
            <div style={S.card}>
              <div style={S.cardHead}><IC.Info /><span>Shop Details</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  {
                    label: "Category",
                    node: <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{SHOP_CATEGORIES[shop.category]?.label || shop.category}</span>,
                  },
                  shop.subcategories?.length ? {
                    label: "Specialties",
                    node: (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
                        {shop.subcategories.map(sub => <span key={sub} style={S.miniChip}>{sub.replace(/_/g, " ")}</span>)}
                      </div>
                    ),
                  } : null,
                  {
                    label: "Phone",
                    node: <a href={tel} style={S.tableLinkGreen}><IC.Phone />{shop.phone}</a>,
                  },
                  {
                    label: "WhatsApp",
                    node: shop.whatsapp
                      ? <a href={wa} target="_blank" rel="noopener noreferrer" style={S.tableLinkGreen}><IC.WA />{shop.whatsapp}</a>
                      : <span style={{ color: "#d1d5db", fontSize: 14 }}>—</span>,
                  },
                  { label: "Timings", node: <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{shop.openTime} – {shop.closeTime}</span> },
                  {
                    label: "Closed On",
                    node: shop.closedOn?.length
                      ? <span style={{ fontSize: 14, fontWeight: 600, color: "#d97706" }}>{shop.closedOn.join(", ")}</span>
                      : <span style={{ fontSize: 14, fontWeight: 600, color: "#16a34a" }}>All days open</span>,
                  },
                  {
                    label: "Status",
                    node: (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 700, color: shop.isActive ? "#16a34a" : "#dc2626" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: shop.isActive ? "#22c55e" : "#ef4444", boxShadow: shop.isActive ? "0 0 5px #22c55e" : "none" }} />
                        {shop.isActive ? "Open Now" : "Closed"}
                      </span>
                    ),
                  },
                ].filter(Boolean).map(({ label, node }) => (
                  <div key={label} style={S.tableRow}>
                    <span style={S.tableLabel}>{label}</span>
                    <span style={{ textAlign: "right" }}>{node}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: "grid", gridTemplateColumns: shop.whatsapp ? "1fr 1fr" : "1fr", gap: 12 }}>
              <a href={tel} style={S.ctaGreen} className="btn-green">
                <IC.Phone size={16} /> Call Now
              </a>
              {shop.whatsapp && (
                <a href={wa} target="_blank" rel="noopener noreferrer" style={{ ...S.ctaGreen, background: "#22c55e" }} className="btn-wa">
                  <IC.WA size={16} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        {/* ════ LOCATION ════ */}
        {activeTab === "Location" && (
          <div className="tab-panel narrow-col">
            <div style={{ ...S.card, flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
              <span style={S.pinIcon}><IC.Pin size={16} /></span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 4 }}>{shop.name}</p>
                <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>
                  {shop.location?.address}, {shop.location?.city}
                  {shop.location?.pincode ? ` – ${shop.location.pincode}` : ""}
                </p>
              </div>
            </div>

            {shop.location?.coordinates && (
              <div className="map-box" style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #e5e7eb", boxShadow: "0 2px 16px rgba(0,0,0,.07)" }}>
                <MapView userLoc={null} shops={[shop]} className="h-full" />
              </div>
            )}

            {shop.location?.coordinates && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...S.ctaGreen, background: "#fff", color: "#16a34a", border: "1.5px solid #bbf7d0" }}
              >
                <IC.Pin size={16} /> Open in Google Maps
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Style tokens ────────────────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100vh",
    background: "#f7f9f7",
    color: "#111827",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    paddingBottom: 80,
  },

  /* Header */
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid #e5e7eb",
  },
  headerInner: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    height: 60,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#374151",
    flexShrink: 0,
  },
  headerBrand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 11,
    background: "linear-gradient(135deg,#22c55e,#15803d)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 15,
    flexShrink: 0,
    boxShadow: "0 3px 10px rgba(34,197,94,.35)",
  },
  headerTextCol: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    lineHeight: 1.15,
  },
  headerName: {
    fontSize: 15.5,
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-.2px",
  },
  headerSub: {
    fontSize: 10.5,
    fontWeight: 700,
    color: "#16a34a",
    textTransform: "uppercase",
    letterSpacing: ".5px",
    marginTop: 2,
  },

  /* Hero */
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(0,0,0,.08) 0%, rgba(0,0,0,.35) 100%)",
  },
  catBadge: {
    position: "absolute",
    bottom: 40,
    left: 16,
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 11,
    fontWeight: 700,
    color: "#374151",
    backdropFilter: "blur(8px)",
    letterSpacing: ".4px",
    textTransform: "uppercase",
    zIndex: 4,
  },
  statusPill: {
    position: "absolute",
    bottom: 10,
    left: 16,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid transparent",
    zIndex: 4,
  },
  heroCounter: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(15,23,20,.5)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 11px",
    borderRadius: 20,
    backdropFilter: "blur(6px)",
    letterSpacing: ".2px",
    zIndex: 4,
  },
  galleryPanel: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 16px",
  },

  /* Tabs */
  tabBar: {
    position: "sticky",
    top: 60,
    zIndex: 90,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #e5e7eb",
  },
  tabInner: {
    display: "flex",
  },
  tabBtn: {
    position: "relative",
    flex: 1,
    padding: "15px 4px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    letterSpacing: ".1px",
    transition: "color .15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Filter chips */
  chipRow: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    paddingBottom: 14,
    marginBottom: 4,
  },
  chip: {
    flexShrink: 0,
    padding: "7px 16px",
    borderRadius: 20,
    border: "1.5px solid",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .15s",
    letterSpacing: ".2px",
    background: "transparent",
  },
  countLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9ca3af",
    letterSpacing: ".8px",
    textTransform: "uppercase",
    marginBottom: 14,
  },

  /* Product card */
  prodCard: {
    background: "#fff",
    border: "1.5px solid #e5e7eb",
    borderRadius: 18,
    overflow: "hidden",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  prodImgWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "1",
    background: "#f8f9fa",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  prodImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transition: "transform .3s ease",
  },
  prodNoImg: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    color: "#d1d5db",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "#111827",
    color: "#fff",
    fontSize: 9,
    fontWeight: 800,
    padding: "3px 7px",
    borderRadius: 6,
    letterSpacing: ".3px",
  },
  stockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    fontSize: 9,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 6,
    textTransform: "uppercase",
    letterSpacing: ".5px",
  },
  prodInfo: {
    padding: "12px 13px 13px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  prodCat: {
    fontSize: 10,
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: ".5px",
  },
  prodName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1f2937",
    lineHeight: 1.4,
  },
  prodPrice: {
    fontSize: 13,
    marginBottom: 6,
  },
  mrpText: {
    color: "#b0b6be",
    textDecoration: "line-through",
    fontSize: 11.5,
    fontWeight: 600,
    marginLeft: 6,
  },
  addBtn: {
    marginTop: "auto",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: "8px 0",
    borderRadius: 10,
    border: "1.5px solid",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .15s",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "64px 0",
    textAlign: "center",
  },

  /* Card (about/location) */
  card: {
    background: "#fff",
    border: "1.5px solid #e5e7eb",
    borderRadius: 16,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
    paddingBottom: 12,
    borderBottom: "1px solid #f3f4f6",
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #f9fafb",
  },
  tableLabel: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: 500,
    flexShrink: 0,
  },
  tableLinkGreen: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#16a34a",
    fontWeight: 600,
    fontSize: 14,
    textDecoration: "none",
  },
  miniChip: {
    display: "inline-block",
    padding: "3px 10px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    color: "#15803d",
    textTransform: "uppercase",
    letterSpacing: ".4px",
  },
  ctaGreen: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 0",
    borderRadius: 14,
    background: "#22c55e",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
    border: "1.5px solid transparent",
    transition: "background .15s",
    cursor: "pointer",
  },
  pinIcon: {
    width: 38,
    height: 38,
    background: "#f0fdf4",
    border: "1.5px solid #bbf7d0",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#22c55e",
    flexShrink: 0,
    marginTop: 2,
  },

  /* Button utils */
  btnOutlineGreen: {
    marginTop: 8,
    padding: "10px 24px",
    background: "#f0fdf4",
    border: "1.5px solid #86efac",
    borderRadius: 12,
    color: "#16a34a",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },

  /* Loading */
  spinWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 14,
    minHeight: "100vh",
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid #e5e7eb",
    borderTopColor: "#22c55e",
    animation: "spin .8s linear infinite",
  },
  spinLabel: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: 500,
  },
};