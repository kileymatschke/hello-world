"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const supabase = createClient();

    const signInWithGoogle = async () => {
        const origin = window.location.origin;

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${origin}/auth/callback`, // EXACT
            },
        });
    };

    return (
        <main className="min-h-screen grid place-items-center p-6">
            <button
                onClick={signInWithGoogle}
                className="px-4 py-2 rounded bg-[var(--foreground)] hover:bg-[#fcdfb6] text-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[#DE89BE] focus:ring-offset-2"
                style={{ fontFamily: "var(--font-adelia)" }}
            >
                Sign in with Google
            </button>
        </main>
    );
}


