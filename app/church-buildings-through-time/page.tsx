import { permanentRedirect } from "next/navigation";

export default function ChurchBuildingHistoryPage() {
  permanentRedirect("/where-every-parish-ended-up?view=buildings");
}
