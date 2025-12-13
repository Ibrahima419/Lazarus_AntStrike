# Business Model Canvas : AntStrike-CTI

Ce document détaille le modèle d'affaires pour AntStrike-CTI, une plateforme de Cyber Threat Intelligence (CTI) nouvelle génération. Il est construit sur la base d'une analyse approfondie du marché, des concurrents et des capacités techniques actuelles du projet.

---

## 1. Propositions de Valeur (Value Propositions)
*Quelle valeur apportons-nous et quels problèmes résolvons-nous ?*

### 🛡️ Pour les équipes SOC & Analystes (Douleur : "Alert Fatigue" & "Data Overload")
*   **"Single Pane of Glass" Unifié :** Centralisation automatique de la collecte Multi-Sources (OSINT, Commercial, Dark Web, STIX/TAXII) pour éliminer le besoin de consulter 15 outils différents.
*   **Réduction du Bruit par l'IA :** Moteur de corrélation et de scoring qui réduit les faux positifs de ~80%, permettant aux analystes de se concentrer sur les menaces réelles (Signal vs Bruit).
*   **Enrichissement Automatisé :** Plus de copier-coller d'IPs dans VirusTotal. Tout IOC est enrichi instantanément à l'ingestion.

### 🏢 Pour les RSSI & Décideurs (Douleur : "Manque de Visibilité" & "Staffing Shortages")
*   **ROI et Efficacité Opérationnelle :** Automatisation des tâches manuelles (Playbooks SOAR) agissant comme un "multiplicateur de force" pour les équipes en sous-effectif.
*   **Protection de Marque proactive :** Détection et *Takedown* automatisé des menaces externes (Phishing, Faux profils réseaux sociaux) avant qu'elles n'impactent l'entreprise.
*   **Conformité "Out-of-the-box" :** Rapports automatisés alignés sur les standards (ISO, NIS2, DORA) et certifications intégrées (SOC2 Type II).

