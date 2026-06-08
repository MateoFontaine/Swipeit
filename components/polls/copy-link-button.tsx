"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type CopyLinkButtonProps = {
  url: string;
  className?: string;
};

export function CopyLinkButton({ url, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex h-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card px-5 text-sm font-semibold transition-all",
        "hover:bg-muted active:scale-[0.98]",
        copied && "border-emerald-300 bg-emerald-50 text-emerald-800",
        className
      )}
    >
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
}
