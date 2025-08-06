CREATE TABLE system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    severity TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_idea_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);