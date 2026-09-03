# CRM — Create Customer (Sprint 1, User Story 1)

- **User Story:** [Create Customer](https://app.clickup.com/t/86eye4dth) — as a CRM user, I want to create a new
  Customer record with its full profile, management, and business-process
  detail, so the organization has a single authoritative record for a
  buying entity before any commercial activity begins.
- **Test-case set:** [CRM - Sprint 1 - Create Customer](https://app.clickup.com/t/86eyqvaq4)
- **Automated in:** [`tests/crm/create-customer.spec.ts`](../../tests/crm/create-customer.spec.ts)
- **Page object:** [`src/pages/crm/create-customer.page.ts`](../../src/pages/crm/create-customer.page.ts)

| #     | Test case                                                            | Steps                                                                                                                                                                       | Expected result                                                                                                                           | ClickUp                                      | Automated | Verified locally      |
| ----- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------- | --------------------- |
| TC:1  | Verify navigation and layout of Create Customer screen               | 1. Navigate to the CRM module.<br>2. Click the "Create Customer" button/entry point.                                                                                        | The "Create Customer" form opens displaying Customer Profile, Customer Management, Departments and Assignees, and Link Contacts sections. | [link](https://app.clickup.com/t/86eyqvaru)  | ✅        | ✅ passing            |
| TC:2  | Verify validation when mandatory fields are left blank               | 1. Open the Create Customer form.<br>2. Leave mandatory fields empty (Customer Name, Email, City, Country, CRM Stage, Origin Type).<br>3. Click "Save Customer".            | Save is blocked; inline "Required" errors appear under each empty mandatory field.                                                        | [link](https://app.clickup.com/t/86eyqvatv)  | ✅        | ✅ passing            |
| TC:3  | Verify field-level format validation for URL fields                  | 1. Navigate to Customer Profile section.<br>2. Enter invalid strings into LinkedIn, Facebook, Instagram fields.<br>3. Click "Save Customer".                                | Save is blocked; "Enter a valid URL" errors shown under the respective fields.                                                            | [link](https://app.clickup.com/t/86eyqvav3)  | ✅        | ✅ passing            |
| TC:4  | Verify Business Process / Department assignee restriction            | 1. Fill in all required Customer details.<br>2. Add a Business Process/Department line under Customer Management.<br>3. Don't add an assignee.<br>4. Click "Save Customer". | Save is blocked with an error indicating at least one assignee is required for the added process/department.                              | [link](https://app.clickup.com/t/z941abt4rq) | ✅        | ❌ blocked (see note) |
| TC:5  | Verify duplicate detection modal warning                             | 1. Enter details (Name, Email, etc.) matching an existing Customer.<br>2. Click "Save Customer".                                                                            | Modal warns "This customer may already exist", lists matches, offers "Cancel to review" / "Save anyway".                                  | [link](https://app.clickup.com/t/z941abt4rr) | ✅        | ❌ blocked (see note) |
| TC:6  | Verify duplicate detection cancel action                             | 1. Trigger the duplicate detection warning.<br>2. Click "Cancel to review".                                                                                                 | Modal closes; user stays on the form to review/edit without saving.                                                                       | [link](https://app.clickup.com/t/z941abt4ru) | ✅        | ❌ blocked (see note) |
| TC:7  | Verify successful customer creation without existing contacts linked | 1. Fill in all valid mandatory/optional details.<br>2. Leave "Link Contacts" empty.<br>3. Click "Save Customer" (confirm "Save anyway" if the duplicate warning appears).   | Customer saved, unique Customer ID auto-generated, confirmation toast shown, "Proceed to Contact creation?" prompt modal appears.         | [link](https://app.clickup.com/t/z941abt4rw) | ✅        | ❌ blocked (see note) |
| TC:8  | Verify post-save Contact creation prompt — "Create Contact" path     | 1. Save a new customer without linked contacts.<br>2. On the post-save modal, click "Create Contact".                                                                       | Routes to the Create Contact form with the new Customer pre-linked.                                                                       | [link](https://app.clickup.com/t/z941abt4t4) | ✅        | ❌ blocked (see note) |
| TC:9  | Verify post-save Contact creation prompt — "Cancel" path             | 1. Save a new customer without linked contacts.<br>2. On the post-save modal, click "Cancel".                                                                               | Modal closes; user redirected to the Customer Detail view or Customer List.                                                               | [link](https://app.clickup.com/t/z941abt4t5) | ✅        | ❌ blocked (see note) |
| TC:10 | Verify linking existing contacts during Customer creation            | 1. Fill in valid customer details.<br>2. In "Link Contacts", search and select one or more existing unlinked Contacts.<br>3. Click "Save Customer".                         | Customer saved; selected Contact records updated to reference the new Customer.                                                           | [link](https://app.clickup.com/t/z941abt4t6) | ✅        | ❌ blocked (see note) |
| TC:11 | Verify Cancel button functionality                                   | 1. Open the Create Customer form and enter details.<br>2. Click "Cancel" at the bottom of the form.                                                                         | Creation canceled, no record persisted, user navigated back to the Customers list.                                                        | [link](https://app.clickup.com/t/z941abt4up) | ✅        | ✅ passing            |

## Notes for whoever picks this up next

As of 2026-09-03, verified against a local `tilt up` stack (`npm run
test:crm`): **6 passing** (auth setup, TC:1, TC:2, TC:3, TC:11, and the
module smoke test), **7 blocked** (TC:4–TC:10).

The blocked ones all fail at the same point, for the same reason — not a
locator bug. `Country`, `CRM Stage`, `Origin Type`, `Origin`, and `Buyer`
are custom comboboxes (click the trigger → a dialog opens with a
"Suggestions" listbox of options — see `selectComboboxOption()` in
`create-customer.page.ts`), and **none of that reference data is seeded
in this local environment**: every one of those comboboxes shows "No ...
available." (confirmed by inspecting the live app), and "Add" under
Departments and Assignees never leaves its disabled/"Loading
departments…" state. This matches the user story's own stated
prerequisite ("Reference/master data needed by the form is configured:
origin types, buyer/segment types, business-process catalogue, ...
country/region list") — it just isn't configured on this machine yet.

Once that reference data is seeded locally, TC:4–TC:10 should be usable
as-is — the interaction code (`selectComboboxOption`,
`addBusinessProcessWithAssignee`, `linkExistingContact`) is written and
correct against the real DOM, it just has nothing to select yet. Also
worth knowing: TC:5/TC:6 (duplicate detection) additionally need an
_existing_ Customer in local data that matches the test's name/email —
there's a TODO for that in `create-customer.spec.ts`.
