"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { OptionImage } from "@/components/poll/option-image";
import type { PollOption } from "@/types/database";

export type SwipeDirection = "yes" | "no";

type SwipeCardProps = {
  option: PollOption;
  isTop: boolean;
  stackIndex: number;
  exitDirection: SwipeDirection | null;
  onDismiss: (direction: SwipeDirection) => void;
};

export function SwipeCard({
  option,
  isTop,
  stackIndex,
  exitDirection,
  onDismiss,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const dismissed = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);
  const isDragging = useRef(false);

  const rotate = useTransform(x, (val) => {
    const width = cardRef.current?.offsetWidth ?? 320;
    const clamp = width * 0.85;
    return Math.max(-22, Math.min(22, (val / clamp) * 22));
  });
  const yesOpacity = useTransform(x, [0, 40, 100], [0, 0.5, 1]);
  const noOpacity = useTransform(x, [-100, -40, 0], [1, 0.5, 0]);
  const yesScale = useTransform(x, [0, 100], [0.7, 1.1]);
  const noScale = useTransform(x, [-100, 0], [1.1, 0.7]);
  const yesTint = useTransform(x, [0, 160], [0, 0.45]);
  const noTint = useTransform(x, [-160, 0], [0.45, 0]);

  async function flyOut(direction: SwipeDirection) {
    if (dismissed.current || !isTop) return;
    dismissed.current = true;
    isDragging.current = false;

    const width = cardRef.current?.offsetWidth ?? 320;
    const exitDistance = Math.max(width * 1.45, 280);
    const targetX = direction === "yes" ? exitDistance : -exitDistance;
    await animate(x, targetX, {
      type: "spring",
      stiffness: 320,
      damping: 28,
    });
    onDismiss(direction);
  }

  async function snapBack() {
    isDragging.current = false;
    await animate(x, 0, {
      type: "spring",
      stiffness: 500,
      damping: 35,
    });
  }

  function resolveSwipe(offset: number, elapsedMs: number) {
    const width = cardRef.current?.offsetWidth ?? 320;
    const threshold = width * 0.22;
    const velocity = elapsedMs > 0 ? offset / elapsedMs : 0;

    if (offset > threshold || (offset > 25 && velocity > 0.6)) {
      flyOut("yes");
      return;
    }

    if (offset < -threshold || (offset < -25 && velocity < -0.6)) {
      flyOut("no");
      return;
    }

    snapBack();
  }

  const wasTop = useRef(false);

  useEffect(() => {
    if (exitDirection && isTop) {
      flyOut(exitDirection);
    }
  }, [exitDirection, isTop]);

  useEffect(() => {
    if (isTop && !wasTop.current) {
      x.set(0);
      dismissed.current = false;
    }
    wasTop.current = isTop;
  }, [isTop, option.id, x]);

  function handlePointerDown(e: React.PointerEvent) {
    if (!isTop || dismissed.current) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartTime.current = Date.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging.current || dismissed.current) return;
    x.set(e.clientX - dragStartX.current);
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!isDragging.current || dismissed.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const offset = x.get();
    const elapsedMs = Date.now() - dragStartTime.current;
    resolveSwipe(offset, elapsedMs);
  }

  function handlePointerCancel() {
    if (!isDragging.current || dismissed.current) return;
    snapBack();
  }

  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 10;

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 select-none"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: 10 - stackIndex,
        scale,
        y: yOffset,
        pointerEvents: isTop ? "auto" : "none",
        touchAction: "none",
      }}
      onPointerDown={isTop ? handlePointerDown : undefined}
      onPointerMove={isTop ? handlePointerMove : undefined}
      onPointerUp={isTop ? handlePointerUp : undefined}
      onPointerCancel={isTop ? handlePointerCancel : undefined}
      initial={{ scale: scale * 0.95, opacity: 0, y: yOffset + 12 }}
      animate={{ scale, opacity: 1, y: yOffset }}
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
    >
      <div
        className={`relative h-full w-full overflow-hidden rounded-3xl shadow-2xl shadow-black/30 ${
          isTop ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <OptionImage
          option={option}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/5" />

        {isTop && (
          <>
            <motion.div
              className="pointer-events-none absolute inset-0 bg-emerald-500"
              style={{ opacity: yesTint }}
            />
            <motion.div
              className="pointer-events-none absolute inset-0 bg-rose-500"
              style={{ opacity: noTint }}
            />

            <motion.div
              className="pointer-events-none absolute left-6 top-8 rotate-[-12deg] rounded-lg border-[5px] border-emerald-400 px-5 py-2"
              style={{ opacity: yesOpacity, scale: yesScale }}
            >
              <span className="text-3xl font-black tracking-widest text-emerald-400">
                SÍ
              </span>
            </motion.div>

            <motion.div
              className="pointer-events-none absolute right-6 top-8 rotate-[12deg] rounded-lg border-[5px] border-rose-400 px-5 py-2"
              style={{ opacity: noOpacity, scale: noScale }}
            >
              <span className="text-3xl font-black tracking-widest text-rose-400">
                NO
              </span>
            </motion.div>
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 pt-20">
          <p className="text-2xl font-bold leading-tight text-white drop-shadow-lg sm:text-3xl">
            {option.text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
