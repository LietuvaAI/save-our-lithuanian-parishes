import { permanentRedirect } from "next/navigation";

// The former Record table is now the clearly named profile directory. Keep the
// old route working for citations, bookmarks, and external links.
export default function RecordPage() {
  permanentRedirect("/parishes");
}
