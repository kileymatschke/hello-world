"use client";

import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
    const handleSignOut = async () => {
        await fetch("/auth/signout", { method: "POST" });
        window.location.href = "/login";
    };

    return (
        <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded bg-[#E3AACD] text-sm font-semibold shadow-md hover:bg-[#FDCFF3] focus:outline-none focus:ring-2 focus:ring-[#F9C784] focus:ring-offset-2"
            style={{ fontFamily: "var(--font-adelia)", color: "var(--background)" }}
        >
            Sign Out
        </button>
    );
}