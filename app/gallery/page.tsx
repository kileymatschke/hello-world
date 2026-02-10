import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return <GalleryClient />;
}