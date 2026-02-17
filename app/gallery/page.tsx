import { createClient } from "@/lib/supabase/server";
import LoginPage from "../LoginPage";
import CardDisplay from "../components/CardDisplay";
import SignOutButton from "../components/SignOutButton"; // Import the new component

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <LoginPage />;

    return (
      <div className="relative flex flex-col items-center min-h-screenp-4"> {/* Added relative positioning */}
            <div className="absolute top-4 right-4"> {/* Positioned top-right */}
                <SignOutButton />
            </div>
            <h1 className="text-4xl font-bold mb-8 mt-4">The Humor Project</h1>
            <CardDisplay />
        </div>
    );
}
