"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Process from './components/Process';
import Stats from './components/Stats';
import AuthModal from './components/AuthModal';

function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getSplineTransform = () => {
    const p = scrollProgress;
    let translateX, scale;
    
    if (p < 0.33) {
      const normalized = p / 0.33;
      translateX = lerp(28, -30, normalized);
      scale = lerp(1.1, 1.05, normalized);
    } else if (p < 0.66) {
      const normalized = (p - 0.33) / 0.33;
      translateX = lerp(-30, 30, normalized);
      scale = lerp(1.05, 1.1, normalized);
    } else {
      const normalized = (p - 0.66) / 0.34;
      translateX = lerp(30, 0, normalized);
      scale = lerp(1.1, 1.0, normalized);
    }

    return { translateX, scale };
  };

  const { translateX, scale } = getSplineTransform();
  const rotationY = scrollProgress * Math.PI * 2;

  return (
    <main ref={containerRef} className="bg-black min-h-screen relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[1px] bg-white/40 z-50 origin-left"
        style={{ scaleX }}
      />

      <Navbar />

      <div className="fixed top-0 right-0 w-[60%] h-screen z-20 pointer-events-none">
        <div
          className="w-full h-full pointer-events-auto"
          style={{
            transform: `translateX(${translateX}%) scale(${scale}) rotateY(${rotationY}rad)`,
            transformOrigin: "center center",
            transition: "transform 0.1s ease-out",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl backdrop-blur-sm border border-white/10 animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 pointer-events-none">
        <Hero />
        <Features />
        <Process />
        <Stats />
      </div>

      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-black bg-white rounded-full hover:bg-white/90 transition-all"
        >
          Register / Login
        </button>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
}
