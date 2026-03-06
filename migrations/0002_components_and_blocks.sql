CREATE TABLE IF NOT EXISTS components (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  template TEXT NOT NULL,
  fields_json TEXT NOT NULL,
  defaults_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS component_blocks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  locale TEXT NOT NULL,
  content_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
