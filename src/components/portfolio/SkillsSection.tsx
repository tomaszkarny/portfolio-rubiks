"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SkillCategory {
  name: string;
  skills: string[];
  icon?: string;
}

interface SkillsSectionProps {
  categories?: SkillCategory[];
}

const defaultCategories: SkillCategory[] = [
  {
    name: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    name: "3D & Graphics",
    skills: ["Three.js", "WebGL", "GLSL Shaders", "React Three Fiber", "Blender"],
  },
  {
    name: "Backend",
    skills: ["Node.js", "Python", "PostgreSQL", "MongoDB", "REST APIs"],
  },
  {
    name: "Tools",
    skills: ["Git", "Docker", "Figma", "VS Code", "CI/CD"],
  },
];

function SkillCategoryCard({
  category,
  index,
  isInView,
}: {
  category: SkillCategory;
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      whileHover={{ borderColor: "rgba(184, 92, 56, 0.5)" }}
      className="p-6 rounded-xl hover-lift"
      style={{
        backgroundColor: "rgba(45, 42, 38, 0.03)",
        border: "2px solid rgba(45, 42, 38, 0.1)",
      }}
    >
      <h3
        className="text-xl font-bold mb-5"
        style={{ color: "#2d2a26" }}
      >
        {category.name}
      </h3>

      <div className="flex flex-wrap gap-2">
        {category.skills.map((skill, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.1 + i * 0.05 }}
            className="px-3 py-1.5 text-sm rounded-full cursor-default transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "rgba(45, 42, 38, 0.08)",
              color: "#3d3a36",
            }}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export function SkillsSection({ categories = defaultCategories }: SkillsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="skills"
      ref={ref}
      className="min-h-[120vh] flex items-center px-6 md:px-12 lg:px-20 py-32"
    >
      {/* Content on right side (cube is on left in this section) */}
      <div className="max-w-2xl ml-auto relative z-20">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <p className="section-label mb-4">
            Expertise
          </p>

          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            style={{ color: "#2d2a26" }}
          >
            Skills & Tools
          </h2>

          <p
            className="text-lg md:text-xl"
            style={{ color: "#4a4540" }}
          >
            Technologies and frameworks I use to bring ideas to life.
          </p>
        </motion.div>

        {/* Section divider */}
        <div className="section-divider mb-10" />

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <SkillCategoryCard
              key={index}
              category={category}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
