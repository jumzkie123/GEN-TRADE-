import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uesauvucnmqtupwytjpm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlc2F1dnVjbm1xdHVwd3l0anBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzY2MTUsImV4cCI6MjA4ODI1MjYxNX0.qTHLQBvjD7N31RSz0lsknxg3MlL3bGxS91OjuKWWBcQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
