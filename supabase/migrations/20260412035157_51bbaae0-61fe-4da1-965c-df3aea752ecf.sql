
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

DROP INDEX IF EXISTS idx_medicines_name_trgm;
CREATE INDEX idx_medicines_name_trgm ON public.medicines USING gin (name extensions.gin_trgm_ops);
