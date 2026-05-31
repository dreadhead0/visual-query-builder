# Visual Query Builder

A highly interactive visual query builder built with **Next.js App Router** and **TypeScript**.

Users can visually construct database/API-style filters through a graphical interface using schema-driven fields, operators, nested condition groups, live Mongo-style query preview, validation, mock execution, query history, saved presets, and JSON import/export.

## Live URL

Production deployment URL: https://visual-query-builder-2tr8.vercel.app/

## Current Features

* Next.js App Router
* TypeScript
* Tailwind CSS
* Shadcn/UI components
* Zustand state management
* Schema-driven query builder
* Dynamic field/operator/value controls
* Recursive nested condition groups
* Collapsible groups
* Same-parent drag-and-drop reordering
* Keyboard shortcuts
* Live Mongo-style query preview
* Query validation engine
* Mock query execution simulator
* Result count display
* Loading and empty states
* Sorting and pagination
* Data source/schema switching
* Query history
* Saved query presets
* Export/import query JSON with validation
* Dark/light mode
* Animated transitions
* Unit and component tests with Vitest and React Testing Library
* Browser interaction tests with Playwright
* GitHub CI checks
* Vercel production deployment and preview deployments

## Available Schemas

The app currently supports three mock schemas:

* Users
* Orders
* Products

Each schema controls the available fields, allowed operators, value input type, validation behavior, generated query output, mock dataset, and result table columns.

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run unit and component tests:

```bash
npm test
```

Run browser interaction tests:

```bash
npm run test:e2e
```

Run lint:

```bash
npm run lint
```

Run the production build:

```bash
npm run build
```

## Deployment

This project is deployed with **Vercel**.

* Pushes to `main` trigger production deployments.
* Pull requests generate preview deployments.
* GitHub Actions runs CI checks before merge.
* CI currently runs lint, unit/component tests, browser tests, and production build.

## Project Status

This project is being built through feature branches and pull requests as required by the Stage 8 finalist task.

Completed so far:

* Core query builder functionality
* Recursive nested group rendering
* Schema-driven controls
* Query preview
* Query validation
* Mock query execution
* Advanced interactions
* Deployment setup
* Unit/component test coverage
* Browser interaction test coverage

Remaining before final submission:

* Final UI polish
* Final architecture README expansion
* Demo video guide/script
