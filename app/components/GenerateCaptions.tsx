"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const LS_CAPTIONS_KEY = "generate_captions_captions";
const LS_STATUS_KEY = "generate_captions_status";
const NUM_CAPTIONS = 5;

type CaptionItem = {
    content: string;
};

export default function GenerateCaptions() {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const latestRequestIdRef = useRef(0);

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [captions, setCaptions] = useState<CaptionItem[]>([]);
    const [status, setStatus] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const messageStyle = {
        fontFamily: "var(--font-fors)",
        fontSize: 18,
        color: "var(--background)",
        opacity: 0.75,
    } as const;

    useEffect(() => {
        try {
            const savedCaptions = localStorage.getItem(LS_CAPTIONS_KEY);
            if (savedCaptions) setCaptions(JSON.parse(savedCaptions));

            const savedStatus = localStorage.getItem(LS_STATUS_KEY);
            if (savedStatus) setStatus(savedStatus);
        } catch {
            // ignore bad localStorage data
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LS_CAPTIONS_KEY, JSON.stringify(captions));
        } catch {
            // ignore storage errors
        }
    }, [captions]);

    useEffect(() => {
        try {
            localStorage.setItem(LS_STATUS_KEY, status);
        } catch {
            // ignore storage errors
        }
    }, [status]);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleGenerate = async () => {
        if (!file || isGenerating) return;

        const requestId = ++latestRequestIdRef.current;
        setIsGenerating(true);

        const {
            data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

        if (!token) {
            alert("Not logged in");
            setIsGenerating(false);
            return;
        }

        try {
            setStatus("Step 1: Getting upload URL...");

            const presignRes = await fetch(
                "https://api.almostcrackd.ai/pipeline/generate-presigned-url",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ contentType: file.type }),
                }
            );

            if (!presignRes.ok) {
                throw new Error("Failed to get upload URL");
            }

            const { presignedUrl, cdnUrl } = await presignRes.json();

            setStatus("Step 2: Uploading image...");

            const uploadRes = await fetch(presignedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!uploadRes.ok) {
                throw new Error("Failed to upload image");
            }

            setStatus("Step 3: Registering image...");

            const registerRes = await fetch(
                "https://api.almostcrackd.ai/pipeline/upload-image-from-url",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
                }
            );

            if (!registerRes.ok) {
                throw new Error("Failed to register image");
            }

            const { imageId } = await registerRes.json();

            setStatus("Step 4: Generating captions... this may take several moments");

            const results = await Promise.all(
                Array.from({ length: NUM_CAPTIONS }, async () => {
                    const captionsRes = await fetch(
                        "https://api.almostcrackd.ai/pipeline/generate-captions",
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ imageId }),
                        }
                    );

                    if (!captionsRes.ok) {
                        throw new Error("Failed to generate captions");
                    }

                    return captionsRes.json();
                })
            );

            if (requestId !== latestRequestIdRef.current) return;

            const flattened = results.flat();

            const cleaned: CaptionItem[] = flattened
                .map((item: any) => ({
                    content: String(item?.content ?? "").trim(),
                }))
                .filter((item) => item.content.length > 0);

            const unique = Array.from(
                new Map(cleaned.map((item) => [item.content, item])).values()
            );

            setCaptions(unique.slice(0, 10));
            setStatus("");
        } catch (err) {
            console.error(err);
            if (requestId === latestRequestIdRef.current) {
                setStatus("Error occurred");
            }
        } finally {
            if (requestId === latestRequestIdRef.current) {
                setIsGenerating(false);
            }
        }
    };

    const handleClearCaptions = () => {
        setCaptions([]);
        setStatus("");
        try {
            localStorage.removeItem(LS_CAPTIONS_KEY);
            localStorage.removeItem(LS_STATUS_KEY);
        } catch {
            // ignore storage errors
        }
    };

    return (
        <div className="bg-(--cards) p-6 rounded-2xl shadow-md w-full max-w-2xl">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <p
                className="mt-2 text-sm text-center"
                style={{
                    fontFamily: "var(--font-fors)",
                    fontSize: 18,
                    color: "var(--background)",
                    fontWeight: 600,
                }}
            >
                Upload an image to generate corresponding captions. <br />
                These captions are part of a larger study in AI humor to understand
                how different wording affects how people interpret and respond to images.
            </p>

            <p
                className="mt-12 text-sm"
                style={{
                    fontFamily: "var(--font-fors)",
                    fontSize: 20,
                    color: "var(--background)",
                    fontWeight: 700,
                }}
            >
                STEP 1
            </p>

            <div className="mt-2 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#F9C784] text-[var(--background)] font-semibold shadow-md hover:bg-[#fcdfb6] transition"
                    style={{ fontFamily: "var(--font-adelia)" }}
                >
                    Choose image
                </button>

                <span
                    className="text-lg truncate max-w-[220px]"
                    style={{
                        fontFamily: "var(--font-coolvetica)",
                        color: "var(--background)",
                        fontSize: 24,
                        opacity: 0.7,
                    }}
                >
                    {file ? file.name : "NO FILE CHOSEN"}
                </span>
            </div>

            <p className="mt-2 text-sm" style={messageStyle}>
                Accepted file types: jpg, png, gif, webp, bmp, svg, tiff
            </p>

            {previewUrl && (
                <div className="mt-4">
                    <img
                        src={previewUrl}
                        alt="Uploaded preview"
                        className="w-full max-h-80 object-contain rounded"
                    />
                </div>
            )}

            <p
                className="mt-12 text-sm"
                style={{
                    fontFamily: "var(--font-fors)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--background)",
                }}
            >
                STEP 2
            </p>

            <div className="flex items-center gap-3 mt-2">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-xl bg-[#F9C784] text-[var(--background)] font-semibold shadow-md hover:bg-[#fcdfb6] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "var(--font-adelia)" }}
                >
                    {isGenerating ? "Generating..." : "Generate Captions"}
                </button>

                <button
                    type="button"
                    onClick={handleClearCaptions}
                    className="px-4 py-2 rounded-xl border font-semibold"
                    style={{
                        fontFamily: "var(--font-adelia)",
                        color: "var(--background)",
                    }}
                >
                    Clear
                </button>
            </div>

            <p className="mt-2 text-sm" style={messageStyle}>
                {status}
            </p>

            <ul
                className="mt-4 space-y-2"
                style={{
                    fontFamily: "var(--font-fors)",
                    color: "var(--background)",
                    fontSize: 18
                }}
            >
                {captions.map((c, i) => (
                    <li key={i} className="border p-2 rounded">
                        {c.content}
                    </li>
                ))}
            </ul>
        </div>
    );
}