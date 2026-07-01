"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const Icon = {
  back: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  edit: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  save: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  cancel: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  camera: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13a3 3 0 100 6 3 3 0 000-6z" /></svg>,
};

function Field({ label, value, name, type = "text", onChange, editing, placeholder, locked, lockedHint }) {
  return (
    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}
        {locked && <span className="text-[9px] normal-case font-medium text-slate-300">({lockedHint || "cannot edit"})</span>}
      </span>
      {editing && !locked ? (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1.5 w-full bg-white border border-emerald-100 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
        />
      ) : (
        <span className={`text-slate-800 font-medium mt-0.5 block break-words ${locked ? "opacity-60" : ""}`}>
          {value || <span className="text-slate-300 italic font-normal">Not Provided</span>}
        </span>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]     = useState("");
  const fileRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem('User');
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      router.push('/login');
    }
  }, [router]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const buildForm = (u) => ({
    name:      u?.name      || "",
    phone:     u?.phone     || "",
    addresses: u?.addresses || "",
    pincode:   u?.pincode   || "",
    image:     u?.image     || "",
  });

  const [form, setForm] = useState(buildForm(null));

  useEffect(() => {
    if (user) setForm(buildForm(user));
  }, [user]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('User');
    router.replace('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCancel = () => {
    setForm(buildForm(user));
    setEditing(false);
  };

  const handleImageUpload = async (e) => {
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
        showToast("Upload failed: " + (data.message || "Unknown error"));
      }
    } catch {
      showToast("Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Name required hai");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/update/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:      form.name,
          phone:     form.phone,
          addresses: form.addresses,
          pincode:   form.pincode,
          image:     form.image,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem('User', JSON.stringify(updatedUser));
        setEditing(false);
        showToast("✓ Profile updated");
      } else {
        showToast("Save failed: " + (data.message || "Unknown error"));
      }
    } catch {
      showToast("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-50" />;

  const formattedJoinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : "Recent";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-slate-50 to-slate-50 text-slate-800 font-sans antialiased pb-12">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl animate-[fadeIn_0.2s_ease]">
          {toast}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translate(-50%,-8px);} to {opacity:1; transform:translate(-50%,0);} }`}</style>

      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100 px-4 py-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors"
          >
            {Icon.back}
          </button>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">Account Profile</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {user.role === 'shop_owner' ? 'Shop Owner' : user.role === 'admin' ? 'Admin' : 'Customer'}
          </span>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition-all"
            >
              {Icon.edit} Edit Profile
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all"
              >
                {Icon.cancel} Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60"
              >
                {saving
                  ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : Icon.save}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile edit bar */}
      <div className="sm:hidden sticky top-[68px] z-30 bg-white/90 backdrop-blur-md border-b border-emerald-50 px-4 py-2.5">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition-all"
          >
            {Icon.edit} Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all"
            >
              {Icon.cancel} Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60"
            >
              {saving
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : Icon.save}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      <main className="p-4 max-w-4xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: Avatar & Quick Stats */}
        <div className="md:col-span-1 bg-white border border-emerald-100/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center justify-between h-fit">
          <div className="w-full">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500 shadow-md bg-emerald-600 flex items-center justify-center">
                {form.image ? (
                  <img
                    src={form.image}
                    alt={user.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {editing && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md border-2 border-white transition-all disabled:opacity-60"
                    title="Change photo"
                  >
                    {uploading
                      ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : Icon.camera}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </>
              )}
            </div>

            {editing ? (
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full text-center text-xl font-bold text-slate-800 bg-slate-50 border border-emerald-100 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-800 line-clamp-1">{user.name}</h2>
            )}
            <p className="text-slate-400 text-sm mt-1 break-all">{user.email}</p>
          </div>

          <div className="w-full border-t border-slate-100 mt-6 pt-4 text-left space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Member Since</span>
              <span className="font-medium text-slate-700">{formattedJoinedDate}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Info Forms/Details */}
        <div className="md:col-span-2 space-y-6">

          {/* Section: Personal Information */}
          <div className="bg-white border border-emerald-100/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="name" value={form.name} onChange={handleChange} editing={editing} />
              <Field label="Mobile Number" name="phone" value={form.phone} onChange={handleChange} editing={editing} type="tel" placeholder="10-digit mobile number" />
              <div className="sm:col-span-2">
                <Field label="Email" value={user.email} editing={editing} locked lockedHint="cannot edit" />
              </div>
            </div>
          </div>

          {/* Section: Address Details */}
          <div className="bg-white border border-emerald-100/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Primary Address
            </h3>

            <div className="space-y-4">
              {editing ? (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400 uppercase">Street Address</span>
                  <textarea
                    name="addresses"
                    value={form.addresses}
                    onChange={handleChange}
                    rows={3}
                    placeholder="House no, street, locality…"
                    className="mt-1.5 w-full bg-white border border-emerald-100 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none transition-all"
                  />
                </div>
              ) : (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400 uppercase">Street Address</span>
                  <span className="text-slate-800 font-medium mt-0.5 block leading-relaxed">
                    {form.addresses || 'No address added yet'}
                  </span>
                </div>
              )}

              <div className="sm:w-1/2">
                <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} editing={editing} placeholder="6-digit pincode" />
              </div>
            </div>
          </div>

          {/* Actions & Navigation Section */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => router.push('/orders')}
              className="w-full bg-white border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-700 font-semibold py-4 rounded-xl transition-all flex justify-between px-6 items-center shadow-sm group"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {user.role === 'shop_owner' ? 'Manage Shop & Orders' : 'My Orders'}
              </span>
              <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={logout}
              className="w-full bg-red-50 hover:bg-red-100/70 border border-red-200/60 text-red-600 font-semibold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out Account
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}