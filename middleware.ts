import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Session refreshen — NICHT entfernen!
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Nicht-eingeloggte User auf /login redirecten
  // Ausnahmen: /login und /auth/callback
  if (
    !user &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth/callback")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Eingeloggte User von /login wegschicken
  if (user && pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Approval-Check für eingeloggte User auf geschützten Routen
  if (user) {
    const unprotected = ["/login", "/auth/callback", "/onboarding", "/waiting"];
    const isUnprotected = unprotected.some((p) => pathname.startsWith(p));

    if (!isUnprotected) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("approved")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // Noch kein Profil → Onboarding
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      if (!profile.approved) {
        // Profil vorhanden, aber nicht freigeschaltet
        const url = request.nextUrl.clone();
        url.pathname = "/waiting";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Alle Routen außer statische Assets und API-Routen
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
