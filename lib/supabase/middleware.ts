import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if this is an auth callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    // Redirect to appropriate dashboard after successful auth
    const userType = requestUrl.searchParams.get("type") || "paciente"
    return NextResponse.redirect(new URL(`/dashboard/${userType}`, request.url))
  }

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Protected routes - redirect to login if not authenticated
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/cadastro") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/admin"

  if (!isAuthRoute && request.nextUrl.pathname.startsWith("/dashboard")) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const redirectUrl = new URL("/", request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}
