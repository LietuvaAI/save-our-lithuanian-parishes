import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 2026-07-16 IA restructure: The Record absorbed the old Data page;
      // the Network page became About.
      { source: "/data", destination: "/record", permanent: true },
      { source: "/network", destination: "/about", permanent: true },
      { source: "/now", destination: "/under-threat", permanent: true },
      // The unreviewed Draugas ledger pages were retired on 2026-08-07.
      // Preserve inbound links by returning visitors to the canonical profile.
      {
        source: "/parishes/:slug/draugas",
        destination: "/parishes/:slug",
        permanent: true,
      },
      // Registry Revision 1 same-entity adjudications.
      {
        source: "/parishes/sv-kazimiero-waterbury-ct",
        destination: "/parishes/sv-juozapo-waterbury-ct",
        permanent: true,
      },
      {
        source: "/registry/holyname-baltimore-md",
        destination: "/registry/st-alphonsus-baltimore-md",
        permanent: true,
      },
      {
        source: "/registry/st-casimir-chicago-heights-il",
        destination: "/registry/casimir-chicago-il",
        permanent: true,
      },
      {
        source: "/registry/our-lady-of-sorrows-kearny-nj",
        destination: "/registry/parish-kearny-nj",
        permanent: true,
      },
      {
        source: "/registry/sorrows-kearny-nj",
        destination: "/registry/parish-kearny-nj",
        permanent: true,
      },
      {
        source: "/registry/mary-kearny-nj",
        destination: "/registry/parish-kearny-nj",
        permanent: true,
      },
      {
        source: "/registry/lithuanian-church-harrison-nj",
        destination: "/registry/parish-kearny-nj",
        permanent: true,
      },
      {
        source: "/registry/holyname-haverhill-ma",
        destination: "/registry/george-haverhill-ma",
        permanent: true,
      },
      {
        source: "/registry/michael-north-chicago-il",
        destination: "/registry/michael-chicago-north-side-il",
        permanent: true,
      },
      {
        source: "/registry/parish-freeland-pa",
        destination: "/registry/casimir-freeland-pa",
        permanent: true,
      },
      {
        source: "/registry/parish-westville-il",
        destination: "/registry/holy-cross-westville-il",
        permanent: true,
      },
      {
        source: "/registry/parish-westville-il-2",
        destination: "/registry/ss-peter-and-paul-westville-il",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
