import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tqcrsrnpyvpeaimoeskp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxY3Jzcm5weXZwZWFpbW9lc2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUxMzA0MDAsImV4cCI6MjA0MDcwNjQwMH0.mock_key_replace_with_your_actual_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
