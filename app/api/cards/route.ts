import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
        console.error("auth.getUser error:", userErr);
    }

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only pull caption candidates that already look usable:
    // - content is not null
    // - content is not empty string
    // - image_id exists
    const { data: captionCandidates, error: captionIdsError } = await supabase
        .from("captions")
        .select("id")
        .not("content", "is", null)
        .neq("content", "")
        .not("image_id", "is", null)
        .limit(5000);

    if (captionIdsError) {
        console.error("Error fetching caption IDs:", captionIdsError);
        return NextResponse.json(
            { error: "Failed to fetch captions" },
            { status: 500 }
        );
    }

    if (!captionCandidates || captionCandidates.length === 0) {
        return NextResponse.json(
            { error: "No valid captions available" },
            { status: 404 }
        );
    }

    const MAX_TRIES = 20;

    for (let i = 0; i < MAX_TRIES; i++) {
        const randomCaptionId =
            captionCandidates[Math.floor(Math.random() * captionCandidates.length)].id;

        // Fetch caption
        const { data: cap, error: capErr } = await supabase
            .from("captions")
            .select("id, content, image_id")
            .eq("id", randomCaptionId)
            .maybeSingle();

        if (capErr) {
            console.error("Error fetching caption:", { randomCaptionId, capErr });
            continue;
        }

        const captionText = (cap?.content ?? "").trim();

        if (!cap || !captionText) {
            console.error("Caption missing/blank content:", { randomCaptionId, cap });
            continue;
        }

        if (!cap.image_id) {
            console.error("Caption missing image_id:", { randomCaptionId, cap });
            continue;
        }

        // Fetch image
        const { data: img, error: imgErr } = await supabase
            .from("images")
            .select("url")
            .eq("id", cap.image_id)
            .maybeSingle();

        if (imgErr) {
            console.error("Error fetching image:", { image_id: cap.image_id, imgErr });
            continue;
        }

        const imageUrl = (img?.url ?? "").trim();

        if (!imageUrl) {
            console.error("Image missing/blank url:", { image_id: cap.image_id, img });
            continue;
        }

        // Success
        return NextResponse.json({
            image_url: imageUrl,
            caption: captionText,
            caption_id: String(cap.id),
        });
    }

    return NextResponse.json(
        { error: "Could not find a valid caption+image card after multiple attempts." },
        { status: 404 }
    );
}