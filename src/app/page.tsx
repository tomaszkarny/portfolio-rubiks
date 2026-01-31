"use client";

import { CubeBackground } from "@/components/scroll-cube";

export default function Home() {
  return (
    <main className="relative">
      {/* 3D Background - fixed position */}
      <CubeBackground />

      {/* Scrollable Content */}
      <div className="relative z-10 min-h-[600vh]">
        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight" style={{ color: '#2d2a26' }}>
              <span style={{ fontStyle: 'italic' }}>
                Sketch
              </span>{" "}
              <span style={{ color: '#3d3a36' }}>Cube</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8" style={{ color: '#5a5550' }}>
              Scroll down to unfold the drawing
            </p>
            <div className="flex items-center justify-center gap-2" style={{ color: '#7a756e' }}>
              <svg
                className="w-6 h-6 animate-bounce"
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
              <span className="text-sm uppercase tracking-wider">Scroll</span>
            </div>
          </div>
        </section>

        {/* Feature Section 1 */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8" style={{ color: '#2d2a26' }}>
              Hand-Drawn Style
            </h2>
            <p className="text-lg md:text-xl leading-relaxed mb-12" style={{ color: '#5a5550' }}>
              Watch the cube come to life with pencil sketch aesthetics.
              Cross-hatching reacts to light, creating depth and dimension
              just like a real sketchbook drawing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon="✏️"
                title="Hatching"
                description="Dynamic cross-hatching responds to lighting direction"
              />
              <FeatureCard
                icon="📄"
                title="Paper"
                description="Warm cream background mimics real sketchbook paper"
              />
              <FeatureCard
                icon="✨"
                title="Animated"
                description="Subtle wobble effect for authentic hand-drawn feel"
              />
            </div>
          </div>
        </section>

        {/* Feature Section 2 */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8" style={{ color: '#2d2a26' }}>
              The Cube Explodes
            </h2>
            <p className="text-lg md:text-xl leading-relaxed mb-12" style={{ color: '#5a5550' }}>
              As you scroll, the cube rotates, pauses, then dramatically
              explodes into its 27 individual cubelets—all rendered
              in beautiful monochromatic pencil sketch style.
            </p>
            <div
              className="inline-flex items-center gap-4 px-6 py-3 rounded-full"
              style={{
                border: '2px solid rgba(45, 42, 38, 0.3)',
                backgroundColor: 'rgba(45, 42, 38, 0.05)'
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#2d2a26' }}
              />
              <span className="font-medium" style={{ color: '#2d2a26' }}>
                Interactive 3D Sketch
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="p-6 rounded-xl backdrop-blur-sm transition-colors"
      style={{
        backgroundColor: 'rgba(45, 42, 38, 0.05)',
        border: '2px solid rgba(45, 42, 38, 0.15)',
      }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: '#2d2a26' }}>{title}</h3>
      <p className="text-sm" style={{ color: '#5a5550' }}>{description}</p>
    </div>
  );
}
