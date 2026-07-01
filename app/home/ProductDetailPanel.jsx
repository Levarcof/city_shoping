"use client";
import { useState, useRef, useEffect } from "react";

const Icon = {
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  edit: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  save: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  cancel: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  image: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  tag: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
};

function EditableField({ label, value, name, type = "text", onChange, editing, placeholder, prefix }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
      {editing ? (
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{prefix}</span>
          )}
          <input
            type={type}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            step={type === "number" ? "0.01" : undefined}
            min={type === "number" ? "0" : undefined}
            className={`bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#00B259] focus:ring-2 focus:ring-[#00B259]/10 transition-all w-full ${prefix ? "pl-7 pr-3" : "px-3"}`}
          />
        </div>
      ) : (
        <p className="text-sm font-bold text-gray-800">
          {prefix}{value || <span className="text-gray-300 italic font-normal">Not set</span>}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL PANEL — slide-over drawer, navbar/sidebar untouched
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductDetailPanel({ shop, item, onClose, onUpdated, showToast }) {
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const buildForm = (it) => ({
    name:        it.name        || "",
    subcat:      it.subcat      || "",
    description: it.description || "",
    price:       it.price       ?? "",
    unit:        it.unit        || "",
    inStock:     it.inStock     ?? true,
    image:       it.image       || "",
  });

  const [form, setForm] = useState(buildForm(item));

  // Jab nayi product card click ho (panel already open ho) to form reset ho jaye
  useEffect(() => {
    setForm(buildForm(item));
    setEditing(false);
  }, [item._id]);

  // Esc se band ho jaye
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCancel = () => {
    setForm(buildForm(item));
    setEditing(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((f) => ({ ...f, image: data.url }));
      } else {
        showToast?.("Upload failed: " + (data.message || "Unknown error"));
      }
    } catch {
      showToast?.("Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast?.("Product name required hai");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/update/product", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: shop._id,
          itemId: item._id,
          name:        form.name,
          subcat:      form.subcat,
          description: form.description,
          price:       Number(form.price) || 0,
          unit:        form.unit,
          inStock:     form.inStock,
          image:       form.image,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast?.("✓ Product updated");
        setEditing(false);
        onUpdated?.(data.item); // parent ko updated item de do taaki list bhi refresh ho
      } else {
        showToast?.("Save failed: " + (data.message || "Unknown error"));
      }
    } catch {
      showToast?.("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.15s_ease]"
      />

      {/* Panel */}
      <div className="ml-auto relative w-full sm:max-w-xl lg:max-w-2xl h-full bg-[#F7F8FA] shadow-2xl overflow-y-auto animate-[slideIn_0.25s_ease]">
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate">{shop.name}</p>
              <h1 className="text-base font-black text-gray-900 truncate">{form.name || "Product"}</h1>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-all"
                  >
                    {Icon.cancel}<span className="hidden sm:inline">Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B259] hover:bg-green-600 text-white text-xs font-black shadow-sm transition-all disabled:opacity-60"
                  >
                    {saving
                      ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : Icon.save}
                    {saving ? "Saving…" : "Save"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:border-[#00B259] hover:text-[#00B259] hover:bg-green-50 transition-all"
                >
                  {Icon.edit} Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                {Icon.close}
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-6 space-y-5">

          {/* Image */}
          <div className="relative w-full aspect-square max-w-sm mx-auto rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            {form.image ? (
              <img src={form.image} alt={form.name} className="w-full h-full object-contain p-8" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-300">
                {Icon.image}
                <span className="text-xs font-semibold text-gray-400">No image uploaded</span>
              </div>
            )}

            <div
              className={`absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border
                ${form.inStock
                  ? "bg-green-500 text-white border-green-400/40 shadow-md shadow-green-200"
                  : "bg-white text-red-500 border-red-200"
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${form.inStock ? "bg-white/70" : "bg-red-400"}`} />
              {form.inStock ? "In Stock" : "Out of Stock"}
            </div>

            {editing && (
              <>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-bold px-3.5 py-2.5 rounded-xl hover:bg-white transition-all shadow-md disabled:opacity-60"
                >
                  {uploading
                    ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#00B259] rounded-full animate-spin" />
                    : Icon.upload}
                  {uploading ? "Uploading…" : form.image ? "Replace image" : "Add image"}
                </button>
                {form.image && (
                  <button
                    onClick={() => setForm((f) => ({ ...f, image: "" }))}
                    className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-red-600 transition-all shadow-md"
                  >
                    {Icon.trash} Remove
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </>
            )}
          </div>

          {/* Price + Stock row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Price</p>
              {editing ? (
                <div className="flex items-center gap-2">
                  <EditableField name="price" value={form.price} onChange={handleChange} editing={editing} type="number" prefix="₹" />
                  <span className="text-gray-300 font-bold pt-5">/</span>
                  <EditableField name="unit" value={form.unit} onChange={handleChange} editing={editing} placeholder="kg, pc, ltr…" />
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#00B259]">₹{form.price || 0}</span>
                  <span className="text-sm font-bold text-gray-400">/ {form.unit || "unit"}</span>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Availability</p>
                <p className="text-sm font-bold text-gray-800">{form.inStock ? "In Stock" : "Out of Stock"}</p>
              </div>
              <button
                type="button"
                disabled={!editing}
                onClick={() => setForm((f) => ({ ...f, inStock: !f.inStock }))}
                className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0
                  ${form.inStock ? "bg-[#00B259]" : "bg-gray-200"}
                  ${editing ? "cursor-pointer" : "cursor-default opacity-70"}`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform
                    ${form.inStock ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2.5">Product Info</h3>

            <EditableField label="Product Name" name="name" value={form.name} editing={editing} onChange={handleChange} />

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
              {editing ? (
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Product ke baare me kuch likhein…"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-[#00B259] focus:ring-2 focus:ring-[#00B259]/10 resize-none transition-all w-full"
                />
              ) : (
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                  {form.description || <span className="text-gray-300 italic font-normal">No description</span>}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subcategory</label>
              {editing ? (
                shop.subcategories?.length > 0 ? (
                  <select
                    name="subcat"
                    value={form.subcat}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#00B259] focus:ring-2 focus:ring-[#00B259]/10 transition-all w-full capitalize"
                  >
                    <option value="">Select subcategory</option>
                    {shop.subcategories.map((sub) => (
                      <option key={sub} value={sub} className="capitalize">{sub.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="subcat"
                    value={form.subcat}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#00B259] w-full"
                  />
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 w-fit bg-[#F0FAF4] border border-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full capitalize">
                  {Icon.tag} {form.subcat ? form.subcat.replace(/_/g, " ") : "Uncategorized"}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
              <p className="text-sm font-semibold text-gray-600 capitalize">{shop.category?.replace(/_/g, " ")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}