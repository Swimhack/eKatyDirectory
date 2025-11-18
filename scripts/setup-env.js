#!/usr/bin/env node

/**
 * Interactive Environment Setup Script
 *
 * Helps configure all environment variables for eKaty.com
 * Run: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset} `, resolve);
  });
}

// Environment variable configuration
const envConfig = {
  database: [
    {
      key: 'DATABASE_URL',
      description: 'PostgreSQL database connection URL',
      example: 'postgresql://user:password@localhost:5432/ekaty',
      required: true
    }
  ],
  stripe: [
    {
      key: 'STRIPE_SECRET_KEY',
      description: 'Stripe secret key (starts with sk_test_ or sk_live_)',
      example: 'sk_test_xxxxxxxxxxxxxxxxxxxxx',
      required: true
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      description: 'Stripe publishable key (starts with pk_test_ or pk_live_)',
      example: 'pk_test_xxxxxxxxxxxxxxxxxxxxx',
      required: true
    },
    {
      key: 'STRIPE_WEBHOOK_SECRET',
      description: 'Stripe webhook signing secret (starts with whsec_)',
      example: 'whsec_xxxxxxxxxxxxxxxxxxxxx',
      required: true
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY',
      description: 'Stripe Price ID for Basic Monthly plan',
      example: 'price_xxxxxxxxxxxxxxxxxxxxx',
      required: true
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL',
      description: 'Stripe Price ID for Basic Annual plan',
      example: 'price_xxxxxxxxxxxxxxxxxxxxx',
      required: false
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY',
      description: 'Stripe Price ID for Pro Monthly plan',
      example: 'price_xxxxxxxxxxxxxxxxxxxxx',
      required: true
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL',
      description: 'Stripe Price ID for Pro Annual plan',
      example: 'price_xxxxxxxxxxxxxxxxxxxxx',
      required: false
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY',
      description: 'Stripe Price ID for Premium Monthly plan',
      example: 'price_xxxxxxxxxxxxxxxxxxxxx',
      required: true
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL',
      description: 'Stripe Price ID for Premium Annual plan',
      example: 'price_xxxxxxxxxxxxxxxxxxxxx',
      required: false
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PRICE_OWNER',
      description: 'Stripe Price ID for Restaurant Owner claim ($10/mo)',
      example: 'price_xxxxxxxxxxxxxxxxxxxxx',
      required: false
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PRICE_FEATURED',
      description: 'Stripe Price ID for Featured claim ($99/mo)',
      example: 'price_xxxxxxxxxxxxxxxxxxxxx',
      required: false
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM',
      description: 'Stripe Price ID for Premium claim ($199/mo)',
      example: 'price_xxxxxxxxxxxxxxxxxxxxx',
      required: false
    }
  ],
  email: [
    {
      key: 'EMAIL_PROVIDER',
      description: 'Email service provider (sendgrid, resend, postmark, smtp)',
      example: 'sendgrid',
      default: 'sendgrid',
      required: false
    },
    {
      key: 'EMAIL_FROM',
      description: 'From email address for transactional emails',
      example: 'billing@ekaty.com',
      default: 'billing@ekaty.com',
      required: false
    },
    {
      key: 'SENDGRID_API_KEY',
      description: 'SendGrid API key (if using SendGrid)',
      example: 'SG.xxxxxxxxxxxxxxxxxxxxx',
      required: false
    },
    {
      key: 'RESEND_API_KEY',
      description: 'Resend API key (if using Resend)',
      example: 're_xxxxxxxxxxxxxxxxxxxxx',
      required: false
    }
  ],
  google: [
    {
      key: 'GOOGLE_PLACES_API_KEY',
      description: 'Google Places API key for restaurant data',
      example: 'AIzaxxxxxxxxxxxxxxxxxxxxx',
      required: false
    }
  ],
  other: [
    {
      key: 'NEXTAUTH_SECRET',
      description: 'Secret for NextAuth.js session encryption',
      example: 'Run: openssl rand -base64 32',
      required: true,
      generate: true
    },
    {
      key: 'NEXTAUTH_URL',
      description: 'Base URL of your application',
      example: 'http://localhost:3000',
      default: 'http://localhost:3000',
      required: true
    }
  ]
};

async function setupEnvironment() {
  log('\n╔════════════════════════════════════════════╗', 'bright');
  log('║   eKaty.com Environment Setup Wizard      ║', 'bright');
  log('╚════════════════════════════════════════════╝\n', 'bright');

  log('This wizard will help you configure all environment variables.\n', 'blue');
  log('Press Enter to skip optional fields.\n', 'yellow');

  const envValues = {};

  // Process each category
  for (const [category, variables] of Object.entries(envConfig)) {
    log(`\n${'='.repeat(50)}`, 'cyan');
    log(`${category.toUpperCase()} CONFIGURATION`, 'cyan');
    log('='.repeat(50) + '\n', 'cyan');

    for (const variable of variables) {
      const requiredText = variable.required ? '[REQUIRED]' : '[optional]';
      log(`\n${variable.key} ${requiredText}`, 'bright');
      log(`  ${variable.description}`, 'blue');
      if (variable.example) {
        log(`  Example: ${variable.example}`, 'yellow');
      }
      if (variable.default) {
        log(`  Default: ${variable.default}`, 'yellow');
      }

      let value = '';

      if (variable.generate) {
        const generateAnswer = await question('Generate automatically? (y/n): ');
        if (generateAnswer.toLowerCase() === 'y') {
          const crypto = require('crypto');
          value = crypto.randomBytes(32).toString('base64');
          log(`  Generated: ${value}`, 'green');
        }
      }

      if (!value) {
        value = await question('Enter value: ');
      }

      if (!value && variable.default) {
        value = variable.default;
        log(`  Using default: ${value}`, 'green');
      }

      if (!value && variable.required) {
        log('  ⚠️  This field is required!', 'yellow');
        value = await question('Enter value: ');
      }

      if (value) {
        envValues[variable.key] = value;
      }
    }
  }

  // Generate .env file
  log('\n' + '='.repeat(50), 'green');
  log('GENERATING .env FILE', 'green');
  log('='.repeat(50) + '\n', 'green');

  const envContent = generateEnvFile(envValues);
  const envPath = path.join(process.cwd(), '.env');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('\nCanceled. No changes made.', 'yellow');
      rl.close();
      return;
    }
  }

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  log(`✓ .env file created at ${envPath}`, 'green');

  // Also create .env.example
  const exampleContent = generateEnvExample();
  const examplePath = path.join(process.cwd(), '.env.example');
  fs.writeFileSync(examplePath, exampleContent);
  log(`✓ .env.example file created at ${examplePath}`, 'green');

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('SETUP COMPLETE!', 'green');
  log('='.repeat(50) + '\n', 'cyan');

  log('Next steps:', 'bright');
  log('1. Review your .env file', 'blue');
  log('2. Run database migrations: npx prisma migrate dev', 'blue');
  log('3. Start development server: npm run dev', 'blue');
  log('4. Run Stripe setup script: node scripts/stripe-setup.js', 'blue');

  if (!envValues.SENDGRID_API_KEY && !envValues.RESEND_API_KEY) {
    log('\n⚠️  Warning: No email provider configured. Email notifications will not work.', 'yellow');
  }

  if (!envValues.GOOGLE_PLACES_API_KEY) {
    log('\n⚠️  Warning: Google Places API not configured. Restaurant data updates will not work.', 'yellow');
  }

  log('\n✨ Ready to launch! Good luck with eKaty.com!\n', 'green');

  rl.close();
}

function generateEnvFile(values) {
  const lines = [
    '# eKaty.com Environment Configuration',
    `# Generated: ${new Date().toISOString()}`,
    '',
    '# Database',
    values.DATABASE_URL ? `DATABASE_URL="${values.DATABASE_URL}"` : '# DATABASE_URL="postgresql://user:password@localhost:5432/ekaty"',
    '',
    '# NextAuth',
    values.NEXTAUTH_SECRET ? `NEXTAUTH_SECRET="${values.NEXTAUTH_SECRET}"` : '# NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"',
    values.NEXTAUTH_URL ? `NEXTAUTH_URL="${values.NEXTAUTH_URL}"` : '# NEXTAUTH_URL="http://localhost:3000"',
    '',
    '# Stripe',
    values.STRIPE_SECRET_KEY ? `STRIPE_SECRET_KEY="${values.STRIPE_SECRET_KEY}"` : '# STRIPE_SECRET_KEY="sk_test_xxxxx"',
    values.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${values.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}"` : '# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"',
    values.STRIPE_WEBHOOK_SECRET ? `STRIPE_WEBHOOK_SECRET="${values.STRIPE_WEBHOOK_SECRET}"` : '# STRIPE_WEBHOOK_SECRET="whsec_xxxxx"',
    '',
    '# Stripe Price IDs - Subscriptions',
    values.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY ? `NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="${values.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY}"` : '# NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="price_xxxxx"',
    values.NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL ? `NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL="${values.NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL}"` : '# NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL="price_xxxxx"',
    values.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ? `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="${values.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY}"` : '# NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_xxxxx"',
    values.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL ? `NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL="${values.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL}"` : '# NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL="price_xxxxx"',
    values.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY ? `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY="${values.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY}"` : '# NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY="price_xxxxx"',
    values.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL ? `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL="${values.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL}"` : '# NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL="price_xxxxx"',
    '',
    '# Stripe Price IDs - Restaurant Claims',
    values.NEXT_PUBLIC_STRIPE_PRICE_OWNER ? `NEXT_PUBLIC_STRIPE_PRICE_OWNER="${values.NEXT_PUBLIC_STRIPE_PRICE_OWNER}"` : '# NEXT_PUBLIC_STRIPE_PRICE_OWNER="price_xxxxx"',
    values.NEXT_PUBLIC_STRIPE_PRICE_FEATURED ? `NEXT_PUBLIC_STRIPE_PRICE_FEATURED="${values.NEXT_PUBLIC_STRIPE_PRICE_FEATURED}"` : '# NEXT_PUBLIC_STRIPE_PRICE_FEATURED="price_xxxxx"',
    values.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM ? `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM="${values.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM}"` : '# NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM="price_xxxxx"',
    '',
    '# Email',
    values.EMAIL_PROVIDER ? `EMAIL_PROVIDER="${values.EMAIL_PROVIDER}"` : '# EMAIL_PROVIDER="sendgrid"',
    values.EMAIL_FROM ? `EMAIL_FROM="${values.EMAIL_FROM}"` : '# EMAIL_FROM="billing@ekaty.com"',
    values.SENDGRID_API_KEY ? `SENDGRID_API_KEY="${values.SENDGRID_API_KEY}"` : '# SENDGRID_API_KEY="SG.xxxxx"',
    values.RESEND_API_KEY ? `RESEND_API_KEY="${values.RESEND_API_KEY}"` : '# RESEND_API_KEY="re_xxxxx"',
    '',
    '# Google Places API',
    values.GOOGLE_PLACES_API_KEY ? `GOOGLE_PLACES_API_KEY="${values.GOOGLE_PLACES_API_KEY}"` : '# GOOGLE_PLACES_API_KEY="AIzaxxxxx"',
    ''
  ];

  return lines.join('\n');
}

function generateEnvExample() {
  return `# eKaty.com Environment Configuration Example
# Copy this file to .env and fill in your values

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ekaty"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# Stripe Price IDs - Subscriptions
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL="price_xxxxx"

# Stripe Price IDs - Restaurant Claims
NEXT_PUBLIC_STRIPE_PRICE_OWNER="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_FEATURED="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM="price_xxxxx"

# Email
EMAIL_PROVIDER="sendgrid"
EMAIL_FROM="billing@ekaty.com"
SENDGRID_API_KEY="SG.xxxxx"

# Google Places API
GOOGLE_PLACES_API_KEY="AIzaxxxxx"
`;
}

// Run setup
setupEnvironment().catch(error => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});
