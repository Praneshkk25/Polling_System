import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import CinematicHeroExperience from '../components/landing/CinematicHeroExperience';
import RealTimeMomentScene from '../components/landing/scenes/RealTimeMomentScene';
import WhyPulsePollScene from '../components/landing/scenes/WhyPulsePollScene';
import ProductFlowScene from '../components/landing/scenes/ProductFlowScene';
import FinalCTAScene from '../components/landing/scenes/FinalCTAScene';

/**
 * Cinematic Scroll-Driven Landing Page for PulsePoll
 * Built as an interactive product film where normal browser scroll
 * drives continuous 3D camera depth, perspective tilts, card morphing,
 * dynamic progress bar growths, and real-time synchronization rays.
 * Inspired directly by Video-35008.mp4.
 * 100% reversible, zero blank screens, zero layout overlaps.
 */
export default function LandingPage({ onGetStarted, onSignIn, onExplore }) {
  return (
    <div className="landing-wrapper cinematic-mode">
      {/* 1. Transparent / Compact Light Navbar with Top Progress Bar */}
      <LandingNavbar
        onGetStarted={onGetStarted}
        onSignIn={onSignIn}
        onExplore={onExplore}
      />

      {/* Main Cinematic Scroll Storyboard */}
      <main className="landing-story-track">
        {/* Continuous 3D Scroll Experience: Hero -> Ask Anything -> Share Anywhere -> Live Results Climax */}
        <CinematicHeroExperience
          onGetStarted={onGetStarted}
          onExplore={onExplore}
        />

        {/* Scene 05: Real-Time Engine (Radial audience avatars around central poll) */}
        <RealTimeMomentScene />

        {/* Scene 06: Why PulsePoll (Staggered 4-directional feature reveals) */}
        <WhyPulsePollScene />

        {/* Scene 07: Product Ecosystem (Animated CREATE -> SHARE -> VOTE -> LIVE flow) */}
        <ProductFlowScene />

        {/* Scene 08: Final CTA (Cliff visual, "Every vote adds a new perspective", CTAs) */}
        <FinalCTAScene
          onGetStarted={onGetStarted}
          onExplore={onExplore}
          onSignIn={onSignIn}
        />
      </main>
    </div>
  );
}
