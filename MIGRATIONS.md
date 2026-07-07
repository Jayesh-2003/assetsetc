# Database Migrations Guide

This guide explains how to manage the database schema, run migrations, and seed the database using Prisma.

## Prerequisites

Ensure you have a `.env` file in the root directory with a valid `DATABASE_URL`. For a local PostgreSQL instance:

```env
DATABASE_URL="postgresql://us_enrolment:12345678@localhost:5432/assetsetc"
```

---

## Migration Scripts

We have added convenience scripts in `package.json` to manage the database:

| Command | Underlying command | Description |
|---------|---------------------|-------------|
| `npm run db:push` | `npx prisma db push` | Pushes the Prisma schema state directly to the database without creating a migration file. Best for rapid prototyping. |
| `npm run db:migrate` | `npx prisma migrate dev` | Creates a new SQL migration file, prompts for a name, and applies it to the development database. |
| `npm run db:deploy` | `npx prisma migrate deploy` | Applies pending migrations to the database. Use this command in CI/CD or production environments. |
| `npm run db:seed` | `npx tsx scripts/seed.ts` | Seeds the database with default records (e.g., the System Admin user). |
| `npm run db:studio` | `npx prisma studio` | Starts a local web-based GUI console on [http://localhost:5555](http://localhost:5555) to view/edit database records. |
| `npm run prisma:generate` | `npx prisma generate` | Re-generates the local Prisma Client types based on `schema.prisma`. |

---

## Workflow Guide

### 1. Local Prototyping (Quick Setup)
If you are working locally and want to apply your changes to the database without generating SQL migration files:
```bash
npm run db:push
npm run db:seed
```

### 2. Creating a Database Migration
When you modify `prisma/schema.prisma` and want to track the change with a migration file (so it can be applied to staging or production):
1. Modify `prisma/schema.prisma`.
2. Run:
   ```bash
   npm run db:migrate
   ```
3. Enter a descriptive name for the migration when prompted (e.g., `add_repair_status`). This creates a new folder in `prisma/migrations/` containing the SQL migration script.

### 3. Deploying to Production / Staging
To apply all pending SQL migration files to a production or staging database:
```bash
npm run db:deploy
```
