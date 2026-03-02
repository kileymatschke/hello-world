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
            <div className="absolute top-36 left-1/2 -translate-x-1/2 z-50">
                <SignOutButton />
            </div>

            <h1
                className="text-6xl font-bold mb-2 mt-4 text-center"
                style={{ fontFamily: "var(--font-custom)", color:"var(--foreground)" }}
            >
                The Humor Project
            </h1>

            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-custom)", color:"var(--foreground)" }}>Project 1: Public-facing voting site for captions</h2>


            {/* Responsive wrapper: stacks on mobile, side-by-side on md+ */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">


                <Link href="/browse" className="z-20">
                    <div className="relative cursor-pointer z-20 w-[320px] h-[400px] sm:w-[400px] sm:h-[400px] -rotate-6 hover:-rotate-8 transition-transform mt-18">
                        <Image
                            src="/sticky4.png"
                            alt="sticky note"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />

                        <p
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-center pointer-events-none"
                            style={{ fontFamily: "var(--font-custom)", color: "#d68b27" }}
                        >
                            Browse
                        </p>
                    </div>
                </Link>



                <Link href="/generate" className="z-20">
                    <div className="relative cursor-pointer z-20 w-[320px] h-[400px] sm:w-[400px] sm:h-[400px] rotate-12 hover:rotate-8 transition-transform">
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
                            Generate captions
                        </p>
                    </div>
                </Link>

                <Link href="/vote" className="z-20">
                    <div className="relative cursor-pointer z-20 w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] -rotate-12 mt-20 hover:-rotate-8 transition-transform">
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
                            Vote
                        </p>
                    </div>
                </Link>



            </div>

        </div>
    );
}