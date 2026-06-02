# QueryNest — Visual Query Builder

A highly interactive visual query builder built with **Next.js App Router** and **TypeScript**.

QueryNest allows users to visually construct complex database/API-style filters without writing raw query syntax manually. Users can choose a schema, build rules, group conditions, nest logic, preview generated Mongo-style query objects, validate inputs, execute simulated queries, inspect matching results, save presets, reuse query history, and import/export query JSON.

---

## Live Demo

**Production URL:** https://visual-query-builder-2tr8.vercel.app/

---

## Project Overview

Modern applications often need advanced filtering interfaces: admin dashboards, analytics tools, database explorers, API clients, CRMs, and internal tools all require users to build precise queries.

Writing raw query syntax can be error-prone and intimidating, especially when logic becomes deeply nested.

QueryNest solves that by turning query construction into a visual workflow:

1. Choose a data source/schema.
2. Add rules with field, operator, and value controls.
3. Group rules with `AND` / `OR` logic.
4. Nest groups recursively.
5. Preview the generated query in real time.
6. Validate issues before execution.
7. Run the query against mock datasets.
8. Inspect matching results dynamically.

The application is designed to demonstrate frontend systems thinking, recursive UI engineering, schema-driven rendering, state architecture, validation, performance optimization, and advanced interaction design.

---

## Core Features

### Dynamic Query Rule Builder

Users can create query rules visually using:

* Field selector
* Operator selector
* Value input

Example:

```txt
Field: Age
Operator: Greater Than
Value: 18
```

Supported operator categories include:

* Equals
* Not equals
* Contains
* Starts with
* Greater than
* Less than
* In array
* Between
* Regex
* Null checks
* Date comparisons

The available operators are determined by the selected field type, so users are guided toward valid combinations.

---

### Nested Condition Groups

QueryNest supports recursive condition groups with `AND` and `OR` logic.

Example query structure:

```txt
Root Group
├── Age greater than 18
├── Country equals Nigeria
└── Nested OR Group
    ├── Status equals active
    └── Purchases greater than 10
```

Users can:

* Add rules dynamically
* Add nested groups dynamically
* Remove rules and groups
* Collapse and expand groups
* Reorder rules/groups
* Build deeply nested logic
* Edit selected nodes through a focused editor panel

The system is designed to support unlimited nesting depth at the data-model level. The UI keeps deep nesting usable through a tree-based structure panel and a separate selected-node editor.

---

### Schema-Driven Query System

The builder adapts dynamically based on the selected schema.

Current supported schemas:

* Users
* Orders
* Products

Each schema defines:

* Available fields
* Field labels
* Field types
* Enum options
* Supported operators
* Input control behavior
* Result table columns
* Mock dataset structure

Example schema concept:

```ts
{
  name: "string",
  age: "number",
  status: "enum",
  createdAt: "date"
}
```

The UI responds to the schema by rendering the correct controls:

| Field Type      | UI Behavior                                     |
| --------------- | ----------------------------------------------- |
| String          | Text input, contains, starts with, regex        |
| Number          | Numeric input, greater than, less than, between |
| Enum            | Dropdown/select options                         |
| Boolean         | True/false controls                             |
| Date            | Date input and date comparison operators        |
| Nullable fields | Null-check operators                            |

This keeps the query builder flexible and extensible without hardcoding one fixed dataset.

---

### Live Query Preview

As users build or edit a query, QueryNest generates a live Mongo-style query object.

Example:

```json
{
  "$and": [
    {
      "age": {
        "$gt": 18
      }
    },
    {
      "country": {
        "$eq": "Nigeria"
      }
    }
  ]
}
```

The preview updates in real time as the user changes:

* Fields
* Operators
* Values
* Group logic
* Nested structure

The JSON preview uses subtle syntax highlighting to improve readability while keeping the black-first visual style.

---

### Query Execution Simulator

Users can execute valid queries against mock datasets.

Execution features include:

* Mock dataset filtering
* Dynamic result count
* Loading state
* Empty state
* Sorting
* Pagination
* Virtualized row rendering
* Result table inspection

Broad queries can return thousands of generated records, while the UI only mounts the rows needed for the visible viewport. This demonstrates performance-aware rendering for large result sets.

---

### Query Validation Engine

QueryNest validates the query tree before execution.

Validation catches cases such as:

* Empty rule values
* Invalid field/operator combinations
* Invalid date ranges
* Empty nested groups
* Malformed imported query structures
* Schema mismatch issues

The validation panel clearly explains what needs to be fixed. Validation issues can guide users back to the affected rule or group, reducing confusion in deeply nested queries.

The Run Query button remains disabled until the current query is valid.

---

### Advanced Interactions

QueryNest includes the required advanced interactions:

* Drag-and-drop condition reordering
* Keyboard shortcuts
* Collapsible groups
* Query history
* Saved query presets
* Export query JSON
* Import query JSON
* Dark/light mode
* Animated transitions
* Responsive layout
* Mobile-safe modal behavior

