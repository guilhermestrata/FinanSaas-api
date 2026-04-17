# FinanSaas API (MVP)

Backend HTTP JSON for the FinanSaas Financial Planning SPA.

- Base URL: `/api`
- Content-Type: `application/json`
- Swagger UI: `GET /docs`
- Health: `GET /health`

## Running

- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`

SQLite database is used via Prisma (`DATABASE_URL` in `.env`).

## Auth (MVP)

MVP uses a fixed demo user (`userId = "demo-user"`). No JWT yet.

## Error format

Non-2xx:

```json
{"error":"message","code":"SOME_CODE"}
```

## Implemented endpoints

### POST `/api/boleto/parse`
Request:
```json
{ "code": "string" }
```
Response 200:
```json
{ "normalized": "digits", "kind": "barcode44|linhaDigitavel47|convenio48" }
```
400:
```json
{ "error": "Código inválido. Informe 44, 47 ou 48 dígitos.", "code": "INVALID_BOLETO_CODE" }
```

### POST `/api/ai/projections`
Implements the MVP projection logic and insights.

### GET/PUT `/api/finance/profile`
Stores/returns `netMonthlyIncome`.

### GET/POST/DELETE `/api/fixed-expenses`
CRUD FixedExpense.

### GET/POST/PATCH/DELETE `/api/boletos`
CRUD Boleto with code normalization.

### GET/POST/DELETE `/api/salary-changes`
CRUD SalaryChange.

### POST `/api/finance/monthly`
Monthly table snapshot based on current profile + totals.
