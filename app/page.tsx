"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const supabase = createClient();

    const signInWithGoogle = async () => {
        const origin = window.location.origin;

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        });
    };

    return (
        <main className="min-h-screen grid place-items-center p-6">
            <button
                onClick={signInWithGoogle}
                className="px-4 py-2 rounded bg-black text-white"
            >
                Continue with Google
            </button>
        </main>
    );
}


// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
//
// export default async function Home() {
//     const supabase = await createClient();
//     const { data: { user } } = await supabase.auth.getUser();
//
//     if (user) redirect("/gallery");
//     redirect("/login");
// }