#!/usr/bin/env node

/**
 * Automated Stripe Setup Script
 *
 * Creates all products, prices, and webhooks for eKaty.com monetization
 * Run: node scripts/stripe-setup.js
 *
 * Prerequisites:
 * 1. Install Stripe CLI: npm install -g stripe
 * 2. Login: stripe login
 * 3. Set STRIPE_SECRET_KEY in .env
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTS = [
  {
    name: 'Basic Plan',
    description: 'Essential features for getting started with eKaty.com',
    metadata: { tier: 'BASIC' },
    prices: [
      { amount: 4900, interval: 'month', currency: 'usd', trial_days: 14 }, // $49/mo
      { amount: 47040, interval: 'year', currency: 'usd', trial_days: 14 }  // $49 * 12 * 0.8 = $470.40/yr
    ]
  },
  {
    name: 'Pro Plan',
    description: 'Advanced features for growing restaurants',
    metadata: { tier: 'PRO' },
    prices: [
      { amount: 9900, interval: 'month', currency: 'usd', trial_days: 14 },  // $99/mo
      { amount: 95040, interval: 'year', currency: 'usd', trial_days: 14 }   // $99 * 12 * 0.8 = $950.40/yr
    ]
  },
  {
    name: 'Premium Plan',
    description: 'Complete marketing suite for established restaurants',
    metadata: { tier: 'PREMIUM' },
    prices: [
      { amount: 19900, interval: 'month', currency: 'usd', trial_days: 14 }, // $199/mo
      { amount: 191040, interval: 'year', currency: 'usd', trial_days: 14 }  // $199 * 12 * 0.8 = $1,910.40/yr
    ]
  },
  {
    name: 'Restaurant Claim - Owner',
    description: 'Claim and verify restaurant ownership',
    metadata: { type: 'claim', level: 'owner' },
    prices: [
      { amount: 1000, interval: 'month', currency: 'usd', trial_days: 14 }   // $10/mo
    ]
  },
  {
    name: 'Restaurant Claim - Featured',
    description: 'Featured listing with enhanced visibility',
    metadata: { type: 'claim', level: 'featured' },
    prices: [
      { amount: 9900, interval: 'month', currency: 'usd', trial_days: 14 }   // $99/mo
    ]
  },
  {
    name: 'Restaurant Claim - Premium',
    description: 'Premium listing with maximum exposure',
    metadata: { type: 'claim', level: 'premium' },
    prices: [
      { amount: 19900, interval: 'month', currency: 'usd', trial_days: 14 }  // $199/mo
    ]
  }
];

const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
];

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

// Main setup function
async function setupStripe() {
  log('\n🚀 Starting Stripe Setup for eKaty.com\n', 'cyan');

  if (!process.env.STRIPE_SECRET_KEY) {
    error('STRIPE_SECRET_KEY not found in environment variables');
    error('Add to .env: STRIPE_SECRET_KEY="sk_test_xxxxx"');
    process.exit(1);
  }

  const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
  info(`Running in ${isTestMode ? 'TEST' : 'LIVE'} mode`);

  if (!isTestMode) {
    warn('⚠️  WARNING: Running in LIVE mode. Real money will be charged!');
    warn('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  const results = {
    products: [],
    prices: {},
    webhook: null
  };

  // Create products and prices
  log('\n📦 Creating Products and Prices...\n', 'cyan');

  for (const productConfig of PRODUCTS) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
        metadata: productConfig.metadata
      });

      success(`Created product: ${product.name}`);
      results.products.push(product);

      // Create prices for this product
      for (const priceConfig of productConfig.prices) {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: priceConfig.amount,
          currency: priceConfig.currency,
          recurring: {
            interval: priceConfig.interval,
            trial_period_days: priceConfig.trial_days
          },
          metadata: {
            tier: productConfig.metadata.tier || productConfig.metadata.level,
            type: productConfig.metadata.type || 'subscription'
          }
        });

        const priceLabel = `${priceConfig.amount / 100} ${priceConfig.currency.toUpperCase()}/${priceConfig.interval}`;
        success(`  Created price: ${price.id} (${priceLabel})`);

        // Store price ID with descriptive key
        const tier = productConfig.metadata.tier || productConfig.metadata.level;
        const interval = priceConfig.interval.toUpperCase();
        const key = tier ? `${tier}_${interval}` : `${productConfig.metadata.type}_${productConfig.metadata.level}`.toUpperCase();
        results.prices[key] = price.id;
      }

      log(''); // Empty line for readability
    } catch (err) {
      error(`Failed to create product ${productConfig.name}: ${err.message}`);
    }
  }

  // Create webhook endpoint
  log('\n🔗 Creating Webhook Endpoint...\n', 'cyan');

  try {
    // Determine webhook URL
    const webhookUrl = isTestMode
      ? 'http://localhost:3000/api/webhooks/stripe'
      : 'https://ekaty.com/api/webhooks/stripe';

    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: WEBHOOK_EVENTS,
      description: 'eKaty.com billing webhooks'
    });

    success(`Created webhook endpoint: ${webhook.id}`);
    info(`  URL: ${webhookUrl}`);
    info(`  Secret: ${webhook.secret}`);
    results.webhook = webhook;
  } catch (err) {
    error(`Failed to create webhook: ${err.message}`);
  }

  // Generate .env configuration
  log('\n📝 Generating .env Configuration...\n', 'cyan');

  const envConfig = generateEnvConfig(results);

  // Save to .env.stripe file
  const envPath = path.join(process.cwd(), '.env.stripe');
  fs.writeFileSync(envPath, envConfig);
  success(`Saved configuration to ${envPath}`);

  // Display configuration
  log('\n' + '='.repeat(80), 'cyan');
  log('🎉 Stripe Setup Complete!', 'green');
  log('='.repeat(80) + '\n', 'cyan');

  console.log(envConfig);

  log('\n' + '='.repeat(80), 'cyan');
  log('📋 Next Steps:', 'yellow');
  log('='.repeat(80) + '\n', 'cyan');

  info('1. Copy the configuration above to your .env file');
  info('2. Update lib/subscriptions.ts with the new price IDs');
  info('3. Restart your Next.js development server');
  info('4. Test checkout flow at http://localhost:3000/pricing');

  if (isTestMode) {
    log('\n🧪 Testing with Stripe CLI:', 'cyan');
    info('stripe listen --forward-to localhost:3000/api/webhooks/stripe');
    info('stripe trigger checkout.session.completed');
  } else {
    log('\n⚠️  Production Mode:', 'yellow');
    warn('Update webhook URL in Stripe Dashboard to: https://ekaty.com/api/webhooks/stripe');
    warn('Deploy to production: fly deploy');
    warn('Set secrets: fly secrets import < .env.production');
  }

  log('\n✅ Setup complete!\n', 'green');
}

// Generate .env configuration string
function generateEnvConfig(results) {
  const lines = [
    '# Stripe Configuration',
    '# Generated by scripts/stripe-setup.js',
    '# ' + new Date().toISOString(),
    '',
    '# API Keys',
    `STRIPE_SECRET_KEY="${process.env.STRIPE_SECRET_KEY}"`,
    results.webhook ? `STRIPE_WEBHOOK_SECRET="${results.webhook.secret}"` : '# STRIPE_WEBHOOK_SECRET="whsec_xxxxx"',
    '',
    '# Subscription Price IDs',
  ];

  // Add subscription prices
  if (results.prices.BASIC_MONTH) {
    lines.push(`NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="${results.prices.BASIC_MONTH}"`);
  }
  if (results.prices.BASIC_YEAR) {
    lines.push(`NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL="${results.prices.BASIC_YEAR}"`);
  }
  if (results.prices.PRO_MONTH) {
    lines.push(`NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="${results.prices.PRO_MONTH}"`);
  }
  if (results.prices.PRO_YEAR) {
    lines.push(`NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL="${results.prices.PRO_YEAR}"`);
  }
  if (results.prices.PREMIUM_MONTH) {
    lines.push(`NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY="${results.prices.PREMIUM_MONTH}"`);
  }
  if (results.prices.PREMIUM_YEAR) {
    lines.push(`NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL="${results.prices.PREMIUM_YEAR}"`);
  }

  lines.push('');
  lines.push('# Restaurant Claim Price IDs');

  if (results.prices.CLAIM_OWNER) {
    lines.push(`NEXT_PUBLIC_STRIPE_PRICE_OWNER="${results.prices.CLAIM_OWNER}"`);
  }
  if (results.prices.CLAIM_FEATURED) {
    lines.push(`NEXT_PUBLIC_STRIPE_PRICE_FEATURED="${results.prices.CLAIM_FEATURED}"`);
  }
  if (results.prices.CLAIM_PREMIUM) {
    lines.push(`NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM="${results.prices.CLAIM_PREMIUM}"`);
  }

  return lines.join('\n') + '\n';
}

// Update lib/subscriptions.ts with new price IDs
async function updateSubscriptionsFile(priceIds) {
  const filePath = path.join(process.cwd(), 'lib', 'subscriptions.ts');

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace price IDs
    content = content.replace(
      /STRIPE_PRICE_IDS\s*=\s*{[^}]+}/s,
      `STRIPE_PRICE_IDS = {
  BASIC_MONTHLY: '${priceIds.BASIC_MONTH}',
  BASIC_ANNUAL: '${priceIds.BASIC_YEAR}',
  PRO_MONTHLY: '${priceIds.PRO_MONTH}',
  PRO_ANNUAL: '${priceIds.PRO_YEAR}',
  PREMIUM_MONTHLY: '${priceIds.PREMIUM_MONTH}',
  PREMIUM_ANNUAL: '${priceIds.PREMIUM_YEAR}'
}`
    );

    fs.writeFileSync(filePath, content);
    success('Updated lib/subscriptions.ts with new price IDs');
  } catch (err) {
    warn(`Could not update lib/subscriptions.ts automatically: ${err.message}`);
    warn('Please update the file manually with the price IDs above');
  }
}

// Run setup
setupStripe().catch(err => {
  error(`Setup failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
