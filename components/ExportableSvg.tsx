"use client";

import { useRef, useState, type ReactNode } from "react";

type ExportableSvgProps = {
  children: ReactNode;
  filename: string;
  label: string;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export default function ExportableSvg({
  children,
  filename,
  label,
}: ExportableSvgProps) {
  const graphicRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");

  function serializedSvg() {
    const source = graphicRef.current?.querySelector("svg");
    if (!source) return null;
    const clone = source.cloneNode(true) as SVGSVGElement;
    const viewBox = clone.viewBox.baseVal;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(viewBox.width));
    clone.setAttribute("height", String(viewBox.height));
    return {
      source: new XMLSerializer().serializeToString(clone),
      width: viewBox.width,
      height: viewBox.height,
    };
  }

  function downloadSvg() {
    const serialized = serializedSvg();
    if (!serialized) return;
    downloadBlob(
      new Blob([serialized.source], {
        type: "image/svg+xml;charset=utf-8",
      }),
      `${filename}.svg`,
    );
    setStatus("SVG downloaded");
  }

  function downloadPng() {
    const serialized = serializedSvg();
    if (!serialized) return;

    const svgBlob = new Blob([serialized.source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = serialized.width * scale;
      canvas.height = serialized.height * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }
      context.scale(scale, scale);
      context.drawImage(image, 0, 0, serialized.width, serialized.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) return;
        downloadBlob(blob, `${filename}.png`);
        setStatus("PNG downloaded");
      }, "image/png");
    };
    image.src = url;
  }

  return (
    <div>
      <div ref={graphicRef} className="overflow-hidden">
        {children}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={downloadSvg}
          className="rounded-md border border-rule bg-background px-3 py-1.5 text-xs font-medium hover:border-foreground"
        >
          Download SVG
        </button>
        <button
          type="button"
          onClick={downloadPng}
          className="rounded-md border border-rule bg-background px-3 py-1.5 text-xs font-medium hover:border-foreground"
        >
          Download PNG
        </button>
        <span className="text-xs text-muted" aria-live="polite">
          {status || `${label}, ready for reuse`}
        </span>
      </div>
    </div>
  );
}
