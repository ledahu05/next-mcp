# Plan : Système de contrôle d'accès avec Magic Link

## Résumé

Implémenter un système de contrôle d'accès pour limiter l'utilisation des tokens Gemini :
1. L'utilisateur demande l'accès via un formulaire (email)
2. L'admin reçoit un email avec un lien de validation
3. Après validation, l'utilisateur reçoit un magic link (valide 24h)
4. L'utilisateur accède à l'app via le magic link (session 7 jours)

## Stack technique

- **Email** : Resend
- **Database** : SQLite + Prisma
- **Session** : Cookies HttpOnly sécurisés

## Structure des fichiers à créer

```
src/
├── app/
│   ├── api/
│   │   ├── access/
│   │   │   ├── request/route.ts       # POST - Demande d'accès
│   │   │   └── validate/[token]/route.ts  # GET - Validation admin
│   │   └── auth/
│   │       ├── magic/[token]/route.ts # GET - Magic link login
│   │       └── session/route.ts       # GET - Vérif session
│   └── access-request/
│       └── page.tsx                   # Page formulaire public
├── components/
│   └── access-request-form.tsx        # Composant formulaire
├── lib/
│   ├── auth/
│   │   ├── session.ts                 # Gestion sessions
│   │   └── tokens.ts                  # Génération tokens
│   ├── db/
│   │   └── prisma.ts                  # Client Prisma singleton
│   └── email/
│       └── resend.ts                  # Service email
└── middleware.ts                      # Protection des routes
prisma/
└── schema.prisma                      # Schéma BDD
```

## Schéma Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model AccessRequest {
  id              String   @id @default(cuid())
  email           String   @unique
  status          String   @default("pending") // pending, approved, rejected
  validationToken String   @unique @default(cuid())
  magicLinkToken  String?  @unique
  magicLinkExpiry DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  approvedAt      DateTime?

  @@index([validationToken])
  @@index([magicLinkToken])
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  email     String
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([token])
  @@index([expiresAt])
}
```

## Variables d'environnement à ajouter

```env
DATABASE_URL="file:./dev.db"
RESEND_API_KEY="re_xxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Étapes d'implémentation

### Phase 1 : Infrastructure (dependencies + Prisma)
1. Installer `prisma`, `@prisma/client`, `resend`
2. Initialiser Prisma avec SQLite
3. Créer le schéma et migrer

### Phase 2 : Utilitaires core
4. `src/lib/db/prisma.ts` - Client Prisma singleton
5. `src/lib/auth/tokens.ts` - Génération tokens sécurisés
6. `src/lib/auth/session.ts` - Gestion sessions/cookies
7. `src/lib/email/resend.ts` - Service d'envoi email

### Phase 3 : API Routes
8. `POST /api/access/request` - Créer demande d'accès
9. `GET /api/access/validate/[token]` - Admin valide la demande
10. `GET /api/auth/magic/[token]` - Login via magic link
11. `GET /api/auth/session` - Vérifier session courante

### Phase 4 : Protection & Middleware
12. `src/middleware.ts` - Protéger routes `/` et `/api/chat`

### Phase 5 : UI
13. `src/components/access-request-form.tsx` - Formulaire de demande
14. `src/app/access-request/page.tsx` - Page publique

### Phase 6 : Intégration
15. Modifier `src/app/api/chat/route.ts` - Ajouter vérification auth
16. Modifier `src/app/page.tsx` - Ajouter redirection si non authentifié

## Fichiers existants à modifier

| Fichier | Modification |
|---------|--------------|
| `src/app/api/chat/route.ts` | Ajouter vérification session au début |
| `src/app/page.tsx` | Ajouter server-side auth check + redirect |
| `package.json` | Ajouter prisma, @prisma/client, resend |
| `.env.local` | Ajouter variables DB et email |

## Sécurité

- Tokens générés avec `crypto.randomBytes(32)` (256-bit)
- Cookies `httpOnly`, `secure` (prod), `sameSite: lax`
- Magic links à usage unique (supprimés après utilisation)
- Expiration : magic link 24h, session 7 jours
- Email admin hardcodé dans les variables d'env

## Flow utilisateur

```
[Utilisateur]                    [Admin]                      [Système]
     |                              |                              |
     |-- Remplit formulaire ------->|                              |
     |                              |<-- Reçoit email notification |
     |                              |                              |
     |                              |-- Clique lien validation --->|
     |                              |                              |
     |<-- Reçoit magic link --------|                              |
     |                              |                              |
     |-- Clique magic link -------->|                              |
     |                              |                              |
     |<-- Session créée, accès app -|                              |
```
