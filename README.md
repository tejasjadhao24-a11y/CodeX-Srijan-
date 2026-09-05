# FraudGuard — Real-Time Transaction Fraud-Risk Detection & Adaptive Intervention System

[![GitHub Repository](https://img.shields.io/badge/GitHub-CodeX--Srijan--%20FraudGuard-cyan?style=for-the-badge&logo=github)](https://github.com/tejasjadhao24-a11y/CodeX-Srijan-)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-SQLite%20ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Vosk AI](https://img.shields.io/badge/Speech%20Recognition-Vosk%20Offline%20STT-orange?style=for-the-badge)](https://alphacephei.com/vosk/)
[![Test Suite](https://img.shields.io/badge/E2E%20Tests-11%2F11%20Passing%20(100%25)-emerald?style=for-the-badge)](https://github.com/tejasjadhao24-a11y/CodeX-Srijan-)

**FraudGuard** is an end-to-end, full-stack transaction fraud-risk detection and adaptive intervention security platform. It intercepts unauthorized or coerced transactions in real time before funds leave user accounts, neutralizing zero-day social engineering, CEO/executive impersonation ("Boss Scams"), coercive phone pressure, and synthetic voice deepfakes.

---

## 📌 Executive Summary

Modern banking fraud has shifted away from credential-theft malware toward **Authorized Push Payment (APP) fraud** and **coercive social engineering**, where legitimate users are deceived into authorizing transactions themselves under false pretenses or synthetic voice calls. Traditional rule engines check static daily limits after funds have already settled. 

**FraudGuard** solves this by acting as an inline real-time risk decisioning gate. It evaluates 12+ explainable behavioral, device, and contextual heuristics, runs **real offline speech-to-text with Vosk** on caller audio to detect linguistic coercion patterns, provides full step-by-step reasoning transparency, and introduces **Guardian Mode** to protect minors from unauthorized in-app gaming and digital purchases.

---

## 💥 The Problem Statement

1. **Zero-Day Social Engineering & Executive Impersonation ("Boss Scams")**:
   - Attackers pose as CEOs, CFOs, bank security officials, or police officers demanding urgent, confidential wire transfers. Because the legitimate account owner authorizes the transaction, traditional 2FA and OTP controls fail completely.
2. **Synthetic Voice Clones & Telephony Deepfakes**:
   - Generative audio tools can replicate an executive or family member's voice with only a few seconds of reference audio, creating unprecedented urgency and secrecy.
3. **Black-Box Fraud Scores**:
   - Existing anti-fraud tools output arbitrary risk numbers without explainability. Users and fraud analysts cannot tell *why* a transaction was flagged or held.
4. **Minor & Family Vulnerability in Gaming**:
   - Children and teenagers increasingly fall prey to predatory in-app purchases, microtransactions, or gaming scams, draining parent accounts without immediate visibility or un-deletable oversight.

---

## 🛡️ The FraudGuard Solution

FraudGuard operates across 5 core security layers:

```
[ Transaction Dispatch ]
           │
           ▼
[ Layer 1: Real-Time Ingestion & 12+ Explainable Heuristics ]
  ├─ Amount vs Baseline (>10x or >3x multiplier)
  ├─ Beneficiary Trust & Record Age
  ├─ Device Identification & Known Hardware Check
  ├─ Geolocation Anomaly Detection
  ├─ High-Risk Merchant Category (Gaming, Crypto, Gambling, Gift Cards)
  ├─ 10-Minute Velocity & Rapid Repeat Same Merchant
  ├─ Account Age vs Volume Tenure Check
  └─ Behavioral Historical Category Shift
           │
           ▼
[ Layer 2: Guardian Mode Protection (Minors) ]
  ├─ Guaranteed Un-deletable Mirroring to Guardian Alert Ledger
  ├─ Auto-Elevation of Flagged Categories to >= MEDIUM
  └─ Configurable Per-Transaction Spend Threshold Enforcement (-> HELD)
           │
           ▼
[ Layer 3: Adaptive Intervention Isolation (High / Critical) ]
  ├─ Step 1: Contextual Impersonation Screening (+30 to +50 pts)
  ├─ Step 2: Real Offline Vosk Speech-to-Text & Threat Phrase Analysis (+10 to +50 pts)
  └─ Step 3: Sequential Factor-by-Factor Calculation & Final Decision Gate
           │
           ▼
[ Layer 4: Automated Gate Decision ]
  ├─ LOW (0-30): Immediate Approval & Instant Settlement
  ├─ MEDIUM (31-55): Approved with Inline Advisory Notice
  ├─ HIGH (56-80): Pause & Verify via Adaptive Intervention
  └─ CRITICAL (81-100): Quarantined in Case Incident Review Queue
           │
           ▼
[ Layer 5: Forensic Case Review Queue & Parent Controls ]
  ├─ Guardian Dashboard: Live Weekly Spend, Category Breakdown, 1-Click Approve/Block
  └─ Security Analyst Queue: Manual Hold Release & Fraud Cancellation Controls
```

---

## 💻 Tech Stack

| Layer | Technology | Rationale & Implementation |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** | Modern React Server Components, server actions, dynamic routing, and fast SSR. |
| **UI Library** | **React 19** | Latest hooks, optimal re-rendering, and seamless async transitions. |
| **Styling** | **Tailwind CSS v3.4** | Custom dark cyber-security design system with tailored HSL tokens, backdrop blur, and glows. |
| **Database & ORM** | **SQLite + Prisma ORM** | File-based zero-configuration embedded database (`dev.db`), full audit persistence, and type-safe relational queries. |
| **Speech AI Engine** | **Vosk (`vosk-model-small-en-us-0.15`)** | True offline neural speech-to-text recognition running locally in Node/Python without cloud latency or third-party leakage. |
| **Real-Time Telemetry** | **SWR (Stale-While-Revalidate)** | 3-second short-interval reactive polling syncing live telemetry and alerts without manual page refresh. |
| **Audio Processing** | **MediaRecorder & Web Audio API** | In-browser audio capture and WAV conversion for live speech transcription. |
| **Iconography & Motion**| **Lucide React & CSS Micro-Interactions** | Consistent security iconography, animated number counters, and SVG circular gauges. |
| **Verification & E2E** | **Node.js `tsx` + Puppeteer Core** | 11-step automated end-to-end integration test suite and 1440px desktop screenshot validation. |

---

## 🧩 Key Innovations & Features

### 1. Real Offline Voice Analysis with Vosk
- **Offline Speech-to-Text**: Operates without external API keys or cloud services using the lightweight `vosk-model-small-en-us-0.15` model.
- **Dual Input Modes**:
  - **Live Microphone**: In-browser recording with timer, waveform visualization, and instant playback.
  - **File Upload**: Native support for `.wav`, `.mp3`, and `.webm` audio recordings.
  - **1-Click Demo Clips**: Pre-recorded scam-style clip and legitimate control clip for consistent pitching.
- **Linguistic Threat Detection**:
  - **Authority Claims (+15 pts)**: `"this is your ceo"`, `"bank security"`, `"police department"`, `"compliance officer"`.
  - **Urgency (+10 pts)**: `"immediately"`, `"right now"`, `"urgent"`, `"before it's too late"`.
  - **Secrecy Pressure (+15 pts)**: `"don't tell anyone"`, `"keep this confidential"`, `"strictly confidential"`.
  - **Isolation Tactics (+10 pts)**: `"don't call the office"`, `"use this number only"`, `"stay on the line"`.
  - Total voice threat points are capped at **+50 pts**.
- **Inline Highlighting**: Displays the exact returned transcript with highlighted, color-coded badges matching each threat category.

### 2. Sequential Step-by-Step Risk Calculation Sequence
Rather than presenting a mysterious static score, FraudGuard makes the engine's reasoning **visible and explainable**:
- Evaluates 9 baseline checks followed by contextual impersonation and Vosk audio signals in order.
- Staggered sequential reveal animation with an incrementing running tally counter.
- Evaluated inputs that come back clean are explicitly displayed as de-emphasized with a checkmark (*"Clean"* / *"+0 pts"*), proving that all security controls were tested.

### 3. Guardian Mode — Child & Minor Protection
- **Guaranteed Mirroring**: Any transaction by a user flagged with `isMinor = true` writes an immutable record to the `GuardianAlert` table linked to their guardian's account. Minor sessions cannot edit or delete these alerts.
- **Risk Elevation**: Transactions in flagged categories (`gaming`, `gambling`) are automatically elevated to at least `MEDIUM` risk.
- **Configurable Approval Threshold**: Transfers exceeding the parent's per-transaction limit (e.g. >$75.00) or rapid one-tap bursts transition into `HELD` quarantine and require guardian confirmation.
- **Dedicated Guardian Dashboard (`/guardian`)**:
  - Real-time 7-day spend breakdown by category and primary merchant.
  - Per-child spend threshold slider with live database updates.
  - 1-click **Approve** and **Block** actions directly updating the transaction ledger.

---

## 📱 Page Walkthrough & Views

1. **Telemetry Dashboard (`/dashboard`)**:
   - High-contrast telemetry cards: Total Monitored, Flagged Threats, Protection Index, and Roundtrip Latency.
   - Quarantined Fraud Value highlight banner with radiant border styling.
   - Live transaction feed with level-specific glowing badges and slide-over **Transaction Audit Drawer** with raw database JSON inspection.

2. **Send Money & Threat Interception (`/send-money`)**:
   - 5 calibrated demo presets for live demonstrations (Standard, New Payee, Critical Scam, Device/Location Anomaly, and Guardian Breach).
   - Live simulated inputs: Hardware Device ID, Geolocation, Merchant Category, and simulated hour slider.
   - Real-time debounced SVG RiskGauge ring with live sequential reasoning breakdown.

3. **Guardian Mode Console (`/guardian`)**:
   - Supervised spend tracking for linked minors (e.g., Jordan Rivera, age 12).
   - Category spend distribution chart (`[GAMING]`, etc.).
   - Interactive approval threshold editor and un-deletable live alert feed.

4. **Case Incident Review & Forensic Queue (`/cases`)**:
   - Filterable security analyst triage queue (Held in Quarantine, Pending Review, Approved Overrides, Cancelled/Fraud).
   - Expandable forensic rows displaying the full sequential breakdown, impersonation responses, hardware metadata, and Vosk audio transcripts.
   - 1-click manual **Release Hold** or **Cancel Fraud** actions.

5. **Enterprise Threat Specification (`/enterprise`)**:
   - Multi-layered detection pipeline flow diagram.
   - Live SQLite Prisma API response viewer querying `/api/cases`.
   - Threat intelligence model documentation for executive and judge reviews.

---

## 🧪 Verification & End-to-End Test Suite

Run the automated integration test suite:
```powershell
npx tsx src/scripts/e2e-test.ts
```

### Verified Test Cases (11/11 Passing):
1. **SSR / HTML Delivery**: All 5 pages (`/dashboard`, `/send-money`, `/cases`, `/enterprise`, `/guardian`) render with 200 OK.
2. **Directory Access**: `GET /api/beneficiaries` returns verified accounts.
3. **Telemetry Aggregations**: `GET /api/dashboard/stats` computes real database metrics.
4. **Expanded Heuristics**: Device anomaly, location anomaly, and merchant category risk evaluated cleanly in preview mode.
5. **Rapid Repeat Burst Detection**: Real SQLite query verifies 3+ transfers to same payee in 10 minutes (+15 pts).
6. **Guardian Minor Transaction**: Minor transfer correctly creates `Transaction` and mirrors to `GuardianAlert` (`status: HELD`).
7. **Guardian Stats Aggregation**: `GET /api/guardian/stats` computes weekly category spend for minors.
8. **Guardian Alert Action**: Parent approves minor transaction, updating alert and settling transaction.
9. **Threshold Updates**: `PATCH /api/guardian/settings` updates minor spend threshold.
10. **Real Vosk Voice Transcription**:
    - Scam audio transcribed to text, detecting authority/urgency phrases (+50 pts).
    - Control audio transcribed cleanly with 0 threat points.
11. **Composite Finalization**: `PATCH /api/transactions/:id/finalize` calculates composite risk score incorporating voice forensics.

---

## 🚀 Getting Started Locally

```bash
# 1. Clone the repository
git clone https://github.com/tejasjadhao24-a11y/CodeX-Srijan-.git
cd CodeX-Srijan-

# 2. Install dependencies
npm install

# 3. Synchronize database schema and seed demo data
npx prisma db push
npm run db:seed

# 4. Generate demo audio files (Optional, already included in public/audio/)
powershell -ExecutionPolicy Bypass -File scripts/generate_audio.ps1

# 5. Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.
