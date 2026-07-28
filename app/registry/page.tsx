import { redirect } from "next/navigation";

// The Record is the single public index for every parish and congregation.
// Individual legacy /registry/[slug] profiles remain available while the
// profile templates are unified.
export default function RegistryIndexPage() {
  redirect("/record");
}
