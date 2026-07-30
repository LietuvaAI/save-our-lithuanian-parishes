import {
  diocesanLeadership,
  dioceseOfficialUrl,
} from "@/lib/diocese-links";

export function DiocesePill({ name }: { name: string }) {
  const href = dioceseOfficialUrl(name);
  const className =
    "inline-flex max-w-full items-center gap-1 rounded-full border border-rule px-2.5 py-1 text-[11px] font-medium leading-tight text-foreground transition-colors";

  if (!href) {
    return <span className={className}>{name}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:border-foreground hover:bg-foreground/5`}
      title={`Open the official ${name} website`}
    >
      <span>{name}</span>
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (official website)</span>
    </a>
  );
}

export function DiocesanLeaderLink({ diocese }: { diocese: string }) {
  const leader = diocesanLeadership(diocese);
  if (!leader) return null;

  return (
    <a
      href={leader.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-baseline gap-1 text-xs text-muted underline decoration-rule underline-offset-2 hover:text-foreground"
      title={`Open the official ${leader.role.toLowerCase()} page`}
    >
      <span>
        {leader.seeVacant && "See vacant · "}
        {leader.role}: <span className="font-medium">{leader.name}</span>
      </span>
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (official diocesan source)</span>
    </a>
  );
}