### 🚀 Facteurs Différenciants (Unfair Advantage)
*   **Approche Hybride (Produit + Service) :** Plateforme SaaS performante + Option "SOC Managé" pour les clients sans équipe dédiée (mentionné dans [ServicesSection](file:///c:/Users/bmd%20tech/Documents/AntStrike-CTI/AntStrike%20CTI/src/components/landing/ServicesSection.tsx#31-67)).
*   **UX/UI "Premium" & Moderne :** Interface inspirée des meilleurs standards B2C pour maximiser l'adoption par les analystes (souvent négligé par les concurrents legacy comme MISP).

---

## 2. Segments Clients (Customer Segments)
*Pour qui créons-nous de la valeur ?*

1.  **Entreprises de Taille Intermédiaire (ETI) / Mid-Market (Secteurs Critiques)**
    *   *Secteurs :* Finance, Santé, Juridique, Tech.
    *   *Profil :* Ont des données sensibles et une "Attack Surface" élevée, mais pas le budget pour un SOC de 20 personnes. Cherchent l'automatisation.
2.  **Managed Security Service Providers (MSSPs)**
    *   *Besoin :* Outil multi-tenant pour gérer la CTI de 50+ clients avec une seule équipe. Cherchent à revendre le service "Brand Protection" en marque blanche.
3.  **Grandes Entreprises (Enterprise)**
    *   *Besoin :* Capacités d'intégration API lourdes (SIEM/SOAR/EDR), Threat Hunting avancé, et Flux de données "Custom".
4.  **Secteur Public / Gouvernement**
    *   *Besoin :* Souveraineté des données, flux spécifiques, conformité stricte.

---

## 3. Canaux de Distribution (Channels)
*Comment atteignons-nous nos clients ?*

*   **Vente Directe (Inside Sales) :** Pour les contrats Enterprise et MSSP (Haute touche, démos personnalisées).
*   **Product-Led Growth (PLG) / Self-Service :** Essai gratuit de 14 jours (CTA "Démarrer l'Essai Gratuit" sur la Landing Page). Onboarding automatisé pour les petites équipes.
*   **Partenaires & Revendeurs :** Intégrateurs de cybersécurité qui incluent AntStrike dans leur offre de services managés.
*   **Marketplaces Cloud :** Présence sur AWS Marketplace, Azure Marketplace pour faciliter l'achat via les budgets cloud engagés ("Burn down cloud commit").

---

## 4. Relations Clients (Customer Relationships)
*Quel type de relation établissons-nous ?*

*   **Self-Service Automatisé :** Pour le segment Mid-Market/Starter. Documentation riche, Academy en ligne, Chatbot IA.
*   **Customer Success Manager (CSM) dédié :** Pour les comptes Enterprise/MSSP. Revues trimestrielles (QBR), aide à la création de Playbooks sur mesure.
*   **Communauté "Defenders" :** Création d'un espace communautaire (Discord/Slack privé) pour partager des TTPs et des signatures YARA entre clients (Effet réseau).

---

## 5. Flux de Revenus (Revenue Streams)
*Comment gagnons-nous de l'argent ?*

### 📦 Revenus Récurrents (ARR - SaaS)
*   **Tier Starter :** Accès plateforme, flux OSINT, 1 utilisateur.
*   **Tier Pro :** + Flux Commerciaux, Playbooks illimités, 5 utilisateurs.
*   **Tier Enterprise :** + Multi-tenant, API illimitée, SSO, Brand Protection Module.

### ➕ Add-ons & Modules
*   **Module Dark Web Monitoring :** Prix additionnel par domaine surveillé.
*   **Module "Takedown" :** Prix par action de suppression (Phishing/Social Media).
*   **API Quota Booster :** Pour les clients consommant énormément de données.

### 🛠️ Services (Non-Récurrent, ou Retainer)
*   **Incident Response Retainer :** Frais annuel pour garantir la disponibilité des experts en cas de crise.
*   **Onboarding Premium :** Configuration initiale, import historique, formation sur site.

---

## 6. Activités Clés (Key Activities)
*Que devons-nous faire pour que ça marche ?*

*   **Développement Produit continu :** Amélioration de l'UX, ajout de nouveaux connecteurs (Integrations), optimisation du moteur de graphe.
*   **Threat Research (R&D) :** Équipe interne qui chasse les menaces pour créer du contenu "propre" à AntStrike (Rapports exclusifs).
*   **Data Engineering :** Maintenance des pipelines d'ingestion de données (qualité, latence).
*   **Sales & Marketing :** Lead generation, présence aux conférences (FIC, BlackHay), contenu (Blog, Webinars).

---

## 7. Ressources Clés (Key Resources)
*De quoi avons-nous besoin ?*

*   **Plateforme Technologique :** Codebase (React/Node/Python), Infrastructure Cloud scalable.
*   **Données (The Fuel) :** Abonnements aux flux de données payants, accès aux forums Dark Web, Honeypots (T-Pot).
*   **Talents :** Développeurs Fullstack, Analystes CTI Seniors, Sales spécialisés Cyber.
*   **Réputation/Confiance :** Certifications (ISO 27001, SOC2), Preuve de concept.

---

## 8. Partenaires Clés (Key Partners)
*Qui nous aide ?*

*   **Fournisseurs de Données (Feed Providers) :** AlienVault, Spamhaus, CrowdStrike (OEM), GreyNoise.
*   **Partenaires Technologiques (Integrations) :** Splunk, Microsoft Sentinel, TheHive, Cortex XSOAR (pour s'intégrer dans l'écosystème client).
*   **Cloud Providers :** AWS/Azure/GCP (Hébergement et scalabilité).
*   **Associations Industrielles :** FIRST, ISACs (Pour le partage d'informations sectorielles).

---

## 9. Structure de Coûts (Cost Structure)
*Où part l'argent ?*

*   **Frais de Personnel (R&D + Sales) :** Le poste le plus lourd (60-70%). Salaires élevés dans la cyber.
*   **Infrastructure Cloud & Stockage :** Stocker des pétaoctets de logs et indexer les données (Elasticsearch/OpenSearch coûte cher).
*   **Licences de Données (COGS) :** Coût d'achat des flux commerciaux revendus ou intégrés.
*   **Coût d'Acquisition Client (CAC) :** Marketing, Commissions Sales.

---

# 🇸🇳 Stratégie Go-To-Market : Focus Sénégal & Afrique de l'Ouest
*Adaptation du modèle pour le marché local (Zone UEMOA).*

## 1. Segments Prioritaires Locaux
1.  **Fintechs & Mobile Money (Wave, Orange Money, Free Money) :**
    *   *Need :* Lutte contre la fraude transactionnelle (SIM Swap) et protection des données clients (Conformité CDP).
2.  **Banques & Microfinance (EMF) :**
    *   *Need :* Visibilité sur les menaces sans avoir un SOC interne de 10 personnes. Conformité BCEAO/Bâle.
3.  **Secteur Public (ADIE/Sénégal Numérique SA) :**
    *   *Need :* Souveraineté des données (Hébergement local ou Cloud souverain).
4.  **PME/PMI Digitalisées :**
    *   *Need :* Sécurité abordable, "Set and Forget".

## 2. Propositions de Valeur Adaptées
*   **"Conformité CDP Automatisée" :** Rapports pré-configurés pour les audits de la Commission de Protection des Données Personnelles.
*   **Support Local & Hybride :** Support technique disponible en Français et Wolof. Capacité d'intervention sur site à Dakar si nécessaire.
*   **Module "Mobile Money Fraud" :** Détections spécifiques aux schémas de fraude locaux (Arnaques SMS, Phishing ciblé Orange/Wave).

## 3. Modèle de Revenus (Pricing Local)
*   **Devise :** Tarification en **FCFA (XOF)** pour éviter les frictions de change.
*   **Pack "PME Cyber-Résilience" :** Offre packagée accessible (ex: 500.000 FCFA/mois) incluant la plateforme + monitoring léger.
*   **Paiement Flexible :** Acceptation des paiements trimestriels ou semestriels (l'annuel est parfois difficile pour la tréso des PME).

## 4. Stratégie de Partenariat Local
*   **Telcos (Orange, Free, Expresso) :** Proposer AntStrike comme un service VAS (Value Added Service) B2B pour leurs clients internet pro.
*   **Intégrateurs Locaux (ISS Afrique, CFAO, Expert IS) :** Ne pas vendre en direct mais via des revendeurs qui ont déjà la confiance des DSI locaux.
*   **Éducation :** Partenariat avec **ESMT / ESP** pour former des étudiants sur AntStrike (créer une future base d'utilisateurs).

## 5. Concurrents Locaux & Positionnement
*   *Concurrents :* Intégrateurs classiques vendant des solutions lourdes (ex: IBM QRadar, Splunk) souvent trop chères et complexes.
*   *Notre Avantage :* "Léger", Déploiement en 15 minutes, UX moderne, et prix adapté à la réalité économique locale.

