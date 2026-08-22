import Image from "next/image";
import Link from "next/link";

const CHURCHES = [
  {
    src: "/images/parishes/shenandoah-st-george-line-drawing.png",
    alt: "Line drawing of St. George Lithuanian church in Shenandoah.",
    href: "/parishes/sv-jurgio-shenandoah-pa",
    label: "Shenandoah",
  },
  {
    src: "/images/parishes/mount-carmel-holy-cross-line-drawing.png",
    alt: "Line drawing of Holy Cross Lithuanian church in Mount Carmel.",
    href: "/parishes/sv-kryziaus-mount-carmel-pa",
    label: "Mount Carmel",
  },
  {
    src: "/images/parishes/wilkes-barre-holy-trinity-line-drawing.png",
    alt: "Line drawing of Holy Trinity Lithuanian church in Wilkes-Barre.",
    href: "/parishes/svc-trejybes-wilkes-barre-pa",
    label: "Wilkes-Barre",
  },
  {
    src: "/images/parishes/pittsburgh-st-casimir-line-drawing.png",
    alt: "Line drawing of St. Casimir Lithuanian church in Pittsburgh.",
    href: "/parishes/sv-kazimiero-pittsburgh-pa",
    label: "Pittsburgh",
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
    label: "Manhattan",
  },
  {
    src: "/images/parishes/boston-st-peter-line-drawing.png",
    alt: "Line drawing of St. Peter Lithuanian church in Boston.",
    href: "/parishes/sv-petro-boston-ma",
    label: "Boston",
  },
  {
    src: "/images/parishes/waterbury-st-joseph-line-drawing.png",
    alt: "Line drawing of St. Joseph Lithuanian church in Waterbury.",
    href: "/parishes/sv-juozapo-waterbury-ct",
    label: "Waterbury",
  },
  {
    src: "/images/parishes/southfield-divine-providence-current-line-drawing.png",
    alt: "Line drawing of Divine Providence Lithuanian church in Southfield.",
    href: "/parishes/dievo-apvaizdos-southfield-mi",
    label: "Southfield",
  },
] as const;

export default function AboutChurchStrip() {
  return (
    <div className="mt-9 grid grid-cols-5 gap-x-2 gap-y-5 sm:grid-cols-10 sm:gap-x-3" aria-label="Ten parish church records across the Lithuanian parish network">
      {CHURCHES.map((church, index) => (
        <Link
          key={`${church.href}-${index}`}
          href={church.href}
          className="group min-w-0 text-center"
        >
          <span className="relative block aspect-square overflow-hidden border border-[#e4dfd6] bg-[#faf7f1]">
            <Image
              src={church.src}
              alt={church.alt}
              fill
              sizes="(max-width: 639px) 19vw, 110px"
              priority
              className="object-contain contrast-125 mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
            />
          </span>
          <span className="mt-1.5 block font-serif text-small-copy leading-tight text-[#1c1917] underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-current">
            {church.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
