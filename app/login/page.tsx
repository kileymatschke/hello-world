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
        <main className="min-h-screen flex flex-col items-center justify-center gap-10 p-6">

            <h1
                className="text-center"
                style={{ fontSize: 32, fontFamily: "var(--font-adelia)", color: "var(--foreground)" }}
            >
                The Humor Project:<br /> Caption Creation + Rating App
            </h1>

            <button
                onClick={signInWithGoogle}
                className="px-4 py-2 rounded-4xl bg-[var(--foreground)] hover:bg-[#fcdfb6] text-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[#DE89BE] focus:ring-offset-2"
                style={{ fontSize: 16, fontFamily: "var(--font-adelia)" }}
            >
                Sign in with Google
            </button>
        </main>
    );
}


