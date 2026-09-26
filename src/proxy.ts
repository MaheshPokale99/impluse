import { NextResponse, type NextRequest } from "next/server";
import { renewSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));

    const response = NextResponse.next();
    const renewed = await renewSessionToken(token);
    if (renewed) response.cookies.set(SESSION_COOKIE, renewed, sessionCookieOptions);
    return response;
}

export const config = { matcher: ["/dashboard/:path*"] };
