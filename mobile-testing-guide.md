# Mobile Performance & UX Testing Guide

## Quick Mobile Testing Checklist

### 1. **Device Testing (Chrome DevTools)**
```bash
# Open Chrome DevTools
F12 → Toggle Device Mode → Select device presets
```

**Recommended Test Devices:**
- iPhone SE (375×667) - Smallest modern iPhone
- iPhone 12 Pro (390×844) - Standard iPhone
- iPhone 14 Pro Max (428×926) - Large iPhone  
- Samsung Galaxy S20 (360×800) - Android standard
- iPad (768×1024) - Tablet
- iPad Pro (1024×1366) - Large tablet

### 2. **Performance Testing**

#### **Lighthouse Mobile Audit**
```bash
npm install -g lighthouse
lighthouse http://localhost:3002 --preset=mobile --view
```

**Target Scores:**
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

#### **Core Web Vitals (Mobile)**
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1

### 3. **Touch Interaction Testing**

#### **Touch Target Verification**
All interactive elements should be minimum 44×44px:
- ✅ Bottom navigation buttons
- ✅ Category chips
- ✅ Search button
- ✅ Menu hamburger
- ✅ All links and buttons

#### **Touch Feedback Testing**
- Tap any button → Should see visual feedback (scale/color change)
- Swipe interactions → Should feel smooth
- Scroll momentum → Should feel natural

### 4. **Navigation Flow Testing**

#### **Mobile Navigation Test Flow:**
1. **Landing** → Tap logo → Should return home
2. **Search** → Type query → Tap search → Should navigate to results
3. **Categories** → Tap Mexican → Should filter restaurants
4. **Bottom Nav** → Test all 5 buttons (Home, Discover, Roulette, Contact, Profile)
5. **Mobile Menu** → Tap hamburger → Should slide down with options

#### **Cross-Device Consistency:**
- Logo should be smaller on mobile but maintain branding
- Bottom nav should only show on mobile/tablet
- Footer should be minimal on mobile
- All content should be readable without pinch-zoom

### 5. **iOS Specific Testing**

#### **Safari Mobile Testing:**
- Safe area handling around notch
- Status bar color theming
- Momentum scrolling behavior
- Add to Home Screen functionality

#### **iOS Simulator (if available):**
```bash
# Open iOS Simulator
# Navigate to http://localhost:3002
# Test on iPhone 14 Pro and iPhone SE
```

### 6. **Android Specific Testing**

#### **Chrome Mobile Testing:**
- Navigation gestures
- Back button behavior  
- Address bar hide/show on scroll
- Theme color in task switcher

### 7. **PWA Testing**

#### **Install Prompt Testing:**
1. Open site in Chrome mobile
2. Look for "Add to Home Screen" prompt
3. Install app
4. Test app launch from home screen
5. Verify standalone mode (no browser UI)

#### **Manifest Validation:**
Use Chrome DevTools → Application → Manifest to verify:
- Icons load correctly
- Theme colors are applied
- Shortcuts work

### 8. **Accessibility Testing**

#### **Screen Reader Testing:**
- Turn on VoiceOver (iOS) or TalkBack (Android)
- Navigate using swipe gestures
- All buttons should be properly labeled
- Navigation should be logical

#### **Keyboard Navigation:**
- Tab through all interactive elements
- Focus indicators should be visible
- All actions should be keyboard accessible

### 9. **Performance Monitoring**

#### **Real User Monitoring:**
```javascript
// Add to layout.tsx for production monitoring
window.addEventListener('load', () => {
  // Measure key metrics
  const navigation = performance.getEntriesByType('navigation')[0];
  console.log('Page Load Time:', navigation.loadEventEnd - navigation.loadEventStart);
  
  // Measure LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    console.log('LCP:', entries[entries.length - 1].startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });
});
```

### 10. **Network Testing**

#### **Slow Connection Testing:**
Chrome DevTools → Network → Throttling:
- Slow 3G (400ms RTT, 400kb/s down)
- Fast 3G (150ms RTT, 1.6Mb/s down)
- Offline (test service worker if implemented)

### 11. **Orientation Testing**
- Portrait → Landscape → Portrait
- Verify layout doesn't break
- Navigation should remain accessible
- Content should reflow properly

## Automated Testing Script

Create `test-mobile.js`:
```javascript
const puppeteer = require('puppeteer');

async function testMobileUX() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set mobile viewport
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3002');
  
  // Test touch targets
  const buttons = await page.$$('button');
  for (let button of buttons) {
    const box = await button.boundingBox();
    console.log(`Button size: ${box.width}x${box.height}`);
    if (box.width < 44 || box.height < 44) {
      console.warn('Button below 44px minimum');
    }
  }
  
  // Test navigation
  await page.click('[data-testid="bottom-nav-discover"]');
  await page.waitForNavigation();
  console.log('Navigation working');
  
  await browser.close();
}

testMobileUX();
```

## Current Implementation Status

### ✅ **Completed Mobile Features:**
- Mobile-first responsive design
- Sticky bottom navigation
- Touch-friendly interactions (44px minimum)
- Safe area inset support
- PWA manifest
- Optimized typography scaling
- Enhanced focus indicators
- Active state animations

### 🔄 **Recommended Next Steps:**
1. Generate PWA icons (various sizes)
2. Add offline support with service worker
3. Implement pull-to-refresh
4. Add haptic feedback for touch interactions
5. Optimize images for mobile devices
6. Add gesture navigation (swipe)

## Testing Commands

```bash
# Start development server
npm run dev

# Build and test production version
npm run build
npm run start

# Run Lighthouse audit
lighthouse http://localhost:3000 --preset=mobile --view

# Test PWA features
lighthouse http://localhost:3000 --preset=mobile --view --only-categories=pwa
```

Remember to test on real devices when possible, as simulators may not capture all performance characteristics and touch behaviors accurately.