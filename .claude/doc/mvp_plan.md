# Dolibarr React MVP - Master Plan

## Executive Summary

A **4-module MVP** demonstrating the complete quote-to-cash business cycle for services-based businesses.

| Module | Business Role | Complexity | Effort | Detailed Plan |
|--------|--------------|------------|--------|---------------|
| **Societe** | Customers/Suppliers | 8/10 | 2-3 weeks | [phase1_societe.md](phase1_societe.md) |
| **Propal** | Quotes/Proposals | 7/10 | 2-3 weeks | [phase2_propal.md](phase2_propal.md) |
| **Facture** | Customer Invoices | 8/10 | 3-4 weeks | [phase3_facture.md](phase3_facture.md) |
| **Banque** | Bank & Payments | 5/10 | 2-3 weeks | [phase4_banque.md](phase4_banque.md) |
| **Total** | | | **10-14 weeks** | |

---

## Business Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   CUSTOMER   │────▶│    QUOTE     │────▶│   INVOICE    │────▶│    BANK      │
│   (Phase 1)  │     │   (Phase 2)  │     │   (Phase 3)  │     │   (Phase 4)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
    Create              Create              Convert              Record
                       + Sign             + Validate            Payment
                                          + Pay               + Balance
```

**Target:** Services-based business (consulting, agencies, freelancers)
**Currency:** Single currency (EUR/USD) for MVP
**API:** REST API with 45 endpoints

---

## Functional Specifications

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | Full system access | All CRUD, configuration, user management |
| **Sales** | Commercial operations | Customers, quotes, invoices (read/write) |
| **Accountant** | Financial operations | Invoices, payments, bank (read/write) |
| **Viewer** | Read-only access | All modules (read only) |

---

### Module 1: Third Parties (Societe)

#### US-1.1: Customer List View
**As a** sales user
**I want to** see a list of all customers
**So that** I can quickly find and manage customer information

**Acceptance Criteria:**
- [ ] Display paginated list (20 items per page default)
- [ ] Show columns: Name, Code, Email, Phone, Status, Type
- [ ] Sort by any column (ascending/descending)
- [ ] Display total count of records
- [ ] Show "No customers found" when empty

---

#### US-1.2: Search Customers
**As a** sales user
**I want to** search for customers by name, email, or code
**So that** I can quickly find a specific customer

**Acceptance Criteria:**
- [ ] Search input with debounced query (300ms)
- [ ] Search matches partial name, email, or customer code
- [ ] Results update in real-time
- [ ] Clear search button resets results
- [ ] Highlight matching text in results

---

#### US-1.3: Filter Customers
**As a** sales user
**I want to** filter customers by status and type
**So that** I can view specific subsets of customers

**Acceptance Criteria:**
- [ ] Filter by status: Active, Closed
- [ ] Filter by type: Customer, Prospect, Supplier
- [ ] Filter by entity type: Startup, SME, Large, Individual
- [ ] Multiple filters can be combined
- [ ] Active filters displayed as removable chips
- [ ] "Clear all filters" button

---

#### US-1.4: Create Customer
**As a** sales user
**I want to** create a new customer
**So that** I can start doing business with them

**Acceptance Criteria:**
- [ ] Form with required field: Company Name
- [ ] Optional fields: Email, Phone, Address, VAT Number
- [ ] Type selector: Customer, Prospect, Supplier
- [ ] Country/Region dropdowns
- [ ] Customer code auto-generated on save
- [ ] Validation errors displayed inline
- [ ] Success notification after creation
- [ ] Redirect to customer detail page

**Form Fields:**
| Field | Required | Validation |
|-------|----------|------------|
| Company Name | Yes | 1-128 characters |
| Type | Yes | Customer/Prospect/Supplier |
| Email | No | Valid email format |
| Phone | No | Valid phone format |
| Address | No | Max 255 characters |
| ZIP | No | Max 25 characters |
| City | No | Max 50 characters |
| Country | No | From country list |
| VAT Number | No | Country-specific format |

---

#### US-1.5: View Customer Details
**As a** sales user
**I want to** view complete customer information
**So that** I can understand the customer relationship

**Acceptance Criteria:**
- [ ] Display all customer fields organized in sections
- [ ] Sections: General Info, Contact, Address, Financial
- [ ] Show customer code and creation date
- [ ] Show last modification date and user
- [ ] Edit button (if user has permission)
- [ ] Delete button (if no linked documents)
- [ ] Tabs for: Details, Quotes, Invoices, Notes

---

#### US-1.6: Edit Customer
**As a** sales user
**I want to** edit customer information
**So that** I can keep customer data up to date

**Acceptance Criteria:**
- [ ] Pre-populated form with current values
- [ ] Same validation as create form
- [ ] Cancel button returns to detail view without saving
- [ ] Save button updates record
- [ ] Success notification after update
- [ ] Last modifier and timestamp updated

---

#### US-1.7: Delete Customer
**As an** admin user
**I want to** delete a customer
**So that** I can remove obsolete records

**Acceptance Criteria:**
- [ ] Confirmation dialog before deletion
- [ ] Cannot delete if linked quotes exist
- [ ] Cannot delete if linked invoices exist
- [ ] Error message if deletion blocked
- [ ] Success notification after deletion
- [ ] Redirect to customer list

---

#### US-1.8: Customer Status Management
**As a** sales user
**I want to** change customer status
**So that** I can track the commercial relationship

**Acceptance Criteria:**
- [ ] Toggle between Active and Closed
- [ ] Status change requires confirmation
- [ ] Closed customers filtered out by default
- [ ] Visual indicator for closed customers (gray/strikethrough)

---

### Module 2: Quotes (Propal)

#### US-2.1: Quote List View
**As a** sales user
**I want to** see a list of all quotes
**So that** I can track commercial proposals

**Acceptance Criteria:**
- [ ] Display: Reference, Customer, Date, Amount, Status
- [ ] Sort by any column
- [ ] Pagination (20 per page)
- [ ] Status shown as colored badge
- [ ] Filter by status: Draft, Validated, Signed, Refused, Billed
- [ ] Filter by customer
- [ ] Filter by date range
- [ ] Quick actions: View, Duplicate, Delete (if draft)

---

#### US-2.2: Create Quote
**As a** sales user
**I want to** create a new quote for a customer
**So that** I can propose services to them

**Acceptance Criteria:**
- [ ] Customer selector (required, searchable dropdown)
- [ ] Date field (default: today)
- [ ] Validity date field (default: +30 days)
- [ ] Customer reference field (optional)
- [ ] Public notes field (visible on PDF)
- [ ] Private notes field (internal only)
- [ ] Quote saved as Draft status
- [ ] Reference auto-generated (format: PR{YYMM}-{NNNN})
- [ ] Redirect to quote detail to add lines

---

#### US-2.3: Add Line Item to Quote
**As a** sales user
**I want to** add service lines to a quote
**So that** I can detail the proposed services

**Acceptance Criteria:**
- [ ] Add line button opens form/modal
- [ ] Fields: Description, Quantity, Unit Price, VAT Rate, Discount %
- [ ] Description supports multi-line text
- [ ] Line total calculated automatically
- [ ] VAT calculated automatically (default rate: 20%)
- [ ] Line added to quote immediately
- [ ] Can add multiple lines
- [ ] Lines displayed in sortable table

**Line Fields:**
| Field | Required | Default | Validation |
|-------|----------|---------|------------|
| Description | Yes | - | 1-255 characters |
| Quantity | Yes | 1 | > 0 |
| Unit Price | Yes | 0 | >= 0 |
| VAT Rate | Yes | 20% | 0-100% |
| Discount % | No | 0 | 0-100% |

---

#### US-2.4: Edit Line Item
**As a** sales user
**I want to** edit a quote line
**So that** I can correct or update line details

**Acceptance Criteria:**
- [ ] Edit button on each line (only if quote is Draft)
- [ ] Pre-populated form with current values
- [ ] Totals recalculated on save
- [ ] Quote total updated

---

#### US-2.5: Delete Line Item
**As a** sales user
**I want to** remove a line from a quote
**So that** I can correct the quote content

**Acceptance Criteria:**
- [ ] Delete button on each line (only if quote is Draft)
- [ ] Confirmation dialog
- [ ] Line removed immediately
- [ ] Quote total recalculated
- [ ] Cannot delete last line if quote is validated

---

#### US-2.6: Reorder Line Items
**As a** sales user
**I want to** reorder quote lines
**So that** I can organize the presentation

**Acceptance Criteria:**
- [ ] Drag-and-drop reordering (only if Draft)
- [ ] Or: Move up/down buttons
- [ ] Order preserved in PDF
- [ ] Rang field updated in database

---

#### US-2.7: View Quote Details
**As a** sales user
**I want to** view complete quote information
**So that** I can review before sending to customer

**Acceptance Criteria:**
- [ ] Header: Reference, Customer, Date, Status, Validity
- [ ] Customer info summary (name, email, phone)
- [ ] Line items table with all details
- [ ] Subtotals: Total HT, Total VAT, Total TTC
- [ ] Public and private notes
- [ ] Action buttons based on status
- [ ] PDF preview/download button
- [ ] Timeline/history of status changes

---

#### US-2.8: Validate Quote
**As a** sales user
**I want to** validate a draft quote
**So that** I can send it to the customer

**Acceptance Criteria:**
- [ ] Validate button (only if Draft status)
- [ ] Quote must have at least 1 line
- [ ] Confirmation dialog
- [ ] Status changes to "Validated"
- [ ] Validation date recorded
- [ ] Quote becomes read-only (lines cannot be edited)
- [ ] Can still add notes

**Pre-conditions:**
- Quote status is Draft
- Quote has at least 1 line item

**Post-conditions:**
- Status = Validated (1)
- date_valid = current datetime
- fk_user_valid = current user

---

#### US-2.9: Return Quote to Draft
**As a** sales user
**I want to** return a validated quote to draft
**So that** I can make corrections before customer signs

**Acceptance Criteria:**
- [ ] "Back to Draft" button (only if Validated, not Signed)
- [ ] Confirmation dialog
- [ ] Status returns to Draft
- [ ] Lines become editable again

---

#### US-2.10: Sign Quote (Customer Accepted)
**As a** sales user
**I want to** mark a quote as signed
**So that** I can record customer acceptance

**Acceptance Criteria:**
- [ ] "Mark as Signed" button (only if Validated)
- [ ] Confirmation dialog with optional note
- [ ] Status changes to "Signed"
- [ ] Signature date recorded
- [ ] Quote becomes fully read-only
- [ ] "Convert to Invoice" button appears

**Pre-conditions:**
- Quote status is Validated

**Post-conditions:**
- Status = Signed (2)
- date_signature = current datetime

---

#### US-2.11: Refuse Quote (Customer Declined)
**As a** sales user
**I want to** mark a quote as refused
**So that** I can record customer rejection

**Acceptance Criteria:**
- [ ] "Mark as Refused" button (only if Validated)
- [ ] Confirmation dialog with optional reason
- [ ] Status changes to "Refused"
- [ ] Closure date recorded
- [ ] Quote becomes read-only

**Post-conditions:**
- Status = Refused (3)
- date_cloture = current datetime

---

#### US-2.12: Generate Quote PDF
**As a** sales user
**I want to** generate a PDF of the quote
**So that** I can send it to the customer

**Acceptance Criteria:**
- [ ] "Download PDF" button on detail page
- [ ] PDF includes: Company logo, quote reference, date
- [ ] PDF includes: Customer name and address
- [ ] PDF includes: Line items table with totals
- [ ] PDF includes: Public notes
- [ ] PDF includes: Validity date
- [ ] PDF includes: Payment terms
- [ ] Filename format: Quote_{ref}_{date}.pdf

---

#### US-2.13: Duplicate Quote
**As a** sales user
**I want to** duplicate an existing quote
**So that** I can quickly create similar quotes

**Acceptance Criteria:**
- [ ] "Duplicate" button on detail page
- [ ] Creates new quote in Draft status
- [ ] Copies all lines
- [ ] New reference generated
- [ ] Date set to today
- [ ] Validity date recalculated
- [ ] Redirect to new quote detail

---

### Module 3: Invoices (Facture)

#### US-3.1: Invoice List View
**As an** accountant
**I want to** see a list of all invoices
**So that** I can manage billing and payments

**Acceptance Criteria:**
- [ ] Display: Reference, Customer, Date, Due Date, Amount, Status, Paid %
- [ ] Sort by any column
- [ ] Pagination (20 per page)
- [ ] Status badge with color coding
- [ ] Overdue invoices highlighted in red
- [ ] Filter by status: Draft, Unpaid, Paid
- [ ] Filter by customer
- [ ] Filter by date range
- [ ] Filter: Show overdue only

---

#### US-3.2: Create Invoice from Quote
**As a** sales user
**I want to** convert a signed quote to an invoice
**So that** I can bill the customer

**Acceptance Criteria:**
- [ ] "Create Invoice" button on signed quote
- [ ] Confirmation dialog
- [ ] Invoice created with all lines from quote
- [ ] Invoice in Draft status
- [ ] Quote status changes to "Billed"
- [ ] Link maintained between quote and invoice
- [ ] Redirect to invoice detail page
- [ ] Invoice reference auto-generated (FA{YYMM}-{NNNN})

**Pre-conditions:**
- Quote status is Signed

**Post-conditions:**
- New invoice created (status = Draft)
- Quote status = Billed (4)
- Invoice.module_source = 'propal'

---

#### US-3.3: Create Invoice Manually
**As an** accountant
**I want to** create an invoice without a quote
**So that** I can bill for ad-hoc services

**Acceptance Criteria:**
- [ ] "New Invoice" button in invoice list
- [ ] Customer selector (required)
- [ ] Invoice date (default: today)
- [ ] Payment terms selector
- [ ] Due date auto-calculated from payment terms
- [ ] Notes fields (public/private)
- [ ] Invoice saved as Draft
- [ ] Redirect to add line items

---

#### US-3.4: Add Line to Invoice
**As an** accountant
**I want to** add lines to a draft invoice
**So that** I can detail the billed services

**Acceptance Criteria:**
- [ ] Same functionality as quote lines (US-2.3)
- [ ] Only available when invoice is Draft

---

#### US-3.5: View Invoice Details
**As an** accountant
**I want to** view complete invoice information
**So that** I can manage billing

**Acceptance Criteria:**
- [ ] Header: Reference, Customer, Date, Due Date, Status
- [ ] Payment progress bar (amount paid / total)
- [ ] Line items table
- [ ] Totals: HT, VAT, TTC
- [ ] Remaining to pay amount
- [ ] Payment history section
- [ ] Link to source quote (if converted)
- [ ] Action buttons based on status

---

#### US-3.6: Validate Invoice
**As an** accountant
**I want to** validate a draft invoice
**So that** I can send it for payment

**Acceptance Criteria:**
- [ ] "Validate" button (only if Draft)
- [ ] Invoice must have at least 1 line
- [ ] Confirmation dialog
- [ ] Status changes to "Unpaid"
- [ ] Validation date recorded
- [ ] Invoice becomes read-only
- [ ] Due date finalized

**Pre-conditions:**
- Invoice status is Draft
- Invoice has at least 1 line

**Post-conditions:**
- Status = Validated/Unpaid (1)
- date_valid = current datetime
- paye = 0

---

#### US-3.7: Record Payment
**As an** accountant
**I want to** record a payment against an invoice
**So that** I can track what has been paid

**Acceptance Criteria:**
- [ ] "Record Payment" button (only if Validated/Unpaid)
- [ ] Payment form:
  - Amount (default: remaining amount)
  - Payment date (default: today)
  - Payment method (dropdown)
  - Reference/Check number (optional)
  - Bank account (optional, for Phase 4)
  - Note (optional)
- [ ] Amount cannot exceed remaining
- [ ] Payment created and linked to invoice
- [ ] Invoice remaining amount updated
- [ ] If fully paid: Invoice status → Paid
- [ ] Success notification

**Payment Methods:**
- Bank Transfer
- Wire Transfer
- Credit Card
- Check
- Cash
- Direct Debit

---

#### US-3.8: View Payment History
**As an** accountant
**I want to** see all payments for an invoice
**So that** I can track payment progress

**Acceptance Criteria:**
- [ ] List of all payments for the invoice
- [ ] Show: Date, Amount, Method, Reference
- [ ] Running total of payments
- [ ] Timeline view option

---

#### US-3.9: Invoice Marked as Paid
**As an** accountant
**I want** the invoice to automatically update when fully paid
**So that** I know which invoices are settled

**Acceptance Criteria:**
- [ ] When total payments >= invoice total
- [ ] Status automatically changes to "Paid"
- [ ] Closing date recorded
- [ ] "Paid" badge displayed
- [ ] Invoice moves out of "Unpaid" filter

**Post-conditions:**
- Status = Paid (2)
- paye = 1
- date_closing = current datetime

---

#### US-3.10: Generate Invoice PDF
**As an** accountant
**I want to** generate a PDF of the invoice
**So that** I can send it to the customer

**Acceptance Criteria:**
- [ ] Similar to quote PDF (US-2.12)
- [ ] Includes invoice-specific fields:
  - Invoice reference
  - Due date
  - Payment terms
  - Bank details for payment
- [ ] Shows paid stamp if fully paid

---

#### US-3.11: View Overdue Invoices
**As an** accountant
**I want to** see all overdue invoices
**So that** I can follow up on late payments

**Acceptance Criteria:**
- [ ] "Overdue" filter in invoice list
- [ ] Shows invoices where: status=Unpaid AND due_date < today
- [ ] Days overdue column
- [ ] Sort by days overdue (most overdue first)
- [ ] Visual indicator (red highlight/badge)

---

### Module 4: Bank (Banque)

#### US-4.1: Bank Account List
**As an** accountant
**I want to** see all bank accounts
**So that** I can manage company finances

**Acceptance Criteria:**
- [ ] Display: Reference, Label, Bank, Balance, Status
- [ ] Current balance prominently displayed
- [ ] Status: Open/Closed
- [ ] Currency shown
- [ ] Quick action: View transactions

---

#### US-4.2: Create Bank Account
**As an** admin
**I want to** add a new bank account
**So that** I can track transactions

**Acceptance Criteria:**
- [ ] Form fields:
  - Reference (required, unique)
  - Label (required)
  - Account type (Savings/Current/Cash)
  - Currency (default: EUR)
  - Bank name
  - IBAN
  - BIC/SWIFT
  - Account owner
  - Notes
- [ ] IBAN validation (format check)
- [ ] BIC validation (format check)
- [ ] Success notification
- [ ] Redirect to account detail

---

#### US-4.3: View Bank Account Details
**As an** accountant
**I want to** view bank account details
**So that** I can see account information and balance

**Acceptance Criteria:**
- [ ] Display all account information
- [ ] Current balance prominently shown
- [ ] IBAN with copy button
- [ ] BIC with copy button
- [ ] Recent transactions preview (last 10)
- [ ] "View All Transactions" button
- [ ] Edit button (if admin)

---

#### US-4.4: View Transaction List
**As an** accountant
**I want to** see all transactions for an account
**So that** I can track money movement

**Acceptance Criteria:**
- [ ] Display: Date, Label, Type, Amount, Balance
- [ ] Running balance column
- [ ] Credit amounts in green (+)
- [ ] Debit amounts in red (-)
- [ ] Filter by date range
- [ ] Filter by type (transfer, card, check, etc.)
- [ ] Search by label
- [ ] Pagination
- [ ] Export to CSV

---

#### US-4.5: Add Manual Transaction
**As an** accountant
**I want to** record a transaction manually
**So that** I can track all money movements

**Acceptance Criteria:**
- [ ] Form fields:
  - Amount (positive = credit, negative = debit)
  - Operation date (required)
  - Value date (default: operation date)
  - Label/Description (required)
  - Transaction type (dropdown)
  - Check number (if type = check)
  - Note (optional)
- [ ] Transaction created
- [ ] Account balance updated
- [ ] Success notification

---

#### US-4.6: Transaction Linked to Payment
**As an** accountant
**I want** payments to create bank transactions
**So that** bank balance reflects all payments

**Acceptance Criteria:**
- [ ] When recording payment (US-3.7):
  - Option to select bank account
  - If selected: bank transaction auto-created
  - Transaction linked to payment
  - Transaction linked to invoice
- [ ] Transaction label includes invoice reference
- [ ] Can view linked invoice from transaction

---

#### US-4.7: View Transaction Links
**As an** accountant
**I want to** see what a transaction is linked to
**So that** I can understand the transaction context

**Acceptance Criteria:**
- [ ] Click on transaction shows linked objects
- [ ] Links to: Payment, Invoice, Customer
- [ ] Can navigate to linked objects

---

#### US-4.8: Internal Transfer
**As an** accountant
**I want to** transfer money between accounts
**So that** I can manage cash between accounts

**Acceptance Criteria:**
- [ ] "Transfer" button in bank module
- [ ] Form:
  - From account (dropdown)
  - To account (dropdown)
  - Amount (positive number)
  - Date
  - Label/Note
- [ ] Cannot transfer to same account
- [ ] Creates two transactions:
  - Debit on source account (-amount)
  - Credit on destination account (+amount)
- [ ] Transactions linked to each other
- [ ] Both balances updated

---

#### US-4.9: View Account Balance
**As an** accountant
**I want to** see the current balance of an account
**So that** I know available funds

**Acceptance Criteria:**
- [ ] Balance displayed on account card
- [ ] Balance = sum of all transactions
- [ ] Updates in real-time after new transaction
- [ ] Balance shown in account currency

---

### Cross-Module User Stories

#### US-X.1: Complete Quote-to-Cash Flow
**As a** sales user
**I want to** complete the full business cycle
**So that** I can serve customers end-to-end

**Scenario:**
1. Create new customer "Acme Corp"
2. Create quote for Acme Corp with 2 service lines
3. Validate the quote
4. Mark quote as signed (customer accepted)
5. Convert quote to invoice
6. Validate the invoice
7. Record payment (full amount) with bank account
8. Verify: Invoice marked as Paid
9. Verify: Bank balance increased

**Acceptance Criteria:**
- [ ] All steps completable through UI
- [ ] Data integrity maintained throughout
- [ ] Links between objects preserved
- [ ] Correct statuses at each step

---

#### US-X.2: Dashboard Overview
**As a** user
**I want to** see a dashboard with key metrics
**So that** I can understand business status at a glance

**Acceptance Criteria:**
- [ ] Total customers count
- [ ] Quotes summary: Draft, Pending, Signed this month
- [ ] Invoices summary: Draft, Unpaid, Overdue, Paid this month
- [ ] Revenue this month (paid invoices)
- [ ] Bank balance total (all accounts)
- [ ] Quick links to create: Customer, Quote, Invoice

---

#### US-X.3: Global Search
**As a** user
**I want to** search across all modules
**So that** I can quickly find any record

**Acceptance Criteria:**
- [ ] Search bar in header
- [ ] Search across: Customers, Quotes, Invoices
- [ ] Results grouped by type
- [ ] Show: Reference, Name/Label, Status
- [ ] Click to navigate to record

---

### Non-Functional Requirements

#### NFR-1: Performance
- Page load time < 2 seconds
- Search results < 500ms
- PDF generation < 3 seconds
- API response time < 200ms (95th percentile)

#### NFR-2: Usability
- Mobile-responsive design
- Keyboard navigation support
- Form validation with inline errors
- Loading indicators for async operations
- Success/error notifications

#### NFR-3: Security
- Authentication required for all operations
- Role-based access control
- API token authentication
- Input sanitization
- HTTPS only

#### NFR-4: Data Integrity
- Foreign key constraints enforced
- Cascade rules for deletions
- Audit trail (created/modified timestamps and users)
- Prevent duplicate references

---

## Implementation Phases

### Phase 1: Societe (Third Parties)
**Document:** [phase1_societe.md](phase1_societe.md)

| Metric | Value |
|--------|-------|
| Database Tables | 5 core tables |
| API Endpoints | 8 |
| Key Features | Customer CRUD, search, filtering |
| Dependencies | None (foundation) |

**Completion Criteria:**
- Can create/edit/delete customers and suppliers
- Search and filter working
- Customer codes auto-generated

---

### Phase 2: Propal (Quotes)
**Document:** [phase2_propal.md](phase2_propal.md)

| Metric | Value |
|--------|-------|
| Database Tables | 4 core tables |
| API Endpoints | 17 |
| Key Features | Quote CRUD, line items, status workflow |
| Dependencies | Phase 1 (Societe) |

**Status Workflow:**
```
DRAFT → VALIDATED → SIGNED/REFUSED → BILLED
```

**Completion Criteria:**
- Can create quotes linked to customers
- Line items with VAT calculation
- Validate, sign, or refuse quotes
- PDF generation

---

### Phase 3: Facture (Invoices)
**Document:** [phase3_facture.md](phase3_facture.md)

| Metric | Value |
|--------|-------|
| Database Tables | 6 core tables |
| API Endpoints | 13 |
| Key Features | Invoice CRUD, quote conversion, payments |
| Dependencies | Phase 1, Phase 2 |

**Key Flows:**
- Create invoice from signed quote
- Record partial/full payments
- Invoice marked paid when fully settled

**Completion Criteria:**
- Quote-to-invoice conversion working
- Payment recording functional
- Invoice status updates on payment
- PDF generation

---

### Phase 4: Banque (Bank)
**Document:** [phase4_banque.md](phase4_banque.md)

| Metric | Value |
|--------|-------|
| Database Tables | 5 core tables |
| API Endpoints | 7 |
| Key Features | Bank accounts, transactions, balance |
| Dependencies | Phase 1, 2, 3 |

**Key Flows:**
- Payments create bank transactions
- Transactions linked to invoices
- Real-time balance calculation

**Completion Criteria:**
- Bank account management working
- Transactions recorded with payments
- Balance reflects all transactions
- Full quote-to-cash flow complete

---

## Technical Summary

### Database (51 Tables Total)

| Phase | Tables | Key Tables |
|-------|--------|------------|
| 1 | 12 | llx_societe, llx_c_stcomm, llx_c_typent |
| 2 | 13 | llx_propal, llx_propaldet, llx_c_propalst |
| 3 | 11 | llx_facture, llx_facturedet, llx_paiement |
| 4 | 15 | llx_bank_account, llx_bank, llx_bank_url |

### REST API (45 Endpoints)

| Module | Endpoints | Operations |
|--------|-----------|------------|
| `/api/thirdparties` | 8 | CRUD, search by email/barcode |
| `/api/proposals` | 17 | CRUD, lines, validate, sign, close |
| `/api/invoices` | 13 | CRUD, lines, validate, pay |
| `/api/bankaccounts` | 7 | CRUD, transactions, transfer |

### React Components (per phase)

Each phase includes:
- List view with filters and pagination
- Detail/card view
- Create/edit forms
- Status badges and action buttons
- PDF preview/download (where applicable)

---

## Timeline

```
Week 1-3:   Phase 1 (Societe)   ──▶ Test ──▶ Review
Week 4-6:   Phase 2 (Propal)    ──▶ Test ──▶ Review
Week 7-10:  Phase 3 (Facture)   ──▶ Test ──▶ Review
Week 11-13: Phase 4 (Banque)    ──▶ Test ──▶ Review
Week 14:    Integration Test    ──▶ Full Flow ──▶ Release
```

---

## Success Criteria

MVP is complete when the full business flow works:

1. **Create Customer** → Customer appears in list
2. **Create Quote** → Quote linked to customer, lines calculated
3. **Sign Quote** → Status updates to "Signed"
4. **Convert to Invoice** → Invoice created, quote marked "Billed"
5. **Record Payment** → Invoice status updates
6. **Bank Transaction** → Balance reflects payment
7. **Full Paid** → Invoice marked as "Paid"

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Module complexity | Strip to MVP features only |
| Quote-to-invoice conversion | Thorough integration testing |
| PDF generation | Single template, defer multi-template |
| Cross-module integrity | Foreign key validation |
| No product catalog | Free-text lines in quotes/invoices |

---

## Future Phases (Post-MVP)

### Phase 5: Enhanced Features
- Product catalog (basic)
- Multi-currency support
- Multiple PDF templates
- Online signature

### Phase 6: Extended Modules
- Commande (sales orders)
- Fournisseur (suppliers)
- Stock (inventory)
- Accounting integration

---

## Quick Links

| Document | Description |
|----------|-------------|
| [phase1_societe.md](phase1_societe.md) | Full schema, API, components for Third Parties |
| [phase2_propal.md](phase2_propal.md) | Full schema, API, components for Quotes |
| [phase3_facture.md](phase3_facture.md) | Full schema, API, components for Invoices |
| [phase4_banque.md](phase4_banque.md) | Full schema, API, components for Bank |

Each phase document contains:
- Complete database schema (CREATE TABLE)
- TypeScript interfaces
- REST API with request/response examples
- React component structure
- Validation rules
- Test criteria
- Completion checklist
