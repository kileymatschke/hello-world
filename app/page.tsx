import { createClient } from "@/lib/supabase/server";
import LoginPage from "./LoginPage";
import CardDisplay from "./components/CardDisplay";

export default async function Home() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Not logged in → show login page
    if (!user) {
        return <LoginPage />;
    }

    // Logged in → show gallery
    return <CardDisplay />;
}