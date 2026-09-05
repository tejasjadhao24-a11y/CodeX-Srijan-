# FraudGuard — Real-Time Fraud-Risk Detection & Adaptive Intervention

**FraudGuard** is an end-to-end, full-stack transaction fraud-risk detection and adaptive intervention system designed to prevent social engineering, executive impersonation ("Boss Scams"), and synthetic voice deepfake attacks in real-time.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM with SQLite** (`file:./dev.db`), it features real server-side evaluation, dynamic database persistence, reactive telemetry streaming via SWR, and multi-step security intervention workflows.

---

## 🌟 Key Features

1. **Expanded Heuristic Risk Engine (12+ Explainable Rules)**
   - **Amount Multipliers (Mutually Exclusive)**: `>10x baseline` (+40) or `>3x baseline` (+25).
   - **Hardware Device Provenance**: Unrecognized hardware ID (+20).
   - **Geographic Anomaly**: Dispatched outside usual city footprint (+15).
   - **High-Risk Merchant Vertical**: Gaming, gambling, crypto, gift cards (+20).
   - **Rapid Burst Frequency (Same Payee)**: 3+ transfers to same merchant in 10 min (+15).
   - **New Account Multiplier**: Account age <7 days with transfer >5x average (+15).
   - **Behavioral Category Shift**: Novel industry sector never transacted before (+10).
   - **Payee Record Age & Provenance**: Unverified payee (+20), record created <24h ago (+15).
   - **Velocity & Off-Hours**: >2 transfers in 10 min (+15), outside 08:00–22:00 window (+10).
   - **Urgent Round Figures**: Multiples of $50k/$100k/$500k (+5), self-reported urgency (+10).

2. **Guardian Mode — Minor Account Protection (For Families)**
   - **Un-deletable Mirroring**: Every transaction by a minor account (`isMinor = true`) automatically generates a `GuardianAlert` row linked to the guardian, visible only to the parent.
   - **Gaming / In-App Guardrail**: Minor purchases in flagged verticals (`gaming`, `gambling`) are enforced at minimum `MEDIUM` risk.
   - **Configurable Spend Limits**: Any transfer exceeding the guardian-configured threshold (e.g. `$50.00`) or rapid one-tap bursts halts in `HELD` quarantine and routes to the **Guardian Dashboard (`/guardian`)** for parent approval.
   - **Family Dashboard (`/guardian`)**: Weekly spend breakdown by category and app, spend threshold controls, and instant approve/block action triggers.

3. **5 Calibrated Demo Presets for Live Pitching**
   - **Preset 1 (Standard $450)**: Trusted device, verified payee, active hours → **LOW (0/100)** → Instant approval.
   - **Preset 2 (Large New Payee $28,000)**: >10x baseline + crypto vertical + unverified payee → **HIGH (75/100)** → Adaptive Intervention.
   - **Preset 3 (Urgent Critical Scam $500,000)**: Off-hours 23:00 + urgent flag + round sum → **CRITICAL (100/100)** → Quarantine & Hold.
   - **Preset 4 (Device & Location Anomaly $180)**: Unrecognized Android phone in Berlin paying BetVault → **HIGH/CRITICAL (~55-100)** → Multi-factor alert.
   - **Preset 5 (Guardian Breach $120)**: Jordan (Minor) buying Roblox coins over $50 limit → **HELD** → Dispatches alert to Alex Rivera's Guardian console.

---

## 🏗️ Architecture & Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS (Dark Futuristic Cyberpunk Security Console Theme)
- **Database & ORM**: SQLite via Prisma ORM (`prisma/schema.prisma`)
- **Telemetry / Reactive UI**: SWR with 3-second short-interval polling
- **Icons**: Lucide React

---

## 🚀 Quick Setup & Running Locally

### 1. Prerequisites
- Node.js v18+ (Tested on Node v24)
- npm v9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Push Database Schema & Seed Data
```bash
npx prisma db push
npm run db:seed
```

