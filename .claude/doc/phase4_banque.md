# Phase 4: Banque (Bank Accounts) Module

## Overview

**Module:** Banque (Bank Accounts & Transactions)
**Priority:** Financial - Final MVP module
**Dependencies:** Phase 3 (Facture) for payment linking
**Estimated Effort:** 2-3 weeks

## Prerequisites

Before starting Phase 4:
- Phase 1 (Societe) complete
- Phase 2 (Propal) complete
- Phase 3 (Facture) complete with payment recording
- Payments can be linked to invoices

---

## Database Schema

### Core Table: llx_bank_account

```sql
CREATE TABLE llx_bank_account (
  -- Primary Identifiers
  rowid            INTEGER AUTO_INCREMENT PRIMARY KEY,
  ref              VARCHAR(12) NOT NULL,
  label            VARCHAR(50) NOT NULL,
  entity           INTEGER DEFAULT 1 NOT NULL,

  -- Account Type & Status
  courant          SMALLINT DEFAULT 0,               -- 0=savings, 1=current, 2=cash
  clos             SMALLINT DEFAULT 0,               -- 0=open, 1=closed
  rappro           SMALLINT DEFAULT 1,               -- Reconciliation enabled

  -- Currency
  currency_code    VARCHAR(3) NOT NULL DEFAULT 'EUR',

  -- Bank Details
  bank             VARCHAR(60) NULL,                 -- Bank name
  code_banque      VARCHAR(128) NULL,                -- Bank code
  code_guichet     VARCHAR(6) NULL,                  -- Branch code
  number           VARCHAR(255) NULL,                -- Account number
  cle_rib          VARCHAR(5) NULL,                  -- RIB key
  iban_prefix      VARCHAR(100) NULL,                -- Full IBAN
  bic              VARCHAR(11) NULL,                 -- BIC/SWIFT

  -- Owner Info
  proprio          VARCHAR(60) NULL,                 -- Account owner
  owner_address    VARCHAR(255) NULL,
  owner_zip        VARCHAR(25) NULL,
  owner_town       VARCHAR(50) NULL,
  fk_pays          INTEGER DEFAULT 0,

  -- Accounting
  account_number   VARCHAR(32) NULL,                 -- Accounting account code

  -- Metadata
  datec            DATETIME NULL,
  tms              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fk_user_author   INTEGER NULL,
  fk_user_modif    INTEGER NULL,

  -- Notes
  comment          TEXT NULL,
  note_public      TEXT NULL,

  -- Indexes
  UNIQUE KEY uk_bank_account_ref (ref, entity),
  KEY idx_bank_account_entity (entity),
  KEY idx_bank_account_clos (clos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Transactions Table: llx_bank

```sql
CREATE TABLE llx_bank (
  -- Primary Identifiers
  rowid            INTEGER AUTO_INCREMENT PRIMARY KEY,
  fk_account       INTEGER NOT NULL,

  -- Amount
  amount           DOUBLE(24,8) NOT NULL DEFAULT 0,

  -- Dates
  datec            DATETIME NULL,                    -- Creation date
  dateo            DATE NOT NULL,                    -- Operation date
  datev            DATE NOT NULL,                    -- Value date
  tms              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Description
  label            VARCHAR(255) NULL,

  -- Transaction Type
  fk_type          VARCHAR(6) NULL,                  -- TIP, VIR, PRE, CB, CHQ, LIQ

  -- Check/Payment Details
  num_releve       VARCHAR(50) NULL,                 -- Statement number
  num_chq          VARCHAR(50) NULL,                 -- Check number
  banque           VARCHAR(255) NULL,                -- Bank name (for checks)
  emetteur         VARCHAR(255) NULL,                -- Issuer name

  -- Reconciliation
  rappro           TINYINT DEFAULT 0,                -- 0=not reconciled, 1=reconciled

  -- Origin Tracking
  origin_type      VARCHAR(64) NULL,                 -- 'payment', 'invoice', etc.
  origin_id        INTEGER NULL,

  -- User Tracking
  fk_user_author   INTEGER NULL,
  fk_user_rappro   INTEGER NULL,

  -- Notes
  note             TEXT NULL,

  -- Indexes
  KEY idx_bank_fk_account (fk_account),
  KEY idx_bank_dateo (dateo),
  KEY idx_bank_datev (datev),
  KEY idx_bank_rappro (rappro),

  -- Foreign Keys
  CONSTRAINT fk_bank_account FOREIGN KEY (fk_account)
    REFERENCES llx_bank_account (rowid) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Link Table: llx_bank_url

```sql
CREATE TABLE llx_bank_url (
  rowid            INTEGER AUTO_INCREMENT PRIMARY KEY,
  fk_bank          INTEGER NOT NULL,
  url_id           INTEGER NOT NULL,                 -- ID of linked object
  type             VARCHAR(24) NOT NULL,             -- 'payment', 'invoice', 'company', etc.
  url              VARCHAR(255) NULL,                -- Display URL
  label            VARCHAR(255) NULL,                -- Display label

  -- Indexes
  KEY idx_bank_url_fk_bank (fk_bank),
  KEY idx_bank_url_type (type),

  -- Foreign Keys
  CONSTRAINT fk_bank_url_bank FOREIGN KEY (fk_bank)
    REFERENCES llx_bank (rowid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Reference Table: llx_c_type_account

```sql
CREATE TABLE llx_c_type_account (
  id        INTEGER PRIMARY KEY,
  code      VARCHAR(12) NOT NULL UNIQUE,
  label     VARCHAR(128),
  active    TINYINT DEFAULT 1 NOT NULL
) ENGINE=InnoDB;

-- Default data
INSERT INTO llx_c_type_account (id, code, label) VALUES
  (0, 'SAVINGS', 'Savings account'),
  (1, 'CURRENT', 'Current/Checking account'),
  (2, 'CASH', 'Cash register');
```

---

## TypeScript Interfaces

```typescript
// types/banque.ts

export type AccountType = 0 | 1 | 2;  // 0=savings, 1=current, 2=cash

export const ACCOUNT_TYPES = {
  SAVINGS: 0 as const,
  CURRENT: 1 as const,
  CASH: 2 as const,
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  0: 'Savings',
  1: 'Current',
  2: 'Cash',
};

export interface BankAccount {
  rowid: number;
  ref: string;
  label: string;
  entity: number;

  // Type & Status
  courant: AccountType;
  clos: 0 | 1;
  rappro: boolean;

  // Currency
  currencyCode: string;

  // Bank Details
  bank?: string;
  codeBanque?: string;
  codeGuichet?: string;
  number?: string;
  cleRib?: string;
  iban?: string;
  bic?: string;

  // Owner
  proprio?: string;
  ownerAddress?: string;
  ownerZip?: string;
  ownerTown?: string;
  fkPays?: number;

  // Accounting
  accountNumber?: string;

  // Metadata
  datec?: string;
  tms: string;
  fkUserAuthor?: number;
  fkUserModif?: number;

  // Notes
  comment?: string;
  notePublic?: string;

  // Computed
  balance?: number;
}

export interface BankTransaction {
  rowid: number;
  fkAccount: number;
  account?: BankAccount;

  // Amount
  amount: number;

  // Dates
  datec?: string;
  dateo: string;       // Operation date
  datev: string;       // Value date
  tms: string;

  // Description
  label?: string;

  // Type
  fkType?: string;     // TIP, VIR, PRE, CB, CHQ, LIQ

  // Details
  numReleve?: string;
  numChq?: string;
  banque?: string;
  emetteur?: string;

  // Reconciliation
  rappro: boolean;

  // Origin
  originType?: string;
  originId?: number;

  // User
  fkUserAuthor?: number;
  fkUserRappro?: number;

  // Notes
  note?: string;

  // Links
  links?: BankLink[];
}

export interface BankLink {
  rowid: number;
  fkBank: number;
  urlId: number;
  type: string;
  url?: string;
  label?: string;
}

// Transaction types
export const TRANSACTION_TYPES = {
  TIP: 'Bank transfer',
  VIR: 'Wire transfer',
  PRE: 'Direct debit',
  CB: 'Credit card',
  CHQ: 'Check',
  LIQ: 'Cash',
};

// API Request Types
export interface BankAccountCreateRequest {
  ref: string;
  label: string;
  courant: AccountType;
  currencyCode?: string;
  bank?: string;
  iban?: string;
  bic?: string;
  proprio?: string;
  ownerAddress?: string;
  fkPays?: number;
  comment?: string;
}

export interface BankAccountUpdateRequest extends Partial<BankAccountCreateRequest> {
  rowid: number;
}

export interface BankTransactionCreateRequest {
  fkAccount: number;
  amount: number;
  dateo: string;
  datev?: string;
  label?: string;
  fkType?: string;
  numChq?: string;
  emetteur?: string;
  note?: string;
}

export interface BankTransferRequest {
  fromAccount: number;
  toAccount: number;
  amount: number;
  date: string;
  label?: string;
}

export interface BankTransactionListParams {
  fkAccount?: number;
  dateStart?: string;
  dateEnd?: string;
  reconciled?: boolean;
  limit?: number;
  page?: number;
}
```

---

## REST API Endpoints

### Bank Accounts: `/api/bankaccounts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List bank accounts |
| GET | `/{id}` | Get account details |
| POST | `/` | Create account |
| PUT | `/{id}` | Update account |
| DELETE | `/{id}` | Delete account (if empty) |
| GET | `/{id}/balance` | Get current balance |

### Transactions: `/api/bankaccounts/{id}/lines`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List transactions |
| POST | `/` | Add transaction |
| PUT | `/{lineid}` | Update transaction |
| DELETE | `/{lineid}` | Delete transaction |
| GET | `/{lineid}/links` | Get linked objects |
| POST | `/{lineid}/links` | Add link to object |

### Special Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transfer` | Internal transfer between accounts |

### Example: Create Bank Account

```http
POST /api/bankaccounts
Content-Type: application/json

{
  "ref": "BNP-001",
  "label": "BNP Main Account",
  "courant": 1,
  "currencyCode": "EUR",
  "bank": "BNP Paribas",
  "iban": "FR76 3000 4000 0300 0012 3456 789",
  "bic": "BNPAFRPP",
  "proprio": "Acme Corporation",
  "ownerAddress": "123 Business Street, Paris"
}
```

### Example: Add Transaction

```http
POST /api/bankaccounts/1/lines
Content-Type: application/json

{
  "amount": 2160.00,
  "dateo": "2024-01-20",
  "datev": "2024-01-20",
  "label": "Payment from Acme Corp - Invoice FA2401-0001",
  "fkType": "VIR",
  "note": "Wire transfer received"
}
```

### Example: Internal Transfer

```http
POST /api/bankaccounts/transfer
Content-Type: application/json

{
  "fromAccount": 1,
  "toAccount": 2,
  "amount": 5000.00,
  "date": "2024-01-25",
  "label": "Transfer to savings"
}
```

**Response:**
```json
{
  "success": true,
  "debitTransaction": {
    "rowid": 501,
    "amount": -5000.00,
    "fkAccount": 1
  },
  "creditTransaction": {
    "rowid": 502,
    "amount": 5000.00,
    "fkAccount": 2
  }
}
```

---

## Payment-Bank Integration

### Linking Payments to Bank Transactions

When a payment is recorded in Phase 3, it should optionally create a bank transaction:

```typescript
interface PaymentWithBank extends PaymentCreateRequest {
  fkBank?: number;           // Bank account to record transaction
  createBankTransaction?: boolean;
}

async function recordPayment(payment: PaymentWithBank): Promise<Payment> {
  // 1. Create payment record
  const paymentId = await createPayment(payment);

  // 2. If bank account specified, create bank transaction
  if (payment.createBankTransaction && payment.fkBank) {
    const invoice = await getInvoice(payment.invoices[0].fkFacture);

    const transaction = await createBankTransaction({
      fkAccount: payment.fkBank,
      amount: payment.amount,
      dateo: payment.datep,
      datev: payment.datep,
      label: `Payment ${payment.ref} - Invoice ${invoice.ref}`,
      fkType: getPaymentTypeCode(payment.fkPaiement),
      numChq: payment.numPaiement,
    });

    // 3. Link transaction to payment and invoice
    await createBankLink({
      fkBank: transaction.rowid,
      urlId: paymentId,
      type: 'payment',
      label: `Payment ${payment.ref}`,
    });

    await createBankLink({
      fkBank: transaction.rowid,
      urlId: invoice.rowid,
      type: 'invoice',
      label: `Invoice ${invoice.ref}`,
    });

    // 4. Update payment with bank transaction link
    await updatePayment(paymentId, { fkBank: transaction.rowid });
  }

  return getPayment(paymentId);
}
```

### Bank Transaction Links

Each bank transaction can be linked to multiple objects:

| Link Type | Description | url_id references |
|-----------|-------------|-------------------|
| `payment` | Payment record | llx_paiement.rowid |
| `invoice` | Invoice | llx_facture.rowid |
| `company` | Third party | llx_societe.rowid |

---

## Balance Calculation

### Current Balance

```typescript
async function calculateBalance(accountId: number): Promise<number> {
  const result = await db.query(`
    SELECT COALESCE(SUM(amount), 0) as balance
    FROM llx_bank
    WHERE fk_account = ?
  `, [accountId]);

  return result[0].balance;
}
```

### Balance at Date

```typescript
async function calculateBalanceAtDate(
  accountId: number,
  date: string
): Promise<number> {
  const result = await db.query(`
    SELECT COALESCE(SUM(amount), 0) as balance
    FROM llx_bank
    WHERE fk_account = ?
      AND datev <= ?
  `, [accountId, date]);

  return result[0].balance;
}
```

---

## React Components

### Component Structure

```
src/
├── features/
│   └── banque/
│       ├── api/
│       │   └── banqueApi.ts
│       ├── components/
│       │   ├── BankAccountList.tsx    # List of accounts
│       │   ├── BankAccountCard.tsx    # Account detail
│       │   ├── BankAccountForm.tsx    # Create/edit account
│       │   ├── TransactionList.tsx    # Transaction history
│       │   ├── TransactionForm.tsx    # Add transaction
│       │   ├── TransactionLinks.tsx   # View linked objects
│       │   ├── TransferForm.tsx       # Internal transfer
│       │   ├── BalanceDisplay.tsx     # Current balance
│       │   └── ReconciliationView.tsx # Mark as reconciled
│       ├── hooks/
│       │   ├── useBankAccount.ts
│       │   ├── useBankAccounts.ts
│       │   ├── useTransactions.ts
│       │   └── useBankMutations.ts
│       └── types/
```

### Key Components

**BankAccountList.tsx**
- Cards or table view of accounts
- Show: ref, label, bank, balance, status
- Quick actions: view transactions, close account

**BankAccountCard.tsx**
- Full account details
- Current balance prominently displayed
- Recent transactions preview
- IBAN/BIC display with copy buttons
- Links to: transactions, reconciliation

**TransactionList.tsx**
- Table: date, label, type, amount, balance, reconciled
- Filters: date range, type, reconciled status
- Running balance column
- Click to view linked objects
- Color coding: green for credits, red for debits

**TransactionForm.tsx**
- Amount (positive = credit, negative = debit)
- Date pickers (operation & value date)
- Type selector
- Label/description
- Check number (if CHQ type)
- Link to existing payment option

**TransferForm.tsx**
- From account selector
- To account selector
- Amount
- Date
- Creates two linked transactions

---

## Validation Rules

### Bank Account
- `ref` required, unique per entity
- `label` required
- `currencyCode` required
- `iban` must be valid format (if provided)
- `bic` must be valid format (if provided)

### Transaction
- `fkAccount` required (must exist)
- `amount` required (non-zero)
- `dateo` required
- `datev` defaults to `dateo`

### Transfer
- `fromAccount` != `toAccount`
- `amount` > 0
- Both accounts must be open
- Same currency (or handle conversion)

---

## Test Criteria

### Unit Tests
- [ ] Balance calculation
- [ ] IBAN validation
- [ ] BIC validation
- [ ] Transfer creates two transactions

### Integration Tests
- [ ] Create bank account
- [ ] Add transactions
- [ ] Balance updates correctly
- [ ] Transfer between accounts
- [ ] Link transaction to payment
- [ ] Cannot delete account with transactions

### E2E Tests
- [ ] Create new bank account
- [ ] View account details
- [ ] Add manual transaction
- [ ] View transaction history
- [ ] Perform internal transfer
- [ ] See linked invoices from transactions

### Full Flow Test
1. Create customer (Phase 1)
2. Create quote (Phase 2)
3. Sign quote
4. Create invoice from quote (Phase 3)
5. Record payment with bank transaction (Phase 3 + 4)
6. Verify bank balance increases
7. Verify invoice marked as paid
8. View transaction linked to invoice

---

## Phase 4 Completion Checklist

- [ ] Database tables created
- [ ] TypeScript types defined
- [ ] Bank account CRUD working
- [ ] Transaction CRUD working
- [ ] Balance calculation working
- [ ] Transfer feature working
- [ ] Payment-bank linking working
- [ ] React components built
- [ ] IBAN/BIC validation working
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Full flow test passing

**Phase 4 is complete when:** You can manage bank accounts, record transactions, link payments to bank transactions, and see the complete quote-to-cash flow reflected in bank balances.

---

## MVP Completion Summary

After Phase 4, the complete MVP supports:

1. **Customer Management** (Phase 1)
   - Create/edit customers
   - Customer search and filtering

2. **Quote Management** (Phase 2)
   - Create quotes for customers
   - Add line items
   - Validate and sign quotes
   - PDF generation

3. **Invoice Management** (Phase 3)
   - Create invoices from quotes
   - Manual invoice creation
   - Payment recording
   - Invoice status tracking

4. **Bank Management** (Phase 4)
   - Bank account setup
   - Transaction recording
   - Payment linking
   - Balance tracking

### Complete Business Flow

```
Customer → Quote → Invoice → Payment → Bank
   ↓         ↓         ↓         ↓        ↓
Create   Create    Convert   Record   Update
         + Sign   + Validate          Balance
```

---

## Files to Study in Dolibarr

| File | Purpose |
|------|---------|
| `htdocs/compta/bank/class/account.class.php` | Bank account class (2,893 lines) |
| `htdocs/compta/bank/class/api_bankaccounts.class.php` | REST API (771 lines) |
| `htdocs/compta/bank/card.php` | Account detail page |
| `htdocs/compta/bank/bankentries_list.php` | Transaction list |
| `htdocs/compta/bank/line.php` | Transaction detail |
| `htdocs/install/mysql/tables/llx_bank_account.sql` | Table definition |
| `htdocs/install/mysql/tables/llx_bank.sql` | Transaction table |
