"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AboutSectionProps {
  bio?: string;
  highlights?: string[];
}

export function AboutSection({
  bio = "I'm Tomasz — a developer who got hooked on making browsers do unexpected things. From GPU-powered 3D scenes to buttery scroll animations, I obsess over the details that make interfaces feel alive.",
  highlights = [
    "Three.js & WebGL",
    "React / Next.js",
    "GLSL Shaders",
    "Framer Motion",
  ],
}: AboutSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={ref}
      className="min-h-[120vh] flex items-center px-6 md:px-12 lg:px-20 py-32"
    >
      {/* Content positioned on the right side (cube is on left in this section) */}
      <div className="max-w-2xl ml-auto relative z-20">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="content-backdrop"
        >
          <p className="section-label mb-4">
            About Me
          </p>

          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight"
            style={{ color: "#2d2a26" }}
          >
            Who I Am
          </h2>

          <p
            className="text-lg md:text-xl leading-relaxed mb-10"
            style={{ color: "#4a4540" }}
          >
            {bio}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-[rgba(45,42,38,0.05)]"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#b85c38" }}
                />
                <span className="font-medium" style={{ color: "#3d3a36" }}>
                  {highlight}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Visual accent - animated line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1 w-24 origin-left rounded-full"
            style={{ backgroundColor: "#b85c38" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
