"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // Import Supabase client

interface Card {
    image_url: string;
    caption: string;
    caption_id: string; // or number — see note below
}


export default function CardDisplay() {
    const [card, setCard] = useState<Card | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient(); // Initialize Supabase client-side

    // Fetch user once when component mounts or on sign-in status change
    const [profileId, setProfileId] = useState<string | null>(null);

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setProfileId(user.id);
            } else {
                router.push("/login"); // Redirect if no user
            }
        };
        void getProfile();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setProfileId(session.user.id);
            } else {
                setProfileId(null);
                router.push("/login");
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, [supabase, router]);

    const fetchCard = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/cards");
            if (response.status === 401) {
                router.push("/login"); // Redirect to login page
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to fetch card: " + response.statusText);
            }
            const data: Card = await response.json();
            setCard(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            console.error("Error fetching card:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (vote_value: 1 | -1) => {
        if (!card || !profileId) {
            console.error("Cannot vote: card or profile ID is missing. Card:", card, "Profile ID:", profileId);
            setError("Unable to cast vote. Please ensure you are logged in and a card is displayed.");
            return;
        }

        setLoading(true); // Show loading state while voting
        setError(null);
                    try {
                        // Temporary logs to verify values before insert
                        console.log("Attempting to insert vote with:", {
                            caption_id: card.caption_id,
                            profile_id: profileId,
                            vote_value: vote_value,
                        });

                        const { error: insertError } = await supabase
                            .from("caption_votes")
                            .insert({
                                caption_id: card.caption_id,
                                profile_id: profileId,
                                vote_value,
                                created_datetime_utc: new Date().toISOString(),
                            });


                        // if (insertError) {
                        //     console.log("RAW insertError:", insertError);
                        //     console.log("insertError JSON:", JSON.stringify(insertError, null, 2));
                        //     alert(insertError.message); // temporary, so you see it even if console hides it
                        //     return;
                        // }

                        if (insertError) {
                            console.log("RAW insertError:", insertError);
                            console.log("insertError JSON:", JSON.stringify(insertError, null, 2));
                            setError(insertError.message);
                            setLoading(false);
                            return;
                        }




                        console.log("Vote successfully recorded."); // Confirm success
        
                        // After voting, fetch the next card
                        await fetchCard();
                    } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during voting.");
            console.error("Error voting:", err);
            setLoading(false); // End loading on error
        }
    };


    useEffect(() => {
        void fetchCard();
    }, []); // Removed dependency on supabase and router to avoid infinite loop or unnecessary re-fetches

    if (loading) {
        return <div className="text-center p-4">Loading card...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }

    if (!card) {
        return <div className="text-center p-4">No card to display.</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
                <img
                    src={card.image_url}
                    alt={card.caption}
                    className="w-full h-auto object-cover rounded-md mb-4"
                />
                <p className="text-gray-800 text-lg text-center">{card.caption}</p>
                <div className="mt-6 flex justify-center w-full">
                    <button
                        onClick={() => handleVote(1)}
                        className="px-6 py-3 bg-green-500 text-white text-3xl font-bold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 mr-8"
                    >
                        &uarr;
                    </button>
                    <button
                        onClick={() => handleVote(-1)}
                        className="px-6 py-3 bg-red-500 text-white text-3xl font-bold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ml-8"
                    >
                        &darr;
                    </button>
                </div>
            </div>
        </div>
    );
}
