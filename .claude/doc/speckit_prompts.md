# Spec-Kit Prompts for Dolibarr React MVP

This document contains spec-kit prompts for each user story in the MVP. Use these prompts with spec-kit commands (`/speckit.specify`, `/speckit.plan`, `/speckit.tasks`) to generate detailed specifications and implementation plans.

**Documentation References:**
- Master Plan: `@doc/mvp_plan.md`
- Phase 1 (Third Parties): `@doc/phase1_societe.md`
- Phase 2 (Quotes): `@doc/phase2_propal.md`
- Phase 3 (Invoices): `@doc/phase3_facture.md`
- Phase 4 (Bank): `@doc/phase4_banque.md`

---

## Phase 1: Third Parties (Societe)

### US-1.1: Customer List View

**`/speckit.specify` prompt:**
```
Implement a customer list view component for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase1_societe.md

Feature: Display a paginated list of all customers (third parties) from the llx_societe table.

Requirements:
- Show columns: Name (nom), Code (code_client), Email, Phone, Status, Type (client/fournisseur)
- Paginate results with 20 items per page default
- Allow sorting by any column (ascending/descending toggle)
- Display total record count in the header
- Show empty state "No customers found" when no records exist
- Each row should be clickable to navigate to customer detail

User: Sales user managing customer relationships
Goal: Quickly find and manage customer information from a centralized list
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-1.1 Customer List View.

References: @doc/mvp_plan.md @doc/phase1_societe.md

Tech stack:
- React with TypeScript
- TanStack Query for data fetching
- TanStack Table for list management
- REST API endpoint: GET /api/thirdparties

Follow the TypeScript interfaces defined in @doc/phase1_societe.md for Societe type.
Use the pagination pattern: limit/offset query parameters.
```

---

### US-1.2: Search Customers

**`/speckit.specify` prompt:**
```
Implement customer search functionality for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase1_societe.md

Feature: Add search capability to the customer list view that searches by name, email, or customer code.

Requirements:
- Search input field with debounced query (300ms delay)
- Search matches partial text in: nom (name), email, code_client
- Results update in real-time as user types
- Clear button (X icon) resets search and shows all results
- Optional: Highlight matching text in search results
- Integrate with existing list pagination

User: Sales user looking for a specific customer
Goal: Find a specific customer quickly without scrolling through the entire list
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-1.2 Search Customers.

References: @doc/mvp_plan.md @doc/phase1_societe.md

Tech stack:
- React useState for search term
- useDebouncedValue hook (300ms)
- TanStack Query with search parameter
- API endpoint: GET /api/thirdparties?sqlfilters=(nom:like:'%{query}%') OR use multi-field search

Integrate with the CustomerList component from US-1.1.
```

---

### US-1.3: Filter Customers

**`/speckit.specify` prompt:**
```
Implement customer filtering functionality for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase1_societe.md

Feature: Add filter controls to the customer list to filter by status, type, and entity type.

Requirements:
- Filter by status: Active (status=1), Closed (status=0)
- Filter by type: Customer (client=1), Prospect (client=2), Supplier (fournisseur=1)
- Filter by entity type: Startup, SME, Large, Individual (from llx_c_typent)
- Multiple filters can be combined (AND logic)
- Active filters displayed as removable chips/badges
- "Clear all filters" button when any filter is active
- Persist filters in URL query parameters for shareable links

User: Sales user segmenting customer database
Goal: View specific subsets of customers based on business criteria
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-1.3 Filter Customers.

References: @doc/mvp_plan.md @doc/phase1_societe.md

Tech stack:
- React state for filter values
- URL search params sync (useSearchParams)
- TanStack Query with filter parameters
- API: GET /api/thirdparties?sqlfilters=(status:=:1)AND(client:=:1)

Reference llx_c_typent and llx_c_stcomm tables from @doc/phase1_societe.md for dropdown options.
```

---

### US-1.4: Create Customer

**`/speckit.specify` prompt:**
```
Implement customer creation form for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase1_societe.md

Feature: Form to create new third party (customer, prospect, or supplier) records.

Requirements:
- Required field: Company Name (nom) - 1-128 characters
- Type selector: Customer, Prospect, Supplier (sets client/fournisseur flags)
- Optional fields: Email, Phone, Address, ZIP, City, Country, VAT Number
- Country dropdown from llx_c_country reference table
- Customer code (code_client) auto-generated on save using numbering module
- Inline validation errors displayed next to fields
- Success notification (toast) after creation
- Redirect to customer detail page on success

Form validation:
- Email: Valid email format if provided
- Phone: Valid phone format if provided
- VAT: Country-specific format validation

User: Sales user onboarding new business relationships
Goal: Create customer records to enable quotes and invoices
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-1.4 Create Customer.

References: @doc/mvp_plan.md @doc/phase1_societe.md

Tech stack:
- React Hook Form for form management
- Zod for validation schema
- TanStack Query mutation for POST
- API: POST /api/thirdparties

Follow CreateSocieteDTO interface from @doc/phase1_societe.md.
Use the numbering pattern mod_codeclient_elephant for code generation.
```

---

### US-1.5: View Customer Details

**`/speckit.specify` prompt:**
```
Implement customer detail view for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase1_societe.md

Feature: Display complete customer information organized in logical sections.

Requirements:
- Organized sections: General Info, Contact Details, Address, Financial
- Display customer code, creation date (datec), last modification date (tms)
- Show who created/modified the record (fk_user_creat, fk_user_modif)
- Edit button (visible if user has write permission)
- Delete button (visible if no linked quotes/invoices exist)
- Tabbed interface:
  - Details (default): All customer fields
  - Quotes: List of linked quotes (propal where fk_soc matches)
  - Invoices: List of linked invoices (facture where fk_soc matches)
  - Notes: Customer notes (note_public, note_private)

User: Sales user reviewing customer relationship
Goal: Understand complete customer context including history
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-1.5 View Customer Details.

References: @doc/mvp_plan.md @doc/phase1_societe.md @doc/phase2_propal.md @doc/phase3_facture.md

Tech stack:
- React Router for /customers/:id route
- TanStack Query for data fetching
- Tabs component (headless UI or similar)
- API: GET /api/thirdparties/{id}

Cross-reference with propal and facture APIs to populate tabs.
```

