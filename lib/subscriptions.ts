import { prisma } from './prisma'

export type SubscriptionTier = 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM'

export interface SubscriptionFeatures {
  // Profile Features
  enhancedProfile: boolean
  photoUploads: number // max photos
  videoUploads: boolean
  customBranding: boolean

  // Marketing Features
  kidsDeals: boolean
  specialsPromotions: boolean
  eventListing: boolean
  emailCampaigns: boolean
  socialMediaIntegration: boolean

  // Visibility Features
  featuredPlacement: boolean
  homepagePlacement: boolean
  searchPriority: number // 0 = normal, 1-5 = boosted

  // Analytics Features
  basicAnalytics: boolean
  advancedAnalytics: boolean
  competitorBenchmarking: boolean
  customReports: boolean

  // Support Features
  emailSupport: boolean
  prioritySupport: boolean
  accountManager: boolean

  // Advanced Features
  apiAccess: boolean
  abTesting: boolean
  seoOptimization: boolean
  whiteLabel: boolean
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  FREE: {
    enhancedProfile: false,
    photoUploads: 0,
    videoUploads: false,
    customBranding: false,

    kidsDeals: false,
    specialsPromotions: false,
    eventListing: false,
    emailCampaigns: false,
    socialMediaIntegration: false,

    featuredPlacement: false,
    homepagePlacement: false,
    searchPriority: 0,

    basicAnalytics: false,
    advancedAnalytics: false,
    competitorBenchmarking: false,
    customReports: false,

    emailSupport: false,
    prioritySupport: false,
    accountManager: false,

    apiAccess: false,
    abTesting: false,
    seoOptimization: false,
    whiteLabel: false
  },

  BASIC: {
    enhancedProfile: true,
    photoUploads: 10,
    videoUploads: false,
    customBranding: false,

    kidsDeals: true,
    specialsPromotions: true,
    eventListing: true,
    emailCampaigns: false,
    socialMediaIntegration: false,

    featuredPlacement: false,
    homepagePlacement: false,
    searchPriority: 1,

    basicAnalytics: true,
    advancedAnalytics: false,
    competitorBenchmarking: false,
    customReports: false,

    emailSupport: true,
    prioritySupport: false,
    accountManager: false,

    apiAccess: false,
    abTesting: false,
    seoOptimization: false,
    whiteLabel: false
  },

  PRO: {
    enhancedProfile: true,
    photoUploads: 50,
    videoUploads: true,
    customBranding: true,

    kidsDeals: true,
    specialsPromotions: true,
    eventListing: true,
    emailCampaigns: true,
    socialMediaIntegration: true,

    featuredPlacement: true,
    homepagePlacement: false,
    searchPriority: 3,

    basicAnalytics: true,
    advancedAnalytics: true,
    competitorBenchmarking: true,
    customReports: false,

    emailSupport: true,
    prioritySupport: true,
    accountManager: false,

    apiAccess: false,
    abTesting: true,
    seoOptimization: true,
    whiteLabel: false
  },

  PREMIUM: {
    enhancedProfile: true,
    photoUploads: 999,
    videoUploads: true,
    customBranding: true,

    kidsDeals: true,
    specialsPromotions: true,
    eventListing: true,
    emailCampaigns: true,
    socialMediaIntegration: true,

    featuredPlacement: true,
    homepagePlacement: true,
    searchPriority: 5,

    basicAnalytics: true,
    advancedAnalytics: true,
    competitorBenchmarking: true,
    customReports: true,

    emailSupport: true,
    prioritySupport: true,
    accountManager: true,

    apiAccess: true,
    abTesting: true,
    seoOptimization: true,
    whiteLabel: true
  }
}

/**
 * Get user's subscription tier and features
 */
export async function getUserSubscription(userId: string): Promise<{
  tier: SubscriptionTier
  features: SubscriptionFeatures
  status: string
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true
    }
  })

  const tier = (user?.subscriptionTier as SubscriptionTier) || 'FREE'
  const status = user?.subscriptionStatus || 'none'

  return {
    tier,
    features: SUBSCRIPTION_FEATURES[tier],
    status
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: keyof SubscriptionFeatures
): Promise<boolean> {
  const subscription = await getUserSubscription(userId)

  // If subscription is past_due or canceled, downgrade to FREE
  if (subscription.status === 'past_due' || subscription.status === 'canceled') {
    return SUBSCRIPTION_FEATURES.FREE[feature] as boolean
  }

  return subscription.features[feature] as boolean
}

/**
 * Check if user's tier meets minimum requirement
 */
export function meetsMinimumTier(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  const tierHierarchy: SubscriptionTier[] = ['FREE', 'BASIC', 'PRO', 'PREMIUM']
  const userIndex = tierHierarchy.indexOf(userTier)
  const requiredIndex = tierHierarchy.indexOf(requiredTier)

  return userIndex >= requiredIndex
}

/**
 * Get subscription tier pricing
 */
export const SUBSCRIPTION_PRICING = {
  BASIC: { monthly: 49, annual: 470 }, // ~20% discount
  PRO: { monthly: 99, annual: 950 },
  PREMIUM: { monthly: 199, annual: 1910 }
}

/**
 * Stripe Price IDs (to be replaced with actual IDs after Stripe setup)
 */
export const STRIPE_PRICE_IDS = {
  BASIC_MONTHLY: 'price_basic_monthly',
  BASIC_ANNUAL: 'price_basic_annual',
  PRO_MONTHLY: 'price_pro_monthly',
  PRO_ANNUAL: 'price_pro_annual',
  PREMIUM_MONTHLY: 'price_premium_monthly',
  PREMIUM_ANNUAL: 'price_premium_annual'
}

/**
 * Feature descriptions for marketing
 */
export const FEATURE_DESCRIPTIONS: Record<keyof SubscriptionFeatures, string> = {
  enhancedProfile: 'Enhanced profile with custom styling',
  photoUploads: 'Upload multiple photos of your restaurant',
  videoUploads: 'Add video tours and promotional clips',
  customBranding: 'Custom colors and branding',

  kidsDeals: 'Promote kids eat free deals',
  specialsPromotions: 'Daily specials and promotions',
  eventListing: 'List special events and parties',
  emailCampaigns: 'Automated email marketing',
  socialMediaIntegration: 'Connect social media accounts',

  featuredPlacement: 'Featured in search results',
  homepagePlacement: 'Homepage spotlight placement',
  searchPriority: 'Higher ranking in search results',

  basicAnalytics: 'View profile stats and engagement',
  advancedAnalytics: 'Detailed analytics and insights',
  competitorBenchmarking: 'Compare with competitors',
  customReports: 'Generate custom analytics reports',

  emailSupport: 'Email customer support',
  prioritySupport: 'Priority support responses',
  accountManager: 'Dedicated account manager',

  apiAccess: 'API access for integrations',
  abTesting: 'A/B test promotions',
  seoOptimization: 'Advanced SEO optimization',
  whiteLabel: 'White-label marketing materials'
}
