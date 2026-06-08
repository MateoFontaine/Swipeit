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

export function OptionImage({ option, className }: OptionImageProps) {
  if (option.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={option.image_url}
        alt=""
        className={className}
        draggable={false}
      />
    );
  }

  const initial = option.text.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={className}
      style={{ background: placeholderGradient(option.text) }}
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
