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
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
                Web3
              </span>{" "}
              <span className="text-white">Revolution</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8">
              Scroll down to unfold the future
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500">
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
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
              Decentralized by Design
            </h2>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-12">
              Experience the next generation of digital infrastructure.
              Built on trustless protocols, secured by mathematics,
              and powered by a global network of validators.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon="🔐"
                title="Secure"
                description="Military-grade cryptography protects every transaction"
              />
              <FeatureCard
                icon="⚡"
                title="Fast"
                description="Near-instant finality with sub-second block times"
              />
              <FeatureCard
                icon="🌍"
                title="Global"
                description="Accessible to anyone, anywhere, anytime"
              />
            </div>
          </div>
        </section>

        {/* Feature Section 2 */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
              The Cube Unfolds
            </h2>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-12">
              As you scroll, the cube transforms—revealing its inner structure.
              Each face represents a layer of our technology stack,
              working together in perfect harmony.
            </p>
            <div className="inline-flex items-center gap-4 px-6 py-3 border border-cyan-500/30 rounded-full bg-cyan-500/5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 font-medium">
                Interactive 3D Experience
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
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
