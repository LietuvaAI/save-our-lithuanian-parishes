import Image from "next/image";
import Link from "next/link";

type ProcessionChurch = {
  src: string;
  alt: string;
  href: string;
  label: string;
};

const CHURCHES: ProcessionChurch[] = [
  {
    src: "/images/parishes/shenandoah-st-george-line-drawing.png",
    alt: "Line drawing of St. George Lithuanian church in Shenandoah.",
    href: "/parishes/sv-jurgio-shenandoah-pa",
    label: "St. George, Shenandoah",
  },
  {
    src: "/images/parishes/mount-carmel-holy-cross-line-drawing.png",
    alt: "Line drawing of Holy Cross Lithuanian church in Mount Carmel.",
    href: "/parishes/sv-kryziaus-mount-carmel-pa",
    label: "Holy Cross, Mount Carmel",
  },
  {
    src: "/images/parishes/wilkes-barre-holy-trinity-line-drawing.png",
    alt: "Line drawing of the first Holy Trinity Lithuanian church in Wilkes-Barre.",
    href: "/parishes/svc-trejybes-wilkes-barre-pa",
    label: "Holy Trinity, Wilkes-Barre",
  },
  {
    src: "/images/parishes/pittsburgh-st-casimir-line-drawing.png",
    alt: "Line drawing of St. Casimir Lithuanian church in Pittsburgh.",
    href: "/parishes/sv-kazimiero-pittsburgh-pa",
    label: "St. Casimir, Pittsburgh",
  },
  {
    src: "/images/parishes/chicago-st-george-line-drawing.png",
    alt: "Line drawing of St. George Lithuanian church in Chicago.",
    href: "/parishes/sv-jurgio-chicago-il",
    label: "St. George, Chicago",
  },
  {
    src: "/images/parishes/chicago-holy-cross-line-drawing.png",
    alt: "Line drawing of Holy Cross Lithuanian church in Chicago.",
    href: "/parishes/sv-kryziaus-chicago-il",
    label: "Holy Cross, Chicago",
  },
  {
    src: "/images/parishes/manhattan-our-lady-of-vilnius-line-drawing.png",
    alt: "Line drawing of Our Lady of Vilnius Lithuanian church in Manhattan.",
    href: "/parishes/ausros-vartu-manhattan-ny",
    label: "Our Lady of Vilnius, Manhattan",
  },
  {
    src: "/images/parishes/southfield-divine-providence-line-drawing.png",
    alt: "Line drawing of Divine Providence Lithuanian church in Southfield.",
    href: "/parishes/dievo-apvaizdos-southfield-mi",
    label: "Divine Providence, Southfield",
  },
];

export default function ChurchProcession() {
  return (
    <div
      className="mt-3 border-y border-rule py-1.5"
      aria-label="Lithuanian church line drawings from Shenandoah to Southfield"
    >
      <div className="grid h-16 grid-cols-8 items-end gap-1 sm:h-20 sm:gap-2">
        {CHURCHES.map((church) => (
          <Link
            key={church.href}
            href={church.href}
            title={church.label}
            aria-label={`Open the parish record for ${church.label}`}
            className="group relative h-full min-w-0 overflow-hidden"
          >
            <Image
              src={church.src}
              alt={church.alt}
              fill
              sizes="(max-width: 639px) 12vw, 120px"
              loading="eager"
              className="object-contain contrast-125 mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
      <p className="mt-1 text-left text-[10px] leading-tight text-muted sm:text-[11px]">
        <span className="font-semibold text-foreground">The first parish</span>
        {" · "}
        St. George, Shenandoah
        {" · "}
        1893 church
      </p>
    </div>
  );
}
