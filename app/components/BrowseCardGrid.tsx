"use client";

import { useEffect, useState } from "react";

type Card = {
    id: string;
    imageUrl: string;
    caption: string;
};

export default function BrowseCardGrid({ cards }: { cards: Card[] }) {
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setSelectedCard(null);
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <>
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
                {cards.map((card) => (
                    <button
                        key={card.id}
                        type="button"
                        onClick={() => setSelectedCard(card)}
                        className="flex items-start gap-4 rounded-2xl p-4 min-h-[140px] border transition hover:shadow-md text-left w-full"
                        style={{
                            background: "var(--cards)",
                            borderColor: "rgba(0,0,0,0.05)",
                        }}
                    >
                        <img
                            src={card.imageUrl}
                            alt={card.caption}
                            className="w-28 h-28 object-cover rounded-xl flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0 flex items-center h-full">
                            <div
                                className="leading-snug line-clamp-4"
                                style={{
                                    fontFamily: "var(--font-fors)",
                                    color: "var(--background)",
                                    fontSize: 18,
                                }}
                            >
                                {card.caption}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {selectedCard && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                    onClick={() => setSelectedCard(null)}
                >
                    <div
                        className="w-full max-w-3xl rounded-[28px] p-6 shadow-xl"
                        style={{ background: "var(--cards)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-end mb-4">
                            <button
                                type="button"
                                onClick={() => setSelectedCard(null)}
                                className="rounded-full px-4 py-2 font-bold"
                                style={{
                                    background: "var(--foreground)",
                                    color: "var(--background)",
                                    fontFamily: "var(--font-fors)",
                                }}
                            >
                                Close
                            </button>
                        </div>

                        <img
                            src={selectedCard.imageUrl}
                            alt={selectedCard.caption}
                            className="w-full max-h-[70vh] object-cover rounded-[32px]"
                        />

                        <p
                            className="mt-5 leading-relaxed text-center"
                            style={{
                                fontFamily: "var(--font-fors)",
                                color: "var(--background)",
                                fontSize: 24,
                            }}
                        >
                            {selectedCard.caption}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}