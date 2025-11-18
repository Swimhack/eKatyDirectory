/**
 * Restaurant Outreach Email Templates
 * Personalized templates for each segment with high conversion focus
 */

export interface EmailTemplate {
  subject: string
  preview: string
  body: string
  cta: string
  ctaUrl: string
}

export interface RestaurantData {
  name: string
  rating?: number | null
  reviewCount?: number
  phone?: string | null
  website?: string | null
  cuisine?: string | null
  address?: string
}

/**
 * HIGH-VALUE TARGETS
 * Rating ≥4.0, 50+ reviews, no marketing
 */
export function getHighValueTargetEmail(restaurant: RestaurantData): EmailTemplate {
  return {
    subject: `${restaurant.name} - You're Missing 10,000+ Monthly Diners 🍽️`,
    preview: `Your ${restaurant.rating}/5 rating deserves more visibility. Get discovered on eKaty.com.`,
    body: `Hi ${restaurant.name} team,

I noticed ${restaurant.name} has an impressive ${restaurant.rating}/5 rating with ${restaurant.reviewCount}+ reviews - that's fantastic!

However, you're currently missing out on **10,000+ monthly diners** who are actively searching "restaurants near me in Katy" on eKaty.com.

**Here's what's happening right now:**
• 10,000+ Katy residents visit eKaty.com monthly
• They're searching for ${restaurant.cuisine || 'great restaurants'} like yours
• Your competitors are getting featured placement
• You're not showing up in our "Top Rated" sections

**Good news:** We've already created your FREE profile page at:
https://ekaty.com/restaurants/${generateSlug(restaurant.name)}

**Want to get discovered?**
✅ Claim your listing (FREE)
✅ Add your specials and photos
✅ Get featured placement for just $99/month
✅ Start getting more customers THIS WEEK

**Limited Time:**
First 50 restaurants get Featured Placement at 50% OFF ($49/month for 3 months)

Looking forward to helping ${restaurant.name} reach more diners!

Best,
James
Founder, eKaty.com
${restaurant.phone ? `P: ${restaurant.phone}` : 'james@ekaty.com'}`,
    cta: 'Claim Your Free Listing →',
    ctaUrl: `https://ekaty.com/restaurants/${generateSlug(restaurant.name)}?claim=true`
  }
}

/**
 * FAMILY-FRIENDLY UPSELL
 * Already has marketing, not featured
 */
export function getFamilyFriendlyUpsellEmail(restaurant: RestaurantData): EmailTemplate {
  return {
    subject: `🎉 Your ${restaurant.name} Kids Deal is LIVE on eKaty!`,
    preview: `3,500+ families viewed kids deals this month. Upgrade to get 3x more visibility.`,
    body: `Hi ${restaurant.name} team,

Great news! Your kids deal is now live on eKaty.com and getting views from local families.

**This month's stats:**
• 3,500+ parents searched "kids eat free Katy"
• 1,200+ families viewed our Kids Deals page
• Your listing is currently in the "All Deals" section

**But here's the opportunity you're missing:**

Featured restaurants get:
✅ **3x more clicks** (top of search results)
✅ **Priority placement** in "Kids Eat Free" emails (sent to 5,000+ local families)
✅ **Homepage carousel** featuring (10,000+ monthly views)
✅ **"Top Pick" badge** that builds instant trust

**Real Results from Featured Restaurants:**
"We upgraded to Featured and saw a 40% increase in family dinner reservations within 2 weeks!" - Russo's Pizzeria

**Upgrade to Premium Featured for $199/month:**
→ Get 3x more visibility
→ Dominate family search results
→ Limited to only 10 featured restaurants per category

**Special Offer:**
Mention code "FAMILY50" for 50% off your first month ($99.50)

Ready to capture more family diners?

Best,
James
eKaty.com
james@ekaty.com`,
    cta: 'Upgrade to Premium Featured →',
    ctaUrl: `https://ekaty.com/admin/restaurants?upgrade=premium&code=FAMILY50`
  }
}

/**
 * FEATURED PLACEMENT CANDIDATES
 * Rating ≥4.5, 100+ reviews, not featured
 */
