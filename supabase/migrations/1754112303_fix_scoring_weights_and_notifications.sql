-- Migration: fix_scoring_weights_and_notifications
-- Created at: 1754112303

-- Create the scoring_weights table with correct values
CREATE TABLE IF NOT EXISTS scoring_weights (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    weight DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert correct scoring weights that sum to 1.0
INSERT INTO scoring_weights (category, weight) VALUES
('market_demand', 0.25),
('technical_feasibility', 0.20),
('competition_level', 0.15),
('innovation_factor', 0.15),
('monetization_potential', 0.15),
('social_impact', 0.10)
ON CONFLICT DO NOTHING;

-- Create system_notifications table for the bell notifications
CREATE TABLE IF NOT EXISTS system_notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Clear the old notifications table data and add proper notifications
DELETE FROM notifications;

-- Create startup_ideas table if missing
CREATE TABLE IF NOT EXISTS startup_ideas (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    market_size VARCHAR(100),
    difficulty_level VARCHAR(50),
    innovation_score INTEGER,
    market_demand_score INTEGER,
    technical_feasibility_score INTEGER,
    overall_score DECIMAL(3,1),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    is_hidden BOOLEAN DEFAULT FALSE
);;