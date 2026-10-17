"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type ScrollingTextProps = {
  text: string;
  className?: string;
};

export default function ScrollingText({
  text,
  className = "",
}: ScrollingTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = textRef.current;

    if (!container || !content) return;

    const measure = () => {
      setScrollDistance(
        Math.max(0, content.scrollWidth - container.clientWidth),
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);
    measure();

    return () => observer.disconnect();
  }, [text]);

  const style = {
    "--scroll-distance": `${scrollDistance}px`,
    "--scroll-duration": `${scrollDistance / 35}s`,
  } as CSSProperties;

  return (
    <span ref={containerRef} className={`scrolling-text ${className}`}>
      <span
        ref={textRef}
        className={`scrolling-text__content${
          scrollDistance > 0 ? " scrolling-text__content--long" : ""
        }`}
        style={style}
      >
        {text}
      </span>
    </span>
  );
}
