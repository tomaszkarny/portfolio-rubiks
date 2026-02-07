"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  featured?: boolean;
}

interface WorkSectionProps {
  projects?: Project[];
}

// Default projects with one featured
const defaultProjects: Project[] = [
  {
    title: "Scroll-Driven 3D Cube",
    description:
      "A scroll-reactive Rubik's Cube built with Three.js and custom GLSL shaders. Every scroll tick drives the animation — no timeline, no keyframes, just math.",
    tags: ["Three.js", "React", "GLSL"],
    link: "#",
    featured: true,
  },
  {
    title: "WebGL Particle System",
    description:
      "GPU-accelerated particle system with 50k+ particles responding to audio input and mouse movement in real-time.",
    tags: ["WebGL", "GLSL", "Web Audio API"],
    link: "#",
  },
  {
    title: "3D Product Configurator",
    description:
      "Interactive product viewer with real-time material swapping, environment reflections, and camera orbit controls.",
    tags: ["Three.js", "React Three Fiber", "Zustand"],
    link: "#",
  },
  {
    title: "Interactive Data Viz",
    description:
      "Real-time data visualization dashboard with animated chart transitions and WebSocket-driven live updates.",
    tags: ["D3.js", "TypeScript", "WebSocket"],
    link: "#",
  },
];

// Sepia color palette for consistent sketch style
const sepiaColors = {
  border: "rgba(45, 42, 38, 0.15)",
  glow: "0 4px 24px rgba(45, 42, 38, 0.08)",
  hoverGlow: "0 8px 32px rgba(45, 42, 38, 0.15)",
  number: "#635d56",
  gradient: "linear-gradient(135deg, rgba(45, 42, 38, 0.04) 0%, rgba(45, 42, 38, 0.01) 100%)",
  tagBg: "rgba(45, 42, 38, 0.1)",
  tagText: "#4a4540",
  tagBorder: "rgba(45, 42, 38, 0.15)",
};

