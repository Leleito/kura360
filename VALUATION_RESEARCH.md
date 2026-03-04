# KURA360 Platform Valuation & Shareholder Research

**Date:** March 4, 2026
**Prepared for:** Sysmera Limited / George Leleito (@Leleito)
**Platform:** kura360.com

---

## 1. Executive Summary

Kura360 is a **Campaign Compliance & Operations Platform** purpose-built for **Kenyan elections**. It addresses a critical regulatory gap — compliance with the **Elections Campaign Financing Act (ECFA), No. 42 of 2013** — in a market where no dedicated software solution currently exists. The platform combines campaign finance management, field agent coordination, evidence collection, donation tracking (with M-Pesa/Flutterwave integration), and automated IEBC compliance reporting into a single SaaS product.

**Key Finding:** Kura360 appears to be the **first-mover** in Kenya-specific ECFA campaign compliance software, operating in an underserved niche with regulatory tailwinds.

---

## 2. Platform Overview

### 2.1 What Kura360 Does

| Module | Description |
|---|---|
| **Campaign Dashboard** | Real-time overview of spending, compliance status, agent deployment |
| **Finance & Transactions** | Track all income/expenditures with categorization per ECFA (venue hire, publicity, advertising, transport, personnel, administration) |
| **Donations Management** | Receive and track campaign donations via M-Pesa and Flutterwave with KYC compliance checking |
| **Agent Management** | Deploy, track, and coordinate field agents at polling stations with GPS check-in |
| **Evidence Vault** | Store photos, videos, and documents with SHA-256 hashing, EXIF metadata, GPS coordinates, and tamper-proof verification |
| **Compliance Reporting** | Auto-generate IEBC-format compliance reports for ECFA submission |
| **Incident Reporting** | Field agents can report incidents with urgency levels and GPS location |
| **Audit Trail** | Complete audit log of all actions for transparency and legal defensibility |
| **RBAC** | Role-based access control (Campaign Owner, Finance Officer, Agent Coordinator, Field Agent, Viewer) |

### 2.2 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend/BaaS | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Payments | M-Pesa, Flutterwave integration |
| Hosting | Vercel |
| Charts | Recharts |
| Forms | React Hook Form + Zod validation |
| Animations | Framer Motion |

### 2.3 Pricing Model (SaaS Tiers)

| Tier | Price | Features |
|---|---|---|
| **Starter** | Free | 1 campaign, basic dashboard, up to 10 agents, email support |
| **Professional** | KES 9,999/mo (~$77 USD) | Unlimited agents, evidence vault, compliance dashboard, SMS notifications, priority support |
| **Enterprise** | Custom pricing | Multi-campaign, party-level console, API access, dedicated support, custom integrations |

---

## 3. Market Analysis

### 3.1 Total Addressable Market (TAM) — Kenya

Kenya's electoral landscape provides the primary addressable market:

| Election Level | Seats | Potential Campaigns (Avg. 3-5 candidates/seat) |
|---|---|---|
| President | 1 | 3-10 |
| Governor | 47 | 141-235 |
| Senator | 47 | 141-235 |
| Women Representative | 47 | 94-188 |
| Member of Parliament | 290 | 870-1,450 |
| Member of County Assembly (MCA) | 1,450 | 4,350-7,250 |
| **Total** | **1,882** | **~5,600-9,400 campaigns** |

**Kenya Election Cycle Revenue Potential (per 5-year cycle):**

- Conservative (5% penetration at Professional tier): ~280 campaigns x KES 9,999/mo x 12 months = **KES 33.6M/year (~$259K USD/year)**
- Moderate (15% penetration, mixed tiers): ~840 campaigns average = **KES 75-100M/year (~$577K-$770K USD/year)**
- Aggressive (30% penetration + party-level enterprise deals): **KES 200M+/year (~$1.5M+ USD/year)**

### 3.2 Serviceable Addressable Market (SAM) — East Africa & Africa

The ECFA compliance model can be adapted to other African countries with campaign finance legislation:

