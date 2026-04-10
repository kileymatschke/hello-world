import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CardDisplay from "../components/CardDisplay";
import SignOutButton from "../components/SignOutButton";
import Link from "next/link";

export default async function VotePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="min-h-screen px-6 py-8 flex justify-center">
            <div className="w-full lg:w-2/3">
                <div className="flex flex-col items-start">
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
                                Vote
                            </h1>

                            <Link
                                href="/gallery"
                                className="inline-block text-lg"
                                style={{
                                    border: "none",
                                    borderRadius: 999,
                                    padding: "10px 16px",
                                    marginTop: "20px",
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

                        {/*<div className="mt-8 shrink-0">*/}
                        {/*    <SignOutButton />*/}
                        {/*</div>*/}
                    </div>

                    {/* Main content container */}
                    <div
                        className="bg-white/95 w-full max-w-4xl mx-auto rounded-[28px] border p-4 sm:p-5 shadow-sm mt-2"
                        style={{
                            background: "#cadeeb",
                            borderColor: "rgba(0,0,0,0.06)",
                        }}
                    >

                        <p
                            className="mt-4 text-sm text-center"
                            style={{
                                fontFamily: "var(--font-fors)",
                                fontSize: 18,
                                color: "var(--background)",
                                fontWeight: 600,
                            }}
                        >
                            Click the up arrow if you find an image-caption pair funny or the down arrow if you don't.<br />
                            Your responses help us understand which types of captions perform best.<br />
                            You may see images repeated with different captions.
                        </p>

                        <p
                            className="mt-4 text-sm text-center"

                        >
                        </p>


                        <CardDisplay />
                    </div>
                </div>
            </div>
        </div>
    );
}