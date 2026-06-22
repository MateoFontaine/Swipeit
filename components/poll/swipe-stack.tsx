"use client";

import { useCallback, useState } from "react";
import {
  SwipeCard,
  type SwipeDirection,
} from "@/components/poll/swipe-card";
import type { PollOption } from "@/types/database";

type SwipeStackProps = {
  options: PollOption[];
  onComplete?: (votes: Record<string, SwipeDirection>) => void;
};

const VISIBLE_BEHIND = 1;

export function SwipeStack({ options, onComplete }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, SwipeDirection>>({});
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(
    null
  );

  const total = options.length;
  const isComplete = currentIndex >= total;
  const currentNumber = Math.min(currentIndex + 1, total);
  const canUndo = currentIndex > 0;

  const handleDismiss = useCallback(
    (direction: SwipeDirection) => {
      const option = options[currentIndex];
      if (!option) return;

      setExitDirection(null);

      const nextVotes = { ...votes, [option.id]: direction };
      const nextIndex = currentIndex + 1;

      setVotes(nextVotes);
      setCurrentIndex(nextIndex);

      if (nextIndex >= total) {
        queueMicrotask(() => onComplete?.(nextVotes));
      }
    },
    [currentIndex, onComplete, options, total, votes]
  );

  const handleUndo = useCallback(() => {
    if (currentIndex === 0) return;

    const previousOption = options[currentIndex - 1];
    if (!previousOption) return;

    setExitDirection(null);
    setVotes((prev) => {
      const next = { ...prev };
      delete next[previousOption.id];
      return next;
    });
    setCurrentIndex((i) => i - 1);
  }, [currentIndex, options]);

  const triggerButtonVote = useCallback((direction: SwipeDirection) => {
    setExitDirection(direction);
  }, []);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-violet-200/60 bg-violet-500/[0.03] px-5 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Esta encuesta no tiene opciones para votar.
        </p>
      </div>
    );
  }

  if (isComplete) {
    return null;
  }

  const visibleCards = options
    .slice(currentIndex, currentIndex + VISIBLE_BEHIND + 1)
    .map((option, i) => ({
      option,
      stackIndex: i,
      isTop: i === 0,
    }))
    .reverse();

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between px-1">
        <p
          className="text-sm font-medium text-muted-foreground"
          aria-live="polite"
        >
          Opción {currentNumber} de {total}
        </p>
        {canUndo && (
          <button
            type="button"
            onClick={handleUndo}
            className="text-sm font-medium text-violet-600 transition-colors hover:text-violet-700"
          >
            Deshacer
          </button>
        )}
      </div>

      <div
        className="relative mx-auto aspect-[3/4] w-full max-w-[400px] overflow-visible"
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

      <div className="mt-6 flex items-center justify-center gap-8">
        <button
          type="button"
          onClick={() => triggerButtonVote("no")}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-rose-400 bg-white text-2xl text-rose-500 shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Votar No"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={() => triggerButtonVote("yes")}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-400 bg-white text-2xl text-emerald-500 shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Votar Sí"
        >
          ✓
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground sm:hidden">
        Deslizá la card o usá los botones
      </p>
    </div>
  );
}