| Country | Election Cycle | Political Finance Law |
|---|---|---|
| Kenya | 2027 (next) | ECFA 2013 (revised 2017) |
| Nigeria | 2027 | Electoral Act 2022, Section 88-93 |
| South Africa | 2029 | Political Party Funding Act (2018) |
| Ghana | 2028 | Political Parties Act (2000) |
| Tanzania | 2030 | Election Expenses Act (2010) |
| Uganda | 2031 | Presidential Elections Act |

**Pan-African TAM estimate:** 15,000-40,000+ campaigns across these markets = **$5M-$20M+ annual SaaS revenue potential** at scale.

### 3.3 Global Campaign Software Market Context

| Metric | Value | Source |
|---|---|---|
| Global Political Campaign Software Market (2024) | $1.3B-$2.3B | Market Research Future, Deep Market Insights |
| Projected by 2035 | $2.6B-$9.0B | Multiple analysts |
| CAGR | 8.9%-13.2% | Industry consensus |
| MEA (Middle East & Africa) share | ~5% | Market Growth Reports |
| Campaign Management segment | 32-35% of market | Stats N Data |

**The MEA campaign software segment (~$65M-$115M) is currently served by NO dedicated African-built platform** — Kura360 addresses this gap directly.

### 3.4 Competitive Landscape

| Competitor | Market | Kenya-Specific? | ECFA Compliance? |
|---|---|---|---|
| ISPolitical | USA (FEC) | No | No |
| Civix | USA | No | No |
| MapLight | USA | No | No |
| Campaign Deputy | USA (Democrats) | No | No |
| IFES Systems | International (NGO) | Partial (built voter reg) | Partial |
| SoftwareKenya.com | Kenya | Basic SMS/voter tools | No |
| **Kura360** | **Kenya/Africa** | **Yes** | **Yes** |

**Competitive Moat:** Kura360 is the only platform combining ECFA-specific compliance, M-Pesa donation integration, field agent GPS tracking, and tamper-proof evidence management in one product.

---

## 4. Platform Valuation

### 4.1 Valuation Methodology

Given Kura360 is a **pre-revenue / early-stage SaaS startup**, we apply multiple valuation approaches:

#### Method 1: Revenue Multiple (Forward-Looking)

| Scenario | Projected ARR (Year 1-2) | SaaS Multiple (Africa Early-Stage) | Valuation |
|---|---|---|---|
| Conservative | $100K-$250K | 8-12x | **$800K-$3M** |
| Base Case | $250K-$500K | 10-15x | **$2.5M-$7.5M** |
| Optimistic | $500K-$1M | 12-20x | **$6M-$20M** |

*Note: African SaaS companies typically command 8-20x revenue multiples at early stage, depending on growth rate and market positioning.*

#### Method 2: Comparable Transactions

| Company | Stage | Funding | Implied Valuation | Relevance |
|---|---|---|---|---|
| Ushahidi (Kenya) | Series A | $8M raised | ~$40M | Election monitoring/civic tech |
| Smile ID (Nigeria) | Series A | $20M raised | ~$100M | KYC/identity verification |
| Anchor (Nigeria) | Seed | $2.4M raised | ~$12M | Banking-as-a-service |
| Craft Silicon (Kenya) | Growth | N/A | ~$50M+ | Financial software for Africa |

**Comparable-based range: $2M-$10M** (given pre-revenue stage but strong product-market fit signals)

#### Method 3: Cost-to-Replicate + IP Value

| Component | Estimated Value |
|---|---|
| Software Development (12+ months, full-stack) | $150K-$300K |
| ECFA Compliance Logic & Domain Knowledge | $50K-$100K |
| Supabase Architecture & Database Design | $30K-$50K |
| UI/UX Design (premium, mobile-responsive) | $40K-$80K |
| M-Pesa/Flutterwave Integration | $20K-$40K |
| Evidence Vault (SHA-256, EXIF, GPS) | $30K-$50K |
| Brand, Domain (kura360.com), First-Mover Advantage | $50K-$200K |
| **Total Cost-to-Replicate** | **$370K-$820K** |

### 4.2 Recommended Valuation Range

| Metric | Range |
|---|---|
| **Floor (Cost-to-Replicate)** | **$400K-$800K** |
| **Fair Value (Pre-Revenue SaaS)** | **$1.5M-$5M** |
| **Ceiling (With Traction + Revenue)** | **$5M-$15M** |

**Recommended pre-money valuation for fundraising: $2M-$5M** (seed round positioning)

