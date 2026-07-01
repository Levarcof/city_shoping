"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Shop Categories ──────────────────────────────────────────────────────────
const SHOP_CATEGORIES = {
  food_grocery: {
    label: "Food & Grocery",
    icon: "🛒",
    subcategories: ["kirana", "sabzi_fruit", "dairy", "meat_chicken", "bakery", "sweet_mithai", "dry_fruits", "namkeen_snacks", "tea_coffee", "cold_drinks_juice"],
  },
  fashion_apparel: {
    label: "Fashion & Apparel",
    icon: "👗",
    subcategories: ["general_clothes", "saree", "readymade_garments", "kids_wear", "footwear", "jewellery", "artificial_jewellery", "bags_purse", "sportswear"],
  },
  electronics_hardware: {
    label: "Electronics & Hardware",
    icon: "📱",
    subcategories: ["mobile_shop", "mobile_accessories", "electronics", "computer_laptop", "tv_home_appliance", "electrical_hardware", "cctv_security", "battery_inverter"],
  },
  health_beauty: {
    label: "Health & Beauty",
    icon: "💊",
    subcategories: ["medical_store", "ayurvedic", "cosmetics_makeup", "salon_parlour", "optical_eyewear", "gym_equipment", "skincare"],
  },
  ghar_furniture: {
    label: "Ghar & Furniture",
    icon: "🛋️",
    subcategories: ["furniture", "home_decor", "kitchenware_bartan", "bedding_curtain", "paint_hardware", "sanitary_plumbing", "flooring_tiles", "garden_plants"],
  },
  services_repairs: {
    label: "Services & Repairs",
    icon: "🔧",
    subcategories: ["mobile_repair", "ac_fridge_repair", "car_bike_workshop", "tailor_stitching", "laundry", "printing_stationery", "photography", "coaching_tuition"],
  },
  hobby_other: {
    label: "Hobby & Other",
    icon: "🎨",
    subcategories: ["pet_shop", "toy_store", "books_stationery", "sports", "musical_instruments", "art_craft", "puja_religious", "gift_shop", "flower_florist", "agri_kisan", "second_hand", "wholesale"],
  },
};

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── File → Base64 ────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────
function AvatarUpload({ label = "Profile photo", value, onChange, initials = "U" }) {
  const ref = useRef();
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={() => ref.current.click()}
        className="relative w-24 h-24 rounded-full border-[3px] border-dashed border-green-300 bg-green-50 flex items-center justify-center cursor-pointer group overflow-hidden transition-all hover:border-green-500"
      >
        {value ? (
          <img src={value} alt="avatar" className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className="text-3xl font-bold text-green-400 select-none">{initials}</span>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
          <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const b64 = await fileToBase64(file);
          onChange(b64);
        }}
      />
    </div>
  );
}