---

### US-1.6: Edit Customer

**`/speckit.specify` prompt:**
```
Implement customer edit functionality for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase1_societe.md

Feature: Form to edit existing customer records with all fields pre-populated.

Requirements:
- Pre-populate form with current customer values
- Same validation rules as create form (US-1.4)
- Cancel button returns to detail view without saving changes
- Save button submits update via API
- Success notification after update
- Update tms (timestamp) and fk_user_modif automatically
- Handle concurrent edit conflicts (optional: optimistic locking with tms)

User: Sales user maintaining accurate customer data
Goal: Keep customer information current and correct
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-1.6 Edit Customer.

References: @doc/mvp_plan.md @doc/phase1_societe.md

Tech stack:
- Reuse CustomerForm component from US-1.4
- TanStack Query mutation for PUT
- API: PUT /api/thirdparties/{id}

Follow UpdateSocieteDTO interface from @doc/phase1_societe.md.
```

---

### US-1.7: Delete Customer

**`/speckit.specify` prompt:**
```
Implement customer deletion for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase1_societe.md

Feature: Allow admin users to delete customer records with proper safeguards.

Requirements:
- Delete button visible only for admin role
- Confirmation dialog before deletion: "Are you sure you want to delete {customer name}?"
- Pre-check: Cannot delete if linked quotes exist (propal.fk_soc)
- Pre-check: Cannot delete if linked invoices exist (facture.fk_soc)
- Show specific error message if deletion blocked: "Cannot delete: {N} quotes and {M} invoices are linked to this customer"
- Success notification after deletion
- Redirect to customer list after successful deletion

User: Admin cleaning up obsolete customer records
Goal: Remove customers that are no longer needed while protecting data integrity
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-1.7 Delete Customer.

References: @doc/mvp_plan.md @doc/phase1_societe.md

Tech stack:
- Confirmation modal component
- TanStack Query mutation for DELETE
- API: DELETE /api/thirdparties/{id}
- Pre-flight check: GET /api/thirdparties/{id}/linkedobjects or count linked records

The API should return 409 Conflict if deletion not allowed with linked object counts.
```

---

### US-1.8: Customer Status Management

**`/speckit.specify` prompt:**
```
Implement customer status toggle for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase1_societe.md

Feature: Allow users to change customer status between Active and Closed.

Requirements:
- Status toggle button on customer detail page
- Toggle between Active (status=1) and Closed (status=0)
- Confirmation dialog: "Change status to {new status}?"
- Closed customers filtered out by default in list view
- Visual indicator for closed customers: gray background, strikethrough text, or "Closed" badge
- Status change updates tms and fk_user_modif

User: Sales user managing customer lifecycle
Goal: Track commercial relationship status (active vs closed accounts)
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-1.8 Customer Status Management.

References: @doc/mvp_plan.md @doc/phase1_societe.md

Tech stack:
- Toggle/Switch component
- TanStack Query mutation
- API: PUT /api/thirdparties/{id} with { status: 0|1 }

Update list view filter to hide status=0 by default (add "Show closed" checkbox).
```

---

## Phase 2: Quotes (Propal)

### US-2.1: Quote List View

**`/speckit.specify` prompt:**
```
Implement quote list view component for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Display a paginated list of all quotes (propals) with filtering capabilities.

Requirements:
- Columns: Reference (ref), Customer name, Date (datep), Total TTC, Status (fk_statut)
- Sort by any column
- Pagination with 20 items per page
- Status displayed as colored badge:
  - Draft (0): Gray
  - Validated (1): Blue
  - Signed (2): Green
  - Refused (3): Red
  - Billed (4): Purple
- Filter by status (multi-select dropdown)
- Filter by customer (searchable dropdown)
- Filter by date range (from/to date pickers)
- Quick actions per row: View, Duplicate, Delete (if draft only)
- Click row to navigate to quote detail

User: Sales user tracking commercial proposals
Goal: Monitor quote pipeline and take action on proposals
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.1 Quote List View.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- TanStack Table with sorting, filtering
- TanStack Query for data fetching
- API: GET /api/proposals with filter params
- Date range picker component

Map fk_statut to status labels from llx_c_propalst reference table.
```

---

### US-2.2: Create Quote

**`/speckit.specify` prompt:**
```
Implement quote creation form for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Create new quote (propal) header linked to a customer.

Requirements:
- Customer selector: Required, searchable dropdown from societe list (client=1 or client=2)
- Date field (datep): Default to today
- Validity date (fin_validite): Default to today + 30 days
- Customer reference field (ref_client): Optional free text
- Public notes (note_public): Textarea, visible on PDF
- Private notes (note_private): Textarea, internal only
- Quote saved with status = Draft (0)
- Reference (ref) auto-generated: Format PR{YYMM}-{NNNN}
- Redirect to quote detail page to add line items

User: Sales user creating new proposal for customer
Goal: Start a quote that can be detailed with service lines
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.2 Create Quote.

References: @doc/mvp_plan.md @doc/phase2_propal.md @doc/phase1_societe.md

Tech stack:
- React Hook Form
- Customer search/select component (combobox)
- Date picker components
- TanStack Query mutation
- API: POST /api/proposals

Follow CreatePropalDTO from @doc/phase2_propal.md.
Use mod_propale_marbre numbering module pattern.
```

---

### US-2.3: Add Line Item to Quote

**`/speckit.specify` prompt:**
```
Implement add line item functionality for quotes in Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Add service lines to a draft quote with automatic calculations.

Requirements:
- "Add Line" button opens form (modal or inline)
- Fields:
  - Description (desc): Required, multi-line textarea, 1-255 chars
  - Quantity (qty): Required, default 1, must be > 0
  - Unit Price (subprice): Required, default 0, >= 0
  - VAT Rate (tva_tx): Required, default 20%, dropdown 0-100%
  - Discount % (remise_percent): Optional, default 0, range 0-100%
- Automatic calculations:
  - total_ht = qty * subprice * (1 - remise_percent/100)
  - total_tva = total_ht * tva_tx/100
  - total_ttc = total_ht + total_tva
- Line added immediately (API call on save)
- Can add multiple lines sequentially
- Lines displayed in sortable table with rang (order) field
- Update quote totals after each line add

User: Sales user detailing services in a quote
Goal: Build itemized quote with accurate pricing
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.3 Add Line Item to Quote.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- Modal dialog component
- React Hook Form with Zod validation
- TanStack Query mutation
- API: POST /api/proposals/{id}/lines

Follow PropalLine interface from @doc/phase2_propal.md.
Implement calculation helpers for totals.
```

