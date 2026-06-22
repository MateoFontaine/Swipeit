"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PollOption } from "@/types/database";

type OptionImageProps = {
  option: PollOption;
  className?: string;
};

function placeholderGradient(text: string): string {
  const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `linear-gradient(135deg, hsl(${hue}, 45%, 35%) 0%, hsl(${(hue + 40) % 360}, 50%, 22%) 100%)`;
}

function Placeholder({ text, className }: { text: string; className?: string }) {
  const initial = text.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={className}
      style={{ background: placeholderGradient(text) }}
      aria-hidden="true"
    >
      <div className="flex h-full w-full items-center justify-center">
        <span className="select-none text-7xl font-bold text-white/25">
          {initial}
        </span>
      </div>
    </div>
  );
}

export function OptionImage({ option, className }: OptionImageProps) {
  const [src, setSrc] = useState<string | null>(option.image_url);
  const [loading, setLoading] = useState(!option.image_url);
  const [fetchFromApi, setFetchFromApi] = useState(!option.image_url);

  useEffect(() => {
    setSrc(option.image_url);
    setFetchFromApi(!option.image_url);
    setLoading(!option.image_url);
  }, [option.id, option.image_url]);

  useEffect(() => {
    if (!fetchFromApi) {
      return;
    }

    let cancelled = false;

    async function fetchImage() {
      setLoading(true);

      try {
        const params = new URLSearchParams({ text: option.text });
        const response = await fetch(`/api/images/resolve?${params}`);
        const data = (await response.json()) as { url: string | null };

        if (cancelled) return;

        if (data.url) {
          setSrc(data.url);
        } else {
          setSrc(null);
        }
      } catch {
        if (!cancelled) {
          setSrc(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchImage();

    return () => {
      cancelled = true;
    };
  }, [fetchFromApi, option.text]);

  if (loading) {
    return <Skeleton className={className} aria-label="Cargando imagen…" />;
  }

  if (!src) {
    return <Placeholder text={option.text} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={className}
      draggable={false}
      onError={() => {
        setFetchFromApi(true);
        setSrc(null);
      }}
    />
  );
}
