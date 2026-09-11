"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

export default function PortalMobileNav() {
  const [open, setOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
      if (active && profile) {
        setIsOwner(profile.role === "owner");
        setName(profile.full_name || "");
      }
    })();
    return () => { active = false; };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/staff";
  }

  return (
    <div className="portal-nav">
      <button className="portal-nav-toggle" aria-label="Menu" onClick={() => setOpen(!open)}>
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <>
          <div className="portal-nav-backdrop" onClick={() => setOpen(false)} />
          <div className="portal-nav-menu">
            {name && <div className="portal-nav-name">{name} · {isOwner ? "Owner" : "Staff"}</div>}
            <a href="/staff/dashboard" onClick={() => setOpen(false)}>Dashboard</a>
            <a href="/staff/appointments" onClick={() => setOpen(false)}>Appointments</a>
            {isOwner && <a href="/staff/manage" onClick={() => setOpen(false)}>Manage staff</a>}
            {isOwner && <a href="/staff/finance" onClick={() => setOpen(false)}>Finances</a>}
            <a href="/staff/leave" onClick={() => setOpen(false)}>Leave</a>
            <a href="/staff/account" onClick={() => setOpen(false)}>Account</a>
            <button onClick={signOut} className="portal-nav-signout">Sign out</button>
          </div>
        </>
      )}
    </div>
  );
}
