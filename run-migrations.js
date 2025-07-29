import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = 'https://xbgwawselcaoqhczoyqv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.log('Please set your Supabase service role key:')
  console.log('export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration(filename) {
  try {
    console.log(`📄 Running migration: ${filename}`)
    
    const migrationPath = path.join('migrations', filename)
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`  Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error)
          console.error(`Statement: ${statement}`)
          return false
        }
      }
    }
    
    console.log(`✅ Migration ${filename} completed successfully`)
    return true
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error)
    return false
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting database migrations...')
  
  const migrations = [
    '001_add_critical_messages.sql',
    '002_seed_critical_message_types.sql', 
    '003_add_admin_notification_settings.sql'
  ]
  
  for (const migration of migrations) {
    const success = await runMigration(migration)
    if (!success) {
      console.error(`❌ Migration ${migration} failed. Stopping.`)
      process.exit(1)
    }
  }
  
  console.log('🎉 All migrations completed successfully!')
}

runAllMigrations().catch(console.error)