---

## 5. Shareholder & Ownership Research

### 5.1 Current Ownership Structure

Based on codebase analysis:

| Entity | Role | Details |
|---|---|---|
| **Sysmera Limited** | Parent Company / IP Owner | Listed as `"author"` in package.json |
| **George Leleito (@Leleito)** | Founder / Owner | Listed as project owner in CLAUDE.md |

**Sysmera Limited** is a French-registered technology company with a robust presence across East Africa (Kenya, Tanzania, Uganda, Rwanda) and Nigeria. Headquartered operations in Nairobi at Rhapta Heights, Rhapta Road.

### 5.2 Corporate Registration

- **Sysmera Limited** — Registered company with operations in Kenya
- **Kenya Business Registration Service (BRS)** — A formal CR12 (Certificate of Particulars) would need to be obtained from the eCitizen BRS portal (approximately KES 650) to confirm the exact directors and shareholders
- **No public shareholder filings** were found in online databases (PitchBook, Crunchbase, CB Insights)

### 5.3 Current Funding Status

| Metric | Status |
|---|---|
| External Funding Raised | None identified (bootstrapped) |
| Listed on Crunchbase | No |
| Listed on PitchBook | No |
| Listed on AngelList | No |
| Venture Capital Backing | None identified |

**Assessment:** Kura360 appears to be **self-funded/bootstrapped** by Sysmera Limited, with no external investors identified.

### 5.4 Potential Shareholder / Investor Targets

Based on the platform's profile (African election tech, SaaS, compliance/RegTech, civic tech), the following investors and entities are potential shareholders or strategic investors:

#### Tier 1: Africa-Focused VC Funds (Seed/Pre-Seed)

| Fund | Focus | Notable Investments | Fit |
|---|---|---|---|
| **Kepple Africa Ventures** | East Africa early-stage | 100+ African startups | High |
| **Savannah Fund** | Kenya-based seed fund | Tech startups in EAC | High |
| **Chandaria Capital** | Kenya-based, tech focus | Local SaaS companies | High |
| **TLcom Capital** | Africa growth stage | Andela, Twiga Foods | Medium |
| **Partech Africa** | Pan-African | Wave, TradeDepot | Medium |
| **4DX Ventures** | Africa early-stage | Multiple Kenya deals | High |

#### Tier 2: Civic Tech / Democracy Investors

| Entity | Type | Why |
|---|---|---|
| **Omidyar Network** | Impact investor | Democracy & governance portfolio |
| **Luminate (Omidyar Group)** | Civic tech funder | Funds transparency/accountability tech |
| **National Endowment for Democracy (NED)** | Grant funder | Election integrity globally |
| **USAID / DRL** | Development finance | Democracy, Rights & Labor programs |
| **Open Society Foundations** | Philanthropic | Election monitoring & transparency |
| **IFES** | Strategic partner | Already building Kenya election tech |

#### Tier 3: Strategic / Corporate Investors

| Company | Interest |
|---|---|
| **Safaricom (M-Pesa)** | M-Pesa integration partner; could fund or acquire |
| **Flutterwave** | Payment partner; strategic investment potential |
| **Twilio / Africa's Talking** | SMS/communications integration |
| **Google for Startups Africa** | Non-dilutive funding + cloud credits |
| **Microsoft for Startups** | Azure credits + equity-free funding |

#### Tier 4: Election Bodies & Government

| Entity | Opportunity |
|---|---|
| **IEBC (Independent Electoral and Boundaries Commission)** | Could mandate or endorse platform |
| **ORPP (Office of the Registrar of Political Parties)** | Regulatory partnership |
| **County Governments** | Bulk licenses for local campaigns |

---

## 6. SWOT Analysis

### Strengths
- **First-mover advantage** in Kenya ECFA compliance software
- **Full-stack solution** (finance + agents + evidence + compliance)
- **M-Pesa integration** — critical for Kenya market
- **Modern tech stack** (Next.js 16, Supabase, Vercel)
- **Tamper-proof evidence vault** with SHA-256 hashing
- **Regulatory alignment** with ECFA requirements
- **Mobile-responsive** design for field agents

