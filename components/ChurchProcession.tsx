import Image from "next/image";
import Link from "next/link";

type ProcessionChurch = {
  src: string;
  alt: string;
  href: string;
  label: string;
  height: string;
  mobile?: string;
  currentCampaign?: boolean;
};

const CHURCHES: ProcessionChurch[] = [
  {
    src: "/images/parishes/shenandoah-st-george-line-drawing.png",
    alt: "Line drawing of St. George Lithuanian church in Shenandoah.",
    href: "/parishes/sv-jurgio-shenandoah-pa",
    label: "St. George, Shenandoah",
    height: "h-full",
  },
  {
    src: "/images/parishes/mount-carmel-holy-cross-line-drawing.png",
    alt: "Line drawing of Holy Cross Lithuanian church in Mount Carmel.",
    href: "/parishes/sv-kryziaus-mount-carmel-pa",
    label: "Holy Cross, Mount Carmel",
    height: "h-[82%]",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/wilkes-barre-holy-trinity-line-drawing.png",
    alt: "Line drawing of the first Holy Trinity Lithuanian church in Wilkes-Barre.",
    href: "/parishes/svc-trejybes-wilkes-barre-pa",
    label: "Holy Trinity, Wilkes-Barre",
    height: "h-[84%]",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/pittsburgh-st-casimir-line-drawing.png",
    alt: "Line drawing of St. Casimir Lithuanian church in Pittsburgh.",
    href: "/parishes/sv-kazimiero-pittsburgh-pa",
    label: "St. Casimir, Pittsburgh",
    height: "h-[92%]",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/chicago-st-george-line-drawing.png",
    alt: "Line drawing of St. George Lithuanian church in Chicago.",
    href: "/parishes/sv-jurgio-chicago-il",
    label: "St. George, Chicago",
    height: "h-full",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/chicago-holy-cross-line-drawing.png",
    alt: "Line drawing of Holy Cross Lithuanian church in Chicago.",
    href: "/parishes/sv-kryziaus-chicago-il",
    label: "Holy Cross, Chicago",
    height: "h-[94%]",
  },
  {
    src: "/images/parishes/lawrence-sacred-heart-line-drawing.png",
    alt: "Line drawing of Sacred Heart Lithuanian National Catholic church in Lawrence.",
    href: "/parishes/saldziausios-jezaus-sirdies-lawrence-ma",
    label: "Sacred Heart, Lawrence",
    height: "h-[74%]",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/manhattan-our-lady-of-vilnius-line-drawing.png",
    alt: "Line drawing of Our Lady of Vilnius Lithuanian church in Manhattan.",
    href: "/parishes/ausros-vartu-manhattan-ny",
    label: "Our Lady of Vilnius, Manhattan",
    height: "h-[90%]",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/hartford-holy-trinity-line-drawing.png",
    alt: "Line drawing of Holy Trinity Lithuanian church in Hartford.",
    href: "/parishes/svc-trejybes-hartford-ct",
    label: "Holy Trinity, Hartford — active campaign",
    height: "h-[88%]",
    currentCampaign: true,
  },
  {
    src: "/images/parishes/waterbury-st-joseph-line-drawing.png",
    alt: "Line drawing of St. Joseph Lithuanian church in Waterbury.",
    href: "/parishes/sv-juozapo-waterbury-ct",
    label: "St. Joseph, Waterbury — active campaign",
    height: "h-[82%]",
    currentCampaign: true,
  },
  {
    src: "/images/parishes/maspeth-transfiguration-line-drawing.png",
    alt: "Line drawing of Transfiguration Lithuanian church in Maspeth.",
    href: "/parishes/kristaus-atsimainymo-maspeth-ny",
    label: "Transfiguration, Maspeth — active campaign",
    height: "h-[76%]",
    currentCampaign: true,
  },
  {
    src: "/images/parishes/southfield-divine-providence-line-drawing.png",
    alt: "Line drawing of Divine Providence Lithuanian church in Southfield.",
    href: "/parishes/dievo-apvaizdos-southfield-mi",
    label: "Divine Providence, Southfield — active campaign",
    height: "h-full",
    currentCampaign: true,
  },
];

export default function ChurchProcession() {
  return (
    <div
      className="mt-4 border-y border-rule py-2"
      aria-label="From the first Lithuanian parish to four communities organizing today"
    >
      <div className="relative flex h-20 items-end justify-between gap-0.5 overflow-hidden sm:h-24">
        <span
          className="absolute inset-x-0 bottom-0 border-t border-rule"
          aria-hidden
        />
        {CHURCHES.map((church) => (
          <Link
            key={church.href}
            href={church.href}
            title={church.label}
            aria-label={`Open the parish record for ${church.label}`}
            className={`${church.mobile ?? ""} ${church.height} group relative min-w-0 flex-1 overflow-hidden ${
              church.currentCampaign
                ? "border-b-2 border-[color:var(--mark-closed)]"
                : ""
            }`}
          >
            <Image
              src={church.src}
              alt={church.alt}
              fill
              sizes="(max-width: 640px) 16vw, 8vw"
              loading="eager"
              className={`object-contain object-bottom grayscale contrast-125 mix-blend-multiply transition-opacity group-hover:opacity-100 ${
                church.currentCampaign ? "opacity-90" : "opacity-65"
              }`}
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 78%, transparent 100%)",
              }}
            />
          </Link>
        ))}
      </div>
      <div className="mt-1.5 flex items-start justify-between gap-6 text-[10px] leading-snug text-muted sm:text-xs">
        <p className="max-w-[45%] text-left">
          <span className="font-medium text-foreground">The first parish</span>
          <br />
          St. George, Shenandoah &middot; 1893 church
        </p>
        <p className="max-w-[45%] text-right">
          <span className="font-medium text-foreground">
            Happening now
          </span>
          <br />
          Hartford &middot; Waterbury &middot; Maspeth &middot; Southfield
        </p>
      </div>
    </div>
  );
}
