import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
    // Create a response we can attach cookies to
    const response = NextResponse.redirect(new URL("/login", request.url));

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    // read cookies from the incoming request
                    return request.headers.get("cookie")
                        ? request.headers
                            .get("cookie")!
                            .split(";")
                            .map((c) => {
                                const [name, ...rest] = c.trim().split("=");
                                return { name, value: rest.join("=") };
                            })
                        : [];
                },
                setAll(cookiesToSet) {
                    // write cookies onto the outgoing response (this is the key)
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    await supabase.auth.signOut();
    return response;
}