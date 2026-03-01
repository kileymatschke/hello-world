import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "../components/SignOutButton";
import Link from "next/link";
import Image from "next/image";

export default async function GalleryPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="relative flex flex-col items-center min-h-screen p-4">
            <div className="absolute top-28">
                <SignOutButton />
            </div>

            <h1
                className="text-6xl font-bold mb-8 mt-4 text-center"
                style={{ fontFamily: "var(--font-custom)", color:"var(--foreground)" }}
            >
                The Humor Project
            </h1>

            {/* Responsive wrapper: stacks on mobile, side-by-side on md+ */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-20">
                <Link href="/vote" className="z-20">
                    <div className="relative cursor-pointer z-20 w-[320px] h-[400px] sm:w-[400px] sm:h-[400px] -rotate-12 hover:-rotate-8 transition-transform">
                        <Image
                            src="/sticky.png"
                            alt="sticky note"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />

                        <p
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-center pointer-events-none"
                            style={{ fontFamily: "var(--font-custom)", color: "#2274A5" }}
                        >
                            Vote
                        </p>
                    </div>
                </Link>

                <Link href="/generate" className="z-20">
                    <div className="relative cursor-pointer z-20 w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rotate-12 hover:rotate-8 transition-transform">
                        <Image
                            src="/sticky3.png"
                            alt="sticky note"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />

                        <p
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-center pointer-events-none"
                            style={{ fontFamily: "var(--font-custom)", color: "#624c7a" }}
                        >
                            Generate captions
                        </p>
                    </div>
                </Link>
            </div>

        </div>
    );
}