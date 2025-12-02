# Phase 2: Propal (Quotes/Proposals) Module

## Overview

**Module:** Propal (Commercial Proposals/Quotes)
**Priority:** Pre-Sales - Implement after Societe
**Dependencies:** Phase 1 (Societe) must be complete
**Estimated Effort:** 2-3 weeks

## Prerequisites

Before starting Phase 2:
- Phase 1 (Societe) fully tested and working
- Third parties can be created and listed
- Customer selection component available

---

## Database Schema

### Core Table: llx_propal

```sql
CREATE TABLE llx_propal (
  -- Primary Identifiers
  rowid            INTEGER AUTO_INCREMENT PRIMARY KEY,
  ref              VARCHAR(30) NOT NULL,
  entity           INTEGER DEFAULT 1 NOT NULL,

  -- Customer Link (FK to Phase 1)
  fk_soc           INTEGER NOT NULL,

  -- Status
  fk_statut        SMALLINT DEFAULT 0 NOT NULL,  -- 0=draft, 1=validated, 2=signed, 3=refused, 4=billed

  -- Dates
  datep            DATE NOT NULL,                 -- Proposal date
  datec            DATETIME NOT NULL,             -- Creation datetime
  date_valid       DATETIME NULL,                 -- Validation date
  date_signature   DATETIME NULL,                 -- Signature date
  date_cloture     DATETIME NULL,                 -- Closure date
  fin_validite     DATETIME NULL,                 -- Expiration date
  tms              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Financial Totals
  total_ht         DOUBLE(24,8) DEFAULT 0,        -- Total excl. tax
  total_tva        DOUBLE(24,8) DEFAULT 0,        -- Total VAT
  total_ttc        DOUBLE(24,8) DEFAULT 0,        -- Total incl. tax

  -- Settings
  fk_currency      VARCHAR(3) DEFAULT 'EUR',
  remise_percent   REAL DEFAULT 0,                -- Global discount %
  remise_absolue   REAL DEFAULT 0,                -- Global discount amount

  -- Notes
  note_public      TEXT NULL,
  note_private     TEXT NULL,

  -- References
  ref_client       VARCHAR(255) NULL,             -- Customer's reference

  -- User Tracking
  fk_user_author   INTEGER NULL,
  fk_user_valid    INTEGER NULL,
  fk_user_cloture  INTEGER NULL,

  -- Indexes
  UNIQUE KEY uk_propal_ref (ref, entity),
  KEY idx_propal_fk_soc (fk_soc),
  KEY idx_propal_fk_statut (fk_statut),
  KEY idx_propal_datep (datep),

  -- Foreign Keys
  CONSTRAINT fk_propal_societe FOREIGN KEY (fk_soc)
    REFERENCES llx_societe (rowid) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Line Items Table: llx_propaldet

```sql
CREATE TABLE llx_propaldet (
  -- Primary Identifiers
  rowid            INTEGER AUTO_INCREMENT PRIMARY KEY,
  fk_propal        INTEGER NOT NULL,

  -- Line Description
  label            VARCHAR(255) NULL,
  description      TEXT NULL,

  -- Quantity & Pricing
  qty              REAL NOT NULL DEFAULT 1,
  tva_tx           DOUBLE(7,4) DEFAULT 0,         -- VAT rate %
  subprice         DOUBLE(24,8) DEFAULT 0,        -- Unit price excl. tax
  remise_percent   REAL DEFAULT 0,                -- Line discount %

  -- Calculated Totals
  total_ht         DOUBLE(24,8) DEFAULT 0,
  total_tva        DOUBLE(24,8) DEFAULT 0,
  total_ttc        DOUBLE(24,8) DEFAULT 0,

  -- Display
  rang             INTEGER DEFAULT 0,              -- Sort order
  product_type     INTEGER DEFAULT 0,              -- 0=product, 1=service
  special_code     INTEGER DEFAULT 0,              -- 0=normal, 1=shipping, 2=discount

  -- Service Dates (optional)
  date_start       DATETIME NULL,
  date_end         DATETIME NULL,

  -- Indexes
  KEY idx_propaldet_fk_propal (fk_propal),

  -- Foreign Keys
  CONSTRAINT fk_propaldet_propal FOREIGN KEY (fk_propal)
    REFERENCES llx_propal (rowid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Reference Table: llx_c_propalst (Proposal Status)

```sql
CREATE TABLE llx_c_propalst (
  id        SMALLINT PRIMARY KEY,
  code      VARCHAR(12) NOT NULL UNIQUE,
  label     VARCHAR(128),
  active    TINYINT DEFAULT 1 NOT NULL
) ENGINE=InnoDB;

-- Default data
INSERT INTO llx_c_propalst (id, code, label) VALUES
  (0, 'PR_DRAFT', 'Draft'),
  (1, 'PR_OPEN', 'Validated'),
  (2, 'PR_SIGNED', 'Signed'),
  (3, 'PR_NOTSIGNED', 'Refused'),
  (4, 'PR_BILLED', 'Billed');
```

---

## TypeScript Interfaces

```typescript
// types/propal.ts

import { Societe } from './societe';

export type PropalStatus = 0 | 1 | 2 | 3 | 4;

export const PROPAL_STATUS = {
  DRAFT: 0 as const,
  VALIDATED: 1 as const,
  SIGNED: 2 as const,
  REFUSED: 3 as const,
  BILLED: 4 as const,
};

export const PROPAL_STATUS_LABELS: Record<PropalStatus, string> = {
  0: 'Draft',
  1: 'Validated',
  2: 'Signed',
  3: 'Refused',
  4: 'Billed',
};

export interface Propal {
  rowid: number;
  ref: string;
  entity: number;

  // Customer
  fkSoc: number;
  societe?: Societe;  // Expanded

  // Status
  fkStatut: PropalStatus;

  // Dates
  datep: string;       // Proposal date (YYYY-MM-DD)
  datec: string;       // Creation datetime
  dateValid?: string;
  dateSignature?: string;
  dateCloture?: string;
  finValidite?: string;
  tms: string;

  // Financials
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  currency: string;
  remisePercent: number;
  remiseAbsolue: number;

  // Notes
  notePublic?: string;
  notePrivate?: string;
  refClient?: string;

  // User tracking
  fkUserAuthor?: number;
  fkUserValid?: number;

  // Lines (when fetched with details)
  lines?: PropalLine[];
}

export interface PropalLine {
  rowid: number;
  fkPropal: number;

  // Description
  label?: string;
  description?: string;

  // Pricing
  qty: number;
  tvaTx: number;
  subprice: number;
  remisePercent: number;

  // Totals
  totalHt: number;
  totalTva: number;
  totalTtc: number;

  // Display
  rang: number;
  productType: 0 | 1;  // 0=product, 1=service
  specialCode: number;

  // Service dates
  dateStart?: string;
  dateEnd?: string;
}

// API Request Types
export interface PropalCreateRequest {
  fkSoc: number;
  datep?: string;        // Default: today
  finValidite?: string;  // Default: +30 days
  currency?: string;     // Default: EUR
  refClient?: string;
  notePublic?: string;
  notePrivate?: string;
  lines?: PropalLineCreateRequest[];
}

export interface PropalLineCreateRequest {
  label?: string;
  description?: string;
  qty: number;
  subprice: number;
  tvaTx?: number;        // Default: 20
  remisePercent?: number;
  productType?: 0 | 1;
  dateStart?: string;
  dateEnd?: string;
}

export interface PropalUpdateRequest extends Partial<PropalCreateRequest> {
  rowid: number;
}

export interface PropalListParams {
  sortfield?: string;
  sortorder?: 'ASC' | 'DESC';
  limit?: number;
  page?: number;
  status?: PropalStatus;
  fkSoc?: number;
  sqlfilters?: string;
}
```

---

## REST API Endpoints

### Base URL: `/api/proposals`

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/` | List proposals | `PropalListParams` | `Propal[]` |
| GET | `/{id}` | Get by ID | - | `Propal` with lines |
| GET | `/ref/{ref}` | Get by reference | - | `Propal` |
| POST | `/` | Create | `PropalCreateRequest` | `{ id: number }` |
| PUT | `/{id}` | Update | `PropalUpdateRequest` | `Propal` |
| DELETE | `/{id}` | Delete | - | `{ success: true }` |

### Line Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/{id}/lines` | Add line |
| PUT | `/{id}/lines/{lineid}` | Update line |
| DELETE | `/{id}/lines/{lineid}` | Delete line |

### Status Transitions

| Method | Endpoint | Description | Business Rule |
|--------|----------|-------------|---------------|
| POST | `/{id}/validate` | Validate proposal | Draft → Validated |
| POST | `/{id}/close` | Sign or refuse | Validated → Signed/Refused |
| POST | `/{id}/settodraft` | Return to draft | Validated → Draft |
| POST | `/{id}/setinvoiced` | Mark as billed | Signed → Billed |

### Example: Create Proposal

```http
POST /api/proposals
Content-Type: application/json

{
  "fkSoc": 42,
  "datep": "2024-01-15",
  "finValidite": "2024-02-15",
  "refClient": "RFQ-2024-001",
  "notePublic": "Thank you for your interest",
  "lines": [
    {
      "label": "Consulting Services",
      "description": "Initial assessment and planning",
      "qty": 5,
      "subprice": 150.00,
      "tvaTx": 20,
      "productType": 1
    },
    {
      "label": "Implementation",
      "description": "System setup and configuration",
      "qty": 10,
      "subprice": 120.00,
      "tvaTx": 20,
      "productType": 1
    }
  ]
}
```

**Response:**
```json
{
  "id": 101,
  "ref": "PR2401-0001"
}
```

### Example: Validate Proposal

```http
POST /api/proposals/101/validate
```

**Response:**
```json
{
  "rowid": 101,
  "ref": "PR2401-0001",
  "fkStatut": 1,
  "dateValid": "2024-01-15T10:30:00Z"
}
```

### Example: Close (Sign) Proposal

```http
POST /api/proposals/101/close
Content-Type: application/json

{
  "status": 2,
  "note": "Customer accepted via email"
}
```

---

## Status Workflow

```
                    ┌──────────────┐
                    │    DRAFT     │
                    │    (0)       │
                    └──────┬───────┘
                           │ validate
                           ▼
                    ┌──────────────┐
         ┌──────────│  VALIDATED   │──────────┐
         │          │    (1)       │          │
         │          └──────────────┘          │
         │ settodraft                   close │
         │                                    │
         ▼                          ┌─────────┴─────────┐
  ┌──────────────┐                  │                   │
  │    DRAFT     │                  ▼                   ▼
  │    (0)       │           ┌──────────────┐   ┌──────────────┐
  └──────────────┘           │   SIGNED     │   │   REFUSED    │
                             │    (2)       │   │    (3)       │
                             └──────┬───────┘   └──────────────┘
                                    │ setinvoiced
                                    ▼
                             ┌──────────────┐
                             │   BILLED     │
                             │    (4)       │
                             └──────────────┘
```

### Status Transition Rules

| From | To | Action | Conditions |
|------|-----|--------|-----------|
| Draft | Validated | `validate` | Has at least 1 line |
| Validated | Draft | `settodraft` | Not yet signed |
| Validated | Signed | `close(2)` | Customer accepted |
| Validated | Refused | `close(3)` | Customer declined |
| Signed | Billed | `setinvoiced` | Invoice created (Phase 3) |

---

## React Components

### Component Structure

```
src/
├── features/
│   └── propal/
│       ├── api/
│       │   └── propalApi.ts
│       ├── components/
│       │   ├── PropalList.tsx         # List with filters
│       │   ├── PropalCard.tsx         # Detail view
│       │   ├── PropalForm.tsx         # Create/edit header
│       │   ├── PropalLines.tsx        # Line items editor
│       │   ├── PropalLineForm.tsx     # Add/edit line modal
│       │   ├── PropalStatusBadge.tsx  # Status display
│       │   ├── PropalActions.tsx      # Validate/Sign/Refuse buttons
│       │   ├── PropalPDF.tsx          # PDF preview/download
│       │   └── CustomerSelector.tsx   # Reuse from Phase 1
│       ├── hooks/
│       │   ├── usePropal.ts
│       │   ├── usePropals.ts
│       │   └── usePropalMutations.ts
│       └── types/
│           └── index.ts
```

### Key Components

**PropalList.tsx**
- Table: ref, customer, date, total, status
- Filters: status, customer, date range
- Quick actions: view, duplicate, delete

**PropalCard.tsx**
- Header: ref, customer info, dates, status badge
- Lines table with edit/delete
- Totals summary (HT, TVA, TTC)
- Action buttons based on status
- PDF download button

**PropalLines.tsx**
- Editable line items table
- Add line button
- Drag-and-drop reordering
- Auto-calculate totals
- Inline edit or modal

**PropalActions.tsx**
- Context-aware action buttons
- Draft: Edit, Validate, Delete
- Validated: Sign, Refuse, Back to Draft
- Signed: Create Invoice (→ Phase 3)

---

## Calculation Logic

### Line Total Calculation

```typescript
function calculateLineTotal(line: PropalLine): PropalLine {
  const baseAmount = line.qty * line.subprice;
  const discountAmount = baseAmount * (line.remisePercent / 100);
  const totalHt = baseAmount - discountAmount;
  const totalTva = totalHt * (line.tvaTx / 100);
  const totalTtc = totalHt + totalTva;

  return {
    ...line,
    totalHt: Math.round(totalHt * 100) / 100,
    totalTva: Math.round(totalTva * 100) / 100,
    totalTtc: Math.round(totalTtc * 100) / 100,
  };
}
```

### Proposal Total Calculation

```typescript
function calculatePropalTotals(propal: Propal): Propal {
  const lines = propal.lines || [];

  const totalHt = lines.reduce((sum, line) => sum + line.totalHt, 0);
  const totalTva = lines.reduce((sum, line) => sum + line.totalTva, 0);

  // Apply global discount if any
  const discountHt = totalHt * (propal.remisePercent / 100) + propal.remiseAbsolue;
  const finalHt = totalHt - discountHt;
  const finalTva = totalTva * (1 - propal.remisePercent / 100);
  const finalTtc = finalHt + finalTva;

  return {
    ...propal,
    totalHt: Math.round(finalHt * 100) / 100,
    totalTva: Math.round(finalTva * 100) / 100,
    totalTtc: Math.round(finalTtc * 100) / 100,
  };
}
```

---

## Validation Rules

### Proposal Header
- `fkSoc` required (must exist in llx_societe)
- `datep` required, default today
- `finValidite` >= `datep`
- `ref` auto-generated, unique per entity

### Proposal Lines
- At least 1 line required to validate
- `qty` > 0
- `subprice` >= 0
- `tvaTx` 0-100%
- `remisePercent` 0-100%

### Status Transitions
- Cannot validate empty proposal
- Cannot delete validated/signed proposal
- Cannot modify signed/billed proposal

---

## Reference Number Generation

```typescript
// Format: PR{YYMM}-{NNNN}
// Example: PR2401-0001

function generatePropalRef(entity: number, date: Date): string {
  const yymm = date.toISOString().slice(2, 7).replace('-', '');
  const lastRef = await getLastPropalRef(entity, yymm);
  const nextNum = (lastRef ? parseInt(lastRef.slice(-4)) : 0) + 1;
  return `PR${yymm}-${nextNum.toString().padStart(4, '0')}`;
}
```

---

## Test Criteria

### Unit Tests
- [ ] Line total calculation
- [ ] Proposal total calculation
- [ ] Reference number generation
- [ ] Status transition validation

### Integration Tests
- [ ] Create proposal with lines
- [ ] Update proposal lines
- [ ] Validate proposal
- [ ] Sign/refuse proposal
- [ ] Delete draft proposal
- [ ] Cannot delete validated proposal

### E2E Tests
- [ ] Create new proposal for customer
- [ ] Add multiple line items
- [ ] Edit line item quantities
- [ ] Validate proposal
- [ ] Sign proposal
- [ ] View proposal PDF

### Acceptance Criteria
1. Can create proposal linked to customer (from Phase 1)
2. Can add/edit/delete line items
3. Totals calculate correctly (HT, TVA, TTC)
4. Can validate draft proposal
5. Can sign or refuse validated proposal
6. Cannot modify signed proposal
7. Reference numbers are unique and sequential
8. PDF generation works

---

## Phase 2 Completion Checklist

- [ ] Database tables created
- [ ] TypeScript types defined
- [ ] API endpoints implemented (12 endpoints)
- [ ] Status workflow working
- [ ] Line item CRUD working
- [ ] Total calculations correct
- [ ] Reference generation working
- [ ] React components built
- [ ] PDF generation working
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing

**Phase 2 is complete when:** You can create a proposal for a customer, add line items, validate it, and sign it. Ready for Phase 3 (convert to invoice).

---

## Files to Study in Dolibarr

| File | Purpose |
|------|---------|
| `htdocs/comm/propal/class/propal.class.php` | Main class (4,119 lines) |
| `htdocs/comm/propal/class/api_proposals.class.php` | REST API (1,245 lines) |
| `htdocs/comm/propal/card.php` | Detail page |
| `htdocs/comm/propal/list.php` | List page |
| `htdocs/install/mysql/tables/llx_propal.sql` | Table definition |
| `htdocs/install/mysql/tables/llx_propaldet.sql` | Line items table |