---

## Architecture Explanation

QueryNest is built around a typed recursive query tree.

At the center of the application is a data model made of two node types:

```ts
type QueryNode = RuleNode | GroupNode;
```

A rule node represents one filter condition:

```ts
{
  id: string;
  type: "rule";
  field: string;
  operator: QueryOperator;
  value: QueryValue;
}
```

A group node represents a logical group:

```ts
{
  id: string;
  type: "group";
  combinator: "AND" | "OR";
  collapsed: boolean;
  children: QueryNode[];
}
```

This structure allows the application to support nested conditions naturally. Since a group can contain both rules and other groups, the builder can represent deeply nested logical expressions without needing a separate model for every nesting level.

The architecture is separated into clear layers:

```txt
src/
├── app/
│   ├── page.tsx
│   ├── builder/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── landing/
│   ├── layout/
│   ├── query-builder/
│   └── ui/
├── features/
│   └── query-builder/
│       ├── schemas
│       ├── mock data
│       ├── query generation
│       ├── query execution
│       ├── validation
│       ├── import/export
│       ├── tree utilities
│       └── store
└── e2e/
```

The UI components do not directly own the core query algorithms. Query generation, validation, execution, schema definitions, import/export, and tree helpers are kept inside the query-builder feature layer so they can be tested and reused.

---

## Recursive Rendering Strategy

The query structure is rendered recursively.

Each `GroupNode` renders:

* Its group heading
* Its `AND` / `OR` badge
* Its rule/group count
* Collapse/expand behavior
* Its child nodes

Each child can be either:

* A `RuleNode`, rendered as a rule row
* Another `GroupNode`, rendered by the same recursive tree item component

This recursive rendering allows unlimited nesting at the data level.

To keep the UI usable, QueryNest separates structure navigation from editing:

```txt
Query Structure Tree        Selected Node Editor
--------------------        --------------------
Shows full nested tree  ->   Edits only selected rule/group
```

This prevents deeply nested rule inputs from becoming crushed inside the tree. The tree is used for navigation and hierarchy, while the editor panel gives the selected item enough space for proper controls.

Deep nesting is also handled with internal horizontal scrolling inside the query structure panel, so the overall page layout does not break.

---

## State Management Decisions

QueryNest uses **Zustand** for state management.

The store manages:

* Active schema
* Current query tree
* Rule creation
* Group creation
* Rule updates
* Group logic updates
* Collapse/expand state
* Reordering
* Query history
* Saved presets
* Import hydration
* Reset behavior

Zustand was chosen because it provides a lightweight global store without unnecessary boilerplate. It works well for tree-based UI state where multiple components need access to the same query model.

State updates are handled immutably. Tree operations are performed through utility functions that walk the query tree and return updated structures without mutating the original nodes.

This keeps updates predictable and makes the query model easier to test.

---

## Query Engine Design

The query engine is split into three major parts:

### 1. Query Generation

The query generator traverses the query tree recursively and converts visual rules into a Mongo-style query object.

Rules become field/operator expressions.

Groups become `$and` or `$or` arrays.

Example:

```txt
Age greater than 18
```

becomes:

```json
{
  "age": {
    "$gt": 18
  }
}
```

A group with `AND` logic becomes:

```json
{
  "$and": [
    { "age": { "$gt": 18 } },
    { "country": { "$eq": "Nigeria" } }
  ]
}
```

### 2. Query Validation

The validation engine recursively checks the tree before execution.

It validates:

* Required values
* Operator compatibility
* Field existence
* Schema compatibility
* Date ranges
* Empty groups
* Imported structures

Validation returns a structured list of errors so the UI can show clear feedback and link issues back to specific nodes.

### 3. Query Execution

The execution engine simulates database filtering against mock records.

It recursively evaluates:

* Rule matches
* Group `AND` logic
* Group `OR` logic
* Nested groups
* Sorting
* Result slicing

This allows users to inspect how their visual query behaves without connecting to a real backend.

---

## Performance Optimization Techniques

QueryNest includes several performance-minded decisions:

### Memoized Derived State

Expensive derived values such as query statistics, selected node lookup, selected node path, validation output, generated preview, and execution results are memoized where appropriate.

This reduces unnecessary recomputation during frequent UI updates.

### Component Isolation

Large UI areas are split into focused components:

* Data source bar
* Query structure tree
* Tree item
* Selected node editor
* Rule editor
* Query preview
* Validation panel
* Query results
* Query library
* JSON actions
* Keyboard shortcuts dialog

This keeps re-renders localized and makes the system easier to reason about.

### Stable Node IDs

Rules and groups use stable IDs. This is important for:

* Recursive rendering
* Drag-and-drop ordering
* Selecting nodes
* Validation issue targeting
* Import/export stability
* React key stability

### Virtualized Results

The execution results table supports virtualized row rendering.

For large result sets, the table does not mount every matching record into the DOM. Instead, it renders only a small mounted slice of rows and uses spacer heights to preserve scroll behavior.

