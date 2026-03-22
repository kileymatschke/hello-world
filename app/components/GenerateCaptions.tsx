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

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [captions, setCaptions] = useState<CaptionItem[]>([]);
    const [status, setStatus] = useState("");

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
        if (!file) return;

        const {
            data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

        if (!token) {
            alert("Not logged in");
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

            setStatus(`Step 4: Generating captions...`);

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

            const flattened = results.flat();

            const cleaned: CaptionItem[] = flattened
                .map((item: any) => ({
                    content: String(item?.content ?? "").trim(),
                }))
                .filter((item) => item.content.length > 0);

            const unique = Array.from(
                new Map(cleaned.map((item) => [item.content, item])).values()
            );

            setCaptions(unique);
            setStatus("");
        } catch (err) {
            console.error(err);
            setStatus("Error occurred");
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
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded bg-[#F9C784] text-[var(--background)] font-semibold shadow-md hover:bg-[#fcdfb6] transition"
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
                    }}
                >
                    {file ? file.name : "NO FILE CHOSEN"}
                </span>
            </div>

            {previewUrl && (
                <div className="mt-4">
                    <img
                        src={previewUrl}
                        alt="Uploaded preview"
                        className="w-full max-h-80 object-contain rounded border"
                    />
                </div>
            )}

            <div className="flex items-center gap-3 mt-4">
                <button
                    onClick={handleGenerate}
                    className="px-4 py-2 rounded bg-[#F9C784] text-[var(--background)] font-semibold shadow-md hover:bg-[#fcdfb6] transition"
                    style={{ fontFamily: "var(--font-adelia)" }}
                >
                    Generate Captions
                </button>

                <button
                    type="button"
                    onClick={handleClearCaptions}
                    className="px-4 py-2 rounded border font-semibold"
                    style={{
                        fontFamily: "var(--font-adelia)",
                        color: "var(--background)",
                    }}
                >
                    Clear
                </button>
            </div>

            <p
                className="mt-2 text-sm"
                style={{
                    fontFamily: "var(--font-fors)",
                    color: "var(--background)",
                }}
            >
                {status}
            </p>

            {/*<p*/}
            {/*    className="mt-3 text-sm"*/}
            {/*    style={{*/}
            {/*        fontFamily: "var(--font-fors)",*/}
            {/*        color: "var(--background)",*/}
            {/*    }}*/}
            {/*>*/}
            {/*    Caption count: {captions.length}*/}
            {/*</p>*/}

            <ul
                className="mt-4 space-y-2"
                style={{
                    fontFamily: "var(--font-fors)",
                    color: "var(--background)",
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