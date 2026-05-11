import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ['/calendar']
export default function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

    const sessionCookie = getSessionCookie(request)

    if (isProtectedRoute && !sessionCookie) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}