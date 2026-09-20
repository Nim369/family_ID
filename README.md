# Gujarat Kutumb Portal | ગુજરાત કુટુંબ પોર્ટલ
### Unified Family ID & Proactive Welfare Entitlement Architecture (Government of Gujarat)

Official Hackathon Submission for the **Gujarat Kutumb Portal & Administration Center** — an integrated digital governance system featuring dual authenticated portals for Citizens and Taluka Revenue Officers (Mamlatdar / TDO) with real-time cross-origin synchronization, proactive scheme matching, life-cycle event orchestration, and cross-household fraud prevention.

---

## 🏛️ System Architecture Diagram

```mermaid
flowchart TB
    subgraph Citizens [👨‍👩‍👧‍👦 Citizen Portal (Port 3000 / Web)]
        CP_Auth[Aadhaar OTP & Head Authentication]
        CP_Card[Official Digital Kutumb Card & QR]
        CP_Life[Lifecycle Manager: Birth, Marriage, Death]
        CP_Passbook[Proactive Scheme Entitlement Passbook]
        CP_AddMem[Instant Member Registration Modal]
    end

    subgraph SyncBus [⚡ Real-Time Data Synchronization & API Bridge]
        API_Fam[/api/families - GET / POST/]
        API_Notif[/api/notifications - Live Push/]
        API_SMS[/api/send-sms - Telecom Gateway/]
        RevProxy[Vite Dev Server Reverse Proxy :3001 -> :3000]
    end

    subgraph DataTier [💾 Persistent State & Database Tier]
        LiveDB[(src/data/liveDatabase.json)]
        LiveNotif[(src/data/liveNotifications.json)]
        LocalCache[(Browser LocalStorage Cache)]
    end

    subgraph Officers [🏛️ Taluka Officer Portal (Port 3001 / /officer.html)]
        OF_Auth[Taluka Officer Role Authentication]
        OF_Pending[Pending Verification Queue]
        OF_Dossier[360° Citizen Census & Income Dossier]
        OF_Rules[Cross-Household Integrity & Anti-Fraud Engine]
        OF_Stamp[Digital Verification Stamping & Rejection]
    end

    subgraph Telecom [📡 External Telecom & Verification Gateway]
        Fast2SMS[Fast2SMS Cellular Gateway API]
        SMS_Dispatch[Direct Mobile SMS Dispatcher]
    end

    %% Flows
    CP_Auth --> CP_Card
    CP_AddMem -->|POST Member Data| API_Fam
    CP_Life -->|POST Lifecycle Events| API_Fam
    API_Fam <-->|Atomic Disk Persistence| LiveDB
    API_Notif <--> LiveNotif
    LiveDB <--> LocalCache

    OF_Auth --> OF_Pending
    OF_Pending --> OF_Dossier
    OF_Dossier --> OF_Rules
    OF_Rules --> OF_Stamp
    OF_Stamp -->|POST Stamped Status| API_Fam

    Officers <-->|Forward /api| RevProxy <--> API_Fam
    API_Fam -.->|2s Real-Time Polling| OF_Dossier
    API_Fam -.->|2s Real-Time Polling| CP_Card

    CP_AddMem -->|Trigger Alert| API_SMS
    OF_Stamp -->|Trigger Status Alert| API_SMS
    API_SMS --> Fast2SMS --> SMS_Dispatch
```

---

## 🚀 Key Architectural Innovations

### 1. Dual-Portal Sovereign Separation
- **Citizen Portal (`/index.html`):** Citizen access via Aadhaar Number and simulated or real Telecom SMS OTP.
- **Taluka Officer Portal (`/officer.html`):** Dedicated administration portal for Taluka Development Officers (TDO) and Mamlatdars with administrative access credentials.
- In development mode, running on distinct ports (`:3000` for Citizen, `:3001` for Officer) with cross-origin reverse proxying.
- In production build, compiled into a unified multi-page application (MPA) deployable to any standard web host or CDN.

### 2. Zero-Loss Cross-Portal Real-Time Synchronization
- Solves browser Same-Origin Policy (SOP) port isolation through a unified Node/Vite backend middleware (`/api/families` and `/api/notifications`).
- Two-way background polling (`2000ms`) ensures changes made on either portal (such as adding a family member or approving an income certificate) reflect live in both systems without page reload.

### 3. Rules Engine & Cross-Household Fraud Prevention
- **PDS Ration Card Integrity:** Prevents members from having duplicate active ration entitlements across separate households.
- **Multi-Child Education Scholarships:** Enforces state rules allowing multiple eligible female children in the same family to simultaneously receive schemes like *Namo Saraswati Vigyan Sadhana* and *Kanya Kelavani Nidhi*.
- **Dynamic Marriage Migration:** Transfers married daughters from their father's family to their husband's family atomically with relationship adjustments (`DAUGHTER` -> `DAUGHTER_IN_LAW` or `SPOUSE`), preventing ghost duplicate benefits.
- **Deceased Member Archiving:** Freezes deceased citizen records to eliminate ghost subsidies while automatically unlocking widow pensions (*Ganga Swarupa Yojana*) for the surviving spouse.

### 4. Direct Mobile Telecom SMS Gateway
- Pluggable SMS architecture supporting both simulated instant testing and real cellular delivery across Indian mobile networks via **Fast2SMS Bulk V2 API**.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Tailwind CSS, Lucide Icons, Canvas Confetti, QRCode SVG
- **Build Tool:** Vite 6 (Multi-Page Rollup Bundle)
- **State & Backend:** LocalStorage Cache + Node.js Atomic Disk JSON Database (`liveDatabase.json`)
- **Gateway Integration:** Fast2SMS Telecom API (`/api/send-sms`)

---

## 📦 Getting Started & Running Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Installation
```bash
git clone https://github.com/Nim369/family_ID.git
cd family_ID
npm install
```

### 3. Running Portals Locally

#### Option A: Citizen Portal (Port 3000)
```bash
npm run dev:citizen
```
Access at: `http://localhost:3000/`

#### Option B: Taluka Officer Portal (Port 3001)
```bash
npm run dev:officer
```
Access at: `http://localhost:3001/officer`

### 4. Building for Production
```bash
npm run build
```
The production bundle will be generated in `dist/` with both `dist/index.html` (Citizen Portal) and `dist/officer.html` (Taluka Officer Portal).

---

## 👥 Demo Profiles for Evaluators

### 1. Citizen Portal
- **Head of Household:** Rameshbhai Kanubhai Patel
- **Family ID:** `GJ-AMD-2026-10492`
- **Mobile Number:** `9825143210`
- **Aadhaar Number:** `7821-3456-9012`

### 2. Taluka Officer Administration
- **Officer Name:** K. R. Vaghela
- **Designation:** Taluka Development Officer (TDO)
- **Jurisdiction:** Daskroi Taluka, Ahmedabad District
- **Default Credentials:** `tdo.daskroi@gujarat.gov.in` / `Gujarat@2026`
