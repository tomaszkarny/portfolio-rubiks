"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState, useCallback } from "react";

interface SocialLink {
  name: string;
  url: string;
  icon: "github" | "linkedin" | "x" | "email";
}

interface ContactSectionProps {
  // CHANGE THIS: Replace with your actual email
  email?: string;
  socials?: SocialLink[];
}

const defaultSocials: SocialLink[] = [
  { name: "GitHub", url: "https://github.com", icon: "github" },
  { name: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
  { name: "X", url: "https://x.com", icon: "x" },
];

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  switch (icon) {
    case "github":
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "x":
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 1200 1227">
          <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
        </svg>
      );
    case "email":
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
  }
}

const brandColors: Record<string, { bg: string; text: string; glow: string }> = {
  github: { bg: "#24292e", text: "#fff", glow: "#24292e" },
  linkedin: { bg: "#0A66C2", text: "#fff", glow: "#0A66C2" },
  x: { bg: "#000", text: "#fff", glow: "#333" },
};

function SocialIconButton({
  social,
  isInView,
  delay,
}: {
  social: SocialLink;
  isInView: boolean;
  delay: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const [isHovered, setIsHovered] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 15 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 15 });

  const brand = brandColors[social.icon] ?? {
    bg: "rgba(184, 92, 56, 0.12)",
    text: "#2d2a26",
    glow: "#b85c38",
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(x * 16);
      rotateX.set(-y * 16);
    },
    [reduced, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, delay }}
    >
      <motion.a
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 rounded-full"
        style={{
          backgroundColor: isHovered ? brand.bg : "rgba(45, 42, 38, 0.08)",
          color: isHovered ? brand.text : "#2d2a26",
          rotateX: reduced ? 0 : springRotateX,
          rotateY: reduced ? 0 : springRotateY,
          boxShadow: isHovered
            ? `0 0 20px ${brand.glow}40, 0 4px 20px ${brand.glow}30`
            : "0 0 0px transparent",
          transition: "background-color 0.25s ease, color 0.25s ease, box-shadow 0.3s ease",
        }}
        whileHover={{
          scale: reduced ? 1.05 : 1.15,
          y: -4,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 12,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label={social.name}
      >
        <SocialIcon icon={social.icon} />
      </motion.a>

      {/* Tooltip label */}
      <motion.span
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 4,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="text-xs font-medium mt-2 pointer-events-none select-none"
        style={{ color: "#635d56" }}
        aria-hidden
      >
        {social.name}
      </motion.span>
    </motion.div>
  );
}

