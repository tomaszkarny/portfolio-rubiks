"use client";

import { CubeBackground } from "@/components/scroll-cube";
import {
  Navigation,
  HeroSection,
  AboutSection,
  WorkSection,
  SkillsSection,
  ContactSection,
} from "@/components/portfolio";

export default function Home() {
  return (
    <main className="relative">
      {/* Fixed Navigation */}
      <Navigation />

      {/* 3D Background - fixed position with dynamic cube positioning */}
      <CubeBackground />

      {/* Scrollable Content - positioned to not overlap with cube */}
      <div className="relative z-10">
        {/* Hero: Cube centered, content overlaid */}
        <HeroSection
          name="Tomasz Karny"
          title="Creative Developer"
          subtitle="Crafting immersive 3D experiences where code meets artistry"
        />

        {/* About: Cube on left, content on right */}
        <AboutSection
          bio="I transform complex ideas into elegant, interactive experiences. With a deep passion for 3D graphics and creative coding, I push the boundaries of what's possible in the browser, creating digital experiences that captivate and inspire."
          highlights={[
            "Three.js & WebGL specialist",
            "Creative frontend development",
            "Interactive 3D experiences",
            "Performance optimization",
          ]}
        />

        {/* Work: Cube on right, content on left */}
        <WorkSection
          projects={[
            {
              title: "Scroll-Driven 3D Cube",
              description:
                "An interactive Rubik's cube with custom pencil-sketch shaders, scroll-driven animations, and choreographed explosion effects. Built with Three.js and React Three Fiber.",
              tags: ["Three.js", "GLSL", "React", "Framer Motion"],
              link: "#",
              featured: true,
              gradient: "linear-gradient(135deg, #2d2a26 0%, #5a5550 100%)",
            },
            {
              title: "WebGL Particle System",
              description:
                "High-performance particle system with custom shaders, supporting 100k+ particles at 60fps with physics-based movement.",
              tags: ["WebGL", "GLSL", "React Three Fiber"],
              link: "#",
              gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            },
            {
              title: "3D Product Configurator",
              description:
                "Real-time product visualization tool with dynamic lighting, material swapping, and camera controls.",
              tags: ["Three.js", "Next.js", "TypeScript"],
              link: "#",
              gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            },
            {
              title: "Interactive Data Visualization",
              description:
                "3D data visualization dashboard with animated transitions and responsive layouts.",
              tags: ["D3.js", "Three.js", "WebSocket"],
              link: "#",
              gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            },
          ]}
        />

        {/* Skills: Cube on left, content on right */}
        <SkillsSection
          categories={[
            {
              name: "3D & Graphics",
              skills: ["Three.js", "WebGL", "GLSL Shaders", "React Three Fiber", "Post-processing"],
            },
            {
              name: "Frontend",
              skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
            },
            {
              name: "Creative Coding",
              skills: ["Procedural Generation", "Physics Simulation", "Animation Systems", "Shader Art"],
            },
            {
              name: "Tools & Workflow",
              skills: ["Git", "Blender", "Figma", "Performance Profiling", "CI/CD"],
            },
          ]}
        />

        {/* Contact: Cube centered (smaller), content centered around it */}
        <ContactSection
          email="tomasz@karny.dev"
          socials={[
            { name: "GitHub", url: "https://github.com/tomaszkarny", icon: "github" },
            { name: "LinkedIn", url: "https://linkedin.com/in/tomaszkarny", icon: "linkedin" },
            { name: "Twitter", url: "https://twitter.com/tomaszkarny", icon: "twitter" },
          ]}
        />
      </div>
    </main>
  );
}
