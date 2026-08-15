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
    src: "/images/parishes/boston-st-peter-line-drawing.png",
    alt: "Line drawing of St. Peter Lithuanian church in Boston.",
    href: "/parishes/sv-petro-boston-ma",
    label: "St. Peter, Boston",
  },
  {
    src: "/images/parishes/waterbury-st-joseph-line-drawing.png",
    alt: "Line drawing of St. Joseph Lithuanian church in Waterbury.",
    href: "/parishes/sv-juozapo-waterbury-ct",
    label: "St. Joseph, Waterbury",
  },
  {
    src: "/images/parishes/worcester-st-casimir-line-drawing.png",
    alt: "Line drawing of St. Casimir Lithuanian church in Worcester.",
    href: "/parishes/sv-kazimiero-worcester-ma",
    label: "St. Casimir, Worcester",
  },
  {
    src: "/images/parishes/baltimore-st-alphonsus-line-drawing.png",
    alt: "Line drawing of St. Alphonsus church in Baltimore.",
    href: "/parishes/unnamed-lithuanian-parish-baltimore-md",
    label: "St. Alphonsus, Baltimore",
  },
  {
    src: "/images/parishes/southfield-divine-providence-current-line-drawing.png",
    alt: "Line drawing of Divine Providence Lithuanian church in Southfield.",
    href: "/parishes/dievo-apvaizdos-southfield-mi",
    label: "Divine Providence, Southfield",
  },
];

export default function ChurchProcession() {
  return (
    <div
      className="mt-3"
      aria-label="Lithuanian church line drawings from Shenandoah to Southfield"
    >
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12 sm:gap-2">
        {CHURCHES.map((church) => (
          <Link
            key={church.href}
            href={church.href}
            title={church.label}
            aria-label={`Open the parish record for ${church.label}`}
            className="group relative aspect-square min-w-0 overflow-hidden border border-rule bg-[#faf7f0]"
          >
            <Image
              src={church.src}
              alt={church.alt}
              fill
              sizes="(max-width: 639px) 16vw, 88px"
              loading="eager"
              className="object-contain contrast-125 mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
