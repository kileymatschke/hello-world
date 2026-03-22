import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GenerateCaptions from "../components/GenerateCaptions";
import Link from "next/link";
import SignOutButton from "@/app/components/SignOutButton";

export default async function GeneratePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="min-h-screen px-6 py-8 flex justify-center">
            {/* Centered 2/3 container */}
            <div className="w-full lg:w-2/3 flex flex-col items-start">

                {/* Top row */}
                <div className="w-full flex items-start justify-between gap-4">
                    <div className="flex flex-col items-start">
                        <h1
                            style={{
                                marginTop: "30px",
                                fontFamily: "var(--font-adelia)",
                                fontSize: 40,
                            }}
                        >
                            Generate Captions
                        </h1>

                        <Link
                            href="/gallery"
                            className="inline-block text-lg"
                            style={{
                                border: "none",
                                borderRadius: 999,
                                padding: "10px 16px",
                                marginTop: "16px",
                                marginBottom: "20px",
                                background: "var(--foreground)",
                                color: "var(--background)",
                                fontWeight: 700,
                                fontSize: 16,
                                fontFamily: "var(--font-fors)",
                                cursor: "pointer",
                            }}
                        >
                            Back to home
                        </Link>
                    </div>

                    {/* Optional sign out */}
                    {/* <div className="mt-4 shrink-0">
                        <SignOutButton />
                    </div> */}
                </div>

                {/* Main content */}
                <div className="w-full flex justify-center mt-4">
                    <GenerateCaptions />
                </div>
            </div>
        </div>
    );
}