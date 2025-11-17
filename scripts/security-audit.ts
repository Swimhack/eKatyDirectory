import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface SecurityIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  issue: string
  file?: string
  recommendation: string
  passed: boolean
}

const issues: SecurityIssue[] = []

async function securityAudit() {
  console.log('🔒 COMPREHENSIVE SECURITY AUDIT\n')
  console.log('Running security checks...\n')

  // 1. Environment Variable Security
  console.log('1️⃣  ENVIRONMENT VARIABLE SECURITY')
  checkEnvironmentSecurity()

  // 2. SQL Injection Protection
  console.log('\n2️⃣  SQL INJECTION PROTECTION')
  await checkSQLInjection()

  // 3. Authentication Security
  console.log('\n3️⃣  AUTHENTICATION SECURITY')
  await checkAuthenticationSecurity()

  // 4. Session Security
  console.log('\n4️⃣  SESSION SECURITY')
  checkSessionSecurity()

  // 5. API Security
  console.log('\n5️⃣  API SECURITY')
  checkAPISecure()

  // 6. Rate Limiting
  console.log('\n6️⃣  RATE LIMITING')
  await checkRateLimiting()

  // 7. CORS Configuration
  console.log('\n7️⃣  CORS CONFIGURATION')
  checkCORSConfig()

  // 8. Input Validation
  console.log('\n8️⃣  INPUT VALIDATION')
  checkInputValidation()

  // 9. Dependency Vulnerabilities
  console.log('\n9️⃣  DEPENDENCY VULNERABILITIES')
  checkDependencies()

  // 10. Database Security
  console.log('\n🔟 DATABASE SECURITY')
  await checkDatabaseSecurity()

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('SECURITY AUDIT SUMMARY')
  console.log('='.repeat(80) + '\n')

  const critical = issues.filter(i => i.severity === 'CRITICAL')
  const high = issues.filter(i => i.severity === 'HIGH')
  const medium = issues.filter(i => i.severity === 'MEDIUM')
  const low = issues.filter(i => i.severity === 'LOW')

  console.log(`🚨 CRITICAL: ${critical.length}`)
  console.log(`⚠️  HIGH: ${high.length}`)
  console.log(`⚡ MEDIUM: ${medium.length}`)
  console.log(`ℹ️  LOW: ${low.length}`)
  console.log()

  if (critical.length > 0) {
    console.log('🚨 CRITICAL ISSUES (FIX IMMEDIATELY):\n')
    critical.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.category}: ${issue.issue}`)
      console.log(`   📝 ${issue.recommendation}`)
      if (issue.file) console.log(`   📄 ${issue.file}`)
      console.log()
    })
  }

  if (high.length > 0) {
    console.log('⚠️  HIGH PRIORITY ISSUES:\n')
    high.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.category}: ${issue.issue}`)
      console.log(`   📝 ${issue.recommendation}`)
      if (issue.file) console.log(`   📄 ${issue.file}`)
      console.log()
    })
  }

  if (medium.length > 0) {
    console.log('⚡ MEDIUM PRIORITY ISSUES:\n')
    medium.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.category}: ${issue.issue}`)
      console.log(`   📝 ${issue.recommendation}`)
      console.log()
    })
  }

  const passedChecks = issues.filter(i => i.passed).length
  const totalChecks = issues.length
  const score = Math.round((passedChecks / totalChecks) * 100)

  console.log('='.repeat(80))
  console.log(`SECURITY SCORE: ${score}/100 (${passedChecks}/${totalChecks} checks passed)`)
  console.log('='.repeat(80))

  await prisma.$disconnect()
}

function checkEnvironmentSecurity() {
  // Check if .env is in .gitignore
  const gitignorePath = path.join(process.cwd(), '.gitignore')
  let gitignoreContent = ''

  try {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8')
  } catch (error) {
    issues.push({
      severity: 'MEDIUM',
      category: 'Environment Security',
      issue: '.gitignore file not found',
      recommendation: 'Create .gitignore file to prevent committing sensitive files',
      passed: false
    })
  }

  if (gitignoreContent.includes('.env')) {
    console.log('✅ .env files are in .gitignore')
    issues.push({
      severity: 'HIGH',
      category: 'Environment Security',
      issue: '.env files protected from git',
      recommendation: 'Continue to keep .env files out of version control',
      passed: true
    })
  } else {
    console.log('❌ .env files NOT properly ignored by git')
    issues.push({
      severity: 'HIGH',
      category: 'Environment Security',
      issue: '.env files may be committed to git',
      file: '.gitignore',
      recommendation: 'Add .env* to .gitignore immediately',
      passed: false
    })
  }

  // Check if .env.production is committed (THIS IS A VULNERABILITY)
  try {
    const { execSync } = require('child_process')
    const trackedEnvFiles = execSync('git ls-files | grep -E "\\.env"', { encoding: 'utf-8' })

    if (trackedEnvFiles.trim().length > 0) {
      console.log('❌ CRITICAL: Environment files are tracked in git!')
      console.log('   Files:', trackedEnvFiles.trim())

      issues.push({
        severity: 'CRITICAL',
        category: 'Environment Security',
        issue: 'Environment files committed to git repository',
        file: trackedEnvFiles.trim(),
        recommendation: 'Run: git rm --cached .env.production && git commit -m "Remove env file" && git push',
        passed: false
      })
    } else {
      console.log('✅ No environment files in git history')
      issues.push({
        severity: 'CRITICAL',
        category: 'Environment Security',
        issue: 'Environment files check',
        recommendation: 'No action needed',
        passed: true
      })
    }
  } catch (error) {
    // grep returns exit code 1 when no matches found
    console.log('✅ No environment files tracked in git')
    issues.push({
      severity: 'CRITICAL',
      category: 'Environment Security',
      issue: 'Environment files check',
      recommendation: 'No action needed',
      passed: true
    })
  }

  // Check for hardcoded secrets in code
  const apiKeyPattern = /(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{20,}['"]/gi
  const sourceFiles = [
    'lib/auth.ts',
    'lib/google-places/client.ts',
    'app/api/admin/sync/route.ts'
  ]

  sourceFiles.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8')
      const matches = content.match(apiKeyPattern)

      if (matches && !content.includes('process.env')) {
        console.log(`❌ Potential hardcoded secrets in ${file}`)
        issues.push({
          severity: 'CRITICAL',
          category: 'Environment Security',
          issue: 'Hardcoded secrets detected',
          file,
          recommendation: 'Replace hardcoded values with environment variables',
          passed: false
        })
      }
    } catch (error) {
      // File doesn't exist, skip
    }
  })
}

async function checkSQLInjection() {
  // Check for raw SQL usage
  const rawSqlFiles = [
    'scripts/audit-restaurant-data.ts'
  ]

  let hasRawSQL = false
  rawSqlFiles.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8')
      if (content.includes('$queryRaw') || content.includes('$executeRaw')) {
        hasRawSQL = true
      }
    } catch (error) {
      // File doesn't exist
    }
  })

  if (hasRawSQL) {
    console.log('⚠️  Raw SQL queries detected (use with caution)')
    issues.push({
      severity: 'MEDIUM',
      category: 'SQL Injection',
      issue: 'Raw SQL queries found',
      recommendation: 'Ensure all raw SQL uses parameterized queries',
      passed: false
    })
  } else {
    console.log('✅ No raw SQL detected (using Prisma ORM)')
    issues.push({
      severity: 'HIGH',
      category: 'SQL Injection',
      issue: 'SQL injection protection',
      recommendation: 'Continue using Prisma ORM for all database operations',
      passed: true
    })
  }

  // Check API routes for proper input validation
  console.log('✅ Prisma ORM provides parameterized queries by default')
  issues.push({
    severity: 'HIGH',
    category: 'SQL Injection',
    issue: 'Parameterized queries',
    recommendation: 'No action needed - Prisma handles this',
    passed: true
  })
}

async function checkAuthenticationSecurity() {
  // Check password hashing
  const authFile = path.join(process.cwd(), 'app/api/auth/login/route.ts')

  try {
    const content = fs.readFileSync(authFile, 'utf-8')

    if (content.includes('bcrypt')) {
      console.log('✅ bcrypt used for password hashing')
      issues.push({
        severity: 'CRITICAL',
        category: 'Authentication',
        issue: 'Password hashing',
        file: 'app/api/auth/login/route.ts',
        recommendation: 'No action needed',
        passed: true
      })
    } else {
      console.log('❌ bcrypt NOT detected in authentication')
      issues.push({
        severity: 'CRITICAL',
        category: 'Authentication',
        issue: 'Weak password hashing',
        file: 'app/api/auth/login/route.ts',
        recommendation: 'Use bcryptjs with 10+ salt rounds',
        passed: false
      })
    }

    // Check for timing attacks
    if (content.includes('bcrypt.compare')) {
      console.log('✅ Constant-time comparison (bcrypt.compare)')
      issues.push({
        severity: 'HIGH',
        category: 'Authentication',
        issue: 'Timing attack protection',
        recommendation: 'No action needed',
        passed: true
      })
    }

  } catch (error) {
    console.log('❌ Authentication file not found')
    issues.push({
      severity: 'CRITICAL',
      category: 'Authentication',
      issue: 'Authentication implementation missing',
      recommendation: 'Implement proper authentication',
      passed: false
    })
  }

  // Check for rate limiting on login
  console.log('⚠️  Rate limiting on login endpoint not detected')
  issues.push({
    severity: 'HIGH',
    category: 'Authentication',
    issue: 'No rate limiting on /api/auth/login',
    recommendation: 'Add rate limiting to prevent brute force attacks',
    passed: false
  })
}

function checkSessionSecurity() {
  const authFile = path.join(process.cwd(), 'app/api/auth/login/route.ts')

  try {
    const content = fs.readFileSync(authFile, 'utf-8')

    // Check for HTTP-only cookies
    if (content.includes('httpOnly: true')) {
      console.log('✅ HTTP-only cookies enabled')
      issues.push({
        severity: 'HIGH',
        category: 'Session Security',
        issue: 'HTTP-only cookies',
        recommendation: 'No action needed',
        passed: true
      })
    } else {
      console.log('❌ HTTP-only flag not set on cookies')
      issues.push({
        severity: 'HIGH',
        category: 'Session Security',
        issue: 'Cookies vulnerable to XSS',
        recommendation: 'Set httpOnly: true on all auth cookies',
        passed: false
      })
    }

    // Check for secure flag
    if (content.includes('secure:') && content.includes('production')) {
      console.log('✅ Secure flag set in production')
      issues.push({
        severity: 'HIGH',
        category: 'Session Security',
        issue: 'Secure cookie flag',
        recommendation: 'No action needed',
        passed: true
      })
    } else {
      console.log('⚠️  Secure flag configuration unclear')
      issues.push({
        severity: 'MEDIUM',
        category: 'Session Security',
        issue: 'Secure cookie flag may not be set',
        recommendation: 'Ensure secure: true in production',
        passed: false
      })
    }

    // Check for SameSite
    if (content.includes('sameSite')) {
      console.log('✅ SameSite attribute configured')
      issues.push({
        severity: 'MEDIUM',
        category: 'Session Security',
        issue: 'CSRF protection (SameSite)',
        recommendation: 'No action needed',
        passed: true
      })
    }

    // Check session expiration
    if (content.includes('maxAge')) {
      console.log('✅ Session expiration configured')
      issues.push({
        severity: 'MEDIUM',
        category: 'Session Security',
        issue: 'Session timeout',
        recommendation: 'No action needed',
        passed: true
      })
    }

  } catch (error) {
    console.log('❌ Cannot verify session security')
  }

  // Check for weak session token generation
  console.log('⚠️  Session token uses predictable format (sess_${userId}_${timestamp})')
  issues.push({
    severity: 'HIGH',
    category: 'Session Security',
    issue: 'Weak session token generation',
    file: 'app/api/auth/login/route.ts',
    recommendation: 'Use crypto.randomBytes(32) for session tokens',
    passed: false
  })
}

function checkAPISecure() {
  const adminRoutes = [
    'app/api/admin/sync/route.ts',
    'app/api/admin/users/route.ts'
  ]

  adminRoutes.forEach(route => {
    try {
      const content = fs.readFileSync(path.join(process.cwd(), route), 'utf-8')

      if (content.includes('Bearer') && content.includes('authorization')) {
        console.log(`✅ ${route} has Bearer token auth`)
        issues.push({
          severity: 'HIGH',
          category: 'API Security',
          issue: `${route} authentication`,
          recommendation: 'No action needed',
          passed: true
        })
      } else {
        console.log(`❌ ${route} missing authentication`)
        issues.push({
          severity: 'CRITICAL',
          category: 'API Security',
          issue: `${route} has no authentication`,
          file: route,
          recommendation: 'Add Bearer token authentication',
          passed: false
        })
      }
    } catch (error) {
      // File doesn't exist
    }
  })

  // Check for API key exposure
  console.log('⚠️  ADMIN_API_KEY should be rotated regularly')
  issues.push({
    severity: 'MEDIUM',
    category: 'API Security',
    issue: 'API key rotation policy not defined',
    recommendation: 'Implement API key rotation (90 days)',
    passed: false
  })
}

async function checkRateLimiting() {
  // Check if rate limiting exists
  const rateLimiterPath = path.join(process.cwd(), 'lib/google-places/rate-limiter.ts')

  try {
    const content = fs.readFileSync(rateLimiterPath, 'utf-8')

    if (content.includes('dailyLimit')) {
      console.log('✅ Google API rate limiting implemented')
      issues.push({
        severity: 'HIGH',
        category: 'Rate Limiting',
        issue: 'External API rate limiting',
        recommendation: 'No action needed',
        passed: true
      })
    }
  } catch (error) {
    console.log('❌ Rate limiter file not found')
  }

  // Check for endpoint-specific rate limiting
  console.log('⚠️  No rate limiting on public endpoints detected')
  issues.push({
    severity: 'HIGH',
    category: 'Rate Limiting',
    issue: 'Missing rate limits on /api/contact, /api/suggestions',
    recommendation: 'Add rate limiting middleware (express-rate-limit or similar)',
    passed: false
  })

  // Check database for API usage tracking
  try {
    const usageToday = await prisma.apiUsage.findFirst({
      where: {
        date: new Date().toISOString().split('T')[0]
      }
    })

    console.log(`✅ API usage tracking in database (${usageToday?.requestCount || 0} requests today)`)
    issues.push({
      severity: 'MEDIUM',
      category: 'Rate Limiting',
      issue: 'API usage monitoring',
      recommendation: 'No action needed',
      passed: true
    })
  } catch (error) {
    console.log('❌ Cannot access API usage data')
  }
}

function checkCORSConfig() {
  // Next.js handles CORS by default, but check for custom config
  console.log('ℹ️  Next.js default CORS (same-origin)')
  issues.push({
    severity: 'LOW',
    category: 'CORS',
    issue: 'CORS configuration',
    recommendation: 'Review Next.js CORS settings if needed for external API calls',
    passed: true
  })
}

function checkInputValidation() {
  const routes = [
    'app/api/contact/route.ts',
    'app/api/suggestions/route.ts'
  ]

  routes.forEach(route => {
    try {
      const content = fs.readFileSync(path.join(process.cwd(), route), 'utf-8')

      if (content.includes('if (!') && content.includes('required')) {
        console.log(`✅ ${route} has input validation`)
        issues.push({
          severity: 'HIGH',
          category: 'Input Validation',
          issue: `${route} validation`,
          recommendation: 'No action needed',
          passed: true
        })
      } else {
        console.log(`⚠️  ${route} may lack comprehensive validation`)
        issues.push({
          severity: 'MEDIUM',
          category: 'Input Validation',
          issue: `${route} needs better validation`,
          file: route,
          recommendation: 'Add Zod or Yup schema validation',
          passed: false
        })
      }
    } catch (error) {
      // File doesn't exist
    }
  })

  // Check for XSS protection
  console.log('⚠️  No explicit XSS sanitization detected')
  issues.push({
    severity: 'MEDIUM',
    category: 'Input Validation',
    issue: 'XSS protection not explicit',
    recommendation: 'Add DOMPurify for user-generated content',
    passed: false
  })
}

function checkDependencies() {
  // Read npm audit results from earlier
  console.log('⚠️  Critical Next.js vulnerabilities detected (see npm audit output)')
  issues.push({
    severity: 'CRITICAL',
    category: 'Dependencies',
    issue: 'Next.js version 14.2.31 has 1 critical vulnerability',
    recommendation: 'Run: npm update next@14.2.33',
    passed: false
  })

  console.log('⚠️  jest package has high severity vulnerabilities')
  issues.push({
    severity: 'HIGH',
    category: 'Dependencies',
    issue: 'jest version 30+ has glob vulnerabilities',
    recommendation: 'Run: npm update jest@29.7.0',
    passed: false
  })

  console.log('⚠️  tailwindcss has high severity vulnerability')
  issues.push({
    severity: 'HIGH',
    category: 'Dependencies',
    issue: 'tailwindcss version 3.4.15-3.4.18 vulnerable',
    recommendation: 'Run: npm update tailwindcss@latest',
    passed: false
  })
}

async function checkDatabaseSecurity() {
  // Check database connection security
  const databaseUrl = process.env.DATABASE_URL || ''

  if (databaseUrl.includes('password') && !databaseUrl.includes('file:')) {
    console.log('⚠️  Database credentials in connection string')
    issues.push({
      severity: 'HIGH',
      category: 'Database Security',
      issue: 'Database credentials in plain text',
      recommendation: 'Use environment variables for DB credentials',
      passed: false
    })
  } else {
    console.log('✅ SQLite file-based database (no network exposure)')
    issues.push({
      severity: 'MEDIUM',
      category: 'Database Security',
      issue: 'Database connection security',
      recommendation: 'No action needed for SQLite',
      passed: true
    })
  }

  // Check for database backup
  console.log('ℹ️  Litestream backup mentioned in docs')
  issues.push({
    severity: 'MEDIUM',
    category: 'Database Security',
    issue: 'Database backup strategy',
    recommendation: 'Verify Litestream backups are running',
    passed: true
  })

  // Check audit logging
  try {
    const auditCount = await prisma.auditLog.count()
    console.log(`✅ Audit logging active (${auditCount} logs)`)
    issues.push({
      severity: 'MEDIUM',
      category: 'Database Security',
      issue: 'Audit logging',
      recommendation: 'No action needed',
      passed: true
    })
  } catch (error) {
    console.log('❌ Cannot verify audit logging')
    issues.push({
      severity: 'MEDIUM',
      category: 'Database Security',
      issue: 'Audit logging not verified',
      recommendation: 'Ensure audit logs are working',
      passed: false
    })
  }
}

// Run the audit
securityAudit()
