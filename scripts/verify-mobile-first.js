const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://ekaty.fly.dev';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // iPhone 12 Pro
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyMobileFirstDeployment() {
  console.log('🚀 Starting Mobile-First Deployment Verification...');
  console.log(`📱 Testing: ${SITE_URL}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  try {
    // Test 1: Mobile Bottom Navigation
    await testMobileBottomNavigation(browser, results);
    
    // Test 2: Mobile Header Optimization
    await testMobileHeader(browser, results);
    
    // Test 3: Touch Target Compliance
    await testTouchTargets(browser, results);
    
    // Test 4: Mobile Footer
    await testMobileFooter(browser, results);
    
    // Test 5: PWA Manifest
    await testPWAManifest(browser, results);
    
    // Test 6: Safe Area Support
    await testSafeAreaSupport(browser, results);
    
    // Test 7: Mobile-First Responsive Design
    await testResponsiveBreakpoints(browser, results);
    
    // Test 8: Mobile Typography Scaling
    await testMobileTypography(browser, results);
    
    // Test 9: Category Chips Touch Optimization
    await testCategoryChips(browser, results);
    
    // Test 10: Hero Section Mobile Optimization
    await testHeroMobile(browser, results);
    
  } catch (error) {
    console.error('❌ Critical error during testing:', error);
    results.failed++;
    results.tests.push({
      name: 'Critical Error',
      status: 'FAILED',
      error: error.message
    });
  } finally {
    await browser.close();
  }

  // Generate Report
  generateReport(results);
  return results;
}

async function testMobileBottomNavigation(browser, results) {
  console.log('📱 Testing: Mobile Bottom Navigation...');
  
  const page = await browser.newPage();
  await page.setViewport(MOBILE_VIEWPORT);
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check if bottom navigation is visible on mobile
    const bottomNav = await page.$('nav[class*="fixed bottom-0"]');
    if (!bottomNav) {
      throw new Error('Bottom navigation not found');
    }
    
    // Verify bottom nav is hidden on mobile class
    const isHiddenOnDesktop = await page.evaluate(() => {
      const nav = document.querySelector('nav[class*="fixed bottom-0"]');
      return nav && nav.classList.contains('md:hidden');
    });
    
    if (!isHiddenOnDesktop) {
      throw new Error('Bottom navigation should be hidden on desktop');
    }
    
    // Test all 5 navigation items
    const navItems = await page.$$('nav[class*="fixed bottom-0"] a');
    if (navItems.length !== 5) {
      throw new Error(`Expected 5 nav items, found ${navItems.length}`);
    }
    
    // Verify navigation items
    const expectedItems = ['Home', 'Discover', 'Roulette', 'Contact', 'Profile'];
    for (let i = 0; i < expectedItems.length; i++) {
      const text = await navItems[i].evaluate(el => el.textContent.trim());
      if (!text.includes(expectedItems[i])) {
        throw new Error(`Expected nav item "${expectedItems[i]}", found "${text}"`);
      }
    }
    
    // Take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-bottom-nav.png'),
      fullPage: true
    });
    
    results.passed++;
    results.tests.push({
      name: 'Mobile Bottom Navigation',
      status: 'PASSED',
      details: `All 5 navigation items present and properly configured`
    });
    
    console.log('✅ Mobile Bottom Navigation - PASSED');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Mobile Bottom Navigation',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ Mobile Bottom Navigation - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

async function testMobileHeader(browser, results) {
  console.log('📱 Testing: Mobile Header Optimization...');
  
  const page = await browser.newPage();
  await page.setViewport(MOBILE_VIEWPORT);
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check mobile header height
    const headerHeight = await page.evaluate(() => {
      const header = document.querySelector('nav:not([class*="fixed bottom-0"])');
      return header ? header.offsetHeight : 0;
    });
    
    // Mobile header should be shorter than desktop (around 56px vs 64px)
    if (headerHeight < 50 || headerHeight > 70) {
      throw new Error(`Mobile header height ${headerHeight}px is not optimized`);
    }
    
    // Verify compact logo
    const logoSize = await page.evaluate(() => {
      const logo = document.querySelector('nav div[class*="w-8 h-8"]');
      return logo ? { width: logo.offsetWidth, height: logo.offsetHeight } : null;
    });
    
    if (!logoSize || logoSize.width < 30 || logoSize.width > 40) {
      throw new Error('Mobile logo is not properly sized');
    }
    
    // Check for mobile menu button
    const menuButton = await page.$('button[class*="md:hidden"]');
    if (!menuButton) {
      throw new Error('Mobile menu button not found');
    }
    
    // Take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-header.png'),
      clip: { x: 0, y: 0, width: 390, height: 100 }
    });
    
    results.passed++;
    results.tests.push({
      name: 'Mobile Header Optimization',
      status: 'PASSED',
      details: `Header height: ${headerHeight}px, Logo optimized, Menu button present`
    });
    
    console.log('✅ Mobile Header Optimization - PASSED');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Mobile Header Optimization',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ Mobile Header Optimization - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

async function testTouchTargets(browser, results) {
  console.log('👆 Testing: Touch Target Compliance...');
  
  const page = await browser.newPage();
  await page.setViewport(MOBILE_VIEWPORT);
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check all interactive elements for 44px minimum
    const touchTargets = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a[href], input[type="submit"], [role="button"]');
      const results = [];
      
      buttons.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        // Skip hidden elements (display: none, visibility: hidden, or 0 dimensions)
        if (computedStyle.display === 'none' || 
            computedStyle.visibility === 'hidden' || 
            (rect.width === 0 && rect.height === 0)) {
          return;
        }
        
        const minHeight = Math.max(rect.height, parseInt(computedStyle.minHeight) || 0);
        const minWidth = Math.max(rect.width, parseInt(computedStyle.minWidth) || 0);
        
        results.push({
          index,
          width: rect.width,
          height: rect.height,
          minWidth,
          minHeight,
          meetsStandard: minHeight >= 44 && minWidth >= 44,
          className: element.className,
          tagName: element.tagName,
          isVisible: rect.width > 0 && rect.height > 0
        });
      });
      
      return results;
    });
    
    const failedTargets = touchTargets.filter(target => !target.meetsStandard);
    
    if (failedTargets.length > 0) {
      console.log('⚠️  Failed touch targets:', failedTargets.slice(0, 5)); // Show first 5
      throw new Error(`${failedTargets.length} touch targets below 44px minimum`);
    }
    
    results.passed++;
    results.tests.push({
      name: 'Touch Target Compliance',
      status: 'PASSED',
      details: `All ${touchTargets.length} interactive elements meet 44px minimum`
    });
    
    console.log(`✅ Touch Target Compliance - PASSED (${touchTargets.length} targets checked)`);
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Touch Target Compliance',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ Touch Target Compliance - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

async function testMobileFooter(browser, results) {
  console.log('📱 Testing: Mobile Footer Implementation...');
  
  const page = await browser.newPage();
  await page.setViewport(MOBILE_VIEWPORT);
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check for minimal mobile footer
    const mobileFooter = await page.$('footer[class*="md:hidden"]');
    if (!mobileFooter) {
      throw new Error('Mobile footer not found');
    }
    
    // Verify desktop footer is hidden on mobile
    const desktopFooter = await page.$('footer[class*="hidden md:block"]');
    if (!desktopFooter) {
      throw new Error('Desktop footer should be hidden on mobile');
    }
    
    // Check mobile footer is minimal
    const footerHeight = await page.evaluate(() => {
      const footer = document.querySelector('footer[class*="md:hidden"]');
      return footer ? footer.offsetHeight : 0;
    });
    
    if (footerHeight > 100) {
      throw new Error(`Mobile footer too tall: ${footerHeight}px`);
    }
    
    results.passed++;
    results.tests.push({
      name: 'Mobile Footer Implementation',
      status: 'PASSED',
      details: `Mobile footer: ${footerHeight}px height, Desktop footer hidden on mobile`
    });
    
    console.log('✅ Mobile Footer Implementation - PASSED');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Mobile Footer Implementation',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ Mobile Footer Implementation - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

async function testPWAManifest(browser, results) {
  console.log('📱 Testing: PWA Manifest...');
  
  const page = await browser.newPage();
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check for manifest link
    const manifestLink = await page.$('link[rel="manifest"]');
    if (!manifestLink) {
      throw new Error('PWA manifest link not found');
    }
    
    // Get manifest URL
    const manifestHref = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.href : null;
    });
    
    if (!manifestHref) {
      throw new Error('Manifest href not found');
    }
    
    // Test manifest accessibility
    const manifestResponse = await page.goto(manifestHref);
    if (!manifestResponse.ok()) {
      throw new Error(`Manifest not accessible: ${manifestResponse.status()}`);
    }
    
    const manifest = await manifestResponse.json();
    
    // Verify key manifest properties
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        throw new Error(`Missing required manifest field: ${field}`);
      }
    }
    
    // Verify eKaty branding
    if (!manifest.name.includes('eKaty')) {
      throw new Error('Manifest name does not include eKaty branding');
    }
    
    results.passed++;
    results.tests.push({
      name: 'PWA Manifest',
      status: 'PASSED',
      details: `Manifest accessible with ${manifest.icons ? manifest.icons.length : 0} icons`
    });
    
    console.log('✅ PWA Manifest - PASSED');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'PWA Manifest',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ PWA Manifest - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

async function testSafeAreaSupport(browser, results) {
  console.log('📱 Testing: Safe Area Support...');
  
  const page = await browser.newPage();
  await page.setViewport(MOBILE_VIEWPORT);
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check for safe area CSS classes
    const hasSafeArea = await page.evaluate(() => {
      // Check for safe area utilities in the HTML
      const html = document.documentElement.outerHTML;
      return html.includes('safe-') || html.includes('pb-safe-bottom');
    });
    
    if (!hasSafeArea) {
      throw new Error('Safe area support classes not found');
    }
    
    // Check viewport meta tag
    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.content : null;
    });
    
    if (!viewportMeta || !viewportMeta.includes('viewport-fit=cover')) {
      throw new Error('Viewport meta tag missing viewport-fit=cover');
    }
    
    results.passed++;
    results.tests.push({
      name: 'Safe Area Support',
      status: 'PASSED',
      details: 'Safe area classes and viewport-fit=cover detected'
    });
    
    console.log('✅ Safe Area Support - PASSED');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Safe Area Support',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ Safe Area Support - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

async function testResponsiveBreakpoints(browser, results) {
  console.log('📱 Testing: Responsive Breakpoints...');
  
  const page = await browser.newPage();
  
  try {
    const breakpoints = [
      { name: 'Mobile', width: 390, height: 844 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];
    
    for (const bp of breakpoints) {
      await page.setViewport({ width: bp.width, height: bp.height });
      await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Check layout doesn't break
      const bodyOverflow = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflowX;
      });
      
      if (bodyOverflow === 'scroll') {
        throw new Error(`Horizontal scroll detected at ${bp.name} breakpoint`);
      }
      
      // Take screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `breakpoint-${bp.name.toLowerCase()}.png`),
        fullPage: false
      });
    }
    
    results.passed++;
    results.tests.push({
      name: 'Responsive Breakpoints',
      status: 'PASSED',
      details: 'All breakpoints render without horizontal scroll'
    });
    
    console.log('✅ Responsive Breakpoints - PASSED');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Responsive Breakpoints',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ Responsive Breakpoints - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

async function testMobileTypography(browser, results) {
  console.log('📝 Testing: Mobile Typography Scaling...');
  
  const page = await browser.newPage();
  await page.setViewport(MOBILE_VIEWPORT);
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check h1 sizes are mobile-first
    const headingSizes = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      
      return {
        h1: h1 ? window.getComputedStyle(h1).fontSize : null,
        h2: h2 ? window.getComputedStyle(h2).fontSize : null
      };
    });
    
    if (!headingSizes.h1) {
      throw new Error('H1 element not found');
    }
    
    // Parse font size (remove 'px')
    const h1Size = parseFloat(headingSizes.h1);
    
    // Mobile h1 should be reasonable size (not too large)
    if (h1Size < 20 || h1Size > 40) {
      throw new Error(`Mobile H1 size ${h1Size}px not optimized for mobile`);
    }
    
    results.passed++;
    results.tests.push({
      name: 'Mobile Typography Scaling',
      status: 'PASSED',
      details: `H1: ${headingSizes.h1}, H2: ${headingSizes.h2}`
    });
    
    console.log('✅ Mobile Typography Scaling - PASSED');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Mobile Typography Scaling',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ Mobile Typography Scaling - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

async function testCategoryChips(browser, results) {
  console.log('🏷️ Testing: Category Chips Touch Optimization...');
  
  const page = await browser.newPage();
  await page.setViewport(MOBILE_VIEWPORT);
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Find category chips
    const categoryChips = await page.$$('button[class*="rounded-full"]');
    
    if (categoryChips.length === 0) {
      throw new Error('Category chips not found');
    }
    
    // Test first category chip for proper sizing
    const chipSize = await categoryChips[0].evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    
    if (chipSize.height < 44) {
      throw new Error(`Category chip height ${chipSize.height}px below minimum`);
    }
    
    // Test click functionality
    await categoryChips[0].click();
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {
      // Navigation might not happen if it's a client-side route
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Should navigate to discover page
    const currentUrl = page.url();
    if (!currentUrl.includes('/discover')) {
      throw new Error('Category chip click did not navigate correctly');
    }
    
    results.passed++;
    results.tests.push({
      name: 'Category Chips Touch Optimization',
      status: 'PASSED',
      details: `${categoryChips.length} chips found, touch targets compliant`
    });
    
    console.log('✅ Category Chips Touch Optimization - PASSED');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Category Chips Touch Optimization',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ Category Chips Touch Optimization - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

async function testHeroMobile(browser, results) {
  console.log('🎯 Testing: Hero Section Mobile Optimization...');
  
  const page = await browser.newPage();
  await page.setViewport(MOBILE_VIEWPORT);
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check search input sizing
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (!searchInput) {
      throw new Error('Search input not found');
    }
    
    const inputSize = await searchInput.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        width: rect.width,
        height: rect.height,
        minHeight: style.minHeight
      };
    });
    
    if (inputSize.height < 44) {
      throw new Error(`Search input height ${inputSize.height}px below minimum`);
    }
    
    // Check CTA buttons
    const ctaButtons = await page.$$('button[class*="btn-"]');
    if (ctaButtons.length < 2) {
      throw new Error('CTA buttons not found');
    }
    
    // Test button sizing
    for (let i = 0; i < Math.min(2, ctaButtons.length); i++) {
      const buttonSize = await ctaButtons[i].evaluate(el => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      
      if (buttonSize.height < 44) {
        throw new Error(`CTA button ${i} height ${buttonSize.height}px below minimum`);
      }
    }
    
    results.passed++;
    results.tests.push({
      name: 'Hero Section Mobile Optimization',
      status: 'PASSED',
      details: `Search input and CTA buttons properly sized for mobile`
    });
    
    console.log('✅ Hero Section Mobile Optimization - PASSED');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Hero Section Mobile Optimization',
      status: 'FAILED',
      error: error.message
    });
    console.log('❌ Hero Section Mobile Optimization - FAILED:', error.message);
  } finally {
    await page.close();
  }
}

function generateReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(SCREENSHOT_DIR, `mobile-first-report-${timestamp}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    site: SITE_URL,
    summary: {
      total: results.passed + results.failed,
      passed: results.passed,
      failed: results.failed,
      passRate: `${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`
    },
    tests: results.tests
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n🎉 MOBILE-FIRST DEPLOYMENT VERIFICATION COMPLETE!');
  console.log('=====================================');
  console.log(`📊 Total Tests: ${report.summary.total}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`📈 Pass Rate: ${report.summary.passRate}`);
  console.log(`📄 Report: ${reportPath}`);
  console.log(`📸 Screenshots: ${SCREENSHOT_DIR}`);
  
  if (results.failed > 0) {
    console.log('\n⚠️  Failed Tests:');
    results.tests.filter(t => t.status === 'FAILED').forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
  }
  
  return report;
}

// Run if called directly
if (require.main === module) {
  verifyMobileFirstDeployment()
    .then((results) => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyMobileFirstDeployment };