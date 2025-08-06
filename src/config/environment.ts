// Environment configuration
export const environment = {
  production: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://bligmczwtccomnkoxurf.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaWdtY3p3dGNjb21ua294dXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ2MDAsImV4cCI6MjA2OTU4MDYwMH0.w-SRMQpumswoGT8Zt45-9tJHogPrtz93uVxm1izq6pk'
}
