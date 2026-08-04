import { permanentRedirect } from "next/navigation";

// The research registry is not a second public directory. Keep its legacy URL
// working while sending readers to the canonical profile directory.
export default function RegistryIndexPage() {
  permanentRedirect("/parishes");
}
