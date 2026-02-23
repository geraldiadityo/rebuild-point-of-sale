import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// ─── Logout Route Handler ─────────────────────────────────────────────────────

/**
 * POST /api/auth/logout
 *
 * Clears httpOnly `token` and client-readable `user` cookies.
 * Required because httpOnly cookies cannot be removed client-side.
 */
export async function POST() {
    const cookieStore = await cookies();

    cookieStore.delete("token");
    cookieStore.delete("user");

    return NextResponse.json({ message: "Logged out" });
}
