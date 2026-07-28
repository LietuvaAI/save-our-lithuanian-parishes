import { redirect } from "next/navigation";

// The Record is the single public index for every parish and congregation.
// Legacy /registry/[slug] links permanently redirect to the canonical
// /parishes/[slug] profile architecture.
export default function RegistryIndexPage() {
  redirect("/record");
}