---

### US-2.4: Edit Line Item

**`/speckit.specify` prompt:**
```
Implement edit line item functionality for quotes in Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Edit existing quote line items when quote is in Draft status.

Requirements:
- Edit button (pencil icon) on each line row
- Only visible/enabled when quote status = Draft (0)
- Opens same form as add, pre-populated with current values
- Recalculate line totals on save
- Recalculate quote totals after line update
- API updates the specific line by lineid

User: Sales user correcting quote details
Goal: Adjust line items before sending quote to customer
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.4 Edit Line Item.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- Reuse LineItemForm component from US-2.3
- TanStack Query mutation
- API: PUT /api/proposals/{id}/lines/{lineid}

Invalidate quote query to refresh totals after update.
```

---

### US-2.5: Delete Line Item

**`/speckit.specify` prompt:**
```
Implement delete line item functionality for quotes in Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Remove a line item from a draft quote.

Requirements:
- Delete button (trash icon) on each line row
- Only visible/enabled when quote status = Draft (0)
- Confirmation dialog: "Delete this line item?"
- Line removed via API call
- Quote totals recalculated after deletion
- Prevent deletion of last line if quote is already validated (edge case protection)

User: Sales user removing incorrect or unwanted line items
Goal: Correct quote content before sending to customer
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.5 Delete Line Item.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- Confirmation dialog component
- TanStack Query mutation
- API: DELETE /api/proposals/{id}/lines/{lineid}

Invalidate quote query to refresh totals after deletion.
```

---

### US-2.6: Reorder Line Items

**`/speckit.specify` prompt:**
```
Implement line item reordering for quotes in Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Allow users to reorder quote lines for presentation purposes.

Requirements:
- Drag-and-drop reordering OR up/down arrow buttons on each line
- Only enabled when quote status = Draft (0)
- Order preserved in rang field in llx_propaldet
- Order reflected in PDF output
- Batch update rang values after reorder

User: Sales user organizing quote presentation
Goal: Arrange line items in logical order for customer review
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.6 Reorder Line Items.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- @dnd-kit/sortable or similar drag-drop library
- OR simple up/down buttons with onClick handlers
- Batch API call to update rang values
- API: PUT /api/proposals/{id}/lines/{lineid} with { rang: newPosition }
```

---

### US-2.7: View Quote Details

**`/speckit.specify` prompt:**
```
Implement quote detail view for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Display complete quote information with all line items and totals.

Requirements:
- Header section: Reference (ref), Customer link, Date, Status badge, Validity date
- Customer info summary: Name, email, phone (from linked societe)
- Line items table: Description, Qty, Unit Price, VAT, Discount, Line Total
- Totals section:
  - Total HT (total_ht)
  - Total VAT (total_tva)
  - Total TTC (total_ttc)
- Notes section: Public notes, Private notes
- Action buttons based on status (see status workflow)
- PDF preview/download button
- Timeline/history showing status changes with dates

User: Sales user reviewing quote before customer presentation
Goal: Verify all quote details are correct and take appropriate actions
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.7 View Quote Details.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- React Router: /quotes/:id
- TanStack Query for quote + lines fetch
- API: GET /api/proposals/{id}
- Conditional action buttons based on fk_statut

Follow QuoteDetail component structure from @doc/phase2_propal.md.
```

---

### US-2.8: Validate Quote

**`/speckit.specify` prompt:**
```
Implement quote validation for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Transition a draft quote to validated status, making it ready to send to customer.

Requirements:
- "Validate" button visible only when status = Draft (0)
- Pre-validation checks:
  - Quote must have at least 1 line item
  - All required fields must be filled
- Confirmation dialog: "Validate this quote? Lines will become read-only."
- On confirm:
  - Status changes to Validated (1)
  - date_valid set to current datetime
  - fk_user_valid set to current user
- Quote lines become read-only (add/edit/delete buttons hidden)
- Notes can still be edited

User: Sales user finalizing quote for customer presentation
Goal: Lock quote content and mark as ready for customer review
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.8 Validate Quote.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- Confirmation dialog
- TanStack Query mutation
- API: POST /api/proposals/{id}/validate

Update UI to reflect read-only state for lines after validation.
```

---

### US-2.9: Return Quote to Draft

**`/speckit.specify` prompt:**
```
Implement return-to-draft functionality for quotes in Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Allow returning a validated quote back to draft status for corrections.

Requirements:
- "Back to Draft" button visible only when status = Validated (1)
- Cannot use this action if quote is Signed (2) or Billed (4)
- Confirmation dialog: "Return to draft? You will need to re-validate before sending."
- On confirm:
  - Status changes back to Draft (0)
  - date_valid cleared
  - Lines become editable again

User: Sales user needing to make corrections to a validated quote
Goal: Unlock quote for editing before customer has signed
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.9 Return Quote to Draft.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- Confirmation dialog
- TanStack Query mutation
- API: POST /api/proposals/{id}/settodraft (or PUT with status change)

Update UI to re-enable line editing after returning to draft.
```

---

### US-2.10: Sign Quote (Customer Accepted)

**`/speckit.specify` prompt:**
```
Implement quote signing for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Mark a validated quote as signed (customer accepted the proposal).

Requirements:
- "Mark as Signed" button visible only when status = Validated (1)
- Confirmation dialog with optional note field: "Mark as signed? Add a note (optional):"
- On confirm:
  - Status changes to Signed (2)
  - date_signature (or date_cloture) set to current datetime
  - Optional note saved to note_private or dedicated field
- Quote becomes fully read-only (lines AND notes)
- "Convert to Invoice" button appears

User: Sales user recording customer acceptance
Goal: Track that customer agreed to the quote terms
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.10 Sign Quote.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- Dialog with textarea for note
- TanStack Query mutation
- API: POST /api/proposals/{id}/close with { status: 2, note_private: "..." }

Show "Convert to Invoice" button after status change.
```

---

### US-2.11: Refuse Quote (Customer Declined)

