import { getSupabasePublicClient } from "./supabase/public-client";
import { fetchPublicContent } from "./supabase/queries";
import { OFFERS, PACKAGES, SERVICES, THERAPISTS } from "./demo-data";
import type { Offer, Package, Service, Therapist } from "./types";

export interface SiteContent {
  services: Service[];
  packages: Package[];
  offers: Offer[];
  therapists: Therapist[];
}

const FALLBACK: SiteContent = {
  services: SERVICES,
  packages: PACKAGES,
  offers: OFFERS,
  therapists: THERAPISTS,
};

/**
 * Content for the public marketing pages.
 *
 * Reads the live tables so anything the owner edits in /admin appears on the
 * site, and falls back to the bundled demo content when Supabase is not
 * configured — or when it is unreachable, so a database hiccup never takes the
 * public site down.
 *
 * Uses the cookie-free anonymous client on purpose: touching cookies here
 * would make every marketing page dynamic. Pages that call this export
 * `revalidate`, so they stay prerendered and refresh on a timer instead.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return FALLBACK;

  try {
    const content = await fetchPublicContent(supabase);
    return {
      // An empty table means the seed was never run: show the demo content
      // rather than an empty page.
      services: content.services.length ? content.services : FALLBACK.services,
      packages: content.packages.length ? content.packages : FALLBACK.packages,
      offers: content.offers.length ? content.offers : FALLBACK.offers,
      therapists: content.therapists.length ? content.therapists : FALLBACK.therapists,
    };
  } catch {
    return FALLBACK;
  }
}