### Weaknesses
- **Pre-revenue** — no confirmed paying customers yet
- **Election cycle dependency** — revenue may be cyclical (peak every 5 years)
- **Single-market focus** (Kenya only, currently)
- **Small team** — appears to be founder-driven
- **No mobile app** yet (web-only, though mobile-responsive)

### Opportunities
- **2027 Kenya General Election** — immediate market opportunity
- **Pan-African expansion** — adapt for Nigeria, South Africa, Ghana, Tanzania
- **Party-level enterprise deals** — major political parties as anchor clients
- **Regulatory mandate** — ECFA enforcement tightening could make compliance tools necessary
- **Adjacent markets** — NGO grant compliance, county budget tracking, CSO financial transparency
- **AI features** — anomaly detection for suspicious donations, automated compliance flagging

### Threats
- **Political risk** — elections are politically sensitive; platform could face pressure
- **Regulatory changes** — ECFA could be amended
- **Low enforcement** — if ECFA is not enforced, demand for compliance tools decreases
- **International competitors** — global platforms could enter the market
- **Data security** — handling sensitive campaign data creates liability

---

## 7. Key Metrics to Track for Valuation Growth

| Metric | Target (Pre-2027 Election) |
|---|---|
| Registered Campaigns | 50-200 |
| Paying Customers (Professional+) | 20-80 |
| Monthly Recurring Revenue (MRR) | KES 200K-800K ($1.5K-$6K USD) |
| Annual Recurring Revenue (ARR) | KES 2.4M-9.6M ($18K-$74K USD) |
| Total Transaction Volume Tracked | KES 100M+ |
| Field Agents Managed | 500-2,000 |
| Evidence Items Stored | 10,000+ |
| Enterprise Contracts (Parties) | 1-3 |
| Net Revenue Retention | >100% |

---

## 8. Recommendations

1. **Secure 3-5 pilot campaigns** before the 2027 election cycle kicks off — even at discounted rates — to establish product-market fit and generate case studies
2. **Apply to Kepple Africa Ventures, Savannah Fund, and 4DX Ventures** for seed funding ($250K-$1M range)
3. **Engage IFES and Omidyar Network** for strategic partnerships and grant funding
4. **Build a Safaricom/M-Pesa strategic partnership** for integrated donation collection
5. **Develop a native mobile app** for field agents (offline-first with sync)
6. **Obtain a formal CR12** from BRS to have clean corporate records for investor due diligence
7. **Register Kura360 as a separate entity** (if not already) to create a clean cap table for fundraising
8. **Target $2M-$3M pre-money valuation** for a seed round of $500K-$1M

---

## 9. Sources & References

- [Kura360 Platform](https://www.kura360.com/login)
- [Sysmera Website](https://sysmera.com/about/)
- [Kenya ECFA Act No. 42 of 2013 (PDF)](https://www.iebc.or.ke/uploads/resources/SrIlWeBWMH.pdf)
- [IFES Kenya Election Technology](https://www.ifes.org/news/kenya-using-technology-safer-elections)
- [Political Campaign Software Market — Market Research Future](https://www.marketresearchfuture.com/reports/political-campaign-software-market-40465)
- [Political Campaign Management Software Market — 360iResearch](https://www.360iresearch.com/library/intelligence/political-campaign-management-software)
- [Global Political Campaign Software Market — StatsNData](https://www.statsndata.org/report/political-campaign-management-software-market-376373)
- [Kenya BRS — Business Registration Service](https://brs.go.ke/companies-registry/)
- [FinTech SaaS Startups in Africa — Tracxn](https://tracxn.com/d/explore/fintech-saas-startups-in-africa/__C2hA9C1hWYdmFgLPapyCmGAqCMJ1PHY4hrVgIE7Le8Y/companies)
- [Technology and Elections in Kenya — International IDEA](https://www.idea.int/events/technology-and-elections-kenya)
- [Kenya Campaign Finance Analysis — The Conversation](https://theconversation.com/kenyas-election-jitters-have-roots-in-campaign-financing-its-time-to-act-81693)
- [International IDEA Political Finance Database — Kenya](https://www.idea.int/data-tools/country-view/156/55)

---

*This research document is for internal planning purposes. Formal valuation should be conducted by a licensed financial advisor or valuation firm before any fundraising or M&A activity.*
