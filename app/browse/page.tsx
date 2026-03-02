import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import SignOutButton from "../components/SignOutButton";
import {redirect} from "next/navigation";



export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;
const OVERSAMPLE = 8; // fetch extra to still end up with 100 after filtering
const FETCH_SIZE = PAGE_SIZE * OVERSAMPLE;

function shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function chunk<T>(arr: T[], size: number) {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

export default async function BrowsePage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // const { data: { user } } = await supabase.auth.getUser();
    //
    // if (!user) redirect("/login");

    // 1) Count images
    const { count, error: countErr } = await supabase
        .from("images")
        .select("*", { count: "exact", head: true });

    if (countErr) {
        return <div className="p-6 text-red-600">Count error: {countErr.message}</div>;
    }

    const totalImages = count ?? 0;
    if (totalImages === 0) {
        return <div className="p-6">No images found.</div>;
    }

    // 2) Pick a random window of images
    const maxStart = Math.max(0, totalImages - FETCH_SIZE);
    const start = Math.floor(Math.random() * (maxStart + 1));
    const from = start;
    const to = Math.min(start + FETCH_SIZE - 1, totalImages - 1);

    const { data: images, error: imagesErr } = await supabase
        .from("images")
        .select("id, url")
        .range(from, to);

    if (imagesErr) {
        return <div className="p-6 text-red-600">Images error: {imagesErr.message}</div>;
    }

    // Deduplicate images
    const uniqueById = new Map<string, { id: string; url: string }>();
    for (const img of images ?? []) {
        if (img?.id && !uniqueById.has(String(img.id))) uniqueById.set(String(img.id), img);
    }
    const uniqueImages = Array.from(uniqueById.values());
    const imageIds = uniqueImages.map((img) => img.id);

    // 3) Fetch captions that match those images (BATCHED to avoid huge URL -> 400 Bad Request)
    const captionByImageId = new Map<string, string>();

    // 100 is a safe batch size for URL length; you can raise to 150 if you want.
    const batches = chunk(imageIds, 100);

    for (const ids of batches) {
        const { data: captions, error: captionsErr } = await supabase
            .from("captions")
            .select("image_id, content")
            .in("image_id", ids);

        if (captionsErr) {
            // show more detail than just "Bad Request" when possible
            const details =
                (captionsErr as any)?.details ||
                (captionsErr as any)?.hint ||
                (captionsErr as any)?.code ||
                "";
            return (
                <div className="p-6 text-red-600">
                    Captions error: {captionsErr.message} {details ? `(${details})` : ""}
                </div>
            );
        }

        for (const c of captions ?? []) {
            const key = String(c.image_id);
            // only accept non-empty captions
            const content = (c.content ?? "").trim();
            if (!captionByImageId.has(key) && content.length > 0) {
                captionByImageId.set(key, content);
            }
        }
    }

    // ✅ Filter: only images that have a caption
    const imagesWithCaptions = uniqueImages.filter((img) =>
        captionByImageId.has(String(img.id))
    );

    // Shuffle and take 100
    const finalImages = shuffle(imagesWithCaptions).slice(0, PAGE_SIZE);



    return (
        // <div className="relative min-h-screen p-6 flex flex-col items-center">
        //     <div className="absolute top-8 right-6">
        //         <SignOutButton />
        //     </div>

            <div className="absolute top-6 left-6 flex flex-col items-start">
                <h1 className="text-5xl font-bold" style={{ fontFamily: "var(--font-custom)" }}>
                    Browse
                </h1>

                <p className="inline-block text-xl font-bold" style={{ fontFamily: "var(--font-custom)" }}>
                    Refresh to view 100 new image-caption pairs.
                </p>

                <Link
                    href="/gallery"
                    className="inline-block text-lg underline mt-2"
                    style={{ fontFamily: "var(--font-custom)" }}
                >
                    (Back to home)
                </Link>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-10 mb-20 mr-8">
                    {finalImages.map((img) => {
                        const caption = captionByImageId.get(String(img.id))!;

                        return (
                            <div key={img.id} className="rounded-lg shadow bg-white overflow-hidden">
                                {img.url ? (
                                    <img
                                        src={img.url}
                                        alt={caption}
                                        className="w-full aspect-square object-cover"
                                    />
                                ) : (
                                    <div className="w-full aspect-square bg-gray-200 grid place-items-center text-sm text-gray-600">
                                        No image
                                    </div>
                                )}

                                <div className="p-3">
                                    <div
                                        className="text-sm font-bold"
                                        style={{ fontFamily: "var(--font-fors)", color: "var(--background)" }}
                                    >
                                        {caption}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {finalImages.length < PAGE_SIZE && (
                    <div className="mt-6 text-sm text-gray-500">
                        Only showing {finalImages.length} images with captions. If you want to
                        try harder to reach 100, increase OVERSAMPLE (currently {OVERSAMPLE}).
                    </div>
                )}
            </div>
         //</div>
    );
}