This helps the results section remain responsive even when broad queries return thousands of generated records.

### Focused Editing Instead of Full Inline Editing

Instead of rendering every nested rule as a full input row inside the tree, the tree acts as a navigation structure. The actual form controls live in the selected editor panel.

This is a deliberate performance and UX decision. It reduces DOM complexity in deeply nested cases and prevents the UI from becoming unreadable.

---

## Trade-Offs Made

### Mongo-Style Query Output

The app generates Mongo-style query objects instead of SQL or GraphQL filters.

This was chosen because Mongo-style objects map naturally to recursive JavaScript data structures and make nested `AND` / `OR` logic easy to represent.

### Mock Execution Instead of Real Backend

Query execution is simulated against mock datasets.

This keeps the project frontend-focused and allows the query engine, validation engine, and UI interactions to be evaluated without backend dependencies.

### Focused Editor for Deep Nesting

A full inline editor for every nested rule would quickly become cramped and difficult to use. QueryNest uses a tree plus selected-editor pattern instead.

This improves usability for deep nesting but means users edit one selected node at a time instead of editing every input inline inside the tree.

### Generated Mock Data for Virtualization

Large mock datasets are generated programmatically instead of hardcoded manually.

This keeps the codebase maintainable while still allowing large-result performance behavior to be demonstrated.

### Functional Color Usage

The UI uses a black-first liquid glass style, but color is added intentionally for meaning:

* Primary actions
* Selected states
* Query logic
* Validation
* JSON syntax
* Results feedback
* Shortcut hints

The trade-off is that the UI stays visually restrained instead of using many decorative colors.

---

## Testing

QueryNest includes unit, integration, and browser interaction tests for critical behavior.

Test coverage includes:

* Query generation logic
* Query validation behavior
* Query execution behavior
* Import/export behavior
* Tree utility functions
* Store utility behavior
* Query builder component rendering
* Keyboard shortcut interactions
* Browser-level user flows with Playwright

Run tests:

```bash
npm test
```

Run browser tests:

```bash
npm run test:e2e
```

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Recommended full check before merging:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

---

## Continuous Deployment

QueryNest is deployed with **Vercel**.

The deployment setup supports:

* Stable production deployment
* Preview deployments for pull requests
* Automated deployment from the GitHub repository
* CI checks before merge

Production URL:

```txt
https://visual-query-builder-2tr8.vercel.app/
```

---

## Git Workflow

This project was built using a feature-branch and pull-request workflow.

The workflow follows the Stage 8 requirement:

* No direct pushes to `main`
* Feature branches for meaningful work
* Pull requests into `main`
* Clear commit messages
* Descriptive PR titles and descriptions
* Multiple PRs across architecture, features, testing, UI, responsiveness, and polish

---

## Tech Stack

* Next.js App Router
* TypeScript
* React
* Tailwind CSS
* Shadcn/UI
* Zustand
* DnD Kit
* Vitest
* React Testing Library
* Playwright
* Vercel

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/dreadhead0/visual-query-builder
cd visual-query-builder
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app:

```txt
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run lint
```

Runs ESLint.

```bash
npm test
```

Runs Vitest unit/integration tests.

```bash
npm run test:e2e
```

Runs Playwright end-to-end tests.

---

## Example Query

Visual query:

```txt
(age > 18 AND country = "Nigeria")
OR
(status = "active" AND purchases > 10)
```

Generated Mongo-style concept:

```json
{
  "$or": [
    {
      "$and": [
        {
          "age": {
            "$gt": 18
          }
        },
        {
          "country": {
            "$eq": "Nigeria"
          }
        }
      ]
    },
    {
      "$and": [
        {
          "status": {
            "$eq": "active"
          }
        },
        {
          "purchases": {
            "$gt": 10
          }
        }
      ]
    }
  ]
}
```

---

## UI/UX Notes

The interface is designed to feel:

* Professional
* Scalable
* Technically mature
* Responsive
* Highly interactive
* Clear for non-technical users

The builder avoids overwhelming the user by separating the experience into clear zones:

```txt
Data Source
Query Structure
Selected Editor
Live Preview
Validation
Execution Results
Query Library
```

This makes the flow easier to understand:

```txt
Choose schema → Build query → Validate → Preview → Run → Inspect results
```

---

## Security and Stability

The project includes safeguards for:

* Imported JSON validation
* Malformed recursive structures
* Invalid operators
* Missing values
* Empty groups
* Dynamic schema rendering
* Safe mock execution
* No direct raw query execution against a real database

Since the app simulates execution locally, generated queries are used for preview and mock filtering only.

---

## Final Submission Checklist

* Live deployed URL
* GitHub repository
* README with architecture explanation
* Recursive rendering strategy
* State management decisions
* Query engine design
* Performance optimization notes
* Trade-offs made
* Tests
* Demo video

---

## Author

Built by dreadhead : Visual Query Builder with Next.js.
