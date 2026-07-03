"use client";
import { useState } from "react";
import ProductDetailPanel from "./ProductDetailPanel"; 

function ProductCard({ item, onDelete, onOpen }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      onClick={() => onOpen(item)}
      className={`bg-white rounded-2xl overflow-hidden transition-all duration-200 group flex flex-col cursor-pointer
        ${confirmDelete
          ? "ring-2 ring-red-200 shadow-lg"
          : "shadow-sm hover:shadow-2xl hover:-translate-y-1 border border-gray-100"
        }`}
    >
      <div className="relative flex-shrink-0 bg-[#F7F8FA] rounded-t-2xl overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 p-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <span className="text-[10px] text-gray-300 font-bold tracking-wide">No image</span>
          </div>
        )}

        <div
          className={`absolute top-2.5 left-2.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border
            ${item.inStock
              ? "bg-green-500 text-white border-green-400/40 shadow-green-200 shadow-sm"
              : "bg-white text-red-500 border-red-200"
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.inStock ? "bg-white/70" : "bg-red-400"}`} />
          {item.inStock ? "In Stock" : "Out of Stock"}
        </div>

        {(item.subcat || item.subcategory) && (
          <div className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-1 rounded-full bg-white shadow-sm text-gray-500 border border-gray-100 capitalize">
            {(item.subcat || item.subcategory).replace(/_/g, " ")}
          </div>
        )}

        {!confirmDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-xl bg-white shadow-md text-gray-300 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-100 hover:border-red-100 hover:bg-red-50"
            title="Remove product"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        )}
      </div>

      <div className="px-3.5 pt-3 pb-3.5 flex flex-col flex-1 gap-1">

        <h3 className="font-bold text-gray-900 text-[13px] leading-snug line-clamp-2 flex-1">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-1 mt-0.5">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
          <div className="flex items-baseline gap-1">
            <span className="text-[17px] font-black text-[#00B259] leading-none">₹{item.price}</span>
            <span className="text-[11px] font-semibold text-gray-400">/ {item.unit}</span>
          </div>

          {confirmDelete && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item._id); setConfirmDelete(false); }}
                className="bg-red-500 hover:bg-red-600 active:scale-95 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all"
              >
                Delete
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                className="bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accent + "18" }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function ProductsTab({ shop, onDelete, onAddClick, onShopUpdated, showToast }) {
  const allItems = shop.items || [];

  const subCatSet = new Set();
  allItems.forEach((item) => {
    const val = item.subcat || item.subcategory;
    if (val) subCatSet.add(val.trim());
  });
  const subCats = Array.from(subCatSet);
  const hasSubCats = subCats.length > 0;

  const [activeSub, setActiveSub] = useState("All");
  const [activeItem, setActiveItem] = useState(null); 

  const filtered =
    activeSub === "All"
      ? allItems
      : allItems.filter((i) => {
          const val = i.subcat || i.subcategory || "";
          return val.trim() === activeSub;
        });

  const inStockCount = allItems.filter((i) => i.inStock).length;

  const handleProductUpdated = (updatedItem) => {
    const updatedShop = {
      ...shop,
      items: shop.items.map((it) =>
        it._id === updatedItem._id ? updatedItem : it
      ),
    };
    onShopUpdated?.(updatedShop);
    setActiveItem(updatedItem); 
  };

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Products"
          value={allItems.length}
          accent="#00B259"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00B259" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          }
        />
        <StatCard
          label="In Stock"
          value={inStockCount}
          accent="#00B259"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00B259" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          }
        />
        <StatCard
          label="Out of Stock"
          value={allItems.length - inStockCount}
          accent="#ef4444"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          }
        />
        <StatCard
          label="Categories"
          value={subCats.length || "—"}
          accent="#f59e0b"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          }
        />
      </div>

      {hasSubCats && (
        <div className="bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {["All", ...subCats].map((sub) => {
              const isActive = activeSub === sub;
              const count =
                sub === "All"
                  ? allItems.length
                  : allItems.filter(
                      (i) => (i.subcat || i.subcategory || "").trim() === sub
                    ).length;
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSub(sub)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150
                    ${isActive
                      ? "bg-[#00B259] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                >
                  <span className="capitalize">{sub.replace(/_/g, " ")}</span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-gray-900 capitalize">
            {activeSub === "All" ? "All Products" : activeSub.replace(/_/g, " ")}
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-[#00B259] hover:bg-green-600 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl bg-white">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <p className="text-gray-700 font-bold text-sm">
            {activeSub === "All"
              ? "No products yet"
              : `No products in "${activeSub.replace(/_/g, " ")}"`}
          </p>
          <p className="text-gray-400 text-xs mt-1 mb-5">
            {activeSub === "All"
              ? "Add your first product to get started"
              : "Try a different category or add a new product"}
          </p>
          <button
            onClick={onAddClick}
            className="bg-[#00B259] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-green-600 transition-all shadow-sm"
          >
            + Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {filtered.map((item) => (
            <ProductCard
              key={item._id}
              item={item}
              onDelete={onDelete}
              onOpen={setActiveItem}
            />
          ))}
        </div>
      )}

      {activeItem && (
        <ProductDetailPanel
          shop={shop}
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onUpdated={handleProductUpdated}
          showToast={showToast}
        />
      )}
    </div>
  );
}