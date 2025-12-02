# Phase 1: Societe (Third Parties) Module

## Overview

**Module:** Societe (Third Parties - Customers/Suppliers)
**Priority:** Foundation - Must be implemented first
**Dependencies:** None (this is the foundation)
**Estimated Effort:** 2-3 weeks

## Prerequisites

Before starting Phase 1:
- React project scaffolded with TypeScript
- Database connection established
- Authentication system in place
- Basic routing configured

---

## Database Schema

### Core Table: llx_societe

```sql
CREATE TABLE llx_societe (
  -- Primary Identifiers
  rowid                    INTEGER AUTO_INCREMENT PRIMARY KEY,
  entity                   INTEGER DEFAULT 1 NOT NULL,

  -- Core Business Identity
  nom                      VARCHAR(128) NOT NULL,
  name_alias               VARCHAR(128) NULL,
  ref_ext                  VARCHAR(255) NULL,

  -- Business Classification
  status                   TINYINT DEFAULT 1,          -- 1=active, 0=closed
  client                   TINYINT DEFAULT 0,          -- 0=none, 1=customer, 2=prospect
  fournisseur              TINYINT DEFAULT 0,          -- 0=no, 1=supplier
  fk_stcomm                INTEGER DEFAULT 0 NOT NULL, -- Commercial status
  fk_typent                INTEGER NULL,               -- Entity type

  -- Contact Information
  phone                    VARCHAR(30) NULL,
  phone_mobile             VARCHAR(30) NULL,
  fax                      VARCHAR(30) NULL,
  email                    VARCHAR(128) NULL,
  url                      VARCHAR(255) NULL,

  -- Address
  address                  VARCHAR(255) NULL,
  zip                      VARCHAR(25) NULL,
  town                     VARCHAR(50) NULL,
  fk_departement           INTEGER DEFAULT 0,
  fk_pays                  INTEGER DEFAULT 0,

  -- Business Identifiers
  code_client              VARCHAR(24) NULL,
  code_fournisseur         VARCHAR(24) NULL,
  siren                    VARCHAR(128) NULL,
  siret                    VARCHAR(128) NULL,
  tva_intra                VARCHAR(20) NULL,

  -- Financial
  tva_assuj                TINYINT DEFAULT 1,          -- VAT applicable
  remise_client            REAL DEFAULT 0,             -- Default discount %

  -- Notes
  note_public              TEXT NULL,
  note_private             TEXT NULL,

  -- Metadata
  datec                    DATETIME NULL,
  tms                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fk_user_creat            INTEGER NULL,
  fk_user_modif            INTEGER NULL,

  -- Indexes
  UNIQUE KEY uk_societe_code_client (code_client, entity),
  UNIQUE KEY uk_societe_code_fournisseur (code_fournisseur, entity),
  KEY idx_societe_nom (nom),
  KEY idx_societe_entity (entity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Reference Table: llx_c_stcomm (Commercial Status)

```sql
CREATE TABLE llx_c_stcomm (
  id       INTEGER PRIMARY KEY,
  code     VARCHAR(24) NOT NULL UNIQUE,
  libelle  VARCHAR(128),
  active   TINYINT DEFAULT 1 NOT NULL
) ENGINE=InnoDB;

-- Default data
INSERT INTO llx_c_stcomm (id, code, libelle) VALUES
  (-1, 'ST_NO', 'Do not contact'),
  (0, 'ST_NEVER', 'Never contacted'),
  (1, 'ST_TODO', 'To contact'),
  (2, 'ST_PEND', 'Contact in progress'),
  (3, 'ST_DONE', 'Contact done');
```

### Reference Table: llx_c_typent (Entity Types)

```sql
CREATE TABLE llx_c_typent (
  id       INTEGER PRIMARY KEY,
  code     VARCHAR(12) NOT NULL UNIQUE,
  libelle  VARCHAR(128),
  active   TINYINT DEFAULT 1 NOT NULL
) ENGINE=InnoDB;

-- Default data
INSERT INTO llx_c_typent (id, code, libelle) VALUES
  (1, 'TE_STARTUP', 'Startup'),
  (2, 'TE_SMALL', 'Small business'),
  (3, 'TE_MEDIUM', 'Medium business'),
  (4, 'TE_LARGE', 'Large company'),
  (5, 'TE_PRIVATE', 'Individual'),
  (6, 'TE_PUBLIC', 'Public entity'),
  (7, 'TE_OTHER', 'Other');
