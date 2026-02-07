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
          subtitle="I build things that move, glow, and respond to your every scroll"
        />

        {/* About: Cube on left, content on right */}
        <AboutSection
          bio="I'm Tomasz — a developer who got hooked on making browsers do unexpected things. From GPU-powered 3D scenes to buttery scroll animations, I obsess over the details that make interfaces feel alive."
          highlights={[
            "Three.js & WebGL",
            "React / Next.js",
            "GLSL Shaders",
            "Framer Motion",
          ]}
        />

        {/* Work: Cube on right, content on left */}
        <WorkSection
          projects={[
            {
              title: "Scroll-Driven 3D Cube",
              description:
                "A scroll-reactive Rubik's Cube built with Three.js and custom GLSL shaders. Every scroll tick drives the animation — no timeline, no keyframes, just math.",
              tags: ["Three.js", "GLSL", "React", "Framer Motion"],
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
