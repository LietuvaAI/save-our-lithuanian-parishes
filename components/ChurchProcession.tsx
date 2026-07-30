import Image from "next/image";
import Link from "next/link";

type ProcessionChurch = {
  src: string;
  alt: string;
  href: string;
  label: string;
  height: string;
  mobile?: string;
};

const CHURCHES: ProcessionChurch[] = [
  {
    src: "/images/parishes/shenandoah-st-george-1899.jpg",
    alt: "St. George Lithuanian church in Shenandoah.",
    href: "/parishes/sv-jurgio-shenandoah-pa",
    label: "St. George, Shenandoah",
    height: "h-[96%]",
  },
  {
    src: "/images/parishes/mount-carmel-holy-cross-1899.jpg",
    alt: "Holy Cross Lithuanian church in Mount Carmel.",
    href: "/parishes/sv-kryziaus-mount-carmel-pa",
    label: "Holy Cross, Mount Carmel",
    height: "h-[76%]",
  },
  {
    src: "/images/parishes/wilkes-barre-holy-trinity-1899.jpg",
    alt: "Holy Trinity Lithuanian church in Wilkes-Barre.",
    href: "/parishes/svc-trejybes-wilkes-barre-pa",
    label: "Holy Trinity, Wilkes-Barre",
    height: "h-[84%]",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/pittsburgh-st-casimir.jpg",
    alt: "St. Casimir Lithuanian church in Pittsburgh.",
    href: "/parishes/sv-kazimiero-pittsburgh-pa",
    label: "St. Casimir, Pittsburgh",
    height: "h-[78%]",
  },
  {
    src: "/images/parishes/chicago-st-george-1913.jpg",
    alt: "St. George Lithuanian church in Chicago.",
    href: "/parishes/sv-jurgio-chicago-il",
    label: "St. George, Chicago",
    height: "h-[92%]",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/chicago-holy-cross-1914.jpg",
    alt: "Holy Cross Lithuanian church in Chicago.",
    href: "/parishes/sv-kryziaus-chicago-il",
    label: "Holy Cross, Chicago",
    height: "h-[88%]",
  },
  {
    src: "/images/parishes/lawrence-st-francis-1958.jpg",
    alt: "St. Francis Lithuanian church in Lawrence.",
    href: "/parishes/sv-pranciskaus-lawrence-ma",
    label: "St. Francis, Lawrence",
    height: "h-[72%]",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/lawrence-sacred-heart-stereograph.jpg",
    alt: "Sacred Heart Lithuanian National Catholic church in Lawrence.",
    href: "/parishes/saldziausios-jezaus-sirdies-lawrence-ma",
    label: "Sacred Heart, Lawrence",
    height: "h-[68%]",
  },
  {
    src: "/images/parishes/manhattan-our-lady-of-vilnius-2011.jpg",
    alt: "Our Lady of Vilnius Lithuanian church in Manhattan.",
    href: "/parishes/ausros-vartu-manhattan-ny",
    label: "Our Lady of Vilnius, Manhattan",
    height: "h-[82%]",
    mobile: "hidden sm:block",
  },
  {
    src: "/images/parishes/southfield-divine-providence-line-drawing.png",
    alt: "Line drawing of Divine Providence Lithuanian church in Southfield.",
    href: "/parishes/dievo-apvaizdos-southfield-mi",
    label: "Divine Providence, Southfield",
    height: "h-full",
  },
];

export default function ChurchProcession() {
  return (
    <div
      className="mt-4 border-y border-rule py-2"
      aria-label="From the first Lithuanian parish to Divine Providence today"
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
            className={`${church.mobile ?? ""} ${church.height} group relative min-w-0 flex-1 overflow-hidden`}
          >
            <Image
              src={church.src}
              alt={church.alt}
              fill
              sizes="(max-width: 640px) 16vw, 9vw"
              className="object-cover object-top grayscale contrast-125 mix-blend-multiply opacity-70 transition-opacity group-hover:opacity-100"
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 72%, transparent 100%)",
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
            A parish alive today
          </span>
          <br />
          Divine Providence, Southfield &middot; dedicated 1973
        </p>
      </div>
    </div>
  );
}
