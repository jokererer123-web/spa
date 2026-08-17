import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/** Routes that require a signed-in staff member. */
export const STAFF_ROUTES = ["/admin", "/reception", "/desk"] as const;

/** Routes only the owner may open. */
export const ADMIN_ROUTES = ["/admin"] as const;

export const LOGIN_PATH = "/giris";

export function isProtectedPath(pathname: string) {
  return STAFF_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export function isAdminPath(pathname: string) {
  return ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/**
 * Refreshes the Supabase auth cookie on every request and gates the staff
 * routes. Without credentials the app is in demo mode, so the gate is skipped
 * and every screen stays explorable.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalidates the token with Supabase; getSession() alone would
  // trust a cookie the browser could have tampered with.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  // Already signed in and staring at the login page → send them to work.
  if (user && pathname === LOGIN_PATH) {
    const role = await readRole(supabase, user.id);
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : "/reception";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!isProtectedPath(pathname)) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const role = await readRole(supabase, user.id);

  // Signed in, but the account was never granted a staff role.
  if (role !== "admin" && role !== "receptionist") {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "?error=yetkisiz";
    return NextResponse.redirect(url);
  }

  // Receptionists are limited to the booking screen.
  if (isAdminPath(pathname) && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/reception";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

type MinimalClient = ReturnType<typeof createServerClient>;

async function readRole(supabase: MinimalClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return (data?.role as string | undefined) ?? null;
}
