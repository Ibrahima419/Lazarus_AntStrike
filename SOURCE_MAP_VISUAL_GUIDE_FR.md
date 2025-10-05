# 🗺️ Source Intelligence Map - Guide Visuel

## 🎯 Pour l'Analyste SOC

Cette carte vous donne une **vision complète et en temps réel** de toutes vos sources OSINT, avec des métriques professionnelles pour optimiser votre monitoring.

---

## 📊 Tableau de Bord Principal

### **Avant** (Mock Data)
```
┌─────────────┬─────────────┬─────────────┐
│ Total: 45   │ Actives: 38 │ Alertes: 234│
├─────────────┼─────────────┼─────────────┤
│ Trust: 72%  │ Clusters: 5 │ Coverage: 68│
└─────────────┴─────────────┴─────────────┘
```

### **Après** (Données Réelles + Métriques Avancées)
```
┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ 🛡️ SANTÉ GLOBALE    │ ⚡ ALERTES 24H      │ 🎯 SOURCES FIABLES  │ ⏱️ RÉACTIVITÉ       │
│ ━━━━━━━━━━━━━━━━━━━ │ ━━━━━━━━━━━━━━━━━━━ │ ━━━━━━━━━━━━━━━━━━━ │ ━━━━━━━━━━━━━━━━━━━ │
│      87/100          │      1,247           │      34 / 45         │       2h             │
│   [GOOD 🟢]          │  ↑ +18% vs 7j        │  ⚠️ 3 sources faibles│  Temps moy collecte  │
│                      │  [HAUSSE 🔴]         │                      │                      │
├──────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ ⚡ QUALITÉ DONNÉES  │ 🌍 COUVERTURE       │ 📈 DÉBIT            │ ⚠️ ALERTES SYSTÈME  │
│ ━━━━━━━━━━━━━━━━━━━ │ ━━━━━━━━━━━━━━━━━━━ │ ━━━━━━━━━━━━━━━━━━━ │ ━━━━━━━━━━━━━━━━━━━ │
│      82%             │      75%             │      52/h            │       2              │
│ ████████████████░░░░ │  Diversité sources   │  Pic: 14:00          │  Sources obsolètes   │
│   [EXCELLENT 🟢]     │  [BON 🟡]            │                      │  (>48h) [ATTENTION]  │
└──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

---

## 🎨 Codes Couleurs SOC

### Santé Globale
- 🟢 **90-100** : EXCELLENT - Système optimal, monitoring proactif
- 🔵 **75-89** : GOOD - Fonctionnement normal, léger monitoring
- 🟡 **60-74** : WARNING - Attention requise, investiguer causes
- 🔴 **0-59** : CRITICAL - Action immédiate, sources défaillantes

### Trust Score Sources
- 🟢 **70-100** : Fiable (haute confiance)
- 🟡 **50-69** : Moyen (vérification recommandée)
- 🟠 **30-49** : Faible (attention requise)
- 🔴 **0-29** : Très faible (revoir configuration)

### Tendances Alertes
- 🔴 **↑ +X%** : Hausse (possible incident, investiguer)
- 🟢 **↓ -X%** : Baisse (retour normal, bon signe)
- ⚪ **→ Stable** : Normal (situation contrôlée)

---

## 🗺️ Vues Disponibles

### 1. 🌌 **Galaxy View** (Vue Univers)
Visualisation type "système solaire" avec force gravitationnelle.

```
             ┌───────────┐
         ╱   │  Cluster  │   ╲
      ●      │  Threat   │      ●
   Source    │  Intel    │   Source
      ●      │  (Hub)    │      ●
         ╲   └───────────┘   ╱
             
    ● Trust ≥ 70 (vert)
    ● Trust 50-69 (jaune)
    ● Trust < 50 (rouge)
    
    Taille ∝ Nombre d'alertes
    Pulsation ∝ Activité
