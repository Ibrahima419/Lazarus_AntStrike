import React from 'react';
import { LandingLayout } from './LandingLayout';
import { HeroSection } from './HeroSection';
import { PartnersTicker } from './PartnersTicker';
import { BentoGridFeatures } from './BentoGridFeatures';
import { ServicesSection } from './ServicesSection';
import { CallToAction } from './CallToAction';

export const LandingPage: React.FC = () => {
    return (
        <LandingLayout>
            <HeroSection />
            <PartnersTicker />
            <BentoGridFeatures />
            <ServicesSection />
            <CallToAction />
        </LandingLayout>
    );
};
