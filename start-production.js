#!/usr/bin/env node

const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('path')

const env = { ...process.env }

async function exec(command, options = {}) {
  const child = spawn(command, { shell: true, stdio: 'inherit', env, ...options })
  return new Promise((resolve, reject) => {
    child.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} failed with exit code ${code}`))
      }
    })
  })
}

async function main() {
  try {
    console.log('🚀 Starting eKaty production server...')
    
    // Ensure data directory exists
    const dataDir = '/data'
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    // Check if database exists
    const dbPath = path.join(dataDir, 'ekaty.db')
    const dbExists = fs.existsSync(dbPath)
    
    if (!dbExists) {
      console.log('📊 Database not found, initializing...')
      
      // Push schema to database (creates tables)
      console.log('🔄 Creating database schema...')
      await exec('npx prisma db push --accept-data-loss --skip-generate')
      
      // Seed the database
      console.log('🌱 Seeding database with restaurant data...')
      try {
        // Try Google Places first
        await exec('npx ts-node --compiler-options \'{"module":"CommonJS"}\' prisma/seed-google-places.ts')
      } catch (error) {
        console.log('⚠️ Google Places import failed, using static data...')
        // Fallback to static data
        await exec('npx ts-node --compiler-options \'{"module":"CommonJS"}\' prisma/seed-katy.ts')
      }
      
      console.log('✅ Database initialized and seeded successfully!')
    } else {
      console.log('📊 Database exists, syncing schema...')
      // Use db push to sync schema changes without losing data
      await exec('npx prisma db push --accept-data-loss --skip-generate')
      console.log('✅ Schema synchronized!')
    }
    
    // Start the Next.js server
    console.log('🌐 Starting Next.js server...')
    await exec('npm run start')
    
  } catch (error) {
    console.error('❌ Startup failed:', error)
    process.exit(1)
  }
}

main()