```

**Usage Analyste** :
- Sources isolées → Problème de clustering
- Gros clusters rouges → Sources peu fiables à investiguer
- Pulsations rapides → Activité élevée (pic)

---

### 2. 🌍 **Geographic View** (Vue Géographique)
Carte mondiale avec marqueurs par pays.

```
     🌐 Monde Entier
     
  🔴 USA (234 alertes)
     └─ CISA, US-CERT, NSA Advisories
  
  🟠 UK (87 alertes)
     └─ NCSC, NCA, GCHQ
     
  🟡 France (45 alertes)
     └─ ANSSI, CERT-FR
     
  🟢 Allemagne (23 alertes)
     └─ BSI, CERT-Bund
```

**Géolocalisation Intelligente** :
- ✅ Détection TLD (.fr, .uk, .de...)
- ✅ Extraction URL (cisa.gov → USA)
- ✅ Mots-clés (ncsc → UK, anssi → France)
- ✅ 150+ pays supportés

**Usage Analyste** :
- Identifier régions actives
- Détecter campagnes géo-ciblées
- Vérifier couverture mondiale

---

### 3. 🕸️ **Network Graph** (Vue Réseau)
Relations hiérarchiques entre clusters et sources.

```
                 [Root]
                   │
        ┌──────────┼──────────┐
        │          │          │
   [Threat    [Social   [Technical
    Intel]     Media]    Feeds]
        │          │          │
    ┌───┼───┐  ┌───┼───┐  ┌───┼───┐
   RSS API WEB TW FB LI  EM DB CSV
```

**Usage Analyste** :
- Comprendre architecture sources
- Identifier dépendances
- Optimiser groupements

---

### 4. 🔥 **Heatmap View** (Vue Chaleur)
Activité temporelle sur 24h.

```
00h ░░░░░░░░
04h ░░░░░░░░
08h ████░░░░  ← Début activité
12h ██████░░  ← Pic matin
14h ████████  ← Pic absolu ⚡
16h ██████░░
20h ████░░░░
23h ░░░░░░░░
```

**Usage Analyste** :
- Identifier heures de pic
- Planifier analyses manuelles
- Détecter comportements anormaux

---

## 🎯 Workflows Analyste SOC

### 🔍 **Workflow 1 : Monitoring Quotidien**

```
1. Ouvrir "Source Intelligence Map"
2. Vérifier SANTÉ GLOBALE
   └─ < 60 ? → Investiguer (Workflow 3)
   └─ ≥ 60 ? → Continuer monitoring
3. Checker ALERTES 24H
   └─ Hausse > 20% ? → Possibles incidents (Workflow 2)
   └─ Stable ? → Situation normale
4. Contrôler SOURCES FIABLES
   └─ Sources faibles détectées ? → Audit (Workflow 4)
5. Fin ✅
```

---

### 🚨 **Workflow 2 : Réponse Incident**

```
Déclencheur: Hausse alertes > 20%

1. Basculer sur "Geographic View"
2. Identifier pays à forte activité
   └─ Concentration géographique ? → Campagne ciblée
3. Basculer sur "Heatmap View"
   └─ Pic horaire inhabituel ? → Attaque programmée
4. Examiner sources concernées
   └─ Trust Score élevé ? → Alerte légitime (haute confiance)
   └─ Trust Score faible ? → Possible faux positif
5. Corréler avec autres dashboards CTI
6. Déclencher investigation complète
```

---

### ⚠️ **Workflow 3 : Audit Santé Système**

```
Déclencheur: Santé < 60

1. Checker composantes du score :
   ├─ Qualité Données < 60 ? → Problème collecte
   ├─ Couverture < 60 ? → Sources manquantes
   ├─ Fiabilité < 60 ? → Sources obsolètes
   └─ Trust moyen < 60 ? → Reconfiguration nécessaire

2. Ouvrir panneau "Performance"
   └─ Identifier "Bottom Performers"

