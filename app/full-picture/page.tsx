import { redirect } from "next/navigation";

// /full-picture has merged into /about, which now contains the full
// record breakdown: numbers, buildings, identity, ownership, parish lists,
// and the mission narrative in one place.
export default function FullPicturePage() {
  redirect("/about");
}