// ─── Shop Images Upload ───────────────────────────────────────────────────────
function ShopImagesUpload({ images, thumbnail, onImagesChange, onThumbnailChange }) {
  const ref = useRef();

  const handleFiles = async (files) => {
    const newImgs = [];
    for (const file of Array.from(files)) {
      const b64 = await fileToBase64(file);
      newImgs.push(b64);
    }
    const updated = [...images, ...newImgs].slice(0, 5);
    onImagesChange(updated);
    if (!thumbnail && updated.length > 0) onThumbnailChange(updated[0]);
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    onImagesChange(updated);
    if (thumbnail === images[idx]) {
      onThumbnailChange(updated[0] || "");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500">
        Shop photos <span className="normal-case font-normal text-gray-400">(upto 5)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-green-200 group">
            <img src={img} alt={`shop-${idx}`} className="w-full h-full object-cover" />
            {/* Thumbnail badge */}
            <div
              onClick={() => onThumbnailChange(img)}
              className={`absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold py-0.5 cursor-pointer transition-colors ${
                thumbnail === img ? "bg-green-500 text-white" : "bg-black/40 text-white/70 hover:bg-green-500/70 hover:text-white"
              }`}
            >
              {thumbnail === img ? "★ Cover" : "Set cover"}
            </div>
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold leading-none"
            >
              ×
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <button
            type="button"
            onClick={() => ref.current.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-green-300 bg-green-50 flex flex-col items-center justify-center text-green-400 hover:border-green-500 hover:bg-green-100 transition-all gap-1"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-[10px] font-medium">Add photo</span>
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {images.length > 0 && (
        <p className="text-[11px] text-gray-400">Tap a photo to set it as the cover image</p>
      )}
    </div>
  );
}

// ─── InputField ───────────────────────────────────────────────────────────────
function InputField({ label, type = "text", value, onChange, error, hint, ...props }) {
  return (
    <div className="space-y-1 w-full">
      <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`
          w-full bg-white border text-gray-800 rounded-xl px-4 py-3 text-sm
          outline-none transition-all duration-200 placeholder:text-gray-300
          focus:bg-white shadow-sm
          ${error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"
          }
        `}
        {...props}
      />
      {hint && !error && <p className="text-gray-400 text-[11px] mt-0.5">{hint}</p>}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1 mt-0.5">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── TextAreaField ────────────────────────────────────────────────────────────
function TextAreaField({ label, value, onChange, error, rows = 3, placeholder }) {
  return (
    <div className="space-y-1 w-full">
      <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full bg-white border text-gray-800 rounded-xl px-4 py-3 text-sm
          outline-none transition-all duration-200 placeholder:text-gray-300
          focus:bg-white resize-none shadow-sm
          ${error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"
          }
        `}
      />
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1 mt-0.5">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1V10a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── PasswordField ────────────────────────────────────────────────────────────
function PasswordField({ label = "Password", value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1 w-full">
      <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`
            w-full bg-white border text-gray-800 rounded-xl pl-4 pr-12 py-3 text-sm
            outline-none transition-all duration-200 placeholder:text-gray-300
            focus:bg-white shadow-sm
            ${error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"
            }
          `}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
          tabIndex={-1}
        >
          {show ? (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1 mt-0.5">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── SectionDivider ───────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-gray-100" />
      <span className="text-xs font-semibold tracking-wider uppercase text-gray-400 bg-white px-2">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, selected, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border
        ${selected && !danger
          ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
          : ""}
        ${selected && danger
          ? "bg-red-50 border-red-400 text-red-600"
          : ""}
        ${!selected
          ? "bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 hover:bg-green-50"
          : ""}
      `}
    >
      {label}
    </button>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
function ProgressBar({ step, role }) {
  const steps =
    role === "shop_owner"
      ? ["Role", "Personal", "Shop"]
      : ["Role", "Details"];
  const current = step - 1;

  return (
    <div className="flex items-center gap-0 mb-8 w-full max-w-xs mx-auto">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                ${i < current ? "bg-green-500 border-green-500 text-white" : ""}
                ${i === current ? "bg-white border-green-500 text-green-600" : ""}
                ${i > current ? "bg-white border-gray-200 text-gray-400" : ""}
              `}
            >
              {i < current ? (
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-[10px] font-semibold tracking-wide whitespace-nowrap ${i === current ? "text-green-600" : "text-gray-400"}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mb-4 transition-all duration-500 ${i < current ? "bg-green-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  // Personal state including user image
  const [personal, setPersonal] = useState({
    name: "", email: "", phone: "", password: "", addresses: "", pincode: "",
    image: "",
  });
  const [personalErr, setPersonalErr] = useState({});

  // Shop state including shop images
  const [shop, setShop] = useState({
    name: "", description: "", category: "", subcategories: [],
    location: { address: "", city: "", pincode: "", lat: "", lng: "" },
    phone: "", whatsapp: "", openTime: "09:00", closeTime: "21:00", closedOn: [],
    images: [],
    thumbnail: "",
  });
  const [shopErr, setShopErr] = useState({});

  // Reset subcategories when category changes
  useEffect(() => {
    setShop((prev) => ({ ...prev, subcategories: [] }));
  }, [shop.category]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // ── Stable handlers ────────────────────────────────────────────────────────
  const setP = useCallback((key) => (e) =>
    setPersonal((prev) => ({ ...prev, [key]: e.target.value })), []);

  const setS = useCallback((key) => (e) =>
    setShop((prev) => ({ ...prev, [key]: e.target.value })), []);

  const setLoc = useCallback((key) => (e) => {
    const value = e.target.value;
    setShop((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [key]: key === "lat" || key === "lng"
          ? value === "" ? "" : Number(value)
          : value
      }
    }));
  }, []);

  const toggleSub = useCallback((sub) => {
    setShop((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(sub)
        ? prev.subcategories.filter((s) => s !== sub)
        : [...prev.subcategories, sub],
    }));
  }, []);

  const toggleDay = useCallback((day) => {
    setShop((prev) => ({
      ...prev,
      closedOn: prev.closedOn.includes(day)
        ? prev.closedOn.filter((d) => d !== day)
        : [...prev.closedOn, day],
    }));
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validatePersonal = () => {
    const e = {};
    if (!personal.name.trim()) e.name = "Name zaroori hai";
    if (!personal.email.trim()) e.email = "Email zaroori hai";
    else if (!/^\S+@\S+\.\S+$/.test(personal.email)) e.email = "Valid email daalo";
    if (!personal.phone.trim()) e.phone = "Phone zaroori hai";
    else if (!/^[6-9]\d{9}$/.test(personal.phone)) e.phone = "Valid 10-digit number";
    if (!personal.password) e.password = "Password zaroori hai";
    else if (personal.password.length < 6) e.password = "Minimum 6 characters";
    if (role === "customer") {
      if (!personal.addresses.trim()) e.addresses = "Address zaroori hai";
      if (!personal.pincode.trim()) e.pincode = "Pincode zaroori hai";
      else if (!/^\d{6}$/.test(personal.pincode)) e.pincode = "6 digits hona chahiye";
    }
    setPersonalErr(e);
    return Object.keys(e).length === 0;
  };

  const validateShop = () => {
    const e = {};
    if (!shop.name.trim()) e.name = "Shop name zaroori hai";
    if (!shop.category) e.category = "Category select karo";
    if (shop.subcategories.length === 0) e.subcategories = "Ek subcategory zaroori hai";
    if (!shop.location.address.trim()) e.locAddress = "Address zaroori hai";
    if (!shop.location.city.trim()) e.locCity = "City zaroori hai";
    if (!shop.location.pincode.trim()) e.locPincode = "Pincode zaroori hai";
    else if (!/^\d{6}$/.test(shop.location.pincode)) e.locPincode = "6 digits hona chahiye";
    if (!shop.phone.trim() && !shop.whatsapp.trim()) e.phone = "Phone ya WhatsApp zaroori hai";
    if (shop.location.lat === "" || isNaN(shop.location.lat)) e.lat = "Latitude zaroori hai";
    if (shop.location.lng === "" || isNaN(shop.location.lng)) e.lng = "Longitude zaroori hai";
    setShopErr(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit handlers ────────────────────────────────────────────────────────
  const handleCustomerSubmit = async () => {
    if (!validatePersonal()) return;
    setLoading(true);
    setGlobalError("");
    try {
      const res = await fetch("/api/auth/register/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personal),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      showToast("Account created! Redirecting…");
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerSubmit = async () => {
    if (!validateShop()) return;
    setLoading(true);
    setGlobalError("");
    try {
      const payload = {
        user: {
          name: personal.name,
          email: personal.email,
          phone: personal.phone,
          password: personal.password,
          image: personal.image,
        },
        shop: {
          ...shop,
          location: {
            ...shop.location,
            coordinates: [
              Number(shop.location.lng),
              Number(shop.location.lat),
            ],
          },
        },
      };
      const res = await fetch("/api/auth/register/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      showToast("Shop registered! Login to continue");
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (r) => {
    setRole(r);
    setTimeout(() => setStep(2), 180);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-start py-10 px-4">

      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium transition-all ${
          toast.type === "success"
            ? "bg-white border border-green-200 text-green-700 shadow-green-100"
            : "bg-white border border-red-200 text-red-600"
        }`}>
          <span className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
          {toast.msg}
        </div>
      )}

      {/* Brand header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">LocalBazaar</h1>
          <p className="text-xs text-gray-400 mt-0.5">Your neighbourhood marketplace</p>
        </div>
      </div>

      {/* Progress */}
      {step > 1 && <ProgressBar step={step} role={role} />}

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-100/80 overflow-hidden">

        {/* ── STEP 1: Role ──────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2">Welcome</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
              <p className="text-sm text-gray-400">Tell us how you'll use LocalBazaar</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  r: "customer",
                  icon: (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                  ),
                  badge: "🛍️",
                  title: "I'm a Customer",
                  desc: "Discover & shop from local stores near you",
                  tag: "Free forever",
                },
                {
                  r: "shop_owner",
                  icon: (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                    </svg>
                  ),
                  badge: "🏪",
                  title: "I'm a Shop Owner",
                  desc: "List your shop and reach local customers",
                  tag: "Grow your business",
                },
              ].map(({ r, icon, badge, title, desc, tag }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => selectRole(r)}
                  className={`
                    w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left
                    transition-all duration-200 group relative overflow-hidden
                    ${role === r
                      ? "border-green-500 bg-green-50 shadow-md shadow-green-100"
                      : "border-gray-100 bg-gray-50/50 hover:border-green-200 hover:bg-green-50/50"
                    }
                  `}
                >
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 text-xl
                    ${role === r ? "bg-white shadow-sm" : "bg-white"}`}>
                    {badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`font-bold text-sm transition-colors ${role === r ? "text-green-700" : "text-gray-800"}`}>
                        {title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${role === r ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {tag}
                    </span>
                  </div>
                  <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${role === r ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
                    {role === r && (
                      <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <span className="text-gray-400 text-sm">Already have an account? </span>
              <Link href="/login" className="text-green-600 hover:text-green-700 text-sm font-semibold transition-colors">
                Sign in →
              </Link>
            </div>
          </div>
        )}

        {/* ── STEP 2: Personal Info ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="p-8 space-y-5">
            {/* Header */}
            <div className="mb-1">
              <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-1">
                {role === "customer" ? "Step 2 of 2" : "Step 2 of 3"}
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                {role === "customer" ? "Your details" : "Personal info"}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {role === "customer" ? "Set up your shopping profile" : "Tell us about yourself"}
              </p>
            </div>

            {globalError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl flex items-start gap-2">
                <svg width="16" height="16" fill="currentColor" className="mt-0.5 shrink-0" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {globalError}
              </div>
            )}

            {/* Avatar upload */}
            <AvatarUpload
              label="Tap to upload profile photo (optional)"
              value={personal.image}
              onChange={(b64) => setPersonal((prev) => ({ ...prev, image: b64 }))}
              initials={personal.name ? personal.name[0].toUpperCase() : "U"}
            />

            <div className="grid grid-cols-1 gap-4">
              <InputField
                label="Full name"
                value={personal.name}
                onChange={setP("name")}
                error={personalErr.name}
                placeholder="Rahul Sharma"
              />
              <InputField
                label="Email address"
                type="email"
                value={personal.email}
                onChange={setP("email")}
                error={personalErr.email}
                placeholder="rahul@example.com"
              />
              <InputField
                label="Phone number"
                type="tel"
                value={personal.phone}
                onChange={setP("phone")}
                error={personalErr.phone}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
              <PasswordField
                value={personal.password}
                onChange={setP("password")}
                error={personalErr.password}
              />
            </div>

            {role === "customer" && (
              <>
                <SectionDivider label="Delivery Address" />
                <TextAreaField
                  label="Full address"
                  value={personal.addresses}
                  onChange={setP("addresses")}
                  error={personalErr.addresses}
                  rows={2}
                  placeholder="House no., street, area, landmark…"
                />
                <InputField
                  label="Pincode"
                  value={personal.pincode}
                  onChange={setP("pincode")}
                  error={personalErr.pincode}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
              </>
            )}

            <div className="pt-1 space-y-3">
              {role === "customer" ? (
                <button
                  type="button"
                  onClick={handleCustomerSubmit}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] text-sm shadow-lg shadow-green-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : "Create account →"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { if (validatePersonal()) setStep(3); }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] text-sm shadow-lg shadow-green-200"
                >
                  Continue to shop details →
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-400 hover:text-gray-600 py-2 text-sm transition-colors font-medium"
              >
                ← Go back
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Shop Details ──────────────────────────────────────────── */}
        {step === 3 && role === "shop_owner" && (
          <div className="p-8 space-y-5">
            <div className="mb-1">
              <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-1">Step 3 of 3</p>
              <h2 className="text-xl font-bold text-gray-900">Shop details</h2>
              <p className="text-sm text-gray-400 mt-0.5">Set up your shop profile</p>
            </div>

            {globalError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl flex items-start gap-2">
                <svg width="16" height="16" fill="currentColor" className="mt-0.5 shrink-0" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {globalError}
              </div>
            )}

            {/* Shop Images */}
            <ShopImagesUpload
              images={shop.images}
              thumbnail={shop.thumbnail}
              onImagesChange={(imgs) => setShop((prev) => ({ ...prev, images: imgs }))}
              onThumbnailChange={(t) => setShop((prev) => ({ ...prev, thumbnail: t }))}
            />

            <InputField
              label="Shop name"
              value={shop.name}
              onChange={setS("name")}
              error={shopErr.name}
              placeholder="e.g. Sharma Kirana Store"
            />

            <TextAreaField
              label="Description (optional)"
              value={shop.description}
              onChange={setS("description")}
              rows={2}
              placeholder="What do you sell? Any speciality?"
            />

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500">
                Category
              </label>
              <div className="relative">
                <select
                  value={shop.category}
                  onChange={setS("category")}
                  className={`
                    w-full bg-white border text-gray-800 rounded-xl px-4 py-3 text-sm
                    outline-none transition-all duration-200 appearance-none shadow-sm pr-10
                    focus:bg-white
                    ${shopErr.category
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    }
                  `}
                >
                  <option value="" disabled>Select a category…</option>
                  {Object.entries(SHOP_CATEGORIES).map(([key, data]) => (
                    <option key={key} value={key}>{data.icon} {data.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
              {shopErr.category && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {shopErr.category}
                </p>
              )}
            </div>

            {/* Subcategories */}
            {shop.category && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500">
                  What do you sell?
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  {SHOP_CATEGORIES[shop.category]?.subcategories.map((sub) => (
                    <Chip
                      key={sub}
                      label={sub.replace(/_/g, " ")}
                      selected={shop.subcategories.includes(sub)}
                      onClick={() => toggleSub(sub)}
                    />
                  ))}
                </div>
                {shopErr.subcategories && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {shopErr.subcategories}
                  </p>
                )}
              </div>
            )}

            {/* Location */}
            <SectionDivider label="Shop Location" />
            <InputField
              label="Street address"
              value={shop.location.address}
              onChange={setLoc("address")}
              error={shopErr.locAddress}
              placeholder="Street / area / landmark"
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="City"
                value={shop.location.city}
                onChange={setLoc("city")}
                error={shopErr.locCity}
                placeholder="Jaipur"
              />
              <InputField
                label="Pincode"
                value={shop.location.pincode}
                onChange={setLoc("pincode")}
                error={shopErr.locPincode}
                placeholder="302021"
                maxLength={6}
              />
            </div>

            {/* GPS coordinates with hint */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <svg width="15" height="15" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-xs font-semibold text-green-700">GPS Coordinates</span>
                <span className="text-[10px] text-green-500">Find on Google Maps → Share → Copy coordinates</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Latitude"
                  value={shop.location.lat}
                  onChange={setLoc("lat")}
                  error={shopErr.lat}
                  placeholder="26.9124"
                />
                <InputField
                  label="Longitude"
                  value={shop.location.lng}
                  onChange={setLoc("lng")}
                  error={shopErr.lng}
                  placeholder="75.7873"
                />
              </div>
            </div>

            {/* Contact */}
            <SectionDivider label="Contact" />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Phone"
                type="tel"
                value={shop.phone}
                onChange={setS("phone")}
                error={shopErr.phone}
                placeholder="Phone number"
                maxLength={10}
              />
              <InputField
                label="WhatsApp"
                type="tel"
                value={shop.whatsapp}
                onChange={setS("whatsapp")}
                placeholder="WhatsApp number"
                maxLength={10}
              />
            </div>
            {shopErr.phone && (
              <p className="text-red-500 text-xs -mt-3 flex items-center gap-1">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {shopErr.phone}
              </p>
            )}

            {/* Timings */}
            <SectionDivider label="Shop Hours" />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Opens at"
                type="time"
                value={shop.openTime}
                onChange={setS("openTime")}
              />
              <InputField
                label="Closes at"
                type="time"
                value={shop.closeTime}
                onChange={setS("closeTime")}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500">
                Weekly off <span className="text-gray-300 normal-case font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => (
                  <Chip
                    key={day}
                    label={day}
                    selected={shop.closedOn.includes(day)}
                    onClick={() => toggleDay(day)}
                    danger
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleOwnerSubmit}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] text-sm shadow-lg shadow-green-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering shop…
                  </span>
                ) : "Launch my shop 🚀"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-gray-400 hover:text-gray-600 py-2 text-sm transition-colors font-medium"
              >
                ← Back to personal info
              </button>
            </div>
          </div>
        )}

      </div>

      <p className="text-gray-300 text-xs mt-8">
        © 2025 LocalBazaar · All rights reserved
      </p>
    </div>
  );
}