**`/speckit.specify` prompt:**
```
Implement quote refusal for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Mark a validated quote as refused (customer declined the proposal).

Requirements:
- "Mark as Refused" button visible only when status = Validated (1)
- Confirmation dialog with optional reason field: "Mark as refused? Reason (optional):"
- On confirm:
  - Status changes to Refused (3)
  - date_cloture set to current datetime
  - Reason saved to note_private or dedicated field
- Quote becomes fully read-only
- Visual indicator: "Refused" badge in red

User: Sales user recording customer rejection
Goal: Track lost opportunities and reasons
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.11 Refuse Quote.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- Dialog with textarea for reason
- TanStack Query mutation
- API: POST /api/proposals/{id}/close with { status: 3, note_private: "Refused: reason" }
```

---

### US-2.12: Generate Quote PDF

**`/speckit.specify` prompt:**
```
Implement PDF generation for quotes in the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Generate and download a PDF document for the quote.

Requirements:
- "Download PDF" button on quote detail page
- PDF includes:
  - Company logo (from configuration)
  - Quote reference and date
  - Customer name and address
  - Line items table with quantities, prices, totals
  - Subtotals: HT, VAT, TTC
  - Public notes
  - Validity date
  - Payment terms (if defined)
- Filename format: Quote_{ref}_{date}.pdf
- Open in new tab or trigger download

User: Sales user preparing quote for customer delivery
Goal: Create professional PDF to send to customer
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.12 Generate Quote PDF.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- API: GET /api/proposals/{id}/document?format=pdf (or POST /api/documents/proposal/{id})
- Backend generates PDF using existing Dolibarr PDF modules
- Frontend triggers download via blob URL or opens in new tab

Single PDF template for MVP; multiple templates deferred to Phase 2.
```

---

### US-2.13: Duplicate Quote

**`/speckit.specify` prompt:**
```
Implement quote duplication for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md

Feature: Create a copy of an existing quote with new reference and dates.

Requirements:
- "Duplicate" button on quote detail page (any status)
- Creates new quote with:
  - New reference (auto-generated)
  - Status = Draft (0)
  - Date = today
  - Validity date = today + 30 days
  - All lines copied with same values
  - Customer preserved
  - Notes cleared or copied (configurable)
- Redirect to new quote detail page after creation
- Success notification: "Quote duplicated successfully"

User: Sales user creating similar quotes for different periods or modified terms
Goal: Save time by copying existing quote structure
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-2.13 Duplicate Quote.

References: @doc/mvp_plan.md @doc/phase2_propal.md

Tech stack:
- TanStack Query mutation
- API: POST /api/proposals (with clone logic) OR POST /api/proposals/{id}/clone

If API doesn't support clone, fetch quote + lines and POST as new quote.
```

---

## Phase 3: Invoices (Facture)

### US-3.1: Invoice List View

**`/speckit.specify` prompt:**
```
Implement invoice list view for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md

Feature: Display a paginated list of all customer invoices with status indicators.

Requirements:
- Columns: Reference (ref), Customer, Date (datef), Due Date (date_lim_reglement), Amount (total_ttc), Status, Paid %
- Sort by any column
- Pagination (20 per page)
- Status badge with colors:
  - Draft (0): Gray
  - Unpaid/Validated (1): Orange
  - Started (partially paid): Yellow
  - Paid (2): Green
- Overdue invoices: Red highlight (status=1 AND due_date < today)
- Filters:
  - By status: Draft, Unpaid, Paid
  - By customer (searchable dropdown)
  - By date range
  - "Show overdue only" checkbox
- Paid % column: Shows payment progress (sum_paid / total_ttc * 100)

User: Accountant managing billing and collections
Goal: Monitor invoice status and identify overdue payments
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.1 Invoice List View.

References: @doc/mvp_plan.md @doc/phase3_facture.md

Tech stack:
- TanStack Table with sorting, filtering
- TanStack Query
- API: GET /api/invoices with filter params
- Calculate overdue based on date_lim_reglement vs today

Map paye and fk_statut fields to display status.
```

---

### US-3.2: Create Invoice from Quote

**`/speckit.specify` prompt:**
```
Implement quote-to-invoice conversion for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase2_propal.md @doc/phase3_facture.md

Feature: Convert a signed quote into a new invoice.

Requirements:
- "Create Invoice" button on quote detail page
- Only visible when quote status = Signed (2)
- Confirmation dialog: "Create invoice from this quote?"
- On confirm:
  - New invoice created with:
    - Same customer (fk_soc)
    - All line items copied
    - Status = Draft (0)
    - Invoice reference auto-generated (FA{YYMM}-{NNNN})
    - module_source = 'propal'
    - fk_source = quote id (origin tracking)
  - Quote status changes to Billed (4)
- Link maintained: Invoice shows "From Quote: {ref}"
- Redirect to invoice detail page

User: Sales user converting accepted proposal to billing
Goal: Seamlessly transition from quote to invoice without re-entering data
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.2 Create Invoice from Quote.

References: @doc/mvp_plan.md @doc/phase2_propal.md @doc/phase3_facture.md

Tech stack:
- TanStack Query mutation
- API: POST /api/proposals/{id}/setinvoiced (creates invoice and updates quote status)
- Or: POST /api/invoices with { propal_id: {id} } to trigger conversion

Track origin with module_source and fk_source fields.
```

---

### US-3.3: Create Invoice Manually

**`/speckit.specify` prompt:**
```
Implement manual invoice creation for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md

Feature: Create new invoice without a source quote (ad-hoc billing).

Requirements:
- "New Invoice" button in invoice list header
- Form fields:
  - Customer selector (required, searchable dropdown)
  - Invoice date (datef): Default today
  - Payment terms selector (cond_reglement_id): Dropdown from llx_c_payment_term
  - Due date (date_lim_reglement): Auto-calculated from payment terms
  - Payment method (mode_reglement_id): Dropdown from llx_c_paiement
  - Public notes (note_public)
  - Private notes (note_private)
- Invoice saved as Draft (0)
- Reference auto-generated
- Redirect to invoice detail to add line items

User: Accountant billing for ad-hoc services without quotes
Goal: Create invoice directly when quote workflow not needed
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.3 Create Invoice Manually.

References: @doc/mvp_plan.md @doc/phase3_facture.md

Tech stack:
- React Hook Form
- Reference table data for dropdowns
- TanStack Query mutation
- API: POST /api/invoices

Follow CreateFactureDTO from @doc/phase3_facture.md.
```

