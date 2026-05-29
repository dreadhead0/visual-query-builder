# Visual Query Builder

A Stage 8 finalist frontend project built with Next.js, TypeScript, and Tailwind CSS.

The application will allow users to visually build complex database/API queries using dynamic rules, nested condition groups, schema-driven inputs, live query previews, validation, and simulated query execution.

## Project Goal

The goal is to build a highly interactive visual query builder that lets users create advanced filters without manually writing raw query syntax.

Example query logic:

```txt
(age > 18 AND country = "Nigeria")
OR
(status = "active" AND purchases > 10)
Core Features Planned
Dynamic query rule builder
Nested condition groups with AND/OR logic
Recursive group rendering
Schema-driven fields, operators, and inputs
Live Mongo-style query preview
Query execution simulator with mock datasets
Query validation engine
Drag-and-drop rule/group reordering
Keyboard shortcuts
Collapsible groups
Query history
Saved query presets
Export/import query JSON
Dark/light mode
Animated transitions
Unit and integration tests
Tech Stack
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui
Zustand
DnD Kit
Vitest and React Testing Library
Engineering Focus

This project prioritizes:

Clean frontend architecture
Typed query models
Recursive UI engineering
Scalable state management
Validation and safety
Performance optimization
Meaningful test coverage
Proper Git and pull request workflow
Current Status

PR 1 sets up the project foundation:

Next.js App Router project
TypeScript configuration
Tailwind CSS styling
shadcn/ui setup
Base application shell
Initial layout for schema, builder, preview, and results sections