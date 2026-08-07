import type { ReactNode } from "react";

/**
 * The one section pattern: 158px mono rail label, single hairline at the top.
 * No cards, no rounded boxes, no left-border accents.
 * docs/design-system-profile.md §4.
 */
export function ProfileSection({
  id,
  label,
  note,
  accentNote,
  children,
}: {
  id?: string;
  label: string;
  note?: string;
  accentNote?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mt-8 grid scroll-mt-8 gap-x-10 border-t border-rule pt-6 md:grid-cols-[158px_minmax(0,1fr)]"
    >
      <div>
        <h2 className="font-mono text-ui-label font-medium uppercase tracking-[0.15em] text-muted">
          {label}
        </h2>
        {note && (
          <p className="mt-2 whitespace-pre-line font-mono text-ui-label leading-relaxed tracking-wider text-muted">
            {note}
          </p>
        )}
        {accentNote && (
          <p className="mt-2 whitespace-pre-line font-mono text-ui-label leading-relaxed tracking-wider text-accent">
            {accentNote}
          </p>
        )}
      </div>
      <div className="mt-3 min-w-0 md:mt-0">{children}</div>
    </section>
  );
}
