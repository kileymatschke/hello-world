import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CardDisplay from "./components/CardDisplay";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return <CardDisplay />;
}