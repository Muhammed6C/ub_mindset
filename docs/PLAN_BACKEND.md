# Plan d'implémentation — Backend & Administration — UB Mindset

> **Objet :** feuille de route détaillée du backend (API Laravel) et de l'interface d'administration, incluant les **exigences de sécurité** à respecter.
> **Stack cible :** Laravel 13 · PHP 8.3+ · PostgreSQL 16 · Sanctum · Docker (Compose).
> **Frontend :** React 19 / Vite (SPA) — consommera l'API.
> **Statut :** document de planification (à valider avant implémentation).

---

## 0. Contexte et état actuel

**Ce qui existe déjà**
- API REST publique en lecture : `GET /api/health`, `/api/categories`, `/api/categories/{slug}`, `/api/products`, `/api/products/{id}`, `POST /api/orders`, `GET /api/orders/{orderNumber}`, `GET /api/user` (protégé Sanctum).
- Modèles : `User`, `Category`, `Product`, `ProductVariant`, `Order`, `OrderItem`.
- Migrations : `users`, `cache`, `jobs`, `personal_access_tokens`, `categories`, `products`, `product_variants`, `orders`, `order_items`.
- Seeder : 1 admin + 2 catégories + 6 produits + variantes (stock 50).
- Docker : `docker-entrypoint.sh` → attente Postgres → `migrate` → `db:seed` → serveur `:8000`.

