import React from 'react';
import { LandingLayout } from './LandingLayout';
import { HeroSection } from './HeroSection';
import { PartnersTicker } from './PartnersTicker';
import { BentoGridFeatures } from './BentoGridFeatures';
import { CapabilitiesSection } from './CapabilitiesSection';
import { ServicesSection } from './ServicesSection';
import { HumanFirewallSection } from './HumanFirewallSection';
import { CallToAction } from './CallToAction';

export const LandingPage: React.FC = () => {
    return (
        <LandingLayout>
            <HeroSection />
            <PartnersTicker />
            <BentoGridFeatures />
            <CapabilitiesSection />
            <ServicesSection />
            <HumanFirewallSection />
            <CallToAction />
        </LandingLayout>
    );
};
