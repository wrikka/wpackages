-- Create extensions table
CREATE TABLE IF NOT EXISTS extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL,
    repository TEXT NOT NULL,
    description VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,
    download_url TEXT NOT NULL,
    downloads BIGINT DEFAULT 0,
    rating FLOAT DEFAULT 0.0,
    author_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for search
CREATE INDEX IF NOT EXISTS idx_extensions_name ON extensions(name);
CREATE INDEX IF NOT EXISTS idx_extensions_author ON extensions(author);
CREATE INDEX IF NOT EXISTS idx_extensions_category ON extensions(category);
CREATE INDEX IF NOT EXISTS idx_extensions_downloads ON extensions(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_extensions_rating ON extensions(rating DESC);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_extensions_search ON extensions USING gin(
    to_tsvector('english', name || ' ' || description || ' ' || author)
);
