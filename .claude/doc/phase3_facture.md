# Phase 3: Facture (Customer Invoices) Module

## Overview

**Module:** Facture (Customer Invoices)
**Priority:** Core Transaction - Implement after Propal
**Dependencies:** Phase 1 (Societe), Phase 2 (Propal) for conversion
**Estimated Effort:** 3-4 weeks

## Prerequisites

Before starting Phase 3:
- Phase 1 (Societe) complete
- Phase 2 (Propal) complete
- Quote-to-invoice conversion workflow designed
- PDF generation infrastructure ready

---

## Database Schema

### Core Table: llx_facture

```sql
CREATE TABLE llx_facture (
  -- Primary Identifiers
  rowid            INTEGER AUTO_INCREMENT PRIMARY KEY,
  ref              VARCHAR(30) NOT NULL,
  entity           INTEGER DEFAULT 1 NOT NULL,

  -- Customer Link
  fk_soc           INTEGER NOT NULL,

  -- Type & Status
  type             SMALLINT DEFAULT 0 NOT NULL,      -- 0=standard, 2=credit note
  fk_statut        SMALLINT DEFAULT 0 NOT NULL,      -- 0=draft, 1=validated, 2=paid
  paye             SMALLINT DEFAULT 0 NOT NULL,      -- 0=unpaid, 1=paid

  -- Dates
  datec            DATETIME NOT NULL,                -- Creation date
  datef            DATE NOT NULL,                    -- Invoice date
  date_valid       DATETIME NULL,                    -- Validation date
  date_lim_reglement DATE NULL,                      -- Due date
  date_closing     DATETIME NULL,                    -- Closing date
  tms              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Financial Totals
  total_ht         DOUBLE(24,8) DEFAULT 0,
  total_tva        DOUBLE(24,8) DEFAULT 0,
  total_ttc        DOUBLE(24,8) DEFAULT 0,

  -- Discounts
  remise_percent   REAL DEFAULT 0,
  remise_absolue   REAL DEFAULT 0,
  remise           REAL DEFAULT 0,

  -- Settings
  fk_currency      VARCHAR(3) DEFAULT 'EUR',
  fk_cond_reglement INTEGER DEFAULT 1,               -- Payment condition
  fk_mode_reglement INTEGER NULL,                    -- Payment mode

  -- Origin (for quote-to-invoice conversion)
  fk_facture_source INTEGER NULL,                    -- Source invoice (credit notes)
  module_source    VARCHAR(32) NULL,                 -- 'propal' for quote conversion

  -- Notes
  note_public      TEXT NULL,
  note_private     TEXT NULL,
  ref_client       VARCHAR(255) NULL,

  -- User Tracking
  fk_user_author   INTEGER NULL,
  fk_user_valid    INTEGER NULL,
  fk_user_closing  INTEGER NULL,

  -- Close Tracking
  close_code       VARCHAR(16) NULL,                 -- badcustomer, abandon, etc.
  close_note       TEXT NULL,

  -- Indexes
  UNIQUE KEY uk_facture_ref (ref, entity),
  KEY idx_facture_fk_soc (fk_soc),
  KEY idx_facture_fk_statut (fk_statut),
  KEY idx_facture_datef (datef),

  -- Foreign Keys
  CONSTRAINT fk_facture_societe FOREIGN KEY (fk_soc)
    REFERENCES llx_societe (rowid) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Line Items Table: llx_facturedet

```sql
CREATE TABLE llx_facturedet (
  -- Primary Identifiers
  rowid            INTEGER AUTO_INCREMENT PRIMARY KEY,
  fk_facture       INTEGER NOT NULL,

  -- Line Description
  label            VARCHAR(255) NULL,
  description      TEXT NULL,

  -- Quantity & Pricing
  qty              REAL NOT NULL DEFAULT 1,
  tva_tx           DOUBLE(7,4) DEFAULT 0,
  subprice         DOUBLE(24,8) DEFAULT 0,
  remise_percent   REAL DEFAULT 0,

  -- Calculated Totals
  total_ht         DOUBLE(24,8) DEFAULT 0,
  total_tva        DOUBLE(24,8) DEFAULT 0,
  total_ttc        DOUBLE(24,8) DEFAULT 0,

  -- Display
  rang             INTEGER DEFAULT 0,
  product_type     INTEGER DEFAULT 0,
  special_code     INTEGER DEFAULT 0,

  -- Service Dates
  date_start       DATETIME NULL,
  date_end         DATETIME NULL,

  -- Origin (from quote line)
  fk_propaldet     INTEGER NULL,

  -- Indexes
  KEY idx_facturedet_fk_facture (fk_facture),

  -- Foreign Keys
  CONSTRAINT fk_facturedet_facture FOREIGN KEY (fk_facture)
    REFERENCES llx_facture (rowid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Payment Table: llx_paiement

```sql
CREATE TABLE llx_paiement (
  -- Primary Identifiers
  rowid            INTEGER AUTO_INCREMENT PRIMARY KEY,
  ref              VARCHAR(30) NOT NULL,
  entity           INTEGER DEFAULT 1 NOT NULL,

  -- Amount & Date
  datec            DATETIME NOT NULL,                -- Creation date
  datep            DATE NOT NULL,                    -- Payment date
  amount           DOUBLE(24,8) DEFAULT 0,

  -- Payment Method
  fk_paiement      INTEGER NOT NULL,                 -- Payment type (llx_c_paiement)
  num_paiement     VARCHAR(50) NULL,                 -- Check number, etc.

  -- Bank Link (for Phase 4)
  fk_bank          INTEGER DEFAULT 0,

  -- Status
  statut           SMALLINT DEFAULT 0,               -- 0=draft, 1=recorded

  -- User Tracking
  fk_user_creat    INTEGER NULL,
  fk_user_modif    INTEGER NULL,
  tms              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Notes
  note             TEXT NULL,

  -- Indexes
  UNIQUE KEY uk_paiement_ref (ref, entity),
  KEY idx_paiement_datep (datep)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Junction Table: llx_paiement_facture

```sql
CREATE TABLE llx_paiement_facture (
  rowid            INTEGER AUTO_INCREMENT PRIMARY KEY,
  fk_paiement      INTEGER NOT NULL,
  fk_facture       INTEGER NOT NULL,
  amount           DOUBLE(24,8) DEFAULT 0,           -- Amount applied to this invoice

  -- Indexes
  UNIQUE KEY uk_paiement_facture (fk_paiement, fk_facture),
  KEY idx_paiement_facture_facture (fk_facture),

  -- Foreign Keys
  CONSTRAINT fk_pf_paiement FOREIGN KEY (fk_paiement)
    REFERENCES llx_paiement (rowid) ON DELETE CASCADE,
  CONSTRAINT fk_pf_facture FOREIGN KEY (fk_facture)
    REFERENCES llx_facture (rowid) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Reference Table: llx_c_paiement (Payment Methods)

```sql
CREATE TABLE llx_c_paiement (
  id        INTEGER PRIMARY KEY,
  code      VARCHAR(6) NOT NULL UNIQUE,
  libelle   VARCHAR(128),
  type      SMALLINT DEFAULT 1,           -- 1=debited, 2=credited
  active    TINYINT DEFAULT 1 NOT NULL
) ENGINE=InnoDB;

-- Default data
INSERT INTO llx_c_paiement (id, code, libelle, type) VALUES
  (1, 'TIP', 'Bank transfer', 1),
  (2, 'VIR', 'Wire transfer', 1),
  (3, 'PRE', 'Direct debit', 1),
  (4, 'CB', 'Credit card', 1),
  (5, 'CHQ', 'Check', 1),
  (6, 'LIQ', 'Cash', 1);
```

---

## TypeScript Interfaces

```typescript
// types/facture.ts

import { Societe } from './societe';
import { Propal } from './propal';

export type FactureType = 0 | 2;  // 0=standard, 2=credit note
export type FactureStatus = 0 | 1 | 2;  // 0=draft, 1=validated, 2=paid/closed

export const FACTURE_STATUS = {
  DRAFT: 0 as const,
  VALIDATED: 1 as const,
  CLOSED: 2 as const,
};

export const FACTURE_STATUS_LABELS: Record<FactureStatus, string> = {
  0: 'Draft',
  1: 'Unpaid',
  2: 'Paid',
};

export interface Facture {
  rowid: number;
  ref: string;
  entity: number;

  // Customer
  fkSoc: number;
  societe?: Societe;

  // Type & Status
  type: FactureType;
  fkStatut: FactureStatus;
  paye: 0 | 1;

  // Dates
  datec: string;
  datef: string;
  dateValid?: string;
  dateLimReglement?: string;
  dateClosing?: string;
  tms: string;

  // Financials
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  currency: string;
  remisePercent: number;
  remiseAbsolue: number;

  // Payment Settings
  fkCondReglement?: number;
  fkModeReglement?: number;

  // Origin
  fkFactureSource?: number;
  moduleSource?: string;

  // Notes
  notePublic?: string;
  notePrivate?: string;
  refClient?: string;

  // User tracking
  fkUserAuthor?: number;
  fkUserValid?: number;

  // Close info
  closeCode?: string;
  closeNote?: string;

  // Lines & Payments (when fetched)
  lines?: FactureLine[];
  payments?: Payment[];

  // Computed
  remainingToPay?: number;
}

export interface FactureLine {
  rowid: number;
  fkFacture: number;

  label?: string;
  description?: string;

  qty: number;
  tvaTx: number;
  subprice: number;
  remisePercent: number;

  totalHt: number;
  totalTva: number;
  totalTtc: number;

  rang: number;
  productType: 0 | 1;
  specialCode: number;

  dateStart?: string;
  dateEnd?: string;

  // Origin tracking
  fkPropaldet?: number;
}

export interface Payment {
  rowid: number;
  ref: string;
  entity: number;

  datec: string;
  datep: string;
  amount: number;

  fkPaiement: number;
  numPaiement?: string;
  paymentMethod?: PaymentMethod;

  fkBank?: number;
  statut: 0 | 1;

  fkUserCreat?: number;
  note?: string;

  // Junction data
  invoices?: PaymentInvoice[];
}

export interface PaymentInvoice {
  fkFacture: number;
  amount: number;
  invoice?: Facture;
}

export interface PaymentMethod {
  id: number;
  code: string;
  libelle: string;
  type: 1 | 2;
  active: boolean;
}

// API Request Types
export interface FactureCreateRequest {
  fkSoc: number;
  datef?: string;
  type?: FactureType;
  refClient?: string;
  fkCondReglement?: number;
  fkModeReglement?: number;
  notePublic?: string;
  notePrivate?: string;
  lines?: FactureLineCreateRequest[];
}

export interface FactureCreateFromPropalRequest {
  propalId: number;
}

export interface FactureLineCreateRequest {
  label?: string;
  description?: string;
  qty: number;
  subprice: number;
  tvaTx?: number;
  remisePercent?: number;
  productType?: 0 | 1;
  dateStart?: string;
  dateEnd?: string;
}

export interface PaymentCreateRequest {
  fkPaiement: number;
  datep: string;
  amount: number;
  numPaiement?: string;
  note?: string;
  fkBank?: number;
  invoices: Array<{
    fkFacture: number;
    amount: number;
  }>;
}
```

---

## REST API Endpoints

### Invoices: `/api/invoices`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List invoices |
| GET | `/{id}` | Get invoice with lines |
| GET | `/ref/{ref}` | Get by reference |
| POST | `/` | Create invoice |
| POST | `/createfrompropal/{propalId}` | Create from quote |
| PUT | `/{id}` | Update invoice |
| DELETE | `/{id}` | Delete draft invoice |

### Line Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/{id}/lines` | Add line |
| PUT | `/{id}/lines/{lineid}` | Update line |
| DELETE | `/{id}/lines/{lineid}` | Delete line |

### Status & Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/{id}/validate` | Validate invoice |
| POST | `/{id}/settodraft` | Return to draft |
| POST | `/{id}/settopaid` | Mark as paid |
| POST | `/{id}/settounpaid` | Reopen invoice |
| GET | `/{id}/payments` | Get payment history |
| POST | `/{id}/payments` | Add payment |

### Example: Create Invoice from Quote

```http
POST /api/invoices/createfrompropal/101
```

**Response:**
```json
{
  "id": 201,
  "ref": "FA2401-0001",
  "fkSoc": 42,
  "totalTtc": 2160.00,
  "fkStatut": 0,
  "lines": [
    {
      "rowid": 501,
      "label": "Consulting Services",
      "qty": 5,
      "subprice": 150.00,
      "totalTtc": 900.00,
      "fkPropaldet": 301
    }
  ]
}
```

### Example: Add Payment

```http
POST /api/invoices/201/payments
Content-Type: application/json

{
  "fkPaiement": 2,
  "datep": "2024-01-20",
  "amount": 2160.00,
  "numPaiement": "VIR-2024-001",
  "note": "Full payment received"
}
```

**Response:**
```json
{
  "id": 301,
  "ref": "PAY2401-0001",
  "amount": 2160.00,
  "invoiceStatus": 2,
  "message": "Invoice fully paid"
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
         │          │   (Unpaid)   │          │
         │          │    (1)       │          │
         │          └──────────────┘          │
         │ settodraft                         │
         │                                    │
         ▼                                    │ settopaid (when fully paid)
  ┌──────────────┐                            │
  │    DRAFT     │                            │
  │    (0)       │                            │
  └──────────────┘                            │
                                              ▼
                                       ┌──────────────┐
                           ┌───────────│    PAID      │
                           │           │    (2)       │
                           │           └──────────────┘
                           │ settounpaid
                           ▼
                    ┌──────────────┐
                    │  VALIDATED   │
                    │   (Unpaid)   │
                    └──────────────┘
```

### Payment States

| Scenario | fk_statut | paye | remainingToPay |
|----------|-----------|------|----------------|
| Draft | 0 | 0 | totalTtc |
| Validated, no payment | 1 | 0 | totalTtc |
| Partial payment | 1 | 0 | totalTtc - paid |
| Fully paid | 2 | 1 | 0 |
| Overpaid (credit) | 2 | 1 | negative |

---

## Quote-to-Invoice Conversion

### Conversion Logic

```typescript
async function createInvoiceFromPropal(propalId: number): Promise<Facture> {
  const propal = await getPropal(propalId);

  // Validate propal is signed
  if (propal.fkStatut !== PROPAL_STATUS.SIGNED) {
    throw new Error('Can only convert signed proposals');
  }

  // Create invoice
  const invoice: FactureCreateRequest = {
    fkSoc: propal.fkSoc,
    datef: new Date().toISOString().split('T')[0],
    refClient: propal.refClient,
    notePublic: propal.notePublic,
    notePrivate: propal.notePrivate,
    lines: propal.lines?.map(line => ({
      label: line.label,
      description: line.description,
      qty: line.qty,
      subprice: line.subprice,
      tvaTx: line.tvaTx,
      remisePercent: line.remisePercent,
      productType: line.productType,
      dateStart: line.dateStart,
      dateEnd: line.dateEnd,
      // Track origin
      fkPropaldet: line.rowid,
    })),
  };

  const factureId = await createFacture(invoice);

  // Mark propal as billed
  await setPropalInvoiced(propalId);

  return getFacture(factureId);
}
```

### Data Mapping

| Propal Field | Facture Field |
|--------------|---------------|
| fk_soc | fk_soc |
| note_public | note_public |
| note_private | note_private |
| ref_client | ref_client |
| total_ht | total_ht (recalculated) |
| lines[].* | lines[].* (copied) |

---

## React Components

### Component Structure

```
src/
├── features/
│   └── facture/
│       ├── api/
│       │   └── factureApi.ts
│       ├── components/
│       │   ├── FactureList.tsx        # List with filters
│       │   ├── FactureCard.tsx        # Detail view
│       │   ├── FactureForm.tsx        # Create/edit
│       │   ├── FactureLines.tsx       # Line items
│       │   ├── FactureStatusBadge.tsx # Status + payment state
│       │   ├── FactureActions.tsx     # Validate/Pay buttons
│       │   ├── FacturePDF.tsx         # PDF preview
│       │   ├── PaymentForm.tsx        # Record payment modal
│       │   ├── PaymentHistory.tsx     # Payment list
│       │   └── CreateFromPropal.tsx   # Quote conversion
│       ├── hooks/
│       │   ├── useFacture.ts
│       │   ├── useFactures.ts
│       │   ├── useFactureMutations.ts
│       │   └── usePayments.ts
│       └── types/
```

### Key Components

**FactureList.tsx**
- Columns: ref, customer, date, due date, total, status, paid %
- Filters: status, customer, date range, overdue
- Color coding for overdue invoices
- Quick pay action

**FactureCard.tsx**
- Header with status badge
- Payment progress bar
- Line items table
- Payment history
- Actions based on status

**PaymentForm.tsx**
- Payment method selector
- Amount input (default: remaining)
- Date picker
- Reference number input
- Multi-invoice payment option

---

## Validation Rules

### Invoice Header
- `fkSoc` required (must exist)
- `datef` required
- `ref` auto-generated, unique per entity
- `dateLimReglement` calculated from payment conditions

### Invoice Lines
- At least 1 line to validate
- Same rules as Propal lines

### Payments
- `amount` > 0
- `amount` <= remaining to pay (unless overpayment allowed)
- `fkPaiement` required (valid payment method)
- Cannot pay draft invoice

### Status Transitions
- Cannot validate empty invoice
- Cannot delete validated invoice
- Cannot modify paid invoice

---

## Test Criteria

### Unit Tests
- [ ] Create invoice from quote
- [ ] Payment calculation (remaining amount)
- [ ] Total calculations with multiple payments
- [ ] Due date calculation from payment conditions

### Integration Tests
- [ ] Full quote-to-invoice flow
- [ ] Partial payment workflow
- [ ] Full payment marks invoice as paid
- [ ] Cannot pay draft invoice
- [ ] Credit note creation

### E2E Tests
- [ ] Create invoice from signed quote
- [ ] Add line items manually
- [ ] Validate invoice
- [ ] Record partial payment
- [ ] Record final payment (marks as paid)
- [ ] View payment history
- [ ] Download PDF

### Acceptance Criteria
1. Can create invoice manually or from signed quote
2. Quote marked as "billed" after conversion
3. Line items copied correctly from quote
4. Totals calculate correctly
5. Can record multiple payments
6. Invoice status updates when fully paid
7. Can see payment history
8. PDF generation works
9. Overdue invoices highlighted

---

## Phase 3 Completion Checklist

- [ ] Database tables created
- [ ] TypeScript types defined
- [ ] Invoice CRUD API working
- [ ] Quote-to-invoice conversion working
- [ ] Payment recording working
- [ ] Status workflow correct
- [ ] PDF generation working
- [ ] React components built
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing

**Phase 3 is complete when:** You can create an invoice from a signed quote, record payments, and see the invoice marked as paid. Ready for Phase 4 (bank integration).

---

## Files to Study in Dolibarr

| File | Purpose |
|------|---------|
| `htdocs/compta/facture/class/facture.class.php` | Main class (6,585 lines) |
| `htdocs/compta/facture/class/api_invoices.class.php` | REST API (2,246 lines) |
| `htdocs/compta/facture/card.php` | Detail page |
| `htdocs/compta/facture/list.php` | List page |
| `htdocs/compta/paiement/class/paiement.class.php` | Payment class |
| `htdocs/install/mysql/tables/llx_facture.sql` | Table definition |
