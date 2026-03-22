"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Card {
    image_url: string;
    caption: string;
    caption_id: string;
}

function isValidCard(data: unknown): data is Card {
    if (!data || typeof data !== "object") return false;

    const card = data as Record<string, unknown>;

    const imageUrl =
        typeof card.image_url === "string" ? card.image_url.trim() : "";
    const caption =
        typeof card.caption === "string" ? card.caption.trim() : "";
    const captionId =
        typeof card.caption_id === "string" ? card.caption_id.trim() : "";

    return imageUrl.length > 0 && caption.length > 0 && captionId.length > 0;
}

export default function CardDisplay() {
    const router = useRouter();
    const supabase = createClient();

    const [card, setCard] = useState<Card | null>(null);
    const [loadingCard, setLoadingCard] = useState(true);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);

    const didInitialFetch = useRef(false);

    const fetchCard = async () => {
        setLoadingCard(true);
        setError(null);

        try {
            let validCard: Card | null = null;

            for (let attempt = 0; attempt < 5; attempt++) {
                const response = await fetch("/api/cards", { cache: "no-store" });

                if (response.status === 401) {
                    router.push("/login");
                    return;
                }

                if (response.status === 404) {
                    setCard(null);
                    setLoadingCard(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch card: " + response.statusText);
                }

                const data: unknown = await response.json();

                if (isValidCard(data)) {
                    validCard = {
                        image_url: data.image_url.trim(),
                        caption: data.caption.trim(),
                        caption_id: data.caption_id.trim(),
                    };
                    break;
                }
            }

            if (!validCard) {
                setCard(null);
                setError("No valid cards with both an image and a caption were found.");
                return;
            }

            setCard(validCard);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            setCard(null);
        } finally {
            setLoadingCard(false);
        }
    };

    useEffect(() => {
        const getProfile = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) setProfileId(user.id);
            else router.push("/login");
        };

        void getProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.user) setProfileId(session.user.id);
                else {
                    setProfileId(null);
                    router.push("/login");
                }
            }
        );

        return () => authListener?.subscription?.unsubscribe();
    }, [supabase, router]);

    useEffect(() => {
        if (!profileId) return;
        if (didInitialFetch.current) return;

        didInitialFetch.current = true;
        void fetchCard();
    }, [profileId]);

    const voteOnCaption = async (captionId: string, vote_value: 1 | -1) => {
        if (!profileId) {
            setError("Please log in to vote.");
            router.push("/login");
            return;
        }

        setVoting(true);
        setError(null);

        try {
            const { data: existingVote, error: existingVoteErr } = await supabase
                .from("caption_votes")
                .select("caption_id")
                .eq("caption_id", captionId)
                .eq("profile_id", profileId)
                .maybeSingle();

            if (existingVoteErr) throw new Error(existingVoteErr.message);

            if (existingVote) {
                const { error: updateErr } = await supabase
                    .from("caption_votes")
                    .update({
                        vote_value,
                        modified_by_user_id: profileId,
                    })
                    .eq("caption_id", captionId)
                    .eq("profile_id", profileId);

                if (updateErr) throw new Error(updateErr.message);
            } else {
                const { error: insertErr } = await supabase
                    .from("caption_votes")
                    .insert({
                        caption_id: captionId,
                        profile_id: profileId,
                        vote_value,
                        created_by_user_id: profileId,
                        modified_by_user_id: profileId,
                    });

                if (insertErr) throw new Error(insertErr.message);
            }

            await fetchCard();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Voting failed.");
        } finally {
            setVoting(false);
        }
    };

    if (loadingCard) {
        return <div className="text-center p-4 text-[var(--background)]">Loading card...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }

    if (!card) {
        return <div className="text-center p-4">No card to display.</div>;
    }

    return (
        <div className="flex justify-center items-start min-h-[60vh] p-2 sm:p-4">
            <div className="bg-[#f7fcff] shadow-lg rounded-xl p-4 sm:p-5 w-full max-w-xl max-h-[70vh] flex flex-col">

                {/* IMAGE AREA */}
                <div className="flex justify-center items-center h-[45vh]">
                    <img
                        src={card.image_url}
                        alt={card.caption}
                        className="max-h-full max-w-full object-contain rounded-md"
                    />
                </div>

                {/* CAPTION */}
                <p
                    className="mt-2 text-base sm:text-lg text-center font-bold"
                    style={{
                        fontFamily: "var(--font-fors)",
                        color: "var(--background)",
                    }}
                >
                    {card.caption}
                </p>

                {/* BUTTONS */}
                <div className="mt-3 flex justify-center w-full">
                    <button
                        onClick={() => void voteOnCaption(card.caption_id, 1)}
                        disabled={voting}
                        className="px-5 py-2 bg-[#7EB09B] text-white text-2xl font-bold rounded-lg shadow-md hover:bg-[#a9cfbf] mr-6 disabled:opacity-50"
                    >
                        &uarr;
                    </button>

                    <button
                        onClick={() => void voteOnCaption(card.caption_id, -1)}
                        disabled={voting}
                        className="px-5 py-2 bg-[#DE89BE] text-white text-2xl font-bold rounded-lg shadow-md hover:bg-[#E3AACD] ml-6 disabled:opacity-50"
                    >
                        &darr;
                    </button>
                </div>
            </div>
        </div>
    );
}