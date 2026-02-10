"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  CubeBlueprintThumbnail,
  ParticleConstellationThumbnail,
  ProductBlueprintThumbnail,
  DashboardPanelThumbnail,
  ScribbleFill,
  HoverContentOverlay,
  sepiaColors,
} from "./thumbnails";
import type { ReactNode } from "react";
import type { ScribbleFillVariant } from "./thumbnails/scribbleFillData";

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

const thumbnailComponents: ReactNode[] = [
  <CubeBlueprintThumbnail key="cube" featured />,
  <ParticleConstellationThumbnail key="particles" />,
  <ProductBlueprintThumbnail key="product" />,
  <DashboardPanelThumbnail key="dashboard" />,
];

const scribbleFillVariants: ScribbleFillVariant[] = [
  "scribbleA",
  "scribbleB",
  "scribbleC",
  "scribbleD",
];

const cardAccentColors = [
  "rgba(184, 92, 56, 0.85)",   // terracotta
  "rgba(86, 120, 90, 0.85)",   // sage green
  "rgba(140, 100, 70, 0.85)",  // warm brown
  "rgba(100, 80, 120, 0.85)",  // muted plum
];

function ProjectThumbnail({
  index,
  featured,
  project,
}: {
  index: number;
  featured?: boolean;
  project: Project;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`w-full rounded-xl mb-6 relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.03] ${
        featured ? "h-64 md:h-80" : "h-48 md:h-56"
      }`}
      style={{ backgroundColor: "#1a1816" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {thumbnailComponents[index] || thumbnailComponents[0]}

      {/* Scribble fill overlay - draws on hover */}
      <ScribbleFill
        id={`scribble-fill-${index}`}
        variant={scribbleFillVariants[index] || "scribbleA"}
        isHovered={isHovered}
        accentColor={cardAccentColors[index] || cardAccentColors[0]}
      />

      {/* Hover content overlay */}
      <HoverContentOverlay
        isHovered={isHovered}
        index={index}
        description={project.description}
        tags={project.tags}
        link={project.link}
      />

      {/* Featured badge */}
      {featured && (
        <div className="absolute top-4 right-4 z-10">
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
        <ProjectThumbnail index={index} featured={isFeatured} project={project} />

        {/* Project number */}
        <span
          className="text-sm font-mono mb-3 block font-bold relative z-10"
          style={{ color: sepiaColors.number }}
        >
          0{index + 1}
        </span>

        <h3
          className="text-2xl md:text-3xl font-bold mb-4 transition-colors relative z-10"
          style={{ color: "#2d2a26" }}
        >
          {project.title}
        </h3>

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
