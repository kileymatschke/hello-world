"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GenerateCaptions() {
    const supabase = createClient();

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [captions, setCaptions] = useState<any[]>([]);
    const [status, setStatus] = useState("");

    // Create a local preview URL whenever the user picks a file
    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Cleanup to avoid memory leaks
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

            const { presignedUrl, cdnUrl } = await presignRes.json();

            setStatus("Step 2: Uploading image...");

            await fetch(presignedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

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

            const { imageId } = await registerRes.json();

            setStatus("Step 4: Generating captions...");

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

            const data = await captionsRes.json();
            setCaptions(data);
            setStatus("Done!");
        } catch (err) {
            console.error(err);
            setStatus("Error occurred");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {/* Preview of the user's uploaded image */}
            {previewUrl && (
                <div className="mt-4">
                    <img
                        src={previewUrl}
                        alt="Uploaded preview"
                        className="w-full max-h-80 object-contain rounded border"
                    />
                </div>
            )}

            <button
                onClick={handleGenerate}
                className="mt-4 px-4 py-2 bg-(--background) text-white rounded"
            >
                Generate Captions
            </button>

            <p className="mt-2 text-sm">{status}</p>

            <ul className="mt-4 space-y-2">
                {captions.map((c: any, i) => (
                    <li key={i} className="border p-2 rounded">
                        {c.caption || c.content || JSON.stringify(c)}
                    </li>
                ))}
            </ul>
        </div>
    );
}