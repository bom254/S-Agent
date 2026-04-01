# SequelizeConnectionError (ETIMEDOUT) Fix Plan - Progress Tracker

## Status
- ✅ Raw PG test-db.js succeeds (NeonDB accessible)
- ⚠️ Sequelize intermittent timeout (pooler/SSL)
- Goal: Stabilize Sequelize + dev with SQLite option

## Steps

**Step 1: Update package.json [PENDING]**
- Add \"type\": \"module\"

**Step 2: Optimize src/db/sequelize.ts [PENDING]**
- Match .env sslmode=require (no verify-full append)
- Set ssl: { rejectUnauthorized: false }
- Increase connectTimeoutMillis: 60000
- Add retry: sequelize.authenticate() with 3 retries

**Step 3: Add to backend/TODO.md [PENDING]**
- Merge DB troubleshooting

**Step 4: Test [PENDING]**
- cd backend && npm run dev
- Check logs: [DB] Using PostgreSQL → no error

**Step 5: Optional SQLite fallback [PENDING]**
- Add USE_SQLITE=true to .env for local dev

## Commands to Run
```
cd backend
npm install # after package.json update
npm run dev
# If timeout: USE_SQLITE=true npm run dev
```

## NeonDB Tips
- Check dashboard: https://console.neon.tech/app/projects
- Pooler mode OK for dev
- Limits: 20 conn max (default project)

Progress: 0/5 [Update this file as steps complete]