---

### US-3.4: Add Line to Invoice

**`/speckit.specify` prompt:**
```
Implement add line item to invoice for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md

Feature: Add service lines to a draft invoice.

Requirements:
- Same functionality as quote lines (US-2.3)
- Only available when invoice status = Draft (0)
- Fields: Description, Quantity, Unit Price, VAT Rate, Discount %
- Automatic calculation of line totals and invoice totals
- Lines stored in llx_facturedet table

User: Accountant detailing invoice line items
Goal: Build complete invoice with all billable items
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.4 Add Line to Invoice.

References: @doc/mvp_plan.md @doc/phase3_facture.md

Tech stack:
- Reuse LineItemForm component from US-2.3
- TanStack Query mutation
- API: POST /api/invoices/{id}/lines

Follow FactureLine interface from @doc/phase3_facture.md.
```

---

### US-3.5: View Invoice Details

**`/speckit.specify` prompt:**
```
Implement invoice detail view for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md

Feature: Display complete invoice information including payment status.

Requirements:
- Header: Reference, Customer, Invoice Date, Due Date, Status badge
- Payment progress bar: (amount_paid / total_ttc) * 100%
- Line items table with all details
- Totals section: HT, VAT, TTC
- "Remaining to pay" amount prominently displayed
- Payment history section: List of all payments for this invoice
- Source quote link (if converted from quote)
- Action buttons based on status:
  - Draft: Edit, Validate, Delete
  - Unpaid: Record Payment, PDF
  - Paid: PDF only
- PDF preview/download button

User: Accountant managing invoice and tracking payments
Goal: Complete visibility into invoice status and payment history
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.5 View Invoice Details.

References: @doc/mvp_plan.md @doc/phase3_facture.md

Tech stack:
- React Router: /invoices/:id
- TanStack Query for invoice + payments fetch
- API: GET /api/invoices/{id}
- Calculate remaining from total_ttc - sum(payments)

Fetch linked payments from llx_paiement_facture.
```

---

### US-3.6: Validate Invoice

**`/speckit.specify` prompt:**
```
Implement invoice validation for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md

Feature: Transition a draft invoice to validated/unpaid status.

Requirements:
- "Validate" button visible only when status = Draft (0)
- Pre-validation checks:
  - Invoice must have at least 1 line item
  - All required fields filled
- Confirmation dialog: "Validate this invoice? It will become ready for payment."
- On confirm:
  - Status changes to Validated/Unpaid (1)
  - date_valid set to current datetime
  - paye = 0 (not paid)
  - Due date finalized
- Invoice becomes read-only (lines cannot be edited)

User: Accountant finalizing invoice for customer
Goal: Lock invoice content and make available for payment
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.6 Validate Invoice.

References: @doc/mvp_plan.md @doc/phase3_facture.md

Tech stack:
- Confirmation dialog
- TanStack Query mutation
- API: POST /api/invoices/{id}/validate
```

---

### US-3.7: Record Payment

**`/speckit.specify` prompt:**
```
Implement payment recording for invoices in the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md @doc/phase4_banque.md

Feature: Record a payment against an unpaid invoice.

Requirements:
- "Record Payment" button visible when status = Validated/Unpaid (1)
- Payment form dialog:
  - Amount: Default to remaining amount, cannot exceed remaining
  - Payment date: Default today
  - Payment method (dropdown from llx_c_paiement): Bank Transfer, Card, Check, Cash, etc.
  - Reference/Check number: Optional free text
  - Bank account (dropdown from llx_bank_account): Optional for Phase 4 integration
  - Note: Optional textarea
- On save:
  - Create record in llx_paiement
  - Create link in llx_paiement_facture
  - Update invoice remaining amount
  - If fully paid: Invoice status → Paid (2), paye = 1
  - If bank account selected: Create bank transaction (US-4.6)
- Success notification: "Payment of {amount} recorded"

User: Accountant recording customer payments
Goal: Track payments and update invoice status
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.7 Record Payment.

References: @doc/mvp_plan.md @doc/phase3_facture.md @doc/phase4_banque.md

Tech stack:
- Modal dialog form
- TanStack Query mutation
- API: POST /api/invoices/{id}/payments
- Optional bank transaction via POST /api/bankaccounts/{accountid}/lines

Follow PaymentDTO from @doc/phase3_facture.md.
```

---

### US-3.8: View Payment History

**`/speckit.specify` prompt:**
```
Implement payment history view for invoices in the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md

Feature: Display all payments recorded against an invoice.

Requirements:
- Payment history section on invoice detail page
- List showing: Date (datep), Amount, Payment Method, Reference
- Running total of payments
- Link to bank transaction if applicable
- Timeline/chronological view option
- Empty state: "No payments recorded yet"

User: Accountant reviewing payment history
Goal: See complete payment trail for an invoice
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.8 View Payment History.

References: @doc/mvp_plan.md @doc/phase3_facture.md

Tech stack:
- PaymentHistory component within InvoiceDetail
- API: GET /api/invoices/{id}/payments

Join llx_paiement_facture with llx_paiement to get payment details.
```

---

### US-3.9: Invoice Marked as Paid

**`/speckit.specify` prompt:**
```
Implement automatic paid status for invoices in the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md

Feature: Automatically update invoice status when fully paid.

Requirements:
- When total payments >= invoice total_ttc:
  - Status changes to Paid (2)
  - paye field set to 1
  - date_closing set to current datetime (payment date)
- "Paid" badge displayed (green checkmark)
- Invoice removed from "Unpaid" filter results
- Remaining amount shows 0.00 or "Fully Paid"
- This happens automatically on payment save, not manual action

User: Accountant (automatic behavior)
Goal: Invoice status accurately reflects payment state
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.9 Invoice Marked as Paid.

References: @doc/mvp_plan.md @doc/phase3_facture.md

Tech stack:
- Business logic in payment recording (US-3.7)
- Backend: Check sum(payments) >= total_ttc after each payment
- API handles status update automatically
- Frontend: Query invalidation refreshes invoice status
```

---

### US-3.10: Generate Invoice PDF