3. Pour chaque source faible :
   ├─ Vérifier configuration Taranis
   ├─ Tester connectivité
   ├─ Revoir schedule collecte
   └─ Désactiver si défaillante

4. Recalculer santé
   └─ Amélioration ? → OK ✅
   └─ Toujours faible ? → Escalade admin
```

---

### 🔧 **Workflow 4 : Optimisation Sources**

```
Objectif: Maximiser couverture + qualité

1. Analyser "Couverture" actuelle
   └─ < 70% ? → Ajouter sources

2. Geographic View → Régions manquantes ?
   └─ Ajouter feeds locaux (CERT régionaux)

3. Vérifier "Sources Obsolètes"
   └─ > 48h sans collecte → Investiguer
   
4. Pour sources Trust < 50 :
   ├─ Historique fiable ? → Améliorer config
   └─ Historique bruyant ? → Désactiver

5. Viser objectifs :
   ├─ Santé Globale > 85
   ├─ Couverture > 80%
   ├─ Sources Fiables > 80%
   └─ Qualité Données > 75%
```

---

## 📈 KPIs à Surveiller

### Critiques (Quotidien)

| Métrique | Seuil OK | Seuil WARNING | Seuil CRITICAL | Action |
|----------|----------|---------------|----------------|--------|
| **Santé Globale** | ≥ 75 | 60-74 | < 60 | Audit complet |
| **Alertes 24h Trend** | ±10% | ±20% | > ±30% | Investigation |
| **Sources Fiables** | ≥ 80% | 60-79% | < 60% | Reconfiguration |
| **Sources Obsolètes** | 0 | 1-3 | > 3 | Redémarrer collectors |

### Importants (Hebdomadaire)

| Métrique | Objectif | Action si < objectif |
|----------|----------|---------------------|
| **Qualité Données** | ≥ 80% | Nettoyer sources bruyantes |
| **Couverture** | ≥ 75% | Ajouter feeds manquants |
| **Débit moyen** | Stable | Investiguer variations |
| **Temps collecte** | < 4h | Optimiser schedule |

---

## 🌟 Fonctionnalités Clés

### ✅ Déjà Implémenté

- ✅ **Auto-refresh** 30s (toggle ON/OFF)
- ✅ **Refresh manuel** (bouton)
- ✅ **4 vues interactives** (Galaxy, Geo, Network, Heatmap)
- ✅ **Sélection source** (détails dans panneau)
- ✅ **Métriques temps réel** (8 cartes avancées)
- ✅ **Trust scoring** (5 facteurs pondérés)
- ✅ **Géolocalisation** (150+ pays)
- ✅ **Clustering intelligent** (par type/groupe)
- ✅ **Performance panel** (top/bottom sources)

### 🔜 À Venir (Roadmap)

- 🔜 **Filters** (par région, type, trust, etc.)
- 🔜 **Export PDF/CSV** des métriques
- 🔜 **Alertes automatiques** (email/Slack si santé < seuil)
- 🔜 **Historique trends** (graphiques 7/30 jours)
- 🔜 **Comparaison sources** (side-by-side)
- 🔜 **Recommandations IA** (optimisation auto)
- 🔜 **MaxMind integration** (géoloc IP réelle)

---

## 🎓 Exemples Concrets

### Exemple 1 : Détection Campagne APT

```
Symptômes:
├─ Alertes 24h: +45% (🔴 hausse critique)
├─ Geographic View: Concentration Asie-Pacifique
├─ Sources fiables: CISA, Mandiant, CrowdStrike (Trust > 90)
└─ Heatmap: Pic activité 03:00 UTC (heure nuit locale)

Analyse:
→ Campagne APT28 ciblant organisations gouvernementales
→ Sources hautement fiables (⚠️ alerte légitime)
→ Pic nocturne inhabituel (⚠️ activité coordonnée)

