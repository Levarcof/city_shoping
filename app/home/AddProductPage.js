"use client";
import { useState, useCallback } from "react";
import { Spinner } from "./SharedUI";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-700 tracking-wide">{label}</label>
      {children}
      {error && (
        <p className="text-red-500 text-[11px] flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err) =>
  `w-full bg-gray-50 border ${err ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[#00B259] focus:ring-green-100"} text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:bg-white placeholder:text-gray-400`;

export default function AddProductPage({ shopId, onSuccess, onCancel }) {
  // 1. state में subCategory को शामिल किया
  const [product, setProduct] = useState({
    name: "", description: "", price: "", unit: "", subCategory: "", inStock: true, file: null, preview: "",
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const set = (field) => (e) => setProduct((p) => ({ ...p, [field]: e.target.value }));
  const setFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) setProduct((p) => ({ ...p, file: f, preview: URL.createObjectURL(f) }));
  }, []);

  const validate = () => {
    const e = {};
    if (!product.name.trim())  e.name  = "Product name is required";
    if (!product.price)        e.price = "Price is required";
    if (!product.unit.trim())  e.unit  = "Unit is required (e.g. kg, pc)";
    // अगर आप सब-कैटेगरी को ज़रूरी (Required) बनाना चाहते हैं, तो नीचे वाली लाइन को अनकमेंट (uncomment) कर दें:
    // if (!product.subCategory.trim()) e.subCategory = "Sub-category is required";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setUploading(true);
    try {
      let image = "";
      if (product.file) {
        const fd = new FormData();
        fd.append("file", product.file);
        const up   = await fetch("/api/upload", { method: "POST", body: fd });
        const upD  = await up.json();
        if (upD.success) image = upD.url;
      }
      const res  = await fetch(`/api/products/${shopId}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: Number(product.price),
          unit: product.unit,
          subCategory: product.subCategory, // 2. API पेलोड में सब-कैटेगरी जोड़ा
          inStock: product.inStock,
          image,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.item);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div>
          <h1 className="text-base font-black text-gray-900">Add New Product</h1>
          <p className="text-[11px] text-gray-400">Fill in the details below</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">

        {/* Image upload */}
        <Field label="Product Image">
          <label className="flex items-center gap-4 cursor-pointer p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#00B259] hover:bg-green-50/30 transition-all group">
            {product.preview ? (
              <img src={product.preview} className="w-20 h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0" alt="preview" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center flex-shrink-0 gap-1">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-700 group-hover:text-[#00B259] transition-colors">
                {product.file ? product.file.name : "Upload photo"}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG or WEBP · Max 5MB</p>
              {product.file && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setProduct((p) => ({ ...p, file: null, preview: "" })); }}
                  className="text-[11px] text-red-400 hover:text-red-600 mt-1 font-semibold"
                >Remove</button>
              )}
            </div>
            <input type="file" accept="image/*" onChange={setFile} className="hidden" />
          </label>
        </Field>

        {/* Name */}
        <Field label="Product Name *" error={errors.name}>
          <input
            type="text"
            value={product.name}
            onChange={set("name")}
            placeholder="e.g. Fresh Tomatoes"
            className={inputCls(errors.name)}
          />
        </Field>

        {/* Price + Unit */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹) *" error={errors.price}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
              <input
                type="number"
                min="0"
                value={product.price}
                onChange={set("price")}
                placeholder="0"
                className={`${inputCls(errors.price)} pl-8`}
              />
            </div>
          </Field>
          <Field label="Unit *" error={errors.unit}>
            <input
              type="text"
              value={product.unit}
              onChange={set("unit")}
              placeholder="kg, pc, dozen…"
              className={inputCls(errors.unit)}
            />
          </Field>
        </div>

        {/* 3. Sub Category Input Field (नया जोड़ा गया) */}
        <Field label="Sub-Category (optional)" error={errors.subCategory}>
          <input
            type="text"
            value={product.subCategory}
            onChange={set("subCategory")}
            placeholder="e.g. Vegetables, Dairy, Beverages"
            className={inputCls(errors.subCategory)}
          />
        </Field>

        {/* Description */}
        <Field label="Description (optional)">
          <textarea
            rows={3}
            value={product.description}
            onChange={set("description")}
            placeholder="Short description of the product…"
            className={`${inputCls(false)} resize-none`}
          />
        </Field>

        {/* In Stock toggle */}
        <div
          className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-green-200 transition-all"
          onClick={() => setProduct((p) => ({ ...p, inStock: !p.inStock }))}
        >
          <div>
            <p className="text-sm font-bold text-gray-900">Available in Stock</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Customers will see this as available</p>
          </div>
          <div className={`relative w-12 h-6 rounded-full transition-all duration-250 flex-shrink-0
            ${product.inStock ? "bg-[#00B259]" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-250
              ${product.inStock ? "left-[26px]" : "left-0.5"}`} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className="flex-1 bg-[#00B259] hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
        >
          {uploading ? <><Spinner sm /> Saving…</> : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Save Product
            </>
          )}
        </button>
      </div>
    </div>
  );
}