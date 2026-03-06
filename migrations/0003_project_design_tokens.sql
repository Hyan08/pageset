ALTER TABLE projects
ADD COLUMN design_tokens_json TEXT NOT NULL DEFAULT '{}';
