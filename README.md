# 💎 BRO SQUAD
### Private Shared Room Expense Management & Debt Settlement Web Application

A production-ready, mobile-first web application engineered for four roommates (**Asaduzzaman**, **Abdullah**, **Md Milon**, and **Md Monir**) to track shared living expenses, calculate individual contributions, split costs dynamically among selected participants, and automatically resolve who owes whom with minimal transactions.

---

## 🌟 Key Highlights

- **Light Navy Blue Glassmorphism Interface**: Apple-style frosted glass cards, backdrop blur, translucent borders, soft navy gradients, and rounded corners (20px–24px).
- **Mobile-First Experience**: Fixed bottom navigation bar with a floating center `Add (+)` action button, touch-friendly inputs, and full responsive desktop support.
- **Zero-Loss Financial Mathematics**: Financial calculations handled in integer **Paisa** (1 BDT = 100 Paisa). Automatic remainder distribution guarantees that the sum of allocated shares strictly equals the total expense to the exact paisa.
- **Dynamic Participant Splitting**: Expenses can be split among any combination of roommates (2, 3, or all 4 members). Never assumes all members participate in every expense.
- **Greedy Min-Cash-Flow Debt Settlement**: Intelligently calculates optimal payment paths between debtors and creditors to settle all room balances with the minimum number of transactions.
- **Separate Settlement Module**: Direct member-to-member debt clearances (Cash, bKash, Nagad, Bank Transfer) update balances immediately without polluting expense ledgers.
- **Production Cloud Architecture**: Supabase PostgreSQL database with Row Level Security (RLS), persistent authentication sessions, and resilient local storage fallback for offline/instant testing.
- **Installable Progressive Web App (PWA)**: Includes `manifest.json`, custom app icon, and Service Worker caching for home-screen installation on Android and iOS.

---

## 👥 The Four Registered Roommates

| # | Roommate Name | Email | Default Password | Phone |
|---|---------------|-------|------------------|-------|
| 1 | **Asaduzzaman** | `asaduzzaman@brosquad.local` | `brosquad123` | +880 1711-000001 |
| 2 | **Abdullah** | `abdullah@brosquad.local` | `brosquad123` | +880 1811-000002 |
| 3 | **Md Milon** | `milon@brosquad.local` | `brosquad123` | +880 1911-000003 |
| 4 | **Md Monir** | `monir@brosquad.local` | `brosquad123` | +880 1611-000004 |

> 💡 **Quick Switcher**: The app includes a 1-tap profile switcher in the top navigation bar and on the login page so you can instantly view the application from any roommate's perspective.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom glassmorphism utilities & navy palette
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (persistent session cookies & local tokens)
- **Deployment**: Vercel (Frontend) & Supabase (Database/Auth)

---

## 🧮 Mathematical & Financial Engine

### 1. Integer Paisa Conversion
$$\text{paisa} = \text{round}(\text{BDT} \times 100)$$

Floating-point inaccuracies (e.g. `0.1 + 0.2 = 0.30000000000000004`) are completely eliminated.

### 2. Fair Remainder Allocation
When dividing $P$ paisa among $N$ participants:
$$\text{baseShare} = \lfloor P / N \rfloor$$
$$\text{remainder} = P \pmod N$$
The first `remainder` participants receive `baseShare + 1` paisa; the rest receive `baseShare`.
$$\sum_{i=1}^N \text{share}_i \equiv P$$

### 3. Net Balance Formula
$$\text{Net Balance} = (\text{Total Paid} - \text{Total Share}) + \text{Settlements Sent} - \text{Settlements Received}$$
- **Positive (+)**: The roommate should receive money (creditor).
- **Negative (-)**: The roommate owes money (debtor).
- **Zero (৳0)**: The roommate is fully settled.

---

## 📁 Project Structure

