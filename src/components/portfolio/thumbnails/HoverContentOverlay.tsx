"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "./shared";

interface HoverContentOverlayProps {
  isHovered: boolean;
  index: number;
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export function HoverContentOverlay({
  isHovered,
  index,
  title,
  description,
  tags,
  link,
}: HoverContentOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col justify-between p-5"
      style={{ pointerEvents: isHovered ? "auto" : "none" }}
      initial={{ opacity: 0 }}
      animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
      transition={
        isHovered
          ? { duration: 0.3, delay: 0.15 }
          : { duration: 0.2 }
      }
    >
      {/* Top row: project number + external link */}
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-mono font-bold"
          style={{ color: "rgba(255, 255, 255, 0.9)" }}
        >
          0{index + 1}
        </span>
        {link && (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 17L17 7M17 7H7M17 7v10"
            />
          </svg>
        )}
      </div>

      {/* Bottom content: title, description, tags */}
      <motion.div
        initial={{ y: prefersReducedMotion ? 0 : "3vh", opacity: 0 }}
        animate={
          isHovered
            ? { y: 0, opacity: 1 }
            : { y: prefersReducedMotion ? 0 : "3vh", opacity: 0 }
        }
        transition={
          isHovered
            ? { duration: 0.4, delay: 0.2, ease: "easeOut" }
            : { duration: 0.2 }
        }
      >
        <h4
          className="text-lg font-bold mb-1 leading-tight"
          style={{ color: "#fff" }}
        >
          {title}
        </h4>
        <p
          className="text-xs mb-3 line-clamp-2 leading-relaxed"
          style={{ color: "rgba(255, 255, 255, 0.75)" }}
        >
          {description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[10px] rounded-full font-medium"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(4px)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