```

### Reference Table: llx_c_country

```sql
CREATE TABLE llx_c_country (
  rowid        INTEGER PRIMARY KEY,
  code         VARCHAR(2) NOT NULL,
  code_iso     VARCHAR(3) NULL,
  label        VARCHAR(128) NOT NULL,
  active       TINYINT DEFAULT 1 NOT NULL
) ENGINE=InnoDB;

-- Sample data (add full list as needed)
INSERT INTO llx_c_country (rowid, code, code_iso, label) VALUES
  (1, 'FR', 'FRA', 'France'),
  (2, 'BE', 'BEL', 'Belgium'),
  (3, 'US', 'USA', 'United States'),
  (4, 'GB', 'GBR', 'United Kingdom'),
  (5, 'DE', 'DEU', 'Germany');
```

---

## TypeScript Interfaces

```typescript
// types/societe.ts

export interface Societe {
  rowid: number;
  entity: number;

  // Core
  nom: string;
  nameAlias?: string;
  refExt?: string;

  // Classification
  status: 0 | 1;
  client: 0 | 1 | 2;        // 0=none, 1=customer, 2=prospect
  fournisseur: 0 | 1;
  fkStcomm: number;
  fkTypent?: number;

  // Contact
  phone?: string;
  phoneMobile?: string;
  fax?: string;
  email?: string;
  url?: string;

  // Address
  address?: string;
  zip?: string;
  town?: string;
  fkDepartement?: number;
  fkPays?: number;

  // Business IDs
  codeClient?: string;
  codeFournisseur?: string;
  siren?: string;
  siret?: string;
  tvaIntra?: string;

  // Financial
  tvaAssuj: boolean;
  remiseClient: number;

  // Notes
  notePublic?: string;
  notePrivate?: string;

  // Metadata
  datec?: string;
  tms: string;
  fkUserCreat?: number;
  fkUserModif?: number;

  // Expanded relations (optional, from API)
  stcomm?: StComm;
  typent?: TypeEnt;
  country?: Country;
}

export interface StComm {
  id: number;
  code: string;
  libelle: string;
  active: boolean;
}

export interface TypeEnt {
  id: number;
  code: string;
  libelle: string;
  active: boolean;
}

export interface Country {
  rowid: number;
  code: string;
  codeIso?: string;
  label: string;
  active: boolean;
}

// API Request/Response types
export interface SocieteCreateRequest {
  nom: string;
  client?: 0 | 1 | 2;
  fournisseur?: 0 | 1;
  email?: string;
  phone?: string;
  address?: string;
  zip?: string;
  town?: string;
  fkPays?: number;
  tvaIntra?: string;
  notePublic?: string;
  notePrivate?: string;
}

export interface SocieteUpdateRequest extends Partial<SocieteCreateRequest> {
  rowid: number;
}

export interface SocieteListParams {
  sortfield?: string;
  sortorder?: 'ASC' | 'DESC';
  limit?: number;
  page?: number;
  mode?: 'customer' | 'supplier' | 'prospect';
  sqlfilters?: string;
}

export interface SocieteListResponse {
  data: Societe[];
  total: number;
  page: number;
  limit: number;
}
```

---

## REST API Endpoints

### Base URL: `/api/thirdparties`

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/` | List third parties | `SocieteListParams` | `SocieteListResponse` |
| GET | `/{id}` | Get by ID | - | `Societe` |
| GET | `/email/{email}` | Get by email | - | `Societe` |
| POST | `/` | Create | `SocieteCreateRequest` | `{ id: number }` |
| PUT | `/{id}` | Update | `SocieteUpdateRequest` | `Societe` |
| DELETE | `/{id}` | Delete | - | `{ success: true }` |

### Example API Calls

**Create Customer:**
```http
POST /api/thirdparties
Content-Type: application/json

{
  "nom": "Acme Corporation",
  "client": 1,
  "email": "contact@acme.com",
  "phone": "+33 1 23 45 67 89",
  "address": "123 Business Street",
  "zip": "75001",
  "town": "Paris",
  "fkPays": 1,
  "tvaIntra": "FR12345678901"
}
```

