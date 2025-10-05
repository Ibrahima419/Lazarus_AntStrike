import { ArrowRight, Shield, Brain, Users, TrendingUp, Globe, Lock, Zap, Eye, Database, BarChart3, CheckCircle, Bug, Star, Award, Sparkles, ChevronRight, Play, CheckCircle2, Target, Clock, AlertTriangle, TrendingDown, Activity, Gauge, Layers, Cpu, Network, FileText, Building, Scale, Fingerprint } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import logoFull from '../AntStrike.svg';
import logoIcon from '../AntStrike.svg';
import { useState } from 'react';

interface LandingPageProps {
  onEnterPlatform: () => void;
}

export function LandingPage({ onEnterPlatform }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Shield,
      title: "Détection Avancée des Menaces",
      description: "Chasse aux menaces alimentée par l'IA avec corrélation automatique d'IOCs et analyse en temps réel",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Brain,
      title: "Moteur IA Taranis",
      description: "Collection OSINT alimentée par l'IA avec bots d'enrichissement autonomes et scoring de menaces",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "Flux d'Intelligence Globaux",
      description: "Intégration MISP, TAXII et STIX pour une visibilité complète du paysage des menaces",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "CTI Collaboratif",
      description: "Partage d'intelligence des menaces en équipe avec contrôles d'accès de niveau entreprise",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics ROI",
      description: "Démontrez la valeur cybersécurité avec des métriques ROI quantifiées et business intelligence",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Lock,
      title: "Sécurité Zero-Trust",
      description: "Architecture de sécurité entreprise avec MFA, SSO et permissions granulaires",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const stats = [
    { value: "340%", label: "ROI Moyen", description: "Retour sur investissement démontré" },
    { value: "99.8%", label: "Taux de Détection", description: "Menaces persistantes avancées identifiées" },
    { value: "45min", label: "MTTR", description: "Temps moyen de réponse aux menaces" },
    { value: "10M+", label: "IOCs Traités", description: "Indicateurs de compromission quotidiens" }
  ];

  const integrations = [
    "MISP", "TAXII", "STIX", "OpenIOC", "YARA", "Suricata", 
    "Snort", "ElasticSearch", "Splunk", "QRadar", "Sentinel", "Chronicle"
  ];

  const premiumFeatures = [
    {
      icon: Target,
      title: "Attribution de Menaces",
      description: "Identification précise des groupes d'attaquants et de leurs TTPs",
      metrics: "95% de précision"
    },
    {
      icon: Clock,
      title: "Détection en Temps Réel",
      description: "Surveillance 24/7 avec alertes instantanées",
      metrics: "< 5 secondes"
    },
    {
      icon: AlertTriangle,
      title: "Prédiction de Menaces",
      description: "IA prédictive pour anticiper les attaques futures",
      metrics: "72h d'avance"
    },
    {
      icon: TrendingDown,
      title: "Réduction des Faux Positifs",
      description: "Machine Learning avancé pour filtrer le bruit",
      metrics: "-85% de bruit"
    }
  ];

  const industries = [
    { name: "Gouvernement", threats: 1247, risk: "Critique", Icon: Building },
    { name: "Finance", threats: 892, risk: "Élevé", Icon: Scale },
    { name: "Santé", threats: 634, risk: "Élevé", Icon: Activity },
    { name: "Énergie", threats: 521, risk: "Critique", Icon: Zap },
    { name: "Technologie", threats: 478, risk: "Moyen", Icon: Cpu },
    { name: "Télécoms", threats: 356, risk: "Moyen", Icon: Network },
    { name: "Défense", threats: 289, risk: "Critique", Icon: Shield },
    { name: "Éducation", threats: 234, risk: "Faible", Icon: Users }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "CISO, Banque Européenne",
      content: "AntStrike a révolutionné notre approche de la cybersécurité. ROI de 340% en 6 mois.",
      rating: 5
    },
    {
      name: "Jean-Pierre Martin",
      role: "Directeur Sécurité, Groupe Industriel",
      content: "La détection prédictive nous a permis d'éviter 3 attaques majeures cette année.",
      rating: 5
    },
    {
      name: "Sophie Laurent",
      role: "Responsable SOC, Startup Tech",
      content: "Interface intuitive et résultats immédiats. Notre équipe est plus efficace que jamais.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md bg-background/70 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group">
              <img src={logoFull} alt="AntStrike" className="h-8 transition-transform group-hover:scale-105" />
              <Badge variant="secondary" className="hidden md:flex animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="hidden sm:flex">
                <Zap className="w-3 h-3 mr-1" />
                v2.1.4
              </Badge>
              <Button 
                onClick={onEnterPlatform} 
                className="bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Access Platform
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 mb-8 animate-fade-in">
              <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20 px-4 py-1.5">
                <Eye className="w-3 h-3 mr-2 animate-pulse" />
                Next-Generation Threat Intelligence Platform
                <Sparkles className="w-3 h-3 ml-2 text-primary" />
            </Badge>
            </div>
            
            {/* Hero Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AntStrike CTI
              </span>
              <br />
              <span className="text-foreground">Transform Your</span>
              <br />
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Cyber Defense
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in-up delay-100">
              Enterprise-grade CTI platform powered by <span className="text-primary font-semibold">Taranis AI</span>. 
              Automated OSINT collection, intelligent threat correlation, and <span className="text-primary font-semibold">340% proven ROI</span>.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up delay-200">
              <Button 
                size="lg" 
                onClick={onEnterPlatform} 
                className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 hover:opacity-90 px-8 py-6 text-lg shadow-2xl hover:shadow-primary/50 transition-all group"
              >
                <Shield className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Launch Dashboard
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg border-2 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                onClick={() => {
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                View Live Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 items-center animate-fade-in-up delay-300">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 border-2 border-background flex items-center justify-center text-xs font-bold text-white">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="font-medium">1,200+ SOC Analysts</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">4.9/5 Rating</span>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                SOC 2 Type II Certified
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="font-semibold text-lg mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative" id="demo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20 px-4 py-1.5">
              <Brain className="w-3 h-3 mr-2 animate-pulse" />
              Platform Capabilities
              <Sparkles className="w-3 h-3 ml-2 text-primary" />
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Enterprise Threat Intelligence
              <br />
              <span className="text-primary">Redéfinie par l'IA</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Plateforme CTI complète combinant collection automatisée, analyse IA, 
              et partage d'intelligence collaborative pour les opérations de sécurité modernes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`border-border/40 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden ${
                  hoveredFeature === index ? 'shadow-2xl shadow-primary/20 scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardContent className="p-6 relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  
                  {/* Hover Arrow */}
                  <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">En savoir plus</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <Badge variant="outline" className="mb-6 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20 px-4 py-1.5">
                <BarChart3 className="w-3 h-3 mr-2 animate-pulse" />
                Intelligence Dashboards
                <Sparkles className="w-3 h-3 ml-2 text-primary" />
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Centre de Commandement Unifié
                <br />
                <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  pour Opérations Cyber
                </span>
              </h2>
              
              <div className="space-y-5">
                {[
                  "Executive Overview avec métriques business et analytics ROI",
                  "Gestion des Menaces avec filtrage avancé et corrélation",
                  "Réponse aux Incidents avec tracking SLA et automatisation workflow",
                  "Hub d'Intelligence avec intégration MISP/TAXII/STIX",
                  "Gestion d'Entités pour acteurs, malware et infrastructure",
                  "Analyse Avancée avec scoring IA et détection de patterns",
                  "Moteur IA Taranis pour collection OSINT autonome",
                  "Capacités Import/Export pour tous formats standards",
                  "Rapports Business Intelligence avec justification ROI",
                  "Paramètres Enterprise et gestion utilisateurs"
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 group hover:bg-primary/5 rounded-lg p-3 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative animate-fade-in-up delay-200">
              {/* Floating Background Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full blur-xl animate-float"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-float delay-1000"></div>
              
              <div className="bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-600/10 rounded-3xl p-8 border border-primary/20 shadow-2xl backdrop-blur-sm relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-primary mb-2">Métriques en Temps Réel</h3>
                  <p className="text-sm text-muted-foreground">Données actualisées toutes les 30 secondes</p>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-5 bg-background/80 rounded-xl border border-primary/10 hover:border-primary/30 transition-all group backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold group-hover:text-primary transition-colors">Menaces Actives</span>
                    </div>
                    <Badge variant="destructive" className="px-3 py-1 text-lg font-bold animate-pulse">247</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-background/80 rounded-xl border border-primary/10 hover:border-primary/30 transition-all group backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold group-hover:text-primary transition-colors">Flux d'Intelligence</span>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 text-lg font-bold">12 Actifs</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-background/80 rounded-xl border border-primary/10 hover:border-primary/30 transition-all group backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold group-hover:text-primary transition-colors">IOCs Traités</span>
                    </div>
                    <Badge className="px-3 py-1 text-lg font-bold bg-gradient-to-r from-primary to-blue-500">847.2K</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-background/80 rounded-xl border border-primary/10 hover:border-primary/30 transition-all group backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold group-hover:text-primary transition-colors">Temps de Réponse</span>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 text-lg font-bold border-primary/50 text-primary">32min avg</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 px-4 py-1.5">
              <Target className="w-3 h-3 mr-2 animate-pulse" />
              Fonctionnalités Premium
              <Sparkles className="w-3 h-3 ml-2 text-primary" />
            </Badge>
            <h3 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Technologie de
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"> Pointe</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Découvrez les capacités avancées qui placent AntStrike à la pointe de l'innovation en cybersécurité
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="border-border/40 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/20"
              >
                <CardContent className="p-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h4>
                  <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{feature.description}</p>
                  <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary">
                    {feature.metrics}
                  </Badge>
                </CardContent>
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 px-4 py-1.5">
              <Building className="w-3 h-3 mr-2 animate-pulse" />
              Secteurs Protégés
              <Sparkles className="w-3 h-3 ml-2 text-green-500" />
            </Badge>
            <h3 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Protection
              <span className="text-green-500"> Multi-Secteurs</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AntStrike protège les organisations les plus critiques dans tous les secteurs d'activité
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((industry, index) => (
              <div 
                key={index} 
                className="group relative p-6 bg-background/80 rounded-xl border border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                      <industry.Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">{industry.name}</span>
                  </div>
                  <Badge 
                    variant={
                      industry.risk === 'Critique' ? 'destructive' : 
                      industry.risk === 'Élevé' ? 'default' : 
                      industry.risk === 'Moyen' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {industry.risk}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{industry.threats.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">menaces détectées</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 px-4 py-1.5">
              <Star className="w-3 h-3 mr-2 animate-pulse" />
              Témoignages Clients
              <Sparkles className="w-3 h-3 ml-2 text-yellow-500" />
            </Badge>
            <h3 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Ils Nous
              <span className="text-yellow-500"> Font Confiance</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Découvrez comment AntStrike transforme la cybersécurité des organisations leaders
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="border-border/40 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/20"
              >
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-border/40 pt-4">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20 px-4 py-1.5">
              <Globe className="w-3 h-3 mr-2 animate-pulse" />
              Intégrations Seamless
              <Sparkles className="w-3 h-3 ml-2 text-primary" />
            </Badge>
            <h3 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Connexions
              <span className="text-primary"> Universelles</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Support natif pour les formats d'intelligence des menaces standards de l'industrie 
              et les outils de sécurité les plus utilisés
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <div 
                key={index} 
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Badge 
                  variant="outline" 
                  className="w-full px-6 py-4 bg-background/80 hover:bg-primary/5 border-primary/20 hover:border-primary/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg backdrop-blur-sm text-center justify-center"
                >
                  <span className="font-semibold group-hover:text-primary transition-colors">
                {integration}
                  </span>
              </Badge>
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Stats Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 px-4 py-1.5">
              <Activity className="w-3 h-3 mr-2 animate-pulse" />
              Impact Mondial
              <Sparkles className="w-3 h-3 ml-2 text-green-500" />
            </Badge>
            <h3 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Chiffres qui
              <span className="text-green-500"> Parlent</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AntStrike protège des millions d'utilisateurs et des milliers d'organisations à travers le monde
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center group">
              <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                2.5M+
              </div>
              <div className="font-semibold text-lg mb-1">Organisations Protégées</div>
              <div className="text-sm text-muted-foreground">Dans 180+ pays</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                15B+
              </div>
              <div className="font-semibold text-lg mb-1">Menaces Analysées</div>
              <div className="text-sm text-muted-foreground">Chaque année</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                99.9%
              </div>
              <div className="font-semibold text-lg mb-1">Disponibilité</div>
              <div className="text-sm text-muted-foreground">SLA garanti</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                50ms
              </div>
              <div className="font-semibold text-lg mb-1">Temps de Réponse</div>
              <div className="text-sm text-muted-foreground">Latence moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-blue-500 to-purple-600 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDE0YzAtMy4zMTQtMi42ODYtNi02LTZzLTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2IDYtMi42ODYgNi02ek0yNiA0NmMwLTMuMzE0LTIuNjg2LTYtNi02cy02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNnptMzQgMGMwLTMuMzE0LTIuNjg2LTYtNi02cy02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNiA2-MiLjg2IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <Badge className="mb-6 bg-white/20 border-white/30 text-white">
            <Award className="w-3 h-3 mr-2" />
            Rejoignez les leaders de la cybersécurité
          </Badge>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Prêt à Transformer Votre
            <br />
            <span className="text-yellow-300">Intelligence des Menaces ?</span>
          </h2>
          
          <p className="text-xl opacity-95 mb-10 max-w-3xl mx-auto leading-relaxed">
            Rejoignez les organisations de pointe utilisant <span className="font-bold">AntStrike</span> pour se défendre contre 
            les menaces avancées avec une intelligence alimentée par l'IA et un ROI prouvé de 340%.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={onEnterPlatform}
              className="px-8 py-6 text-lg bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-white/50 transition-all group"
            >
              <Shield className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Accéder à la Plateforme
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all"
              onClick={() => alert('Démo disponible sur demande. Contactez-nous !')}
            >
              <Play className="w-5 h-5 mr-2" />
              Planifier une Démo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 items-center opacity-90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Déploiement en 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Support 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">ROI garanti</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6 group">
                <img src={logoFull} alt="AntStrike" className="h-7 transition-transform group-hover:scale-105" />
                <Badge variant="secondary" className="animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enterprise
                </Badge>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
                Plateforme de Cyber Threat Intelligence de nouvelle génération avec collection OSINT alimentée par l'IA 
                et analyse automatisée des menaces. Transformez vos opérations de sécurité avec des insights basés sur les données.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  SOC 2 Type II
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ISO 27001
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  RGPD Conforme
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Plateforme</h4>
              <div className="space-y-3 text-sm">
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Threat Intelligence
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Réponse aux Incidents
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Collection OSINT
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Analyse IA
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Business Intelligence
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Ressources</h4>
              <div className="space-y-3 text-sm">
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Documentation
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  API Reference
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Communauté
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Support 24/7
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Formation
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              © 2024 <span className="font-semibold text-primary">AntStrike</span>. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Badge variant="outline" className="font-mono">
                v2.1.4
              </Badge>
              <span>•</span>
              <span className="flex items-center gap-1">
                Conçu pour les équipes de sécurité d'élite
                <Shield className="w-3 h-3 text-primary" />
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}