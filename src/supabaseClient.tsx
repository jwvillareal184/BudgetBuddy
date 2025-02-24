import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qkltgidpqrwpxflqsosi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbHRnaWRwcXJ3cHhmbHFzb3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMjExNjgsImV4cCI6MjA1Mzc5NzE2OH0.HDSry0IPJZwKCn3-QJYYJUs-NPVQJ0y6zb3um9Q_MJk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