**`/speckit.specify` prompt:**
```
Implement PDF generation for invoices in the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md

Feature: Generate and download a PDF document for the invoice.

Requirements:
- "Download PDF" button on invoice detail page
- PDF includes:
  - Company logo
  - Invoice reference and date
  - Customer name and address
  - Line items table
  - Totals: HT, VAT, TTC
  - Due date
  - Payment terms
  - Bank details for payment (IBAN, BIC)
  - Public notes
- If fully paid: Show "PAID" stamp/watermark
- Filename format: Invoice_{ref}_{date}.pdf

User: Accountant sending invoice to customer
Goal: Professional PDF document for billing
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.10 Generate Invoice PDF.

References: @doc/mvp_plan.md @doc/phase3_facture.md

Tech stack:
- API: GET /api/invoices/{id}/document
- Backend generates PDF using Dolibarr modules
- Download via blob URL

Single template for MVP; conditionally add PAID stamp if paye=1.
```

---

### US-3.11: View Overdue Invoices

**`/speckit.specify` prompt:**
```
Implement overdue invoices filter for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md

Feature: Filter and highlight overdue invoices for collection follow-up.

Requirements:
- "Overdue" filter option in invoice list
- Shows invoices where: status=Unpaid (1) AND date_lim_reglement < today
- "Days Overdue" column showing (today - due_date)
- Sort by days overdue (most overdue first by default)
- Visual indicator:
  - Row highlighted in red/pink
  - Or: Red "Overdue" badge with days count
- Count of overdue invoices shown in filter chip

User: Accountant managing collections
Goal: Identify and prioritize late payment follow-ups
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-3.11 View Overdue Invoices.

References: @doc/mvp_plan.md @doc/phase3_facture.md

Tech stack:
- Filter parameter in list query
- API: GET /api/invoices?sqlfilters=(paye:=:0)AND(date_lim_reglement:<:'{today}')
- Calculate days_overdue in frontend or backend
- Conditional row styling
```

---

## Phase 4: Bank (Banque)

### US-4.1: Bank Account List

**`/speckit.specify` prompt:**
```
Implement bank account list view for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase4_banque.md

Feature: Display all company bank accounts with current balances.

Requirements:
- Columns: Reference (ref), Label (label), Bank Name (bank), Balance, Status
- Current balance prominently displayed for each account
- Status: Open (clos=0) / Closed (clos=1)
- Currency shown next to balance
- Quick action: "View Transactions" button/link
- Click row to navigate to account detail

User: Accountant managing company cash positions
Goal: Overview of all bank accounts and available funds
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-4.1 Bank Account List.

References: @doc/mvp_plan.md @doc/phase4_banque.md

Tech stack:
- TanStack Table
- TanStack Query
- API: GET /api/bankaccounts

Balance calculated from sum of llx_bank transactions or stored in account.
```

---

### US-4.2: Create Bank Account

**`/speckit.specify` prompt:**
```
Implement bank account creation for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase4_banque.md

Feature: Add a new bank account to track company finances.

Requirements:
- Form fields:
  - Reference (ref): Required, unique identifier
  - Label: Required, descriptive name
  - Account type: Savings (0), Current (1), Cash (2)
  - Currency: Default EUR, dropdown
  - Bank name (bank)
  - IBAN: With format validation
  - BIC/SWIFT (code_banque): With format validation
  - Account owner (proprio)
  - Notes (comment)
- IBAN validation: Check format based on country
- BIC validation: 8 or 11 characters alphanumeric
- Initial balance option (creates opening transaction)
- Success notification
- Redirect to account detail

User: Admin setting up company bank accounts
Goal: Configure bank accounts for transaction tracking
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-4.2 Create Bank Account.

References: @doc/mvp_plan.md @doc/phase4_banque.md

Tech stack:
- React Hook Form with Zod validation
- IBAN validation library (ibantools)
- TanStack Query mutation
- API: POST /api/bankaccounts

Follow CreateBankAccountDTO from @doc/phase4_banque.md.
```

---

### US-4.3: View Bank Account Details

**`/speckit.specify` prompt:**
```
Implement bank account detail view for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase4_banque.md

Feature: Display complete bank account information and recent activity.

Requirements:
- Display all account fields organized in sections
- Current balance prominently shown (large font)
- IBAN with "Copy" button
- BIC with "Copy" button
- Recent transactions preview: Last 10 transactions
- "View All Transactions" link/button
- Edit button (admin only)
- Close/Reopen account button (admin only)

User: Accountant reviewing account details
Goal: Quick access to account information and recent activity
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-4.3 View Bank Account Details.

References: @doc/mvp_plan.md @doc/phase4_banque.md

Tech stack:
- React Router: /bank/:id
- TanStack Query
- Copy to clipboard functionality
- API: GET /api/bankaccounts/{id}
- Recent transactions: GET /api/bankaccounts/{id}/lines?limit=10
```

---

### US-4.4: View Transaction List

**`/speckit.specify` prompt:**
```
Implement bank transaction list for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase4_banque.md

Feature: Display all transactions for a bank account with filtering.

Requirements:
- Columns: Date (dateo), Label, Type, Amount, Running Balance
- Running balance calculated progressively
- Credit amounts in green with + sign
- Debit amounts in red with - sign
- Filters:
  - Date range (from/to)
  - Transaction type (transfer, card, check, etc.)
  - Search by label text
- Pagination
- Export to CSV button
- Click transaction to view details/links

User: Accountant reviewing bank activity
Goal: Complete visibility into account transactions
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-4.4 View Transaction List.

References: @doc/mvp_plan.md @doc/phase4_banque.md

Tech stack:
- TanStack Table with filters
- TanStack Query
- API: GET /api/bankaccounts/{id}/lines
- CSV export using client-side library or API endpoint

Calculate running balance in query or frontend processing.
```

---

### US-4.5: Add Manual Transaction