**Ce qui MANQUE (constat)**
- ❌ Aucune notion de **rôle admin** (`users` n'a pas de colonne `role`).
- ❌ **Aucune interface d'administration**, aucune route protégée.
- ❌ Contenus éditoriaux **en dur** dans le front (`config/collection.js`, `lookbook.js`, `ourStory.js`, `footer.js`, `tryOn.js`).
- ❌ Frais de port **codés en dur** dans `OrderController` (3000, gratuit > 50000).
- ❌ Champs catalogue manquants : `subtitle`, `tag`, `original_price`, `position`, galerie multi-images.
- ❌ Pas de gestion de **stock / promotions / livraison / paramètres**.
- ❌ Le **frontend ne consomme pas l'API** (client Axios présent mais inutilisé).
- ❌ Pas d'assets 3D (`garments` / GLB) ni de grille des tailles.

---

## 1. Objectifs

1. Un **back-office complet** pour piloter catalogue, commandes, contenus et essayage 3D **sans toucher au code**.
2. Une **API REST** consommée par le frontend (produits, catégories, commandes, pages).
3. Une **sécurité de niveau production** : authentification, autorisation, validation, protections OWASP.
4. Une architecture **évolutive** (paiements, multidevise, réutilisation du système d'avatar sur tout le catalogue).

---

## 2. Principes d'architecture

- **API-first** : front React et admin consomment la même API.
- **Séparation des responsabilités** : Contrôleurs minces → `FormRequest` (validation) → `Service` (logique métier) → `Model`.
- **Deny by default** : tout est interdit sauf ce qui est explicitement autorisé.
- **Moindre privilège** : comptes DB, comptes admin et tokens avec droits minimaux.
- **Tout est data-driven** : plus de contenu ni de règle métier en dur dans le front.
- **Traçabilité** : journalisation des actions sensibles (audit).

---

## 3. Architecture cible

```
                 ┌────────────────────────┐
   Navigateur ──►│  Frontend React (Vite) │──┐
                 └────────────────────────┘  │  HTTPS / JSON
                 ┌────────────────────────┐  │
   Navigateur ──►│  Admin (Filament)      │──┤
                 └────────────────────────┘  │
                                             ▼
                                   ┌───────────────────┐
                                   │  API Laravel 13    │
                                   │  (Sanctum + RBAC)  │
                                   └─────────┬─────────┘
                                             │
                             ┌───────────────┼────────────────┐
                             ▼               ▼                ▼
                      ┌───────────┐   ┌────────────┐   ┌─────────────┐
                      │PostgreSQL │   │ Storage    │   │ File/Redis  │
                      │   16      │   │ (media/GLB)│   │ cache/queue │
                      └───────────┘   └────────────┘   └─────────────┘
```

**Couches backend**
```
app/
├─ Http/
│  ├─ Controllers/Api/…        (endpoints publics — réponses = API Resources)
│  ├─ Controllers/Admin/…      (endpoints admin protégés)
│  ├─ Requests/…               (FormRequest : validation + autorisation)
│  ├─ Middleware/…             (SecurityHeaders, EnsureIsAdmin, ForceHttps)
│  └─ Resources/…              (ProductResource, OrderResource…)
├─ Models/…                    (Eloquent + relations + casts)
├─ Policies/…                  (autorisation fine par ressource)
└─ Services/…                  (OrderService, InventoryService, MediaService…)
```

---

## 4. Roadmap par phases

| Phase | Contenu | Objectif |
|---|---|---|
| **A — Socle** | Rôles + auth admin, CRUD Catalogue (catégories, produits, variantes, photos, stock), Commandes + statuts, Réglages (WhatsApp/frais/devise) | Rendre le site administrable |
| **B — Contenu & vente** | CMS (pages, lookbook, blog, bannières), Clients, Promotions, Livraison (zones/seuils), Médias | Piloter la vitrine et les ventes |
| **C — Différenciateur** | Essayage 3D (`garments`/GLB, zones, morph, grille des tailles), Analytics, multidevise/langue | Réutiliser l'avatar sur tout le catalogue |
| **D — Durcissement** | Audit log, monitoring, sauvegardes, tests de sécurité, WAF | Passer en production sereinement |

> **Sécurité** : appliquée **dès la phase A** (voir §9), pas en fin de projet.

## 5. Modèle de données

### 5.1 Tables existantes (conservées telles quelles)
`users`, `categories`, `products`, `product_variants`, `orders`, `order_items` (+ tables techniques `personal_access_tokens`, `sessions`, `cache`, `jobs`, `password_reset_tokens`).

### 5.2 Colonnes à ajouter aux tables existantes
| Table | Colonne | Type | Rôle |
|---|---|---|---|
| `users` | `role` | string, défaut `customer` | `customer` \| `admin` \| `staff` |
| `users` | `is_active` | boolean, défaut `true` | Suspension de compte |
| `users` | `last_login_at` | timestamp nullable | Suivi connexions |
| `categories` | `parent_id` | FK nullable (self) | Hiérarchie |
| `categories` | `position` | integer, défaut 0 | Ordre d'affichage |
| `categories` | `is_active` | boolean, défaut `true` | Visibilité |
| `categories` | `meta_title` / `meta_description` | string/text nullable | SEO |
| `products` | `subtitle` | string nullable | Sous-titre (déjà dans le front) |
| `products` | `tag` | string nullable | « NOUVEAU », « PROMO »… |
| `products` | `original_price` | decimal(12,2) nullable | Prix barré / promo |
| `products` | `weight` | decimal(8,3) nullable | Calcul du port |
| `products` | `position` | integer, défaut 0 | Ordre dans le rail |
| `products` | `is_featured` | boolean, défaut `false` | Mise en avant |
| `products` | `meta_title` / `meta_description` | string/text nullable | SEO |
| `product_variants` | `barcode` | string nullable | EAN/code-barres |
| `orders` | `shipping_method` | string nullable | Méthode choisie |
| `orders` | `tracking_number` | string nullable | Suivi transporteur |

### 5.3 Nouvelles tables
| Table | Champs clés | Rôle |
|---|---|---|
| `product_images` | product_id, path, alt, position | Galerie multi-images |
| `media` | disk, path, mime, size, width, height, created_by | Bibliothèque d'uploads centralisée |
| `promotions` | name, code, type(`percent`\|`fixed`), value, starts_at, ends_at, is_active | Codes promo / remises |
| `shipping_zones` | name, country, city, cost, free_over | Frais de port pilotables |
| `stock_movements` | product_variant_id, type(`in`\|`out`\|`adjust`), quantity, reason, user_id | Historique & alertes de stock |
| `pages` | slug, title, sections(json), is_published | CMS (Notre Histoire, etc.) |
| `lookbook_scenes` | position, title, product_id, image, destination | Lookbook |
| `articles` | slug, title, excerpt, body, cover, published_at | Blog |
| `settings` | key(unique), value(json) | WhatsApp, réseaux, devise, seuils, SEO global |
| `activity_log` | user_id, action, subject_type, subject_id, changes(json), ip | Audit admin |

**Tables Phase C (essayage 3D)**
| Table | Champs clés | Rôle |
|---|---|---|
| `garments` | product_id, name, zone(`haut`\|`bas`\|`veste`) | Vêtement 3D lié au produit |
| `garment_assets` | garment_id, disk, path, kind(`glb`\|`texture`\|`pose`) | Fichiers 3D |
| `garment_fit` | garment_id, morph_map(json), anchors(json) | Mapping morph targets / ancrages |
| `size_charts` | product_id/category_id, label, rules(json) | Grille des tailles (mensurations → taille) |
| `body_profiles` | user_id, height_cm, weight_kg, morphology | Profils corporels (⚠️ RGPD) |

### 5.4 Migrations à créer (dans l'ordre)
1. `add_role_and_fields_to_users_table`
2. `add_fields_to_categories_table`
3. `add_fields_to_products_table`
4. `add_barcode_to_product_variants_table`
5. `add_shipping_and_tracking_to_orders_table`
6. `create_product_images_table`
7. `create_media_table`
8. `create_promotions_table` (+ pivot `product_promotion`)
9. `create_shipping_zones_table`
10. `create_stock_movements_table`
11. `create_pages_table`
12. `create_lookbook_scenes_table`
13. `create_articles_table`
14. `create_settings_table`
15. `create_activity_log_table`
16. **(Phase C)** `create_garments_table`, `create_garment_assets_table`, `create_garment_fit_table`, `create_size_charts_table`, `create_body_profiles_table`

---

## 6. API (endpoints)

### 6.1 Endpoints publics (lecture)
```
GET  /api/health
GET  /api/categories                → catégories actives + nb produits
GET  /api/categories/{slug}         → catégorie + produits
GET  /api/products                  → filtres: category, search, sort, per_page (validation stricte)
GET  /api/products/{id}             → fiche + variantes + images
GET  /api/pages/{slug}              → page CMS publiée
GET  /api/lookbook                  → scènes du lookbook
GET  /api/articles                  → blog (paginé)
GET  /api/settings/public           → sous-ensemble public (WhatsApp, réseaux, devise)
POST /api/orders                    → création commande (validée, taux limité)
GET  /api/orders/{orderNumber}      → suivi (⚠️ protégé par jeton de suivi, voir §9)
```

### 6.2 Endpoints admin (protégés : `auth:sanctum` + `admin`)
```
POST   /api/admin/products              GET /api/admin/products
PUT    /api/admin/products/{id}         DELETE /api/admin/products/{id}
POST   /api/admin/products/{id}/images  DELETE /api/admin/images/{id}
… CRUD identiques pour categories, variants, promotions, shipping_zones,
   pages, lookbook_scenes, articles, settings, media, users
POST   /api/admin/orders/{id}/status    → changement de statut (validé + journalisé)
POST   /api/admin/stock/adjust          → mouvement de stock
GET    /api/admin/dashboard             → KPI (CA, commandes, stock bas)
```

> **Règle** : chaque réponse passe par des **API Resources** (jamais les modèles bruts) pour ne jamais exposer de champs sensibles (voir §9.19).

## 7. Interface d'administration (modules)

| # | Module | Fonctions |
|---|---|---|
| 1 | **Auth admin** | Login sécurisé, 2FA (recommandé), gestion de session |
| 2 | **Dashboard** | CA, commandes du jour, top produits, stock bas, nouveaux clients |
| 3 | **Catégories** | CRUD, hiérarchie, ordre (`position`), activation, SEO |
| 4 | **Produits** | CRUD, prix/promo, tags, sous-titre, galerie images, SEO, position, featured |
| 5 | **Variantes** | Tailles/couleurs, SKU, code-barres, prix, **stock** |
| 6 | **Stock** | Ajustements, historique (`stock_movements`), alertes seuil |
| 7 | **Commandes** | Liste + filtres, détail, **workflow de statut**, paiement, note, export |
| 8 | **Clients** | Fiches, adresses, historique d'achats |
| 9 | **Contenus (CMS)** | Pages, Lookbook, Blog, bannières d'accueil, footer |
| 10 | **Promotions** | Codes promo, remises (% / montant), périodes |
| 11 | **Livraison** | Zones, frais, seuil de gratuité |
| 12 | **Médias** | Upload et réutilisation d'images/vidéos/GLB |
| 13 | **Réglages** | WhatsApp, réseaux, devise, SEO global, seuils |
| 14 | **Utilisateurs & rôles** | Comptes admin/staff, permissions |
| 15 | **Essayage 3D** *(Phase C)* | Associer GLB à un produit, zones, morph, grille des tailles |
| 16 | **Audit** *(Phase D)* | Journal des actions sensibles |

---

## 8. Intégration frontend

1. Remplacer la lecture de `src/config/collection.js` par des appels API (`GET /api/products`, `/api/categories`).
2. Le client `src/services/api.js` existe déjà (Axios) → à **brancher** réellement (états `loading`/`error`, cache).
3. Mapper les nouveaux champs (`subtitle`, `tag`, `original_price`, `images[]`, `position`).
4. Envoyer le panier vers `POST /api/orders` (le front calcule un **aperçu**, mais le **montant final est recalculé côté serveur**).
5. Les contenus (lookbook, notre histoire, blog, footer) proviennent de l'API au lieu du `config/`.

---

## 9. Sécurité — exigences OBLIGATOIRES

> Principe directeur : **ne jamais faire confiance au client**, *deny by default*, **moindre privilège**, et validation **côté serveur** systématique. La sécurité s'applique **dès la Phase A**.

### 9.1 Correspondance OWASP Top 10 (2021)

| Risque OWASP | Mesures dans ce projet |
|---|---|
| A01 Broken Access Control | Rôles + Policies, `authorize()`, deny-by-default (§9.3, §9.18) |
| A02 Cryptographic Failures | HTTPS/HSTS, Argon2id/bcrypt, secrets hors code (§9.2, §9.11, §9.12) |
| A03 Injection | Eloquent/requêtes liées, validation, escapement Blade/React (§9.8, §9.4) |
| A04 Insecure Design | Workflows serveur, anti-IDOR, limite de tentatives (§9.3, §9.10) |
| A05 Security Misconfiguration | `APP_DEBUG=false`, headers, Docker non-root (§9.12, §9.13, §9.17) |
| A06 Vulnerable Components | `composer audit` + `npm audit` en CI (§9.16) |
| A07 Auth Failures | Rate limit login, verrouillage, 2FA, sessions sûres (§9.2, §9.10) |
| A08 Integrity Failures | Intégrité webhooks paiement, signature, uploads validés (§9.15, §9.9) |
| A09 Logging Failures | Audit log + alerting (§9.14, §9.21) |
| A10 SSRF | Whitelist d'URL, jamais d'URL utilisateur brute (§9.18) |

### 9.2 Authentification
- **Mots de passe hachés** : `Hash::make()` (Argon2id ou bcrypt). **Jamais** de mot de passe en clair, jamais de hash réversible.
- **Sanctum** pour l'API : tokens avec **expiration**, **abilities/scopes** minimales, révocation.
- **Rate limiting** sur `/login` et endpoints sensibles : `throttle:5,1` + verrouillage progressif après N échecs.
- **Sessions** (admin Blade) : régénérer l'ID après login (`session()->regenerate()`), `secure`, `httpOnly`, `SameSite=Lax/Strict`, expiration.
- **2FA** recommandée pour les comptes admin (TOTP).
- Ne jamais révéler si l'email existe (« identifiants invalides » générique).

### 9.3 Autorisation (contrôle d'accès)
- Colonne `users.role` (+ éventuellement table `roles`/`permissions`) et **middleware `EnsureIsAdmin`**.
- **Policies Laravel** pour chaque ressource → `$this->authorize('update', $product)` dans chaque action.
- **Deny by default** : route non protégée = interdite.
- **Anti-IDOR** : vérifier que l'utilisateur a le droit **sur l'objet précis** (pas seulement « est connecté »).
- Un client **ne peut jamais** lire/modifier les objets d'un autre (adresses, commandes, profils).

### 9.4 Validation & protection contre l'over-posting
- **`FormRequest`** obligatoire sur **toutes** les entrées (création, mise à jour, filtres, uploads).
- Règles strictes : `integer`, `exists:`, `in:`, `max:`, `regex`, `email:rfc,dns`, `numeric|min:0`.
- **Mass assignment** : `$fillable` explicite, **jamais** `$guarded = []`.
- ⚠️ **Ne jamais accepter du client** : `role`, `is_admin`, `is_active`, `price`, `total`, `stock`, `user_id` → ces champs sont **forcés/calculés côté serveur**.
- Normaliser/valider les champs de tri et `per_page` (whitelist) pour éviter l'abus.

### 9.5 Protection XSS & échappement
- **Blade** : échappement automatique via `{{ }}` ; **jamais** `{!! !!}` avec des données utilisateur.
- **React** : échappe par défaut ; **éviter** `dangerouslySetInnerHTML` (sinon contenu déjà assaini).
- **HTML riche (CMS)** : assainir via whitelist (HTMLPurifier côté serveur, DOMPurify côté client).
- Servir les fichiers avec un `Content-Type` correct ; **ne jamais** servir un fichier uploadé en `text/html`.
- Ajouter une **CSP** stricte (§9.13) comme filet de sécurité.

### 9.6 CSRF
- Garder le middleware `VerifyCsrfToken` **actif** sur les routes web/session ; **ne jamais** le désactiver globalement.
- Pour une SPA à cookies : `Sanctum` (cookie de session + `XSRF-TOKEN`) et envoi de l'en-tête `X-XSRF-TOKEN`.
- Cookies de session en `SameSite=Lax` (ou `Strict`) + `Secure` + `HttpOnly`.

### 9.7 CORS
- `config/cors.php` : `allowed_origins` = **liste explicite** (jamais `*` en prod), `allowed_methods`/`allowed_headers` limités.
- **Interdit** : `supports_credentials = true` combiné à `allowed_origins = ['*']`.
- Répondre aux `OPTIONS` (preflight) sans exposer d'information.

### 9.8 Injection (SQL, commande, XXE)
- Toujours utiliser **Eloquent / Query Builder avec bindings** ; **jamais** de concaténation de SQL.
- **`DB::raw()`** uniquement avec paramètres liés, jamais d'entrée utilisateur brute.
- **Aucune** exécution de commande système (`exec`, `shell_exec`) à partir d'entrées utilisateur.
- Désactiver les **entités XML externes** (protection **XXE**) ; préférer JSON.
- Valider strictement et typer les entrées (§9.4) : première ligne de défense.

### 9.9 Uploads de fichiers (images, GLB, médias)
- **Whitelist** d'extensions + **vérification MIME réelle** (`finfo`), pas seulement l'extension.
- **Taille maximale** : images ~5 Mo, GLB ~25 Mo (limites PHP `upload_max_filesize` + règle de validation).
- **Renommer** les fichiers (UUID) et les stocker **hors racine web** (`storage/app/...`), servis via route/contrôleur ou URL signée.
- Interdire l'exécution dans le dossier d'upload (pas de `.php`), vérifier les **magic bytes** (`glTF` pour GLB).
- Supprimer/neutraliser les métadonnées (EXIF) si exposées ; ne jamais se fier au nom d'origine.

### 9.10 Rate limiting & anti-abus
- `throttle` sur : `login`, `register`, `POST /orders`, `search`, `uploads`, endpoints sensibles.
- Limiteurs nommés par **IP + utilisateur** ; en-têtes `Retry-After` / `429`.
- Plafonner `per_page` (ex. max 60) et la profondeur de tri ; rejeter les valeurs non whitelistées.
- Anti-spam commandes (honeypot / captcha léger si nécessaire).

### 9.11 HTTPS, TLS, cookies & chiffrement en transit
- **HTTPS obligatoire** : redirection HTTP→HTTPS + **HSTS** (`max-age`, `includeSubDomains`, `preload`).
- TLS 1.2+ uniquement ; suites robustes ; certificats valides et renouvelés.
- Cookies : `Secure`, `HttpOnly`, `SameSite` ; `APP_KEY` unique et **secret**.
- Chiffrer les données sensibles au repos si nécessaire (colonnes sensibles, sauvegardes).

### 9.12 Gestion des secrets & configuration
- `.env` **jamais commité** (déjà dans `.gitignore`) ; `.env.example` **sans** secret réel.
- Production : `APP_ENV=production`, **`APP_DEBUG=false`** (ne jamais fuiter de stack trace).
- **Rotation** régulière des clés/tokens ; séparer les secrets par environnement.
- Dans Docker : secrets via variables d'environnement / *secrets*, **jamais** dans l'image ; `.dockerignore` exclut `.env`.

### 9.13 En-têtes de sécurité & durcissement
- **Middleware `SecurityHeaders`** ajoutant :
  - `Content-Security-Policy` : `default-src 'self'` ; sources scripts/styles/fonts contrôlées ; **pas d'inline** non maîtrisé ; `frame-ancestors 'none'`.
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (anti-**clickjacking**)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (caméra/micro/géoloc restreints)
  - `Strict-Transport-Security` (HSTS)
- Retirer les en-têtes révélateurs (`Server`, `X-Powered-By`).
- **Bloquer l'accès web** à `/.env`, `/.git`, `/storage`, `/backup`, `/vendor` (config serveur/Nginx).
- Désactiver le **listing de répertoires** et les méthodes HTTP inutiles (`TRACE`, `PUT` sur routes non prévues).

### 9.14 Erreurs, logs & audit
- Production : `APP_DEBUG=false` → **pages d'erreur génériques** (aucune stack trace, aucun chemin interne).
- **Ne jamais** journaliser de secrets, mots de passe ou tokens.
- Canon de logs dédié + rotation ; ne pas exposer les détails d'erreur via l'API.
- **Audit log** (`activity_log`) des actions admin sensibles : qui / quoi / quand / IP.
- **Alertes** sur événements critiques : échecs de login répétés, erreurs 5xx, changement de rôle, grosse commande.

### 9.15 Paiements & webhooks (Wave / Orange Money / carte)
- **Ne jamais stocker de numéro de carte** (PCI-DSS) → passer par un prestataire (redirection/SDK).
- Vérifier la **signature HMAC** des **webhooks** + IP source + **idempotence** (clé d'événement unique).
- Confirmer le **paiement côté serveur** ; **jamais** se fier au retour du navigateur.
- **Montants recalculés côté serveur** ; journaliser chaque transaction (statut, montant, référence).

### 9.16 Dépendances & chaîne d'approvisionnement
- `composer audit` + `npm audit` **en CI** ; corriger les CVE ; verrouiller les versions (`composer.lock`, `package-lock.json` commités).
- Ne pas introduire de paquet non maintenu ; limiter les scripts `composer`/`npm` en production.
- Activer Dependabot/SBOM pour suivre les mises à jour.

### 9.17 Sécurité Docker & déploiement
- Conteneurs **non-root** (utilisateur dédié), images de base minimales et à jour.
- **Aucun secret dans l'image** ; `.dockerignore` exclut `.env`, `.git`, `node_modules`.
- Réseaux Docker isolés ; **exposer uniquement** les ports nécessaires (5173/8000 en dev seulement).
- Production : reverse proxy (Nginx) + TLS ; **PostgreSQL (5432) non exposé publiquement** ; healthchecks + limites de ressources.
- ⚠️ **Risque actuel** : `docker-compose.yml` mappe `5432:5432` en clair → à fermer en prod.

### 9.18 Anti-IDOR, SSRF & intégrité des URL
- **Anti-IDOR** : contrôler l'accès **objet par objet** (Policies), pas seulement « connecté ».
- Suivi de commande : **code/jeton unique non devinable** (pas d'énumération d'IDs séquentiels).
- **SSRF** : whitelist pour tout appel sortant ; **bloquer** IP privées et métadonnées cloud (`169.254.169.254`) ; jamais d'URL utilisateur brute.
- **Redirections ouvertes** : valider les URLs de retour (whitelist de domaines).

### 9.19 Exposition des données (API Resources) & tokens
- Réponses via **API Resources** ; **jamais** les modèles Eloquent bruts.
- Masquer les champs sensibles (`password`, `remember_token`, tokens, IDs internes inutiles).
- **Sanctum** : abilities minimales, **expiration**, révocation ; idéalement un token par usage.
- Pagination systématique + plafond `per_page` (anti-extraction massive).

### 9.20 Données personnelles & RGPD
- **Minimiser** la collecte (nom, adresse, email, téléphone) ; finalité et base légale explicites.
- Droits **d'accès / rectification / suppression** (droit à l'oubli) ; prévoir anonymisation.
- **Limiter la conservation** et purger périodiquement (ex. `body_profiles` de l'essayage).
- Ne jamais exposer les données d'un client à un autre ; journaliser les accès.
- Pages obligatoires : mentions légales, politique de confidentialité, gestion des cookies.

### 9.21 Sauvegardes, continuité & monitoring
- **Sauvegardes régulières chiffrées** (BDD + médias) avec **test de restauration** ; définir RPO/RTO.
- **Monitoring** uptime + erreurs (type Sentry) + alertes ; supervision des pics/abus.
- **WAF** en option (ex. Cloudflare) + plan de **réponse aux incidents**.

---

## 10. Checklist avant mise en production

- [ ] `APP_ENV=production` et **`APP_DEBUG=false`**
- [ ] **HTTPS** forcé + **HSTS** activé
- [ ] `.env` non commité et **non accessible** via le web ; secrets hors code
- [ ] Migrations + seeders exécutés ; `php artisan storage:link`
- [ ] Comptes **admin** créés, rôles attribués, **2FA** activée si retenue
- [ ] **Rate limiting** actif (login, commandes, uploads, search)
- [ ] **En-têtes de sécurité** (CSP, HSTS, X-Frame-Options, nosniff…)
- [ ] **CORS** restreint aux domaines légitimes
- [ ] **Uploads** validés (MIME/taille) et stockés **hors racine web**
- [ ] **PostgreSQL non exposé** publiquement ; accès réseau restreint
- [ ] **Sauvegardes** automatiques chiffrées + **test de restauration** effectué
- [ ] `composer audit` & `npm audit` **sans CVE critique**
- [ ] **Monitoring** + **alerting** opérationnels
- [ ] **Audit log** activé sur les actions sensibles
- [ ] Pages légales : CGV, **confidentialité**, **cookies** (RGPD)

---

## 11. Tests

- **Unitaires** : Policies (autorisation), `OrderService` (calculs montant/port), `BodyProfile` (existant).
- **Fonctionnels (API)** : cas nominal **+** `401` (non authentifié), `403` (interdit), `404`, `422` (validation), `429` (rate limit).
- **Sécurité** : accès admin sans rôle → `403` ; tentative d'injection rejetée ; upload `.php` refusé ; IDOR bloqué ; bruteforce login limité.
- **Intégration front** : consommation réelle de l'API (produits, catégories, commande).
- **CI** : lint + tests + audits de dépendances à chaque push.

---

## 12. Priorisation & estimation indicative

| Lot | Contenu | Estimation |
|---|---|---|
| **A1** | Rôle admin + auth + Policies + `SecurityHeaders` + rate limiting | 2–3 j |
| **A2** | CRUD Catalogue (catégories, produits, variantes, images, stock) via Filament | 3–5 j |
| **A3** | Commandes (liste, détail, statuts, notes) + Réglages | 2–3 j |
| **A4** | Branchement frontend sur l'API | 2–4 j |
| **B** | CMS, clients, promotions, livraison, médias | 5–8 j |
| **C** | Essayage 3D (garments/GLB, zones, morph, grilles de tailles) | 5–10 j |
| **D** | Audit log, monitoring, sauvegardes, tests de sécurité | 3–5 j |

*(Estimations à ajuster selon l'équipe.)*

---

## 13. Décisions à valider

1. **Stack admin** : **Filament** (recommandé) ou admin React séparé ?
2. **Stockage médias** : disque local (`storage`) ou **S3** ?
3. **Auth** : session Blade (Filament) ou **Sanctum** (SPA) ?
4. **2FA admin** : dès maintenant ou plus tard ?
5. **Paiement** : quel prestataire (Wave / Orange Money / carte) ?
6. **Périmètre Phase A** : je démarre par quoi (A1 → A4) ?

---

## Annexe A — Failles / risques déjà présents dans le code actuel

| Constat | Risque | Correctif |
|---|---|---|
| `docker-compose.yml` expose `5432:5432` | Accès DB public | Ne pas publier le port en prod |
| `APP_DEBUG: "true"` dans compose | Fuite d'infos (stack traces) | `false` en prod |
| `users` sans `role` | Aucune séparation admin/client | Ajouter `role` + Policies |
| Aucun contrôle d'accès admin | Escalade possible | Middleware + Policies |
| CORS par défaut | Origines trop permissives | Restreindre `allowed_origins` |
| Aucun **rate limit** sur `POST /orders` | Spam / abus | `throttle` |
| Total/prix calculés côté front | Falsification de prix | Recalcul **serveur** |
| `order_items.variant_info` = texte libre | Perte d'intégrité | FK vers `product_variants` |
| Frais de port en dur | Rigidité | Table `shipping_zones` |
| Contenus en dur dans le front | Non administrable | CMS en base |

## Annexe B — Commandes utiles (Laravel)

```bash
php artisan make:model Product -mcr
php artisan make:request StoreProductRequest
php artisan make:policy ProductPolicy --model=Product
php artisan make:controller Api/Admin/ProductController --api
php artisan migrate
php artisan db:seed
php artisan storage:link
composer audit
```

---

> **Fin du plan.** Valider les décisions du §13 avant de lancer la Phase A.





