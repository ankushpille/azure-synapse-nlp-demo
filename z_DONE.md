# Project Review

After checking against the README requirements, the project is **mostly correct** with a few issues:

## Issues Found

4. **SQL inconsistency** — README docs show `dbo.sales_data` but code uses `nlp_poc.dbo.sales_data` (redundant since DB is already in connection config; not a bug but inconsistent)

Everything else (React app, Express server, NLP logic, CSS, Vite config) is correct and complete.

---

| File              | Change                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/index.js` | **Fixed** — SQL queries changed from `nlp_poc.dbo.sales_data` → `dbo.sales_data` (database already set in connection config, matches README docs) |
