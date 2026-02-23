import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Route Protection Middleware ──────────────────────────────────────────────

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("token")?.value;

    const isPublicPath = PUBLIC_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    // ── Unauthenticated user accessing a protected route ──────────────
    if (!token && !isPublicPath) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Authenticated user accessing the login page ───────────────────
    if (token && isPublicPath) {
        const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
        const destination = new URL(callbackUrl || "/", request.url);
        return NextResponse.redirect(destination);
    }

    return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image  (image optimization)
         * - favicon.ico  (favicon)
         * - public assets (svg, png, jpg, etc.)
         * - API routes    (handled separately)
         */
        "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
    ],
};
