"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
    const supabase = createClient();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // Redirect to login page after signing out
    };

    return (
        <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded bg-(--foreground) text-(--background) text-sm font-semibold shadow-md hover:bg-[#fcdfb6] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            style={{ fontFamily: "var(--font-adelia)" }}

        >
            Sign Out
        </button>
    );
}
