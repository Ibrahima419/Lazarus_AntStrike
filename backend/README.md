#  AntStrike CTI - Documentation Sécurité Backend

Ce document détaille les mesures techniques mises en œuvre pour garantir la sécurité du backend, des données et des communications.

---

## 1. Sécurisation de l'Application

### Authentification & Sessions
- **Technologie** : JWT (JSON Web Tokens) standard RFC 7519.
- **Rotation** : Access Token (durée courte : 15min) + Refresh Token (longue durée : 7j, stocké secure httpOnly).
- **Code** : Voir `src/middleware/auth.middleware.ts`

### Contrôle d'Accès (RBAC)
- **Middleware** : `src/middleware/rbac.middleware.ts`
- **Niveaux** : 
  - `CONFIG_VIEW`, `CONFIG_MANAGE` (Admin)
  - `THREAT_VIEW`, `THREAT_MANAGE` (Analyste)
- **Principe** : "Deny by default". Chaque route protégée doit explicitement lister les permissions requises.

### Protection Injections
- **SQL** : Utilisation exclusive de **Prisma ORM**. Aucune concaténation de chaînes SQL n'est autorisée. Les requêtes sont paramétrées automatiquement.
- **NoSQL / LDAP** : Non applicable (Tech stack relationnelle).
- **XSS** : Les entrées utilisateurs sont nettoyées et validées. Le frontend React échappe automatiquement les variables.

---

## 2. Sécurisation de la Base de Données

### Accès & Privilèges
- **Utilisateur Dédié** : L'application se connecte avec un utilisateur spécifique n'ayant accès qu'aux tables de l'application AntStrike.
- **Isolation Réseau** : Le port 5432 n'est pas exposé publiquement.
- **Mots de Passe** : Aucun mot de passe utilisateur n'est stocké en clair. Algorithme : **bcrypt** with salt.

### Données Sensibles
- Les clés API tierces (VirusTotal, etc.) sont stockées chiffrées en base ou injectées via variables d'environnement.
- Les backups sont chiffrés avant stockage.

---

## 3. Sécurisation API REST

### Configuration Serveur (`server.ts`)
- **Helmet** : Sécurisation des headers HTTP.
  - `Content-Security-Policy`: Restreint les sources de scripts.
  - `X-Frame-Options`: DENY (protection clickjacking).
  - `Strict-Transport-Security`: max-age=31536000 (HSTS).
- **CORS** : Configuration stricte des origines autorisées (Whitelisting).

### Rate Limiting
Protection contre les abus et DDoS applicatifs :
- **Limiteur** : `express-rate-limit`
- **Règle** : 100 requêtes / 15 minutes par IP.
- **Conséquence** : HTTP 429 Too Many Requests si dépassement.

### Validation (`Zod`)
Tout payload entrant (POST/PUT) est validé contre un schéma strict.
- Rejet des champs inconnus (Strip unknown).
- Validation des types et formats (email, uuid, minLength).

---

## 4. Sécurisation des Communications

### Chiffrement (Data in Transit)
- **HTTPS** : Obligatoire pour toute communication Client <-> Serveur.
- **TLS** : Version 1.2 ou 1.3 requise.
- **Certificats** : Gestion via Let's Encrypt ou certificats d'entreprise.

### Intégrité et Confidentialité
- Les payloads sensibles sont transmis uniquement dans le body (POST), jamais en query params (GET) pour éviter les logs proxy.
- Les erreurs API génériques sont retournées en Production pour éviter le *Leakage* d'informations d'infrastructure.

---

## ✅ Checklist de Vérification

| Mesure | Statut | Fichier / Config |
|--------|--------|------------------|
| Auth JWT | ✅ Actif | `auth.middleware.ts` |
| RBAC | ✅ Actif | `rbac.middleware.ts` |
| SQL Injection Proof | ✅ Actif | `Prisma Client` |
| Rate Limiting | ✅ Actif | `server.ts` |
| Headers Sécurité | ✅ Actif | `server.ts` (Helmet) |
| CORS Restrictif | ✅ Actif | `server.ts` |
| Validation Entrées | ✅ Actif | `*.controller.ts` (Zod) |
| Chiffrement DB | ✅ Infras | Config Provider |
| HTTPS | ✅ Infras | Reverse Proxy (Nginx/Traefik) |

---

**Contact Sécurité** : security@antstrike.io
En cas d'incident ou de vulnérabilité découverte, merci de nous contacter immédiatement.