export function getFeaturedPlacementEmail(restaurant: RestaurantData): EmailTemplate {
  return {
    subject: `${restaurant.name}: You're a Top Restaurant in Katy (Make It Official) ⭐`,
    preview: `${restaurant.rating}/5 with ${restaurant.reviewCount}+ reviews. Get featured placement to capture more searches.`,
    body: `Hi ${restaurant.name} team,

Congratulations! ${restaurant.name} is officially one of the **top-rated restaurants in Katy** with your ${restaurant.rating}/5 rating and ${restaurant.reviewCount}+ reviews.

**Here's what your customers are saying about you:**
"Best ${restaurant.cuisine || 'food'} in Katy!" - Verified Customer

**But here's the problem:**
When people search "best restaurants in Katy" on Google and eKaty.com, you're not showing up in the top results - **even though you deserve to be.**

**Why?** Because lower-rated competitors are paying for featured placement.

**The Solution:**
Get Featured Placement for $99/month and dominate search results.

**What Featured Placement Gets You:**
✅ **Top of Search Results** - First restaurant people see
✅ **Homepage Featured Carousel** - 10,000+ monthly impressions
✅ **"Editor's Pick" Badge** - Instant credibility boost
✅ **Email Spotlights** - Sent to 5,000+ local foodies
✅ **Priority in "Best of Katy" Lists** - Media exposure

**Real ROI:**
Average featured restaurant sees **$3,000+ in additional monthly revenue** from eKaty referrals.

**That's a 30x return on a $99/month investment.**

**Limited Availability:**
We only feature 20 restaurants total to maintain exclusivity and quality.

**Currently: 7 spots remaining**

Want to claim your spot before your competitors do?

Best,
James
Founder, eKaty.com
james@ekaty.com`,
    cta: 'Get Featured ($99/month) →',
    ctaUrl: `https://ekaty.com/admin/restaurants?upgrade=featured`
  }
}

/**
 * PHONE-ONLY QUICK WINS
 * Has phone, no website (easy conversion)
 */
export function getPhoneOnlyQuickWinEmail(restaurant: RestaurantData): EmailTemplate {
  return {
    subject: `${restaurant.name}: We Built You a Free Website (That Ranks on Google)`,
    preview: `Your restaurant shows up on Google without a website. Get a professional profile page for FREE.`,
    body: `Hi ${restaurant.name} team,

I noticed ${restaurant.name} doesn't have a website - **that's costing you customers every single day.**

**Here's what's happening:**
• 10,000+ people search for restaurants in Katy every month
• They find your phone number on Google
• But there's NO website to learn about your menu, hours, or specials
• **85% of them go to a competitor with a website instead**

**Good news: We already built you a FREE website.**

**Your new eKaty profile page:**
→ https://ekaty.com/restaurants/${generateSlug(restaurant.name)}

**It already has:**
✅ Your address and phone number
✅ Google Maps integration
✅ Customer reviews
✅ Hours of operation
✅ Professional photos (from Google)

**All you need to do:**
1. Claim it (takes 2 minutes)
2. Add your menu/specials
3. Start getting more customers

**Want to do even more?**
Upgrade to Pro for $49/month and get:
→ Special offers & promotions
→ "Happy Hour" deals
→ Kids eat free nights
→ Email marketing to 5,000+ locals

**No website builder required. No tech skills needed.**

We handle everything.

**Click below to claim your FREE profile page:**

Best,
James
eKaty.com
${restaurant.phone || 'james@ekaty.com'}`,
    cta: 'Claim My FREE Profile Page →',
    ctaUrl: `https://ekaty.com/restaurants/${generateSlug(restaurant.name)}?claim=true`
  }
}

/**
 * PREMIUM RESTAURANT TARGETS
 * $$$ or $$$$, rating ≥4.3
 */
export function getPremiumRestaurantEmail(restaurant: RestaurantData): EmailTemplate {
  return {
    subject: `${restaurant.name}: Premium Dining Deserves Premium Placement`,
    preview: `Exclusive Featured tier for fine dining. Dominate "date night" and "special occasion" searches.`,
    body: `Hi ${restaurant.name} team,

${restaurant.name} offers an exceptional dining experience - your ${restaurant.rating}/5 rating proves it.

But when affluent diners search for "fine dining in Katy" or "best date night restaurants," are you showing up first?

**The Problem:**
• 2,500+ monthly searches for upscale dining in Katy
• Your ideal customers have high intent (ready to spend $100+/visit)
• They're seeing your competitors first

**The Solution:**
Join our **exclusive Featured tier** ($199/month) designed specifically for premium restaurants.

**What's Included:**
✅ **"Fine Dining" Category Domination** - Top placement
✅ **"Date Night" & "Special Occasion" Email Features** - 5,000+ affluent subscribers
✅ **Premium Profile Design** - Showcase your ambiance with photo galleries
✅ **Reservation Integration** - Direct OpenTable/Resy links
✅ **"Editor's Pick for Fine Dining" Badge** - Instant authority
✅ **Dedicated Account Manager** - We promote you personally

**ROI Guarantee:**
If you don't get at least **$2,000 in additional monthly revenue** from eKaty referrals within 90 days, we'll refund your money.

**Exclusivity:**
We only accept 5 restaurants in the Fine Dining tier to maintain quality.

**Current Status: 2 spots available**

Ready to dominate the premium dining market in Katy?

Best,
James
Founder, eKaty.com
james@ekaty.com`,
    cta: 'Join Premium Featured ($199/month) →',
    ctaUrl: `https://ekaty.com/admin/restaurants?upgrade=premium`
  }
}

