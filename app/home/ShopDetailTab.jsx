"use client";
import { useState, useRef } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
    edit: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    save: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    cancel: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    location: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    whatsapp: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.527 5.849L.057 23.882l6.205-1.629A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.669-.493-5.21-1.356l-.372-.22-3.864 1.014 1.03-3.755-.242-.389A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>,
    clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    star: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    image: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    chevronLeft: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
    chevronRight: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
    verified: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>,
    trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
    star2: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
};

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Editable Field ─────────────────────────────────────────────────────────────
function EditableField({ label, value, name, type = "text", onChange, editing, placeholder }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
            {editing ? (
                <input
                    type={type}
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-[#00B259] focus:ring-2 focus:ring-[#00B259]/10 transition-all w-full"
                />
            ) : (
                <p className="text-sm font-semibold text-gray-800">
                    {value || <span className="text-gray-300 italic font-normal">Not set</span>}
                </p>
            )}
        </div>
    );
}

// ── Closed Days Picker ─────────────────────────────────────────────────────────
function ClosedDaysPicker({ closedOn = [], editing, onChange }) {
    const toggle = (day) => {
        const next = closedOn.includes(day) ? closedOn.filter((d) => d !== day) : [...closedOn, day];
        onChange(next);
    };
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Closed On</label>
            <div className="flex flex-wrap gap-1.5">
                {ALL_DAYS.map((day) => {
                    const isClosed = closedOn.includes(day);
                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={!editing}
                            onClick={() => editing && toggle(day)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all duration-150
                ${isClosed ? "bg-red-50 border-red-200 text-red-500" : "bg-green-50 border-green-100 text-green-600"}
                ${editing ? "cursor-pointer hover:scale-105" : "cursor-default"}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Stat Chip ──────────────────────────────────────────────────────────────────
function StatChip({ icon, value, label }) {
    return (
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            <span className="text-[#00B259] flex-shrink-0">{icon}</span>
            <div>
                <p className="text-base font-black text-gray-900 leading-none">{value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

// ── Desktop Gallery: big main + vertical thumbs ────────────────────────────────
function DesktopGallery({ allImgs, active, setActive, editing, onUpload, onDelete, uploading }) {
    const fileRef = useRef();

    if (!allImgs.length) {
        return (
            <div
                onClick={() => editing && fileRef.current?.click()}
                className={`w-full h-full min-h-[420px] rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-3 text-gray-300
          ${editing ? "cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#00B259] hover:bg-green-50/40 transition-all" : ""}`}
            >
                {Icon.image}
                <span className="text-xs font-semibold text-gray-400">
                    {editing ? "Click to upload images" : "No images uploaded"}
                </span>
                {editing && (
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
                )}
            </div>
        );
    }

    return (
        <div className="flex gap-3 h-full">
            {/* Vertical thumbnail strip — left side */}
            {allImgs.length > 1 && (
                <div className="flex flex-col gap-2 w-[72px] flex-shrink-0 overflow-y-auto max-h-[480px] pr-0.5">
                    {allImgs.map((img, i) => (
                        <div key={i} className="relative group flex-shrink-0">
                            <button
                                onClick={() => setActive(i)}
                                className={`w-[68px] h-[68px] rounded-xl overflow-hidden border-2 transition-all duration-150 block
                  ${i === active ? "border-[#00B259] shadow-md scale-105" : "border-transparent opacity-55 hover:opacity-90 hover:scale-102"}`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                            {/* Delete button on thumb */}
                            {editing && (
                                <button
                                    onClick={() => onDelete(i)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    {Icon.trash}
                                </button>
                            )}
                        </div>
                    ))}
                    {/* Upload more button */}
                    {editing && (
                        <>
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="w-[68px] h-[68px] rounded-xl border-2 border-dashed border-gray-300 hover:border-[#00B259] hover:bg-green-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#00B259] transition-all flex-shrink-0"
                            >
                                {uploading
                                    ? <span className="w-4 h-4 border-2 border-gray-300 border-t-[#00B259] rounded-full animate-spin" />
                                    : <>{Icon.upload}<span className="text-[8px] font-bold">Add</span></>
                                }
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
                        </>
                    )}
                </div>
            )}

            {/* Main large image */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-gray-900 min-h-[420px]">
                <img
                    src={allImgs[active]}
                    alt={`Shop image ${active + 1}`}
                    className="w-full h-full object-cover"
                    style={{ maxHeight: "480px" }}
                />
                {/* Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

                {/* Counter */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {active + 1} / {allImgs.length}
                </div>

                {/* Arrow nav */}
                {allImgs.length > 1 && (
                    <>
                        <button
                            onClick={() => setActive((p) => (p - 1 + allImgs.length) % allImgs.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-white transition-all"
                        >
                            {Icon.chevronLeft}
                        </button>
                        <button
                            onClick={() => setActive((p) => (p + 1) % allImgs.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-white transition-all"
                        >
                            {Icon.chevronRight}
                        </button>
                    </>
                )}

                {/* Edit: upload button on main image when only 1 image */}
                {editing && allImgs.length === 1 && (
                    <>
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-white transition-all shadow-md"
                        >
                            {Icon.upload} Add more
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
                    </>
                )}

                {/* Delete active image */}
                {editing && allImgs.length > 0 && (
                    <button
                        onClick={() => onDelete(active)}
                        className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-600 transition-all shadow-md"
                    >
                        {Icon.trash} Remove
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Mobile Gallery (horizontal thumbs below) ───────────────────────────────────
function MobileGallery({ allImgs, active, setActive, editing, onUpload, onDelete, uploading }) {
    const fileRef = useRef();

    if (!allImgs.length) {
        return (
            <div
                onClick={() => editing && fileRef.current?.click()}
                className={`w-full h-56 rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300
          ${editing ? "border-2 border-dashed border-gray-300 cursor-pointer" : ""}`}
            >
                {Icon.image}
                <span className="text-xs font-medium text-gray-400">{editing ? "Tap to upload" : "No images"}</span>
                {editing && <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />}
            </div>
        );
    }

    return (
        <div className="w-full select-none">
            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-gray-900">
                <img src={allImgs[active]} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {active + 1}/{allImgs.length}
                </div>
                {allImgs.length > 1 && (
                    <>
                        <button onClick={() => setActive((p) => (p - 1 + allImgs.length) % allImgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">{Icon.chevronLeft}</button>
                        <button onClick={() => setActive((p) => (p + 1) % allImgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">{Icon.chevronRight}</button>
                    </>
                )}
                {editing && (
                    <button onClick={() => onDelete(active)} className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg">{Icon.trash} Remove</button>
                )}
            </div>
            {/* Thumb strip */}
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {allImgs.map((img, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${i === active ? "border-[#00B259]" : "border-transparent opacity-60"}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                ))}
                {editing && (
                    <>
                        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex-shrink-0 w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                            {uploading ? <span className="w-3 h-3 border-2 border-gray-300 border-t-[#00B259] rounded-full animate-spin" /> : Icon.upload}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
                    </>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ShopDetailTab({ shop, onShopUpdated, showToast }) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [active, setActive] = useState(0);

    // Local image arrays (mutable during edit)
    const [localImages, setLocalImages] = useState(shop.images || []);
    const [localThumbnail, setLocalThumbnail] = useState(shop.thumbnail || null);

    // Derived: all images for gallery
    const allImgs = [...new Set([localThumbnail, ...localImages].filter(Boolean))];

    const [form, setForm] = useState({
        name: shop.name || "",
        description: shop.description || "",
        phone: shop.phone || "",
        whatsapp: shop.whatsapp || "",
        openTime: shop.openTime || "09:00",
        closeTime: shop.closeTime || "21:00",
        closedOn: shop.closedOn || [],
        address: shop.location?.address || "",
        city: shop.location?.city || "",
        pincode: shop.location?.pincode || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleCancel = () => {
        setForm({
            name: shop.name || "",
            description: shop.description || "",
            phone: shop.phone || "",
            whatsapp: shop.whatsapp || "",
            openTime: shop.openTime || "09:00",
            closeTime: shop.closeTime || "21:00",
            closedOn: shop.closedOn || [],
            address: shop.location?.address || "",
            city: shop.location?.city || "",
            pincode: shop.location?.pincode || "",
        });
        setLocalImages(shop.images || []);
        setLocalThumbnail(shop.thumbnail || null);
        setEditing(false);
    };

    // ── Upload images to /api/upload, get back URLs ──────────────────────────────
// ── Upload images to /api/upload, get back URLs ──────────────────────────────
const handleUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  setUploading(true);
  try {
    const uploadedUrls = [];

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file); // ⚠️ singular "file" — API yahi expect karta hai

      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (data.success && data.url) {
        uploadedUrls.push(data.url);
      } else {
        showToast?.("Upload failed: " + (data.message || "Unknown error"));
      }
    }

    if (uploadedUrls.length) {
      setLocalImages((prev) => [...prev, ...uploadedUrls]);
      if (!localThumbnail) setLocalThumbnail(uploadedUrls[0]);
      showToast?.(`✓ ${uploadedUrls.length} image(s) uploaded`);
    }
  } catch {
    showToast?.("Upload error");
  } finally {
    setUploading(false);
    e.target.value = "";
  }
};

    const handleDeleteImage = (idx) => {
        const imgToDelete = allImgs[idx];
        setLocalImages((prev) => prev.filter((u) => u !== imgToDelete));
        if (localThumbnail === imgToDelete) {
            const remaining = allImgs.filter((u) => u !== imgToDelete);
            setLocalThumbnail(remaining[0] || null);
        }
        setActive((prev) => Math.max(0, prev - (idx <= prev ? 1 : 0)));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                phone: form.phone,
                whatsapp: form.whatsapp,
                openTime: form.openTime,
                closeTime: form.closeTime,
                closedOn: form.closedOn,
                images: localImages,
                thumbnail: localThumbnail || localImages[0] || null,
                location: {
                    ...shop.location,
                    address: form.address,
                    city: form.city,
                    pincode: form.pincode,
                },
            };

            const res = await fetch(`/api/update/shop/${shop._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (data.success) {
                onShopUpdated?.(data.shop);
                showToast?.("✓ Shop details saved");
                setEditing(false);
            } else {
                showToast?.("Save failed: " + (data.message || "Unknown error"));
            }
        } catch {
            showToast?.("Network error");
        } finally {
            setSaving(false);
        }
    };

    const totalProducts = shop.items?.length || 0;
    const inStockCount = shop.items?.filter((i) => i.inStock).length || 0;

    const ActionBar = () => (
        <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
                <>
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-all"
                    >
                        {Icon.cancel} Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B259] hover:bg-green-600 text-white text-xs font-black shadow-sm transition-all disabled:opacity-60"
                    >
                        {saving
                            ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : Icon.save}
                        {saving ? "Saving…" : "Save Changes"}
                    </button>
                </>
            ) : (
                <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:border-[#00B259] hover:text-[#00B259] hover:bg-green-50 transition-all"
                >
                    {Icon.edit} Edit Details
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-6 pb-8">
            <div className="hidden md:grid md:grid-cols-[1fr_380px] gap-6 items-start">

                <div className="flex flex-col gap-4">
                    <DesktopGallery
                        allImgs={allImgs}
                        active={active}
                        setActive={setActive}
                        editing={editing}
                        onUpload={handleUpload}
                        onDelete={handleDeleteImage}
                        uploading={uploading}
                    />
                    {/* Stats below gallery on desktop */}
                    <div className="grid grid-cols-4 gap-3">
                        <StatChip icon={Icon.star} value={shop.avgRating?.toFixed(1) || "—"} label="Avg Rating" />
                        <StatChip icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /></svg>} value={totalProducts} label="Products" />
                        <StatChip icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>} value={inStockCount} label="In Stock" />
                        <StatChip icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} value={shop.totalRatings || 0} label="Reviews" />
                    </div>
                </div>

                {/* RIGHT: scrollable info panel */}
                <div className="flex flex-col gap-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
                    {/* Shop header */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    {shop.isVerified && (
                                        <span className="flex items-center gap-1 bg-blue-50 text-blue-500 border border-blue-100 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                                            {Icon.verified} Verified
                                        </span>
                                    )}
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border
                    ${shop.isActive ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-400 border-red-100"}`}>
                                        {shop.isActive ? "● Open" : "● Closed"}
                                    </span>
                                </div>
                                <h2 className="text-xl font-black text-gray-900 leading-tight tracking-tight">{shop.name}</h2>
                                {shop.description && !editing && (
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-3">{shop.description}</p>
                                )}
                            </div>
                            <ActionBar />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Basic Info</h3>
                        <EditableField label="Shop Name" name="name" value={form.name} editing={editing} onChange={handleChange} />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                            {editing ? (
                                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-[#00B259] focus:ring-2 focus:ring-[#00B259]/10 resize-none transition-all w-full"
                                />
                            ) : (
                                <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                                    {form.description || <span className="text-gray-300 italic font-normal">No description</span>}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                            <p className="text-sm font-semibold text-gray-800">{shop.category}</p>
                            <p className="text-[11px] text-gray-400">{shop.subcategories?.join(", ")}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Contact</h3>
                        <EditableField label="Phone" name="phone" value={form.phone} editing={editing} onChange={handleChange} type="tel" />
                        <EditableField label="WhatsApp" name="whatsapp" value={form.whatsapp} editing={editing} onChange={handleChange} type="tel" />
                        <div className="flex flex-col gap-1 opacity-50">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email (cannot edit)</label>
                            <p className="text-sm font-semibold text-gray-800">{shop.owner?.email || "—"}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Location</h3>
                        <EditableField label="Address" name="address" value={form.address} editing={editing} onChange={handleChange} />
                        <div className="grid grid-cols-2 gap-3">
                            <EditableField label="City" name="city" value={form.city} editing={editing} onChange={handleChange} />
                            <EditableField label="Pincode" name="pincode" value={form.pincode} editing={editing} onChange={handleChange} />
                        </div>
                        {shop.location?.coordinates && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium pt-1">
                                <span className="text-[#00B259]">{Icon.location}</span>
                                {shop.location.coordinates[1]?.toFixed(4)}, {shop.location.coordinates[0]?.toFixed(4)}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Timings</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <EditableField label="Opens At" name="openTime" value={form.openTime} editing={editing} onChange={handleChange} type="time" />
                            <EditableField label="Closes At" name="closeTime" value={form.closeTime} editing={editing} onChange={handleChange} type="time" />
                        </div>
                        <ClosedDaysPicker closedOn={form.closedOn} editing={editing} onChange={(days) => setForm((f) => ({ ...f, closedOn: days }))} />
                        {!editing && (
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[#00B259]">{Icon.clock}</span>
                                <span className="text-sm font-bold text-gray-700">{form.openTime} – {form.closeTime}</span>
                            </div>
                        )}
                    </div>

                    {shop.subcategories?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Subcategories</h3>
                            <div className="flex flex-wrap gap-2">
                                {shop.subcategories.map((sub) => (
                                    <span key={sub} className="bg-[#F0FAF4] border border-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">{sub}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="md:hidden space-y-5">
                <MobileGallery
                    allImgs={allImgs}
                    active={active}
                    setActive={setActive}
                    editing={editing}
                    onUpload={handleUpload}
                    onDelete={handleDeleteImage}
                    uploading={uploading}
                />

                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-black text-gray-900 leading-tight">{shop.name}</h2>
                            {shop.isVerified && (
                                <span className="flex items-center gap-1 bg-blue-50 text-blue-500 border border-blue-100 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">{Icon.verified} Verified</span>
                            )}
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${shop.isActive ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-400 border-red-100"}`}>
                                {shop.isActive ? "● Open" : "● Closed"}
                            </span>
                        </div>
                        {shop.description && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{shop.description}</p>}
                    </div>
                    <ActionBar />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <StatChip icon={Icon.star} value={shop.avgRating?.toFixed(1) || "—"} label="Avg Rating" />
                    <StatChip icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /></svg>} value={totalProducts} label="Products" />
                    <StatChip icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>} value={inStockCount} label="In Stock" />
                    <StatChip icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} value={shop.totalRatings || 0} label="Reviews" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Basic Info</h3>
                        <EditableField label="Shop Name" name="name" value={form.name} editing={editing} onChange={handleChange} />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                            {editing ? (
                                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-[#00B259] resize-none w-full" />
                            ) : (
                                <p className="text-sm font-semibold text-gray-800">{form.description || <span className="text-gray-300 italic font-normal">No description</span>}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                            <p className="text-sm font-semibold text-gray-800">{shop.category}</p>
                            <p className="text-[11px] text-gray-400">{shop.subcategories?.join(", ")}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Contact</h3>
                        <EditableField label="Phone" name="phone" value={form.phone} editing={editing} onChange={handleChange} type="tel" />
                        <EditableField label="WhatsApp" name="whatsapp" value={form.whatsapp} editing={editing} onChange={handleChange} type="tel" />
                        <div className="flex flex-col gap-1 opacity-50">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email (cannot edit)</label>
                            <p className="text-sm font-semibold text-gray-800">{shop.owner?.email || "—"}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Location</h3>
                        <EditableField label="Address" name="address" value={form.address} editing={editing} onChange={handleChange} />
                        <div className="grid grid-cols-2 gap-3">
                            <EditableField label="City" name="city" value={form.city} editing={editing} onChange={handleChange} />
                            <EditableField label="Pincode" name="pincode" value={form.pincode} editing={editing} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Timings</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <EditableField label="Opens At" name="openTime" value={form.openTime} editing={editing} onChange={handleChange} type="time" />
                            <EditableField label="Closes At" name="closeTime" value={form.closeTime} editing={editing} onChange={handleChange} type="time" />
                        </div>
                        <ClosedDaysPicker closedOn={form.closedOn} editing={editing} onChange={(days) => setForm((f) => ({ ...f, closedOn: days }))} />
                    </div>
                </div>
            </div>
        </div>
    );
}