import { redirect } from "next/navigation";

// The old statistical overview now lives in The History. About is reserved
// for the project's purpose, people, and principles.
export default function FullPicturePage() {
  redirect("/history");
}
