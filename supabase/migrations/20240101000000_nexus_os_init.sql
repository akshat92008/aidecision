-- MODULE 1: Financials & Runway
CREATE TABLE IF NOT EXISTS financials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    current_cash NUMERIC,
    monthly_revenue NUMERIC,
    monthly_burn NUMERIC,
    runway_months NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MODULE 5: Decisions (Audit)
CREATE TABLE IF NOT EXISTS decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    expected_roi NUMERIC,
    status TEXT DEFAULT 'active', -- active, killed, succeeded
    actual_outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MODULE 2: Execution (Tasks)
CREATE TABLE IF NOT EXISTS execution_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    decision_id UUID REFERENCES decisions(id),
    title TEXT NOT NULL,
    kpi_target TEXT,
    is_drifting BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending'
);

-- MODULE 3: Growth Experiments
CREATE TABLE IF NOT EXISTS experiments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    hypothesis TEXT NOT NULL,
    estimated_cac NUMERIC,
    status TEXT DEFAULT 'testing'
);

-- MODULE 4: Unicorn Agent Insights
CREATE TABLE IF NOT EXISTS agent_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    category TEXT, -- competitor, market, trend
    structured_data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
