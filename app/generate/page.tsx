import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GenerateCaptions from "../components/GenerateCaptions";
import Link from "next/link";
import SignOutButton from "@/app/components/SignOutButton";
import CardDisplay from "@/app/components/CardDisplay";



export default async function GeneratePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="relative min-h-screen p-6 flex flex-col items-center">
            <div className="absolute top-8 right-6">
                <SignOutButton />
            </div>

            <div className="w-full max-w-xl flex justify-between mb-6">

                {/* Left side: title + gallery stacked */}
                <div className="absolute top-6 left-6 flex flex-col items-start">
                    <h1
                        className="text-5xl font-bold"
                        style={{ fontFamily: "var(--font-custom)" }}
                    >
                        Generate Captions
                    </h1>

                    <Link
                        href="/gallery"
                        className="text-lg underline mt-0.5"
                        style={{ fontFamily: "var(--font-custom)" }}
                    >
                        (Back to home)
                    </Link>
                </div>
            </div>

            <div className="mt-32">
                <GenerateCaptions />
            </div>

        </div>
    );
}