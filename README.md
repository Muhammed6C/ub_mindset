# UB Mindset - Plateforme E-commerce (React, Laravel & PostgreSQL)

Architecture moderne conteneurisée pour la marque e-commerce **UB Mindset**.

---

## 🏗️ Architecture Globale

Le projet est découpé en 3 conteneurs orchestrés par Docker Compose :

| Service | Technologie | Image / Base | Port hôte | Rôle |
| :--- | :--- | :--- | :--- | :--- |
| **`postgres`** | PostgreSQL 16 | `postgres:16-alpine` (officielle) | `5432` | Base de données relationnelle persistante |
| **`backend`** | Laravel 13 / PHP 8.4 | Image personnalisée (`./backend/Dockerfile`) | `8000` | API REST, Sanctum, migrations & seeders |
| **`frontend`** | React 19 / Vite / Tailwind | Image personnalisée (`./frontend/Dockerfile`) | `5173` | Interface utilisateur e-commerce & panier |

---

## 🚀 Démarrage Rapide avec Docker

Assurez-vous que **Docker Desktop** est lancé sur votre machine, puis exécutez à la racine du projet :

```bash
# 1. Construire les images et démarrer tous les conteneurs
docker compose up --build

# Ou en arrière-plan (mode détaché)
docker compose up -d --build
```

### URLs d'accès :
- **Boutique Frontend (React) :** [http://localhost:5173](http://localhost:5173)
- **API Backend (Laravel) :** [http://localhost:8000/api](http://localhost:8000/api)
- **Vérification d'état (Healthcheck) :** [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **PostgreSQL :** `localhost:5432` (Base: `ub_mindset`, User: `ub_user`, Mdp: `ub_password`)

---

## 📦 Structure du Répertoire

```text
C:\Dev\ub_mindset\
├── docker-compose.yml           # Configuration multi-conteneurs
├── .env.example                 # Variables d'environnement de référence
├── README.md                    # Guide de démarrage
│
├── backend/                     # API Laravel (PHP 8.4)
│   ├── Dockerfile               # Image PHP 8.4 avec pdo_pgsql & extensions
│   ├── docker-entrypoint.sh     # Attente PGSQL, migrations & seeders automatiques
│   ├── app/
│   │   ├── Http/Controllers/Api/# CategoryController, ProductController, OrderController
│   │   └── Models/              # Category, Product, ProductVariant, Order, OrderItem
│   ├── database/
│   │   ├── migrations/          # Schémas PostgreSQL (catégories, produits, variantes, commandes)
│   │   └── seeders/             # Données de démarrage (vêtements, accessoires, tailles)
│   └── routes/api.php           # Endpoints REST e-commerce
│
└── frontend/                    # Application React (Vite & Tailwind CSS v4)
    ├── Dockerfile               # Image Node.js 22
    ├── src/
    │   ├── components/          # Navbar, Footer, ProductCard, CartDrawer
    │   ├── pages/               # Home, Catalog, ProductDetail, Cart, Checkout
    │   ├── context/             # CartContext (persistance panier localStorage)
    │   └── services/            # Client Axios configuré pour l'API
    └── vite.config.js
```

---

## 🛠️ Commandes Utiles

### Réexécuter les migrations ou les seeds dans Docker :
```bash
docker compose exec backend php artisan migrate:fresh --seed
```

### Consulter les logs d'un service :
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Arrêter les conteneurs :
```bash
docker compose down
```

### Développement local sans Docker (optionnel) :
- **Backend :** `cd backend && php artisan serve`
- **Frontend :** `cd frontend && npm run dev`
