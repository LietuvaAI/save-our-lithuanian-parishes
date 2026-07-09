import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { marked } from "marked";

export const metadata: Metadata = {
  title: "Who Does the Parish Belong To?",
  description:
    "Eighty-three parishes. Fifty-five closings. Eighteen years of the Draugas archive show that one thing decides a parish's fate: whose hands hold the deed.",
  openGraph: {
    images: ["/hero-divine-providence.jpg"],
  },
};

export default function ArticlePage() {
  const markdown = readFileSync(
    join(process.cwd(), "content", "who-does-the-parish-belong-to.md"),
    "utf-8"
  );
  const html = marked.parse(markdown, { async: false });

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Image
        src="/hero-divine-providence.jpg"
        alt="Divine Providence Lithuanian parish church"
        width={1600}
        height={1067}
        priority
        className="rounded-lg mb-10"
      />
      <div
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-h1:text-4xl prose-h1:leading-tight"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
