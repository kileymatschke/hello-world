import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BrowseCardGrid from "../components/BrowseCardGrid";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 66;

type CaptionRow = {
    id: string | number;
    content: string | null;
    image_id: string | number | null;
};

type ImageRow = {
    id: string | number;
    url: string | null;
};

function PaginationControls({
                                safePage,
                                totalPages,
                            }: {
    safePage: number;
    totalPages: number;
}) {
    const buttonStyle = {
        border: "none",
        borderRadius: 999,
        padding: "10px 16px",
        background: "var(--foreground)",
        color: "var(--background)",
        fontWeight: 700,
        fontSize: 16,
        fontFamily: "var(--font-fors)",
        cursor: "pointer",
        textDecoration: "none",
    } as const;

    const disabledStyle = {
        ...buttonStyle,
        opacity: 0.45,
        cursor: "default",
    } as const;

    const pageNumberStyle = (isActive: boolean) =>
        ({
            fontFamily: "var(--font-fors)",
            fontSize: 16,
            fontWeight: isActive ? 1000 : 700,
            color: isActive ? "var(--cards)" : "var(--background)",
            textDecoration: isActive ? "underline" : "none",
            cursor: "pointer",
            padding: "4px 6px",
        }) as const;

    const startPage = Math.max(1, safePage - 2);
    const endPage = Math.min(totalPages, safePage + 2);

    const pages = [];
    for (let p = startPage; p <= endPage; p++) {
        pages.push(p);
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            {safePage > 1 ? (
                <Link href={`/browse?page=${safePage - 1}`} style={buttonStyle}>
                    Previous
                </Link>
            ) : (
                <span style={disabledStyle}>Previous</span>
            )}

            {startPage > 1 && (
                <>
                    <Link href="/browse?page=1" style={pageNumberStyle(safePage === 1)}>
                        1
                    </Link>
                    {startPage > 2 && (
                        <span style={{ color: "var(--background)", fontWeight: 700 }}>...</span>
                    )}
                </>
            )}

            {pages.map((p) => (
                <Link key={p} href={`/browse?page=${p}`} style={pageNumberStyle(p === safePage)}>
                    {p}
                </Link>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && (
                        <span style={{ color: "var(--background)", fontWeight: 700 }}>...</span>
                    )}
                    <Link
                        href={`/browse?page=${totalPages}`}
                        style={pageNumberStyle(safePage === totalPages)}
                    >
                        {totalPages}
                    </Link>
                </>
            )}

            {safePage < totalPages ? (
                <Link href={`/browse?page=${safePage + 1}`} style={buttonStyle}>
                    Next
                </Link>
            ) : (
                <span style={disabledStyle}>Next</span>
            )}
        </div>
    );
}

export default async function BrowsePage({
                                             searchParams,
                                         }: {
    searchParams?: Promise<{ page?: string }>;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const params = await searchParams;
    const currentPage = Math.max(1, Number(params?.page ?? "1") || 1);

    const { count, error: countErr } = await supabase
        .from("captions")
        .select("id", { count: "exact", head: true })
        .not("content", "is", null)
        .neq("content", "")
        .not("image_id", "is", null);

    if (countErr) {
        return <div className="p-6 text-red-600">Count error: {countErr.message}</div>;
    }

    const totalItems = count ?? 0;

    if (totalItems === 0) {
        return <div className="p-6">No captions found.</div>;
    }

    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const safePage = Math.min(currentPage, totalPages);

    const from = (safePage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: captionData, error: captionErr } = await supabase
        .from("captions")
        .select("id, content, image_id")
        .not("content", "is", null)
        .neq("content", "")
        .not("image_id", "is", null)
        .order("id", { ascending: true })
        .range(from, to);

    if (captionErr) {
        return <div className="p-6 text-red-600">Caption load error: {captionErr.message}</div>;
    }

    const captionRows = (captionData ?? []) as CaptionRow[];

    const imageIds = Array.from(
        new Set(
            captionRows
                .map((row) => row.image_id)
                .filter((id): id is string | number => id !== null)
                .map(String)
        )
    );

    const { data: imageData, error: imageErr } =
        imageIds.length === 0
            ? { data: [], error: null }
            : await supabase
                .from("images")
                .select("id, url")
                .in("id", imageIds);

    if (imageErr) {
        return <div className="p-6 text-red-600">Image load error: {imageErr.message}</div>;
    }

    const imageRows = (imageData ?? []) as ImageRow[];

    const imageMap = new Map<string, string>();
    for (const img of imageRows) {
        const url = (img.url ?? "").trim();
        if (url) {
            imageMap.set(String(img.id), url);
        }
    }

    const cards = captionRows
        .map((row) => {
            const caption = (row.content ?? "").trim();
            const imageUrl = row.image_id ? imageMap.get(String(row.image_id)) ?? null : null;

            if (!caption || !imageUrl) return null;

            return {
                id: String(row.id),
                imageUrl,
                caption,
            };
        })
        .filter(Boolean) as { id: string; imageUrl: string; caption: string }[];

    return (
        <div className="min-h-screen px-6 py-8 flex justify-center">
            <div className="w-full max-w-7xl">
                <div className="flex flex-col items-start">
                    <h1
                        style={{
                            marginTop: "30px",
                            fontFamily: "var(--font-adelia)",
                            fontSize: 40,
                        }}
                    >
                        Browse
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
                            textDecoration: "none",
                        }}
                    >
                        Back to home
                    </Link>

                    <div
                        className="w-full rounded-[32px] shadow-sm border p-6 sm:p-8 mt-4 mb-10"
                        style={{
                            background: "#d1e4f0",
                            borderColor: "rgba(0,0,0,0.08)",
                        }}
                    >
                        <div className="mb-8">
                            <PaginationControls safePage={safePage} totalPages={totalPages} />
                        </div>

                        <BrowseCardGrid cards={cards} />

                        <div className="mt-8">
                            <PaginationControls safePage={safePage} totalPages={totalPages} />
                        </div>

                        {cards.length === 0 && (
                            <div className="mt-6 text-sm text-gray-500">
                                No valid image-caption cards found on this page.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}