Action:
→ Escalade niveau 3
→ Activation cellule de crise
→ Monitoring renforcé sources Asie
```

---

### Exemple 2 : Faux Positif Source Bruyante

```
Symptômes:
├─ Alertes 24h: +120% (🔴 hausse extrême)
├─ Santé globale: 78 → 54 (🟡 → 🔴 dégradation)
├─ Sources fiables: -8 sources
└─ Source "Twitter Threat Feed": Trust 12 (🔴 très faible)

Analyse:
→ Source Twitter mal configurée (spam, bots)
→ Génère 80% des alertes (bruit)
→ Dégrade métriques globales

Action:
→ Désactiver "Twitter Threat Feed"
→ Recalcul: Santé → 84 (✅ retour normal)
→ Remplacer par feed Twitter certifié
```

---

### Exemple 3 : Gap Couverture Régionale

```
Symptômes:
├─ Couverture: 62% (🟡 sous objectif)
├─ Geographic View: Afrique/LatAm peu couvertes
├─ Sources: 90% USA/Europe
└─ Incident récent LatAm non détecté

Analyse:
→ Biais géographique Nord-Américain/Européen
→ Gap visibilité Amérique du Sud + Afrique
→ Risque manquer campagnes régionales

Action:
→ Ajouter CERT-BR (Brésil)
→ Ajouter AfricaCERT
→ Ajouter feeds LATAM (Mexico, Argentina)
→ Objectif: Couverture > 85%
```

---

## 🔒 Sécurité & Confidentialité

### Données Affichées

- ✅ **Métadonnées uniquement** (pas de contenu sensible)
- ✅ **Agrégations** (pas de données individuelles)
- ✅ **Sources publiques** (OSINT seulement)
- ✅ **Aucun PII** (Personal Identifiable Information)

### Contrôle Accès

- 🔒 **Role-based access** (admin Taranis)
- 🔒 **Logs audit** (toutes interactions)
- 🔒 **Session timeout** (auto-logout)

---

## 📞 Support

### En Cas de Problème

1. **Santé < 60** 
   → Suivre Workflow 3 (Audit Santé)

2. **Sources obsolètes > 5**
   → Vérifier collectors Taranis (redémarrer si besoin)

3. **Données incohérentes**
   → Bouton "Refresh" (force reload)

4. **Carte ne charge pas**
   → Vérifier API Taranis accessible
   → Console navigateur (F12) pour erreurs

### Logs Utiles

```bash
# Logs Taranis collectors
docker logs taranis-collector

# Logs Taranis core
docker logs taranis-core

# Statut services
curl http://localhost:8080/api/isalive
```

---

## 🎯 Checklist Analyste

### ☀️ **Matin (Début de Shift)**

- [ ] Vérifier Santé Globale ≥ 75
- [ ] Checker Alertes 24h (tendance)
- [ ] Confirmer 0 sources obsolètes
- [ ] Valider couverture ≥ 75%
- [ ] Lire top 5 alertes récentes

### 🌆 **Mi-Journée (Check Intermédiaire)**

- [ ] Refresh manuel données
- [ ] Vérifier pic activité heatmap
- [ ] Comparer volume vs matin
- [ ] Investiguer anomalies détectées

### 🌙 **Soir (Fin de Shift)**

- [ ] Rapport métriques journée
- [ ] Noter incidents/anomalies
- [ ] Vérifier santé avant départ
- [ ] Handover équipe nuit

### 📅 **Hebdomadaire**

- [ ] Audit complet sources (trust, qualité)
- [ ] Optimisation clustering
- [ ] Revue gaps couverture
- [ ] Ajustement seuils alertes

---

**🎉 Félicitations ! Vous disposez maintenant d'une carte intelligence de sources de niveau enterprise.**

**Questions ?** Consultez `SOURCE_MAP_UPGRADE_COMPLETE.md` pour détails techniques.

---

**Version** : 2.0.0  
**Date** : 2024-10-01  
**Auteur** : AI Assistant

