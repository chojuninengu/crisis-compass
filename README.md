# CrisisCompass

A mental health case management platform for coordinators, powered by Supabase and Groq AI.

## Features

- **AI Risk Assessment** — Groq LLM assesses intake risk level (critical/high/moderate/stable) and generates recommended actions
- **Case Management** — Track cases with filtering, status management, and note history
- **AI Note Summarization** — Summarize case notes and extract risk flags with AI
- **Grant Report Generator** — AI-generated funder-ready reports in seconds
- **Resource Directory** — Community resource management with Supabase-backed persistence

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/chojuninengu/crisis-compass.git
cd crisis-compass
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=your-groq-api-key
```

- Get Supabase credentials at [supabase.com](https://supabase.com) → Project Settings → API
- Get Groq API key at [console.groq.com](https://console.groq.com)

### 3. Set Up Supabase Database

Run the following SQL in your Supabase **SQL Editor** (Database → SQL Editor → New query):

```sql
-- Table: cases
CREATE TABLE cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_code TEXT NOT NULL,
  presenting_issue TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'moderate', 'stable')),
  status TEXT NOT NULL CHECK (status IN ('active', 'follow-up', 'closed', 'new')) DEFAULT 'new',
  coordinator TEXT NOT NULL DEFAULT 'Unassigned',
  crisis_history BOOLEAN NOT NULL DEFAULT false,
  crisis_history_details TEXT,
  support_network TEXT CHECK (support_network IN ('none', 'limited', 'moderate', 'strong')),
  urgency_self_report INTEGER CHECK (urgency_self_report BETWEEN 1 AND 5),
  case_notes TEXT,
  risk_rationale TEXT,
  recommended_actions TEXT,
  follow_up_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: case_note_history
CREATE TABLE case_note_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  raw_notes TEXT NOT NULL,
  ai_summary TEXT,
  risk_flags TEXT,
  next_steps TEXT,
  suggested_follow_up TEXT,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: resources
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  contact TEXT,
  availability TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Enable Row Level Security (optional)

To allow anonymous access during development, run:

```sql
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON cases FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE case_note_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON case_note_history FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON resources FOR ALL USING (true) WITH CHECK (true);
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

## Vercel Deployment

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY`
4. Deploy — Vercel auto-detects Vite and builds correctly

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq (llama-3.3-70b-versatile)
- **Charts**: Recharts
- **Routing**: React Router v6