/**
 * Helper function to generate slug from restaurant name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Follow-up email (Day 3)
 */
export function getFollowUpEmail(restaurant: RestaurantData, segment: string): EmailTemplate {
  return {
    subject: `Re: ${restaurant.name} - Quick question`,
    preview: `Just following up on the eKaty opportunity. Any questions?`,
    body: `Hi ${restaurant.name} team,

I sent you an email a few days ago about getting more visibility on eKaty.com.

**Quick question:** What's holding you back from claiming your profile?

Is it:
→ Not sure it's worth it?
→ Too busy right now?
→ Want to see proof it works?
→ Have questions about pricing?

Let me know and I'll help!

Also, here are some quick stats from this week:
• 12,450 restaurant searches on eKaty.com
• 4,200 "kids eat free" searches
• 2,800 "happy hour near me" searches
• 1,500 "${restaurant.cuisine || 'your cuisine'}" searches

Your competitors are capturing these customers.

Want to grab your share?

Best,
James
eKaty.com
james@ekaty.com

P.S. - Still offering 50% off first month for quick decisions!`,
    cta: 'Yes, Let\'s Do This →',
    ctaUrl: `https://ekaty.com/restaurants/${generateSlug(restaurant.name)}?claim=true`
  }
}

/**
 * Follow-up email (Day 7) - Last chance
 */
export function getLastChanceEmail(restaurant: RestaurantData): EmailTemplate {
  return {
    subject: `[FINAL] ${restaurant.name} - Your spot is about to be taken`,
    preview: `Last chance for 50% off Featured placement. Offer expires in 48 hours.`,
    body: `Hi ${restaurant.name} team,

**This is my last email.**

I've reached out a couple times about getting ${restaurant.name} featured on eKaty.com.

**Here's the situation:**
• We have limited Featured spots available
• Your competitors are signing up
• The 50% off offer expires in 48 hours
• After that, full price ($99/month) or the spot goes to someone else

**Decision time:**
→ Say YES: Get featured, capture 10,000+ monthly diners, grow revenue
→ Say NO: Stay invisible while competitors win

No hard feelings either way, but I wanted to give you one last chance before offering your spot to the next restaurant on our waitlist.

**Reply "YES" to this email or click below to claim your spot:**

Best,
James
eKaty.com
james@ekaty.com

P.S. - Even if you're not interested in Featured, at least claim your FREE profile so you show up in search results. Takes 2 minutes:
https://ekaty.com/restaurants/${generateSlug(restaurant.name)}?claim=true`,
    cta: 'Claim My Spot (50% OFF) →',
    ctaUrl: `https://ekaty.com/restaurants/${generateSlug(restaurant.name)}?upgrade=featured&code=LASTCHANCE50`
  }
}

/**
 * Get appropriate template for restaurant segment
 */
export function getTemplateForSegment(
  segment: string,
  restaurant: RestaurantData,
  followUpDay?: number
): EmailTemplate {
  if (followUpDay === 3) {
    return getFollowUpEmail(restaurant, segment)
  }

  if (followUpDay === 7) {
    return getLastChanceEmail(restaurant)
  }

  switch (segment) {
    case 'High-Value Targets':
      return getHighValueTargetEmail(restaurant)

    case 'Family-Friendly Upsell':
      return getFamilyFriendlyUpsellEmail(restaurant)

    case 'Featured Placement Candidates':
      return getFeaturedPlacementEmail(restaurant)

    case 'Phone-Only Quick Wins':
      return getPhoneOnlyQuickWinEmail(restaurant)

    case 'Premium Restaurant Targets':
      return getPremiumRestaurantEmail(restaurant)

    default:
      return getHighValueTargetEmail(restaurant)
  }
}