**Response:**
```json
{
  "id": 42
}
```

**List Customers:**
```http
GET /api/thirdparties?mode=customer&limit=20&page=0&sortfield=nom&sortorder=ASC
```

**Response:**
```json
{
  "data": [
    {
      "rowid": 42,
      "nom": "Acme Corporation",
      "client": 1,
      "email": "contact@acme.com",
      ...
    }
  ],
  "total": 150,
  "page": 0,
  "limit": 20
}
```

---

## React Components

### Component Structure

```
src/
├── features/
│   └── societe/
│       ├── api/
│       │   └── societeApi.ts          # API calls
│       ├── components/
│       │   ├── SocieteList.tsx        # List view with filters
│       │   ├── SocieteCard.tsx        # Detail/edit form
│       │   ├── SocieteForm.tsx        # Create/edit form
│       │   ├── SocieteSearch.tsx      # Search component
│       │   └── SocieteStatusBadge.tsx # Status display
│       ├── hooks/
│       │   ├── useSociete.ts          # Single societe
│       │   ├── useSocietes.ts         # List with pagination
│       │   └── useSocieteMutations.ts # Create/update/delete
│       ├── types/
│       │   └── index.ts               # TypeScript types
│       └── index.ts                   # Module exports
```

### Key Components

**SocieteList.tsx** - Main list view
- Table with sortable columns
- Filters: status, type (customer/supplier/prospect)
- Search by name, email, code
- Pagination
- Actions: view, edit, delete

**SocieteCard.tsx** - Detail view
- Display all societe information
- Tabs: General, Contact, Financial, Notes
- Edit button → SocieteForm
- Delete with confirmation

**SocieteForm.tsx** - Create/Edit form
- Validated form fields
- Country/department selectors
- Auto-generate customer code
- Save/Cancel actions

---

## Validation Rules

### Required Fields
- `nom` (company name) - min 1 char, max 128 chars

### Business Rules
1. `code_client` must be unique per entity (if provided)
2. `code_fournisseur` must be unique per entity (if provided)
3. `email` must be valid format (if provided)
4. `tva_intra` must match country VAT format (if provided)
5. Cannot delete societe if linked to quotes/invoices (check in Phase 2+)

### Auto-generation
- `code_client`: Generate if empty when `client > 0`
- `code_fournisseur`: Generate if empty when `fournisseur = 1`
- `datec`: Set on creation
- `fk_user_creat`: Set to current user on creation
- `fk_user_modif`: Set to current user on update

---

## Test Criteria

### Unit Tests
- [ ] Societe CRUD operations
- [ ] Validation rules (required fields, formats)
- [ ] Code generation logic
- [ ] Search/filter functionality

### Integration Tests
- [ ] API endpoints return correct data
- [ ] Database constraints enforced
- [ ] Pagination works correctly
- [ ] Sorting works on all sortable fields

### E2E Tests
- [ ] Create new customer flow
- [ ] Edit existing customer
- [ ] Search and filter customers
- [ ] Delete customer (with confirmation)
- [ ] View customer details

### Acceptance Criteria
1. Can create a new customer with required fields
2. Can view list of all customers with pagination
3. Can search customers by name, email, or code
4. Can filter by status (active/closed) and type (customer/supplier)
5. Can edit customer details
6. Can delete customer (if no linked documents)
7. Customer codes are unique and auto-generated
8. All API endpoints return appropriate HTTP status codes

---

## Phase 1 Completion Checklist

- [ ] Database tables created and seeded
- [ ] TypeScript types defined
- [ ] API endpoints implemented (8 endpoints)
- [ ] React components built
- [ ] Form validation working
- [ ] Search and filtering working
- [ ] Pagination working
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Code review completed
- [ ] Documentation updated

**Phase 1 is complete when:** All checklist items pass and you can successfully create, read, update, delete, search, and filter third parties through the UI.

---

## Files to Study in Dolibarr

| File | Purpose |
|------|---------|
| `htdocs/societe/class/societe.class.php` | Main class (6,024 lines) |
| `htdocs/societe/class/api_thirdparties.class.php` | REST API (2,636 lines) |
| `htdocs/societe/card.php` | Detail page UI |
| `htdocs/societe/list.php` | List page UI |
| `htdocs/install/mysql/tables/llx_societe.sql` | Table definition |
