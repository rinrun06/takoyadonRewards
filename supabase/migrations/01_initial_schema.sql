-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    total_points INTEGER DEFAULT 0,
    phone_number VARCHAR(50),
    date_of_birth DATE,
    role VARCHAR(50) DEFAULT 'customer'
);

-- Franchise table
CREATE TABLE franchises (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) REFERENCES users(id)
);

-- Branches table
CREATE TABLE branches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    phone_number VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    franchise_id VARCHAR(255) REFERENCES franchises(id)
);

-- Staff table
CREATE TABLE staff (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    branch_id VARCHAR(255) REFERENCES branches(id),
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Rewards table
CREATE TABLE rewards (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    points_cost INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    expiration_date DATE
);

-- Campaigns table
CREATE TABLE campaigns (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    target_franchises JSONB DEFAULT '[]'
);

-- Point Transactions table
CREATE TABLE point_transactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    points INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    reason TEXT,
    related_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward Redemptions table
CREATE TABLE reward_redemptions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    reward_id VARCHAR(255) REFERENCES rewards(id),
    branch_id VARCHAR(255) REFERENCES branches(id),
    points_spent INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visits table
CREATE TABLE visits (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    branch_id VARCHAR(255) REFERENCES branches(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    points_earned INTEGER DEFAULT 0
);

-- QR Codes table
CREATE TABLE qr_codes (
    id VARCHAR(255) PRIMARY KEY,
    branch_id VARCHAR(255) REFERENCES branches(id),
    code VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    related_id VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    branch_id VARCHAR(255) REFERENCES branches(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Approvals table
CREATE TABLE campaign_approvals (
    id VARCHAR(255) PRIMARY KEY,
    campaign_id VARCHAR(255) REFERENCES campaigns(id),
    franchise_id VARCHAR(255) REFERENCES franchises(id),
    status VARCHAR(50) DEFAULT 'pending',
    requested_by VARCHAR(255) REFERENCES users(id),
    request_date TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Comments table
CREATE TABLE campaign_comments (
    id VARCHAR(255) PRIMARY KEY,
    campaign_id VARCHAR(255) REFERENCES campaigns(id),
    user_id VARCHAR(255) REFERENCES users(id),
    comment_type VARCHAR(50) DEFAULT 'comment',
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points Rules table
CREATE TABLE points_rules (
    id VARCHAR(255) PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    points_value INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Add performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_branches_franchise ON branches(franchise_id);
CREATE INDEX idx_staff_user_branch ON staff(user_id, branch_id);
CREATE INDEX idx_point_transactions_user_date ON point_transactions(user_id, created_at);
CREATE INDEX idx_visits_user_branch ON visits(user_id, branch_id);
CREATE INDEX idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_qr_codes_active ON qr_codes(code) WHERE is_active = true;

-- RLS POLICIES for qrcodes
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow staff to view QR codes for their branch"
ON public.qr_codes FOR SELECT
USING (
    (SELECT branch_id FROM public.staff WHERE user_id = auth.uid()::text AND branch_id = public.qr_codes.branch_id) IS NOT NULL
);

CREATE POLICY "Allow staff to create QR codes for their branch"
ON public.qr_codes FOR INSERT
WITH CHECK (
    (SELECT branch_id FROM public.staff WHERE user_id = auth.uid()::text AND branch_id = public.qr_codes.branch_id) IS NOT NULL
);

CREATE POLICY "Allow admins to manage all QR codes"
ON public.qr_codes FOR ALL
USING (
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin')
);
