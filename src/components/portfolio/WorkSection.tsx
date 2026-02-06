"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  featured?: boolean;
  gradient?: string; // Gradient for placeholder image
}

interface WorkSectionProps {
  projects?: Project[];
}

// Default projects with one featured
const defaultProjects: Project[] = [
  {
    title: "Interactive 3D Experience",
    description:
      "A WebGL-powered visualization that responds to user input with fluid animations and real-time physics simulation.",
    tags: ["Three.js", "React", "GLSL"],
    link: "#",
    featured: true,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    title: "E-commerce Platform",
    description:
      "Full-stack application with real-time inventory and seamless checkout flow.",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    link: "#",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    title: "Data Dashboard",
    description:
      "Real-time analytics dashboard with interactive charts and live data streams.",
    tags: ["TypeScript", "D3.js", "WebSocket"],
    link: "#",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    title: "Mobile App Design",
    description:
      "Cross-platform mobile application with gesture-based navigation.",
    tags: ["React Native", "Reanimated", "Figma"],
    link: "#",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
];

// Sepia color palette for consistent sketch style
const sepiaColors = {
  border: "rgba(45, 42, 38, 0.15)",
  glow: "0 4px 24px rgba(45, 42, 38, 0.08)",
  hoverGlow: "0 8px 32px rgba(45, 42, 38, 0.15)",
  number: "#7a756e",
  gradient: "linear-gradient(135deg, rgba(45, 42, 38, 0.04) 0%, rgba(45, 42, 38, 0.01) 100%)",
  tagBg: "rgba(45, 42, 38, 0.1)",
  tagText: "#5a5550",
  tagBorder: "rgba(45, 42, 38, 0.15)",
};

function ProjectImagePlaceholder({ gradient, featured, title }: { gradient?: string; featured?: boolean; title?: string }) {
  // Generate dynamic pattern based on project title for visual variety
  const patternSeed = title ? title.length * 7 : 42;

  return (
    <div
      className={`w-full rounded-xl mb-6 relative overflow-hidden group-hover:scale-[1.02] transition-all duration-500 ${
        featured ? "h-64 md:h-80" : "h-48 md:h-56"
      }`}
      style={{
        background: gradient || "linear-gradient(135deg, rgba(45, 42, 38, 0.08) 0%, rgba(45, 42, 38, 0.04) 100%)",
      }}
    >
      {/* Dynamic geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              ${45 + (patternSeed % 30)}deg,
              transparent,
              transparent ${8 + (patternSeed % 6)}px,
              rgba(255, 255, 255, 0.15) ${8 + (patternSeed % 6)}px,
              rgba(255, 255, 255, 0.15) ${16 + (patternSeed % 8)}px
            ),
            repeating-linear-gradient(
              ${-45 + (patternSeed % 20)}deg,
              transparent,
              transparent 12px,
              rgba(255, 255, 255, 0.08) 12px,
              rgba(255, 255, 255, 0.08) 24px
            )
          `,
        }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated gradient shimmer on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700"
        style={{
          background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s ease-in-out",
        }}
      />

      {/* Code/Tech icon for visual interest */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <svg
            className="w-16 h-16 text-white/25 group-hover:text-white/40 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        </div>
      </div>

      {/* Featured badge */}
      {featured && (
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white backdrop-blur-sm">
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
          scale: 1.02,
          boxShadow: sepiaColors.hoverGlow,
        }}
      >
        {/* Subtle corner accent */}
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
          style={{
            background: "#7a756e",
          }}
        />

        {/* Project image placeholder */}
        <ProjectImagePlaceholder gradient={project.gradient} featured={isFeatured} title={project.title} />

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
          style={{ color: "#5a5550" }}
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
            <span className="link-underline transition-colors group-hover:text-[#5a5550]">
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
            style={{ color: "#5a5550" }}
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
