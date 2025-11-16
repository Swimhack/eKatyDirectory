# Creating Your eKaty Open Graph Image

## Option 1: Screenshot the HTML Template (Easiest)

1. Open `public/og-image-template.html` in your browser
2. Set browser window to exactly 1200x630 pixels
3. Take a screenshot (or use browser dev tools to capture)
4. Save as `public/og-image.png`

## Option 2: Use an Online Tool

Visit one of these free OG image generators:
- https://www.opengraph.xyz/
- https://www.bannerbear.com/tools/open-graph-image-generator/
- https://ogimage.gallery/

**Design specs:**
- Size: 1200x630 pixels
- Background: Blue gradient (#1e40af to #60a5fa)
- Text: "eKaty" (large, bold, white)
- Tagline: "Best Restaurants in Katy, Texas"
- Subtitle: "Discover. Dine. Delight."
- Add food emojis: 🍕 🍔 🍜 🌮 🍣

## Option 3: Use Canva (Recommended for Best Quality)

1. Go to https://www.canva.com/
2. Create custom size: 1200 x 630 px
3. Use the design from the HTML template as reference
4. Download as PNG
5. Save to `public/og-image.png`

## Option 4: Hire a Designer on Fiverr

Search for "Open Graph image design" - usually $5-20 for a professional design

## After Creating the Image

1. Save the image as `public/og-image.png`
2. The metadata is already configured in your app
3. Test it at: https://www.opengraph.xyz/url/https://ekaty.fly.dev/

## Current Metadata Setup

Your app already has OG tags configured. Once you add `public/og-image.png`, it will automatically be used for:
- Facebook shares
- Twitter/X shares
- LinkedIn shares
- Discord embeds
- Slack previews
- And more!

## Quick Test

After adding the image, test your OG tags:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/
