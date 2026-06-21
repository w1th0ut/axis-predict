"use client";

import React, { useEffect, useMemo, useState } from "react";

const WORDS = ["guarded", "adaptive", "auditable"] as const;

export default function AnimatedHeroWord() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeWord = useMemo(() => WORDS[wordIndex], [wordIndex]);

  useEffect(() => {
    const completedWord = visibleLength === activeWord.length;
    const clearedWord = visibleLength === 0;

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && !completedWord) {
          setVisibleLength((value) => value + 1);
          return;
        }

        if (!isDeleting && completedWord) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && !clearedWord) {
          setVisibleLength((value) => value - 1);
          return;
        }

        setIsDeleting(false);
        setWordIndex((value) => (value + 1) % WORDS.length);
      },
      !isDeleting && completedWord ? 1300 : isDeleting ? 55 : 90,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [activeWord.length, isDeleting, visibleLength]);

  return (
    <span className="inline-flex min-w-[10ch] items-baseline text-[var(--axis-primary)]">
      <span>{activeWord.slice(0, visibleLength)}</span>
    </span>
  );
}
