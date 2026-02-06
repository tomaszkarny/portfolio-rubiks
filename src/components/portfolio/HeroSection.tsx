"use client";

import { motion } from "framer-motion";
import { useSyncExternalStore } from "react";

interface HeroSectionProps {
  name?: string;
  title?: string;
  subtitle?: string;
}

// Simple mount detection without setState in effect
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

// Staggered text reveal animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
};

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 100,
    },
  },
};

// Animated text component that reveals letter by letter
function AnimatedName({ text, mounted }: { text: string; mounted: boolean }) {
  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate={mounted ? "visible" : "hidden"}
      className="inline-flex flex-wrap"
      style={{ perspective: "1000px" }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
          style={{
            transformOrigin: "bottom",
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function HeroSection({
  name = "Tomasz Karny",
  title = "Creative Developer",
  subtitle = "Crafting immersive 3D experiences where code meets artistry",
}: HeroSectionProps) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Content overlay - positioned to work with central cube */}
      <div className="relative z-20 text-center max-w-5xl px-6 md:px-12">
        {/* Subtle backdrop for text readability over 3D cube */}
        <div
          className="absolute inset-0 -m-8 rounded-3xl"
          style={{
            background: "radial-gradient(ellipse at center, rgba(245, 240, 230, 0.7) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative">
          {/* Welcome badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span
              className="px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(45, 42, 38, 0.08)",
                color: "#5a5550",
                border: "1px solid rgba(45, 42, 38, 0.1)",
              }}
            >
              Creative Developer
            </span>
          </motion.div>

          {/* Main name - large, animated letter by letter */}
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tighter leading-none"
            style={{ color: "#2d2a26" }}
          >
            <AnimatedName text={name} mounted={mounted} />
          </h1>

          {/* Title - animated word by word */}
          <motion.h2
            variants={containerVariants}
            initial="hidden"
            animate={mounted ? "visible" : "hidden"}
            className="text-2xl md:text-3xl lg:text-4xl font-light mb-8 tracking-wide"
            style={{ color: "#3d3a36" }}
          >
            {title.split(" ").map((word, index) => (
              <motion.span
                key={index}
                variants={wordVariants}
                className="inline-block mr-3"
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto"
            style={{ color: "#5a5550" }}
          >
            {subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a
              href="#work"
              className="btn-primary btn-interactive inline-flex items-center gap-3 text-base md:text-lg"
            >
              <span>Explore Work</span>
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </motion.svg>
            </a>
            <a
              href="#contact"
              className="btn-secondary btn-interactive text-base md:text-lg"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - bottom center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{ color: "#7a756e" }}
      >
        <span className="text-xs uppercase tracking-[0.2em] font-medium">
          Scroll
        </span>
        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
