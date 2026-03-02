"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Card {
    image_url: string;
    caption: string;
    caption_id: string;
}

export default function CardDisplay() {
    const router = useRouter();
    const supabase = createClient();

    const [card, setCard] = useState<Card | null>(null);
    const [loadingCard, setLoadingCard] = useState(true);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);

    // ✅ prevents double-fetch on initial render (dev Strict Mode)
    const didInitialFetch = useRef(false);

    const fetchCard = async () => {
        setLoadingCard(true);
        setError(null);
        try {
            const response = await fetch("/api/cards", { cache: "no-store" });
            if (response.status === 401) {
                router.push("/login");
                return;
            }
            if (!response.ok) throw new Error("Failed to fetch card: " + response.statusText);

            const data: Card = await response.json();
            setCard(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoadingCard(false);
        }
    };

    // 1) Get user + subscribe to auth changes
    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setProfileId(user.id);
            else router.push("/login");
        };
        void getProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) setProfileId(session.user.id);
            else {
                setProfileId(null);
                router.push("/login");
            }
        });

        return () => authListener?.subscription?.unsubscribe();
    }, [supabase, router]);

    // 2) ✅ Fetch the first card only AFTER we have a profileId, and only once
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
            const nowIso = new Date().toISOString();
            const { error: voteErr } = await supabase
                .from("caption_votes")
                .upsert(
                    {
                        caption_id: captionId,
                        profile_id: profileId,
                        vote_value,
                        created_datetime_utc: nowIso,
                        modified_datetime_utc: nowIso,
                    },
                    { onConflict: "caption_id,profile_id" }
                );

            if (voteErr) throw new Error(voteErr.message);

            // next card
            await fetchCard();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Voting failed.");
        } finally {
            setVoting(false);
        }
    };

    if (loadingCard) return <div className="text-center p-4">Loading card...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    if (!card) return <div className="text-center p-4">No card to display.</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-[#FFFFFF] shadow-lg rounded-lg p-6 max-w-md w-full">
                <img
                    src={card.image_url}
                    alt={card.caption}
                    className="w-full h-auto object-cover rounded-md mb-4"
                />
                <p
                    className="text-2xl text-center font-bold"
                    style={{ fontFamily: "var(--font-fors)", color: "var(--background)" }}
                >
                    {card.caption}
                </p>

                <div className="mt-6 flex justify-center w-full">
                    <button
                        onClick={() => void voteOnCaption(card.caption_id, 1)}
                        disabled={voting}
                        className="px-6 py-3 bg-[#7EB09B] text-white text-3xl font-bold rounded-lg shadow-md hover:bg-[#a9cfbf] mr-8 disabled:opacity-50"
                    >
                        &uarr;
                    </button>
                    <button
                        onClick={() => void voteOnCaption(card.caption_id, -1)}
                        disabled={voting}
                        className="px-6 py-3 bg-[#DE89BE] text-white text-3xl font-bold rounded-lg shadow-md hover:bg-[#E3AACD] ml-8 disabled:opacity-50"
                    >
                        &darr;
                    </button>
                </div>
            </div>
        </div>
    );
}