function ProjectThumbnail({ index, featured }: { index: number; featured?: boolean }) {
  const thumbnails = [
    // Project 01: Wireframe cube with floating lines
    (
      <div key="cube" className="relative w-full h-full flex items-center justify-center">
        <div
          className="w-20 h-20 border-2 relative"
          style={{
            borderColor: "#b85c38",
            transform: "rotateX(15deg) rotateY(-20deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute inset-0 border-2"
            style={{
              borderColor: "rgba(184, 92, 56, 0.4)",
              transform: "translateZ(40px)",
            }}
          />
          <div
            className="absolute top-0 left-0 w-full h-0 border-t-2"
            style={{
              borderColor: "rgba(184, 92, 56, 0.3)",
              transform: "rotateX(-90deg) translateZ(0px)",
              transformOrigin: "top",
              height: "40px",
            }}
          />
        </div>
        {/* Floating accent lines */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${30 + i * 15}px`,
              height: "1px",
              backgroundColor: `rgba(184, 92, 56, ${0.15 + i * 0.05})`,
              top: `${20 + i * 16}%`,
              left: `${10 + i * 12}%`,
              transform: `rotate(${-15 + i * 8}deg)`,
            }}
          />
        ))}
      </div>
    ),
    // Project 02: Particle dots
    (
      <div key="particles" className="relative w-full h-full overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 4)}px`,
              height: `${2 + (i % 4)}px`,
              backgroundColor: i % 5 === 0 ? "#b85c38" : "rgba(184, 92, 56, 0.3)",
              top: `${(i * 17 + i * i * 3) % 90 + 5}%`,
              left: `${(i * 23 + i * i * 7) % 90 + 5}%`,
              boxShadow: i % 5 === 0 ? "0 0 6px rgba(184, 92, 56, 0.4)" : "none",
            }}
          />
        ))}
      </div>
    ),
    // Project 03: 3D product box outline
    (
      <div key="product" className="relative w-full h-full flex items-center justify-center" style={{ perspective: "400px" }}>
        <div
          className="w-24 h-28 border-2 relative"
          style={{
            borderColor: "rgba(184, 92, 56, 0.6)",
            transform: "rotateY(-25deg) rotateX(5deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Side face */}
          <div
            className="absolute top-0 right-0 h-full border-r-2"
            style={{
              width: "30px",
              borderColor: "rgba(184, 92, 56, 0.3)",
              transform: "rotateY(90deg) translateZ(0px)",
              transformOrigin: "right",
              background: "linear-gradient(180deg, rgba(184,92,56,0.08) 0%, transparent 100%)",
            }}
          />
          {/* Top face */}
          <div
            className="absolute top-0 left-0 w-full border-t-2"
            style={{
              height: "20px",
              borderColor: "rgba(184, 92, 56, 0.3)",
              transform: "rotateX(-90deg)",
              transformOrigin: "top",
              background: "linear-gradient(90deg, rgba(184,92,56,0.06) 0%, transparent 100%)",
            }}
          />
          {/* Inner detail lines */}
          <div className="absolute inset-4 border border-dashed" style={{ borderColor: "rgba(184, 92, 56, 0.2)" }} />
        </div>
      </div>
    ),
    // Project 04: Data viz bars
    (
      <div key="dataviz" className="relative w-full h-full flex items-end justify-center gap-2 pb-8 px-8">
        {[65, 40, 85, 55, 70, 45, 90, 60].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h}%`,
              backgroundColor: i % 3 === 0 ? "rgba(184, 92, 56, 0.7)" : "rgba(184, 92, 56, 0.25)",
              maxWidth: "20px",
            }}
          />
        ))}
        {/* Grid lines */}
        {[25, 50, 75].map((top) => (
          <div
            key={top}
            className="absolute left-6 right-6"
            style={{
              top: `${top}%`,
              height: "1px",
              backgroundColor: "rgba(184, 92, 56, 0.1)",
            }}
          />
        ))}
      </div>
    ),
  ];

  return (
    <div
      className={`w-full rounded-xl mb-6 relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.03] ${
        featured ? "h-64 md:h-80" : "h-48 md:h-56"
      }`}
      style={{ backgroundColor: "#1a1816" }}
    >
      {thumbnails[index] || thumbnails[0]}
      {/* Featured badge */}
      {featured && (
        <div className="absolute top-4 right-4">
          <span
            className="px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm"
            style={{ backgroundColor: "rgba(184, 92, 56, 0.9)", color: "#fff" }}
          >
            Featured
          </span>
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  index,
  isInView,
}: {
  project: Project;
  index: number;
  isInView: boolean;
}) {
  const isFeatured = project.featured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.15 }}
      className={`group cursor-pointer ${isFeatured ? "md:col-span-2" : ""}`}
    >
      <motion.div
        className="p-6 md:p-8 rounded-2xl transition-all duration-300 relative overflow-hidden h-full"
        style={{
          background: sepiaColors.gradient,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${sepiaColors.border}`,
          boxShadow: sepiaColors.glow,
        }}
        whileHover={{
          y: -4,
          boxShadow: "0 12px 40px rgba(45, 42, 38, 0.18)",
        }}
      >
        {/* Subtle corner accent */}
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
          style={{
            background: "#7a756e",
          }}
        />

        {/* Project thumbnail */}
        <ProjectThumbnail index={index} featured={isFeatured} />

        {/* Project number */}
        <span
          className="text-sm font-mono mb-3 block font-bold relative z-10"
          style={{ color: sepiaColors.number }}
        >
          0{index + 1}
        </span>

        <h3
          className="text-2xl md:text-3xl font-bold mb-3 transition-colors relative z-10"
          style={{ color: "#2d2a26" }}
        >
          {project.title}
        </h3>

        <p
          className={`text-base md:text-lg mb-6 relative z-10 ${isFeatured ? "max-w-2xl" : ""}`}
          style={{ color: "#4a4540" }}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4 relative z-10">
          {project.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 text-sm rounded-full font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: sepiaColors.tagBg,
                color: sepiaColors.tagText,
                border: `1px solid ${sepiaColors.tagBorder}`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* View link */}
        {project.link && (
          <div
            className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all relative z-10"
            style={{ color: "#2d2a26" }}
          >
            <span className="link-underline transition-colors group-hover:text-[#b85c38]">
              View Project
            </span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function WorkSection({ projects = defaultProjects }: WorkSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="work"
      ref={ref}
      className="min-h-[200vh] flex items-start px-6 md:px-12 lg:px-20 py-32"
    >
      {/* Content on left side (cube is on right in this section) */}
      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="section-label mb-4">
            Portfolio
          </p>

          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            style={{ color: "#2d2a26" }}
          >
            Selected Work
          </h2>

          <p
            className="text-lg md:text-xl max-w-xl"
            style={{ color: "#4a4540" }}
          >
            A collection of projects that showcase my expertise in creating
            engaging digital experiences.
          </p>
        </motion.div>

        {/* Section divider */}
        <div className="section-divider mb-12" />

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