```
bro-squad/
├── public/
│   ├── icon.svg             # BRO SQUAD high-res vector icon
│   ├── manifest.json        # PWA configuration
│   └── sw.js                # Service Worker
├── supabase/
│   ├── schema.sql           # Complete PostgreSQL schema with RLS policies
│   ├── functions.sql        # Stored procedures & balance computation functions
│   └── seed.sql             # Room & 4 roommate seed records
├── tests/
│   └── test-suite.mjs       # Automated mathematical & splitting test suite
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with Header and Mobile BottomNav
│   │   ├── page.tsx         # Dashboard with summary cards & recent activity
│   │   ├── globals.css      # Light navy glassmorphism stylesheet
│   │   ├── login/           # Authentication page
│   │   ├── expenses/        # Expense History, Search, Filters
│   │   ├── expenses/new/    # Add Expense form
│   │   ├── expenses/[id]/   # Edit Expense form
│   │   ├── balance/         # Balances & Settlement calculator
│   │   ├── members/         # Roommate profile cards & personal histories
│   │   ├── reports/         # Visual charts (Recharts) & CSV export
│   │   └── settings/        # Account & Room settings
│   ├── components/
│   │   ├── UI/              # GlassCard, GlassButton, GlassBadge, Modal, Skeleton
│   │   ├── Navigation/      # Header, BottomNav
│   │   ├── Dashboard/       # SummaryCards, QuickActions, RecentExpenses
│   │   ├── Expenses/        # ExpenseForm, ExpenseCard, ExpenseFilters
│   │   ├── Settlement/      # SuggestedSettlements, RecordSettlementModal
│   │   └── Analytics/       # ExpenseCharts
│   ├── context/
│   │   ├── AuthContext.tsx  # User state & persistent session management
│   │   ├── RoomContext.tsx  # Room data, balances, & reactive actions
│   │   └── ToastContext.tsx # Floating notification alerts
│   └── lib/
│       ├── calculations.ts  # Integer paisa math & greedy settlement algorithm
│       ├── formatters.ts    # BDT currency, relative dates, & avatars
│       ├── storage.ts       # Unified Supabase + local resilient data layer
│       ├── types.ts         # TypeScript interfaces
│       └── supabase/        # Supabase client initialization
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Run Locally

```bash
# Navigate to the project directory
cd "C:\Users\YOU TECH BD\.gemini\antigravity\scratch\bro-squad"

# Install dependencies (already completed)
npm install

# Run the test suite to verify math and split integrity
npm test

# Start local Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Connecting Supabase (Production Cloud Setup)

1. Create a free account at [supabase.com](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open and run the provided SQL scripts in sequence:
   - `supabase/schema.sql` (Creates all tables, constraints, indexes, and RLS policies)
   - `supabase/functions.sql` (Creates user trigger functions and balance calculation RPCs)
   - `supabase/seed.sql` (Creates BRO SQUAD room and links the 4 roommates)
4. Retrieve your **Project URL** and **Anon Key** from `Project Settings > API`.
5. Update `.env.local` or configure your hosting environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   NEXT_PUBLIC_DEFAULT_ROOM_NAME="BRO SQUAD"
   ```

---

## 🚢 Free Deployment to Vercel

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: complete BRO SQUAD application"
   git remote add origin https://github.com/your-username/bro-squad.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `bro-squad` repository.
4. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DEFAULT_ROOM_NAME`
5. Click **Deploy**. Your application will be live in seconds with HTTPS and instant PWA support!

---

## 🧪 Verification & Test Results

Run the built-in test suite anytime:
```bash
npm test
```

All 6 test suites pass with 100% accuracy:
- ✅ 1,000 randomized cases verifying zero-loss integer paisa allocation.
- ✅ Specification Example 1: 2-person split (Breakfast ৳200).
- ✅ Specification Example 2: 3-person split (Dinner ৳600).
- ✅ Specification Example 3: 4-person split (Snacks ৳400).
- ✅ Combined cumulative balance & greedy min-cash-flow debt settlement.
- ✅ Direct settlement payment recording and debt clearance.

---

Designed with ❤️ for the **BRO SQUAD** roommates.
