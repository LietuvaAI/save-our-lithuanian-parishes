import { notFound, permanentRedirect } from "next/navigation";
import {
  getCanonicalParishProfileByRegistrySlug,
  legacyRegistryProfileSlugs,
} from "@/lib/parish-profile";

export function generateStaticParams() {
  return legacyRegistryProfileSlugs.map((slug) => ({ slug }));
}

export default async function LegacyRegistryProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getCanonicalParishProfileByRegistrySlug(slug);
  if (!profile) notFound();
  permanentRedirect(profile.href);
}
