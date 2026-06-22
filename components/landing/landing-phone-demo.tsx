"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";
import {
  SwipeCard,
  type SwipeDirection,
} from "@/components/poll/swipe-card";
import type { PollOption } from "@/types/database";

const DEMO_POLL_ID = "landing-demo";
const VISIBLE_BEHIND = 1;

const DEMO_OPTIONS: PollOption[] = [
  {
    id: "demo-1",
    poll_id: DEMO_POLL_ID,
    text: "Pizza",
    image_url:
      "https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=400",
    sort_order: 0,
  },
  {
    id: "demo-2",
    poll_id: DEMO_POLL_ID,
    text: "Sushi",
    image_url:
      "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400",
    sort_order: 1,
  },
  {
    id: "demo-3",
    poll_id: DEMO_POLL_ID,
    text: "Hamburguesa",
    image_url:
      "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",
    sort_order: 2,
  },
  {
    id: "demo-4",
    poll_id: DEMO_POLL_ID,
    text: "Tacos",
    image_url:
      "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400",
    sort_order: 3,
  },
  {
    id: "demo-5",
    poll_id: DEMO_POLL_ID,
    text: "Empanadas",
    image_url:
      "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400",
    sort_order: 4,
  },
  {
    id: "demo-6",
    poll_id: DEMO_POLL_ID,
    text: "Ensalada",
    image_url:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    sort_order: 5,
  },
];

function StatusBar() {
  return (
    <div className="relative z-10 flex items-center justify-between px-6 pt-3 pb-0.5 text-[10px] font-semibold text-foreground">
      <span>9:41</span>
      <div className="flex items-center gap-1" aria-hidden>
        <svg className="h-2.5 w-2.5" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5" opacity="0.35" />
          <rect x="4.5" y="5" width="3" height="7" rx="0.5" opacity="0.55" />
          <rect x="9" y="2" width="3" height="10" rx="0.5" opacity="0.75" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
        </svg>
        <svg className="h-2.5 w-3.5" viewBox="0 0 18 12" fill="currentColor">
          <path d="M9 2.5c2.2 0 4.2.9 5.7 2.3l1.4-1.4C14.3 1.4 11.8 0.2 9 0.2S3.7 1.4 1.9 3.4l1.4 1.4C4.8 3.4 6.8 2.5 9 2.5z" opacity="0.45" />
          <path d="M9 5.5c1.3 0 2.5.5 3.4 1.4l1.4-1.4C12.5 4.2 10.8 3.5 9 3.5S5.5 4.2 4.2 5.5l1.4 1.4c.9-.9 2.1-1.4 3.4-1.4z" opacity="0.7" />
          <circle cx="9" cy="10" r="1.8" />
        </svg>
        <svg className="h-2.5 w-5" viewBox="0 0 24 12" fill="currentColor">
          <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
          <rect x="2" y="2" width="15" height="8" rx="1.5" />
          <rect x="21.5" y="4" width="2" height="4" rx="1" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

function DynamicIsland() {
  return (
    <div className="absolute left-1/2 top-2.5 z-20 flex h-[22px] w-[80px] -translate-x-1/2 items-center justify-end rounded-full bg-zinc-900 pr-2.5 shadow-inner">
      <div className="h-2 w-2 rounded-full bg-zinc-700 ring-1 ring-zinc-600" />
    </div>
  );
}

function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[268px] sm:w-[280px]">
      <div className="absolute -left-[2px] top-[18%] h-7 w-[3px] rounded-l-sm bg-zinc-600" aria-hidden />
      <div className="absolute -left-[2px] top-[26%] h-12 w-[3px] rounded-l-sm bg-zinc-600" aria-hidden />
      <div className="absolute -left-[2px] top-[34%] h-12 w-[3px] rounded-l-sm bg-zinc-600" aria-hidden />
      <div className="absolute -right-[2px] top-[28%] h-16 w-[3px] rounded-r-sm bg-zinc-600" aria-hidden />

      <div className="rounded-[3rem] bg-linear-to-b from-zinc-500 via-zinc-700 to-zinc-800 p-[2px] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset]">
        <div className="rounded-[2.9rem] bg-zinc-950 p-[7px]">
          <div className="relative min-h-[520px] overflow-x-visible overflow-y-hidden rounded-[2.55rem] bg-background sm:min-h-[540px]">
            <DynamicIsland />
            <StatusBar />
            {children}
            <div className="absolute bottom-2 left-1/2 z-20 h-[4px] w-[96px] -translate-x-1/2 rounded-full bg-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** SwipeStack interactivo con loop infinito para la landing. */
function PollVotePreview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(
    null
  );

  const options = DEMO_OPTIONS;
  const total = options.length;
  const windowIndex = currentIndex % total;
  const currentNumber = windowIndex + 1;

  const handleDismiss = useCallback(
    (_direction: SwipeDirection) => {
      setExitDirection(null);
      setCurrentIndex((i) => (i + 1) % total);
    },
    [total]
  );

  const triggerButtonVote = useCallback((direction: SwipeDirection) => {
    setExitDirection(direction);
  }, []);

  const visibleCards = Array.from({ length: VISIBLE_BEHIND + 1 }, (_, i) => {
    const option = options[(windowIndex + i) % total];
    return {
      option,
      stackIndex: i,
      isTop: i === 0,
    };
  }).reverse();

  return (
    <div className="flex h-full flex-col px-3.5 pb-3 pt-0">
      <header className="px-1 pt-4 pb-2">
        <p className="text-base font-bold tracking-tight text-foreground">
          Swipe<span className="text-accent">it</span>
        </p>
      </header>

      <p className="mb-3 text-center text-[11px] text-muted-foreground">
        Votando como{" "}
        <span className="font-semibold text-foreground">Ana</span>
      </p>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between px-0.5">
          <p className="text-[11px] font-medium text-muted-foreground">
            Opción {currentNumber} de {total}
          </p>
        </div>

        <div
          className="relative mx-auto aspect-[3/4] w-full overflow-visible"
          aria-label={`Votando opción ${currentNumber} de ${total}`}
        >
          {visibleCards.map(({ option, stackIndex, isTop }) => (
            <SwipeCard
              key={option.id}
              option={option}
              isTop={isTop}
              stackIndex={stackIndex}
              exitDirection={isTop ? exitDirection : null}
              onDismiss={handleDismiss}
            />
          ))}
        </div>

        <div className="mt-4 flex shrink-0 items-center justify-center gap-7">
          <button
            type="button"
            onClick={() => triggerButtonVote("no")}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-rose-400 bg-white text-2xl text-rose-500 shadow-lg transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
            aria-label="Votar No"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={() => triggerButtonVote("yes")}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400 bg-white text-2xl text-emerald-500 shadow-lg transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
            aria-label="Votar Sí"
          >
            ✓
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Deslizá la card o usá los botones
        </p>
      </div>
    </div>
  );
}

export function LandingPhoneDemo() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative z-10 touch-manipulation"
      animate={prefersReducedMotion ? undefined : { y: [-4, 4, -4] }}
      transition={
        prefersReducedMotion
          ? undefined
          : { duration: 5, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <IPhoneFrame>
        <PollVotePreview />
      </IPhoneFrame>
    </motion.div>
  );
}
