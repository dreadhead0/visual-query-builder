# Visual Query Builder

A highly interactive visual query builder built with Next.js App Router and TypeScript.

Users can visually construct database/API-style filters using schema-driven fields, operators, nested condition groups, live Mongo-style query preview, validation, mock execution, query history, saved presets, and JSON import/export.

## Live URL

Production deployment: https://visual-query-builder-2tr8.vercel.app/

## Current Features

- Next.js App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI components
- Zustand state management
- Schema-driven query builder
- Dynamic field/operator/value controls
- Recursive nested condition groups
- Collapsible groups
- Live Mongo-style query preview
- Query validation engine
- Mock query execution simulator
- Result count display
- Loading and empty states
- Sorting and pagination
- Data source/schema switching
- Query history
- Saved query presets
- Export/import query JSON with validation
- GitHub CI build checks
- Vercel production deployment and preview deployments

## Available Schemas

The app currently supports three mock schemas:

- Users
- Orders
- Products

Each schema controls the available fields, operators, value inputs, preview output, validation behavior, and result table columns.

## Development

Install dependencies:

```bash
npm install

## Start development server:

npm run dev

## Run production build:

npm run build

## Deployment

This project is deployed with Vercel.

Pushes to main trigger production deployments.
Pull requests generate preview deployments.
GitHub Actions runs CI build checks before merge.

## Project Status

This project is being built through feature branches and pull requests as required by the Stage 8 task.