**`/speckit.specify` prompt:**
```
Implement manual transaction entry for bank accounts in Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase4_banque.md

Feature: Record manual transactions (deposits, withdrawals, fees) in bank accounts.

Requirements:
- "Add Transaction" button on account detail/transaction list
- Form fields:
  - Amount: Positive = credit (deposit), Negative = debit (withdrawal)
  - Operation date (dateo): Required
  - Value date (datev): Default = operation date
  - Label/Description: Required
  - Transaction type (fk_type): Dropdown (Transfer, Card, Check, Cash, etc.)
  - Check number (num_chq): Shown if type = Check
  - Note (note): Optional
- Transaction created immediately
- Account balance updated
- Success notification

User: Accountant recording bank activity
Goal: Keep bank records accurate with all transactions
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-4.5 Add Manual Transaction.

References: @doc/mvp_plan.md @doc/phase4_banque.md

Tech stack:
- Modal dialog form
- TanStack Query mutation
- API: POST /api/bankaccounts/{id}/lines

Follow CreateBankTransactionDTO from @doc/phase4_banque.md.
```

---

### US-4.6: Transaction Linked to Payment

**`/speckit.specify` prompt:**
```
Implement payment-to-bank-transaction linking for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase3_facture.md @doc/phase4_banque.md

Feature: When recording a payment, optionally create corresponding bank transaction.

Requirements:
- In payment form (US-3.7):
  - Bank account dropdown (optional)
  - If account selected:
    - Bank transaction auto-created with same amount
    - Transaction label includes invoice reference
    - Link created in llx_bank_url (fk_bank → bank transaction, type='payment')
- Transaction linked to:
  - Payment record
  - Invoice (via payment)
  - Customer (via invoice)
- View linked invoice from transaction detail

User: Accountant recording payments with bank integration
Goal: Keep bank and invoice records in sync automatically
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-4.6 Transaction Linked to Payment.

References: @doc/mvp_plan.md @doc/phase3_facture.md @doc/phase4_banque.md

Tech stack:
- Extend payment API to accept bank_account_id
- Backend creates bank transaction when account provided
- Link via llx_bank_url table
- API: POST /api/invoices/{id}/payments with { accountid: id }
```

---

### US-4.7: View Transaction Links

**`/speckit.specify` prompt:**
```
Implement transaction link viewing for bank transactions in Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase4_banque.md

Feature: Display objects linked to a bank transaction (payments, invoices, customers).

Requirements:
- Transaction detail view or expandable row
- Show linked objects from llx_bank_url:
  - Payment (type='payment')
  - Invoice (via payment)
  - Customer (via invoice/societe)
  - Other transaction (if internal transfer)
- Each link clickable to navigate to that object
- Icons indicating link type

User: Accountant understanding transaction context
Goal: Trace transaction back to business origin
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-4.7 View Transaction Links.

References: @doc/mvp_plan.md @doc/phase4_banque.md

Tech stack:
- Expandable row or detail panel
- API: GET /api/bankaccounts/{id}/lines/{lineid} with linked objects
- Or: Parse llx_bank_url to fetch linked entities

Follow bank_url query patterns from @doc/phase4_banque.md.
```

---

### US-4.8: Internal Transfer

**`/speckit.specify` prompt:**
```
Implement internal bank transfer for the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase4_banque.md

Feature: Transfer money between company bank accounts.

Requirements:
- "Transfer" button in bank module header
- Form:
  - From account: Dropdown of all accounts
  - To account: Dropdown (excluding selected "from")
  - Amount: Positive number
  - Date: Default today
  - Label/Note: Optional description
- Cannot transfer to same account (validation)
- Creates two linked transactions:
  - Debit (-amount) on source account
  - Credit (+amount) on destination account
- Transactions linked to each other via llx_bank_url
- Both account balances updated
- Success notification: "Transfer of {amount} completed"

User: Accountant managing cash between accounts
Goal: Move funds between company accounts with proper record
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-4.8 Internal Transfer.

References: @doc/mvp_plan.md @doc/phase4_banque.md

Tech stack:
- Transfer modal form
- TanStack Query mutation
- API: POST /api/bankaccounts/{from_id}/transfer/{to_id}

Backend creates both transactions and links them.
```

---

### US-4.9: View Account Balance

**`/speckit.specify` prompt:**
```
Implement balance display for bank accounts in the Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase4_banque.md

Feature: Display current calculated balance for bank accounts.

Requirements:
- Balance displayed prominently on:
  - Account list (each row)
  - Account detail page (hero section)
- Balance = SUM(all transactions in llx_bank for this account)
- Updates in real-time after any new transaction
- Shown in account currency (EUR, USD, etc.)
- Format: Currency symbol + amount with 2 decimals

User: Accountant checking available funds
Goal: Know current balance at a glance
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-4.9 View Account Balance.

References: @doc/mvp_plan.md @doc/phase4_banque.md

Tech stack:
- Balance returned from API (calculated server-side)
- API: GET /api/bankaccounts/{id} includes balance field
- Or: API: GET /api/bankaccounts/{id}/balance

Query invalidation ensures fresh balance after transactions.
```

---

## Cross-Module User Stories

### US-X.1: Complete Quote-to-Cash Flow

**`/speckit.specify` prompt:**
```
Implement end-to-end quote-to-cash integration test scenario for Dolibarr React MVP.

Context: @doc/mvp_plan.md @doc/phase1_societe.md @doc/phase2_propal.md @doc/phase3_facture.md @doc/phase4_banque.md

Feature: Verify the complete business cycle works end-to-end.

Test Scenario:
1. Create new customer "Acme Corp"
2. Create quote for Acme Corp with 2 service lines (e.g., "Consulting 10h @ 150", "Training 1d @ 800")
3. Validate the quote
4. Mark quote as signed (customer accepted)
5. Convert quote to invoice
6. Validate the invoice
7. Record full payment with bank account selection
8. Verify: Invoice status = Paid
9. Verify: Bank account balance increased by payment amount
10. Verify: Links maintained (invoice → quote → customer, transaction → payment → invoice)

Acceptance Criteria:
- All steps completable through UI without errors
- Data integrity maintained at each step
- Object links preserved and navigable
- Correct status at each workflow step

User: Sales user and accountant completing business cycle
Goal: Prove MVP handles complete quote-to-cash flow
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-X.1 Complete Quote-to-Cash Flow.

References: All phase documents

This is an integration test scenario, not new functionality. Plan should:
1. Define Cypress or Playwright E2E test spec
2. Test data setup (fixtures or API seeding)
3. Step-by-step UI interactions
4. Assertions at each step
5. Cleanup after test
```

---

### US-X.2: Dashboard Overview

