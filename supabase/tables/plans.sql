CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
                    price_id VARCHAR(255) UNIQUE NOT NULL,
                    plan_type VARCHAR(50) NOT NULL,
                    price INTEGER NOT NULL,
                    monthly_limit INTEGER NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);