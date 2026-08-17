import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/guard";

/**
 * Next 16 renamed the middleware convention to `proxy`. This runs before every
 * page request: it refreshes the Supabase auth cookie and gates /admin,
 * /reception and /desk behind a signed-in staff account.
 */
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files. The auth cookie has to
     * be refreshed on normal page requests, not on every hero frame.
     */
    "/((?!_next/static|_next/image|favicon.ico|hero/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
