import type { ReactNode } from "react";

type ExportableSvgProps = {
  children: ReactNode;
  filename: string;
  label: string;
};

export default function ExportableSvg({ children }: ExportableSvgProps) {
  return <div className="overflow-hidden">{children}</div>;
}
