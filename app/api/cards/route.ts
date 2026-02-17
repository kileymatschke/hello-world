// app/api/cards/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) console.error("auth.getUser error:", userErr);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pull caption candidates (you can raise/lower limit)
    const { data: captionIds, error: captionIdsError } = await supabase
        .from("captions")
        .select("id")
        .limit(5000);

    if (captionIdsError) {
        console.error("Error fetching caption IDs:", captionIdsError);
        return NextResponse.json({ error: "Failed to fetch captions" }, { status: 500 });
    }

    if (!captionIds || captionIds.length === 0) {
        return NextResponse.json({ error: "No captions available" }, { status: 500 });
    }

    // Try multiple random picks so a single "bad" row doesn't kill the endpoint
    const MAX_TRIES = 10;

    for (let i = 0; i < MAX_TRIES; i++) {
        const randomCaptionId = captionIds[Math.floor(Math.random() * captionIds.length)].id;

        // 1) Fetch caption
        const { data: cap, error: capErr } = await supabase
            .from("captions")
            .select("id, content, image_id")
            .eq("id", randomCaptionId)
            .maybeSingle();

        if (capErr) {
            console.error("Error fetching caption:", { randomCaptionId, capErr });
            continue;
        }

        if (!cap?.image_id) {
            console.error("Caption missing image_id:", { randomCaptionId, cap });
            continue;
        }

        // 2) Fetch image
        const { data: img, error: imgErr } = await supabase
            .from("images")
            .select("url")
            .eq("id", cap.image_id)
            .maybeSingle();

        if (imgErr) {
            console.error("Error fetching image:", { image_id: cap.image_id, imgErr });
            continue;
        }

        if (!img?.url) {
            console.error("Image missing url:", { image_id: cap.image_id, img });
            continue;
        }

        // Success ✅
        return NextResponse.json({
            image_url: img.url,
            caption: cap.content ?? "No caption available.",
            caption_id: cap.id,
        });
    }

    // If we get here, every attempt failed
    return NextResponse.json(
        { error: "Could not find a valid caption+image card after multiple attempts." },
        { status: 500 }
    );
}