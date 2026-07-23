import { redirect } from "next/navigation";

// Parish Profiles has merged into The Record (/record), which shows all
// documented parishes with depth indicators and links to individual profiles.
export default function ParishProfilesPage() {
  redirect("/record");
}