> **Pinned Seed Math:**
> - Demo User: `Alex Rivera` (`avgTransactionAmount = $2,000.00`, active window `08:00–22:00`).
> - 5 Beneficiaries: Sarah Jenkins (Known), Wire Corp Tech (Known), Apex Global Ltd (Unverified, <24h old), Metro Electric Co (Known), Quantum Capital Inc (Known).
> - 10 realistic historical transactions seeded into `dev.db`.

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧮 Server-Side Risk Scoring Rules

Every transaction submitted to `/api/transactions/evaluate` runs through the server-side engine in `src/lib/riskEngine.ts`:

| Heuristic Rule | Condition | Score Impact |
| :--- | :--- | :--- |
| **Amount Multiplier (Mutually Exclusive)** | `amount > 10 * user.avgTransactionAmount` | **+40 pts** |
| | `else if (amount > 3 * user.avgTransactionAmount)` | **+25 pts** |
| **Payee Provenance** | Beneficiary not in verified directory | **+20 pts** |
| **Payee Creation Age** | Beneficiary added `<24 hours` ago | **+15 pts** |
| **Velocity Check** | `>2 transactions` in past 10 minutes | **+15 pts** |
| **Off-Hours Activity** | `simulatedHour` outside `08:00 – 22:00` window | **+10 pts** |
| **Urgency Flag** | User toggled emergency urgency flag | **+10 pts** |
| **Urgent Round Sum** | Amount is multiple of `$50,000`, `$100,000`, or `$500,000` | **+5 pts** |

### Risk Bands & Automated Enforcement
- **`0 - 30` (LOW)**: Green → Action: `PROCEED` (Immediately Approved)
- **`31 - 55` (MEDIUM)**: Amber → Action: `PROCEED` (Inline advisory caution)
- **`56 - 80` (HIGH)**: Orange → Action: `PAUSE_VERIFY` (Adaptive Intervention Triggered)
- **`81 - 100` (CRITICAL)**: Red → Action: `HOLD_ESCALATE` (Quarantined in Case History)

---

## 📡 REST API Surface

### 1. `POST /api/transactions/evaluate`
Evaluates risk score dynamically. Supports `previewMode: true` for live debounced UI feedback without writing to DB.
```json
// Request Body
{
  "beneficiaryId": "ben_apex_global",
  "amount": 28000,
  "selfReportedUrgent": false,
  "simulatedHour": 14,
  "previewMode": false
}
```

### 2. `PATCH /api/transactions/:id/social-check`
Computes social engineering threat points:
- `self`: `0 pts`
- `whatsapp_call`: `+30 pts`
- `employer_impersonation`: `+35 pts`
- `bank_police_impersonation`: `+40 pts`
- `secrecy_demanded`: `+50 pts`

### 3. `PATCH /api/transactions/:id/deepfake-check`
Simulated neural voice analysis returning synthetic clone confidence score (`60-90%`) and acoustic harmonic notes.

### 4. `PATCH /api/transactions/:id/finalize`
Combines heuristic base score, social engineering score, and deepfake score into `finalRiskLevel` and `actionTaken`, setting status to `HELD` or `APPROVED`.

### 5. `GET /api/dashboard/stats`
Returns live DB counts (`totalMonitored`, `highCriticalCount`, `heldCount`, `protectionScore`, `avgProcessingTimeMs`, and `recentTransactions`).

### 6. `GET /api/cases?status=HELD`
Returns flagged incident cases filtered by status with risk factor arrays and user metadata.

### 7. `PATCH /api/cases/:id`
Updates case status (`APPROVED` or `CANCELLED`) with audit trail.

---

## 🧪 Automated Testing
Run the comprehensive end-to-end integration test suite:
```bash
npx tsx src/scripts/e2e-test.ts
```
All 10 tests verify page rendering, preview computation, DB persistence, the 3-step intervention API chain, and case resolution.
