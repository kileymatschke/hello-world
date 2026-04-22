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
        <div className="relative flex flex-col items-center min-h-screen px-4 py-6 overflow-hidden">


            <h1
                className="mt-12 text-4xl sm:text-5xl md:text-6xl font-bold mb-2 mt-4 text-center"
                style={{ fontWeight: 1000, fontFamily: "var(--font-fors)", color: "var(--foreground)", fontSize: 16 }}
            >
                THE HUMOR PROJECT:
            </h1>

            <h2
                className="mt-2 text-base sm:text-lg md:text-xl font-bold text-center"
                style={{ fontFamily: "var(--font-adelia)", color: "var(--foreground)", fontSize: 32 }}
            >
                Caption Creation + Rating App
            </h2>

            <div className="py-6">
                <SignOutButton />
            </div>

            <div className="mt-2 flex flex-wrap justify-center items-center gap-6 md:gap-8 w-full max-w-7xl">
                <div className="z-20 flex justify-center">
                    <Link
                        href="/browse"
                        className="relative block cursor-pointer z-20 w-[min(85vw,320px)] aspect-[4/5] sm:w-[min(42vw,380px)] lg:w-[320px] -rotate-6 hover:-rotate-8 transition-transform"
                    >
                        <Image
                            src="/sticky4.png"
                            alt="sticky note"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                        <p
                            className="absolute top-1/2 left-1/2 w-[70%] -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-center pointer-events-none leading-tight"
                            style={{ fontFamily: "var(--font-custom)", color: "#d68b27" }}
                        >
                            Browse
                        </p>
                    </Link>
                </div>

                <div className="z-20 flex justify-center">
                    <Link
                        href="/generate"
                        className="relative block cursor-pointer z-20 w-[min(85vw,320px)] aspect-[4/5] sm:w-[min(42vw,380px)] lg:w-[320px] rotate-12 hover:rotate-8 transition-transform"
                    >
                        <Image
                            src="/sticky.png"
                            alt="sticky note"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                        <p
                            className="absolute top-1/2 left-1/2 w-[70%] -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-center pointer-events-none leading-tight"
                            style={{ fontFamily: "var(--font-custom)", color: "#2274A5" }}
                        >
                            Generate captions
                        </p>
                    </Link>
                </div>

                <div className="z-20 flex justify-center">
                    <Link
                        href="/vote"
                        className="relative block cursor-pointer z-20 w-[min(85vw,320px)] aspect-square sm:w-[min(42vw,380px)] lg:w-[320px] -rotate-12 hover:-rotate-8 transition-transform"
                    >
                        <Image
                            src="/sticky3.png"
                            alt="sticky note"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                        <p
                            className="absolute top-1/2 left-1/2 w-[70%] -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-center pointer-events-none leading-tight"
                            style={{ fontFamily: "var(--font-custom)", color: "#624c7a" }}
                        >
                            Vote
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}