function EmailCTA({
  email,
  isInView,
}: {
  email: string;
  isInView: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  // Magnetic pull — button drifts toward cursor
  const magnetX = useMotionValue(0);
  const magnetY = useMotionValue(0);
  const springMagnetX = useSpring(magnetX, { stiffness: 150, damping: 15 });
  const springMagnetY = useSpring(magnetY, { stiffness: 150, damping: 15 });

  // Cursor-following spotlight
  const mouseXNorm = useMotionValue(0.5);
  const mouseYNorm = useMotionValue(0.5);
  const spotlightX = useTransform(mouseXNorm, [0, 1], [0, 100]);
  const spotlightY = useTransform(mouseYNorm, [0, 1], [0, 100]);
  const spotlightBg = useMotionTemplate`radial-gradient(circle 120px at ${spotlightX}% ${spotlightY}%, rgba(255,255,255,0.12), transparent)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const x = nx - 0.5;
      const y = ny - 0.5;
      rotateY.set(x * 14);
      rotateX.set(-y * 14);
      magnetX.set(x * 14);
      magnetY.set(y * 8);
      mouseXNorm.set(nx);
      mouseYNorm.set(ny);
    },
    [reduced, rotateX, rotateY, magnetX, magnetY, mouseXNorm, mouseYNorm]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    magnetX.set(0);
    magnetY.set(0);
    setIsHovered(false);
  }, [rotateX, rotateY, magnetX, magnetY]);

  return (
    <motion.div
      className="inline-block mb-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{ perspective: 800 }}
    >
      {/* Magnetic pull wrapper */}
      <motion.div
        className="relative"
        style={{
          x: reduced ? 0 : springMagnetX,
          y: reduced ? 0 : springMagnetY,
        }}
      >
        {/* Pulsating glow behind button */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse, rgba(184, 92, 56, 0.6) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={
            isHovered
              ? {
                  scale: [1, 1.35, 1.15, 1.3, 1.2],
                  opacity: [0.4, 0.8, 0.5, 0.7, 0.6],
                }
              : { scale: 1, opacity: 0 }
          }
          transition={
            isHovered
              ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4 }
          }
        />

        {/* Tilt + scale wrapper (above overflow-hidden so tilt isn't clipped) */}
        <motion.div
          style={{
            rotateX: reduced ? 0 : springRotateX,
            rotateY: reduced ? 0 : springRotateY,
          }}
          whileHover={{
            scale: reduced ? 1.02 : 1.07,
            y: -5,
          }}
          whileTap={{ scale: 0.96 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Border wrapper — clips the oversized rotating gradient */}
          <div className="relative rounded-2xl p-[3px] overflow-hidden">
            {/* Rotating conic gradient — the border shine */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                inset: "-50%",
                background:
                  "conic-gradient(from 0deg, transparent 0%, transparent 65%, rgba(255, 255, 255, 0.25) 72%, rgba(255, 255, 255, 0.6) 78%, rgba(255, 255, 255, 0.8) 80%, rgba(255, 255, 255, 0.6) 82%, rgba(255, 255, 255, 0.25) 88%, transparent 95%, transparent 100%)",
              }}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360, opacity: 1 }}
              transition={{
                rotate: { duration: 2.5, repeat: Infinity, ease: "linear" },
                opacity: { duration: 0.3 },
              }}
            />

            <a
              href={`mailto:${email}`}
              className="relative block rounded-[14px] overflow-hidden inline-flex items-center gap-3 text-lg font-semibold"
              style={{
                padding: "1rem 2.25rem",
                background: isHovered
                  ? "linear-gradient(135deg, #d17a52 0%, #b85c38 40%, #9e4a2a 100%)"
                  : "linear-gradient(135deg, #c16844 0%, #b85c38 100%)",
                color: "#fff",
                boxShadow: isHovered
                  ? "0 10px 40px rgba(184, 92, 56, 0.5), 0 0 80px rgba(184, 92, 56, 0.15), inset 0 1px 0 rgba(255,255,255,0.2)"
                  : "0 4px 14px rgba(184, 92, 56, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                transition: "box-shadow 0.4s ease, background 0.4s ease",
              }}
              aria-label={`Send email to ${email}`}
            >
              {/* Cursor-following spotlight */}
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{ background: spotlightBg }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              <span className="relative">
                <SocialIcon icon="email" />
              </span>

              <span className="relative">{email}</span>

              {/* Send arrow that slides in on hover */}
              <motion.span
                className="relative inline-flex items-center overflow-hidden"
                animate={{ width: isHovered ? 20 : 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <motion.svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: isHovered ? 0 : -20 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: isHovered ? 0.1 : 0,
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </motion.svg>
              </motion.span>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function ContactSection({
  // CHANGE THIS: Replace with your actual email
  email = "hello@example.com",
  socials = defaultSocials,
}: ContactSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="contact"
      ref={ref}
      className="min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-20 py-32"
    >
      {/* Content centered (cube is also centered/small in this section) */}
      <div className="text-center max-w-2xl relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label mb-4">
            Get in Touch
          </p>

          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            style={{ color: "#2d2a26" }}
          >
            Let&apos;s Work Together
          </h2>

          <p
            className="text-lg md:text-xl mb-10"
            style={{ color: "#4a4540" }}
          >
            Have a project in mind? I&apos;d love to hear about it. Drop me a line
            and let&apos;s create something amazing.
          </p>

          {/* Email CTA */}
          <EmailCTA email={email} isInView={isInView} />

          {/* Section divider */}
          <div className="section-divider mx-auto max-w-xs mb-10" />

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center gap-4"
          >
            {socials.map((social, index) => (
              <SocialIconButton
                key={index}
                social={social}
                isInView={isInView}
                delay={0.6 + index * 0.1}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-24 text-sm"
          style={{ color: "#635d56" }}
        >
          Designed & Built with React, Three.js, and Framer Motion
        </motion.p>
      </div>
    </section>
  );
}