**`/speckit.specify` prompt:**
```
Implement dashboard overview page for the Dolibarr React MVP.

Context: @doc/mvp_plan.md

Feature: Home page showing key business metrics at a glance.

Requirements:
- Metrics cards:
  - Total customers count
  - Quotes summary: X Draft, Y Pending, Z Signed (this month)
  - Invoices summary: X Draft, Y Unpaid, Z Overdue, W Paid (this month)
  - Revenue this month: Sum of paid invoices total_ttc
  - Total bank balance: Sum of all account balances
- Quick action buttons:
  - + New Customer
  - + New Quote
  - + New Invoice
- Charts (optional for MVP):
  - Monthly revenue trend
  - Quote conversion rate
- Responsive layout (cards stack on mobile)

User: All users accessing the system
Goal: Immediate visibility into business health
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-X.2 Dashboard Overview.

References: @doc/mvp_plan.md

Tech stack:
- Dashboard page as default route (/)
- Multiple TanStack Query calls for each metric
- Stat cards component (reusable)
- APIs:
  - GET /api/thirdparties?sqlfilters=(client:>:0)&limit=1 (for count)
  - GET /api/proposals?limit=1 with status filters
  - GET /api/invoices with date range filter
  - GET /api/bankaccounts (sum balances)
```

---

### US-X.3: Global Search

**`/speckit.specify` prompt:**
```
Implement global search functionality for the Dolibarr React MVP.

Context: @doc/mvp_plan.md

Feature: Search across all modules from a single search bar.

Requirements:
- Search bar in application header (always visible)
- Search across: Customers, Quotes, Invoices
- Results grouped by type:
  - Customers: Name (nom), Code
  - Quotes: Reference (ref), Customer name
  - Invoices: Reference (ref), Customer name
- Show for each result: Reference, Name/Label, Status
- Click result to navigate to that record
- Keyboard shortcut to focus search (Cmd/Ctrl + K)
- Recent searches history (optional)
- Minimum 2 characters to trigger search

User: Any user looking for a specific record
Goal: Find any record quickly without navigating to each module
```

**`/speckit.plan` prompt:**
```
Create implementation plan for US-X.3 Global Search.

References: @doc/mvp_plan.md

Tech stack:
- Search input in header/navbar
- Command palette style UI (cmdk library) OR custom dropdown
- Parallel API calls:
  - GET /api/thirdparties?sqlfilters=(nom:like:'%{q}%')&limit=5
  - GET /api/proposals?sqlfilters=(ref:like:'%{q}%')&limit=5
  - GET /api/invoices?sqlfilters=(ref:like:'%{q}%')&limit=5
- Aggregate and group results
- Keyboard navigation (up/down arrows, enter to select)
```

---

## Non-Functional Requirements

### NFR-1: Performance

**`/speckit.specify` prompt:**
```
Define performance requirements for the Dolibarr React MVP.

Context: @doc/mvp_plan.md

Requirements:
- Page load time: < 2 seconds on initial load
- Search results: < 500ms response time
- PDF generation: < 3 seconds
- API response time: < 200ms for 95th percentile
- List views: Smooth scrolling with 1000+ records
- No UI blocking during API calls (async with loading states)

Implementation considerations:
- Use React Query caching effectively
- Implement pagination (not infinite scroll for MVP)
- Lazy load heavy components
- Optimize bundle size (code splitting)
```

---

### NFR-2: Usability

**`/speckit.specify` prompt:**
```
Define usability requirements for the Dolibarr React MVP.

Context: @doc/mvp_plan.md

Requirements:
- Mobile-responsive design (works on tablet/phone)
- Keyboard navigation support (tab through forms, enter to submit)
- Form validation with inline error messages
- Loading indicators for all async operations
- Success/error toast notifications
- Consistent UI patterns across all modules
- Breadcrumb navigation
- "Unsaved changes" warning when leaving edited forms
```

---

### NFR-3: Security

**`/speckit.specify` prompt:**
```
Define security requirements for the Dolibarr React MVP.

Context: @doc/mvp_plan.md

Requirements:
- Authentication required for all API endpoints
- Role-based access control (Admin, Sales, Accountant, Viewer)
- API token authentication (Bearer token in header)
- Input sanitization on all form fields
- HTTPS only (no HTTP)
- CSRF protection
- XSS prevention (React handles by default, but verify)
- SQL injection prevention (API-side, parameterized queries)
- Session timeout after inactivity
```

---

### NFR-4: Data Integrity

**`/speckit.specify` prompt:**
```
Define data integrity requirements for the Dolibarr React MVP.

Context: @doc/mvp_plan.md

Requirements:
- Foreign key constraints enforced at database level
- Cascade rules:
  - Customer deletion blocked if quotes/invoices exist
  - Quote deletion blocked if invoice exists
- Audit trail: Created/modified timestamps and user IDs on all records
- Unique reference codes (customer code, quote ref, invoice ref)
- Prevent duplicate payments (idempotency key)
- Transaction atomicity for multi-step operations (quote-to-invoice conversion)
- Optimistic locking for concurrent edits (optional)
```

---

## Usage Instructions

### Workflow

1. **Start with `/speckit.specify`**: Provide the prompt to generate detailed requirements
2. **Clarify**: Use `/speckit.clarify` to address [NEEDS CLARIFICATION] markers
3. **Plan with `/speckit.plan`**: Generate implementation plan with tech stack details
4. **Task breakdown with `/speckit.tasks`**: Convert plan to actionable task list
5. **Implement**: Work through tasks sequentially

### File References

When using spec-kit, always include these file references:

```
@doc/mvp_plan.md           - Master plan and user stories
@doc/phase1_societe.md     - Third Parties DB schema, API, components
@doc/phase2_propal.md      - Quotes DB schema, API, workflow
@doc/phase3_facture.md     - Invoices DB schema, API, payments
@doc/phase4_banque.md      - Bank DB schema, API, transactions
```

### Example Session

```bash
# Initialize spec-kit for the project
uvx --from git+https://github.com/github/spec-kit.git specify init dolibarr-react-mvp

# Generate spec for first user story
/speckit.specify
[paste US-1.1 prompt]

# Clarify any ambiguities
/speckit.clarify

# Generate implementation plan
/speckit.plan
[paste US-1.1 plan prompt]

# Break into tasks
/speckit.tasks
```
