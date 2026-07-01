"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VALID_ROLES } from "./constants";
import { PageLoader } from "./SharedUI";
import CustomerHome from "./CustomerHome";
import OwnerHome from "./OwnerHome";
//Smooth like butter like criminal under cover gone pop like trouble
 export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);


  useEffect(() => {
    const sync = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const p = JSON.parse(stored);
            if (p?.role && VALID_ROLES.includes(p.role)) setUser(p);
          } catch { localStorage.removeItem("user"); }
        }

        const res = await fetch("/api/user/me", { credentials: "include" });
        const data = await res.json();       

        if (!res.ok || !data.success) {
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        const stored = localStorage.getItem("user");
        if (!stored) router.replace("/login");
      } finally {
        setReady(true);
      }
    };
    sync();
  }, [router]);

  if (!ready || !user) return <PageLoader text="Verifying session…" />;

  return user.role === "customer" ? <CustomerHome user={user} /> : <OwnerHome user={user} />;
}