import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ekaty.fly.dev';

test.describe('Categories Page', () => {
  test('should load categories page successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/categories`);
    
    // Check page title and header
    await expect(page.locator('h1')).toContainText('Browse by Category');
    await expect(page.locator('text=Explore Katy\'s diverse culinary landscape')).toBeVisible();
  });

  test('should display all 16 category cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/categories`);
    
    // Wait for categories to load
    await page.waitForSelector('a[href^="/categories/"]');
    
    // Count category cards
    const categoryCards = page.locator('a[href^="/categories/"]');
    await expect(categoryCards).toHaveCount(16);
  });

  test('should show restaurant counts for categories', async ({ page }) => {
    await page.goto(`${BASE_URL}/categories`);
    
    // Wait for counts to load
    await page.waitForTimeout(2000);
    
    // Check that at least some categories have counts
    const countBadges = page.locator('.bg-primary-100');
    const count = await countBadges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to BBQ category page', async ({ page }) => {
    await page.goto(`${BASE_URL}/categories`);
    
    // Click on BBQ category
    await page.click('a[href="/categories/bbq"]');
    
    // Verify URL changed
    await expect(page).toHaveURL(`${BASE_URL}/categories/bbq`);
    
    // Verify breadcrumbs
    await expect(page.locator('nav')).toContainText('Home');
    await expect(page.locator('nav')).toContainText('Categories');
    await expect(page.locator('nav')).toContainText('BBQ');
    
    // Verify header
    await expect(page.locator('h1')).toContainText('BBQ Restaurants in Katy');
  });
});

test.describe('BBQ Category Page', () => {
  test('should display BBQ restaurants', async ({ page }) => {
    await page.goto(`${BASE_URL}/categories/bbq`);
    
    // Wait for restaurants to load
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });
    
    // Check that restaurants are displayed
    const restaurantCards = page.locator('[class*="RestaurantCard"], article, [class*="restaurant"]');
    const count = await restaurantCards.count();
    
    // Should have at least 5 BBQ restaurants based on API response
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('should show BBQ restaurant names', async ({ page }) => {
    await page.goto(`${BASE_URL}/categories/bbq`);
    
    await page.waitForTimeout(2000);
    
    // Check for known BBQ restaurants
    const pageContent = await page.content();
    const hasBBQRestaurants = 
      pageContent.includes('BBQ') || 
      pageContent.includes('Midway') ||
      pageContent.includes('Dozier');
    
    expect(hasBBQRestaurants).toBeTruthy();
  });

  test('breadcrumb links should work', async ({ page }) => {
    await page.goto(`${BASE_URL}/categories/bbq`);
    
    // Click on "Categories" in breadcrumb
    await page.click('nav a[href="/categories"]');
    
    // Should navigate back to categories page
    await expect(page).toHaveURL(`${BASE_URL}/categories`);
    await expect(page.locator('h1')).toContainText('Browse by Category');
  });

  test('home breadcrumb link should work', async ({ page }) => {
    await page.goto(`${BASE_URL}/categories/bbq`);
    
    // Click on "Home" in breadcrumb
    await page.click('nav a[href="/"]');
    
    // Should navigate to home page
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });
});

test.describe('API Endpoints', () => {
  test('should return BBQ restaurants from API', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/restaurants?category=BBQ&limit=10`);
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.restaurants).toBeDefined();
    expect(Array.isArray(data.restaurants)).toBeTruthy();
    expect(data.restaurants.length).toBeGreaterThan(0);
    
    // Verify pagination
    expect(data.pagination).toBeDefined();
    expect(data.pagination.total).toBeGreaterThan(0);
  });

  test('should return correct restaurant data structure', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/restaurants?category=BBQ&limit=1`);
    const data = await response.json();
    
    if (data.restaurants.length > 0) {
      const restaurant = data.restaurants[0];
      
      // Check required fields
      expect(restaurant.id).toBeDefined();
      expect(restaurant.name).toBeDefined();
      expect(restaurant.slug).toBeDefined();
      expect(restaurant.address).toBeDefined();
      expect(restaurant.cuisineTypes).toBeDefined();
      
      // Verify BBQ is in cuisineTypes
      expect(restaurant.cuisineTypes).toContain('BBQ');
    }
  });

  test('should handle category counts correctly', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/restaurants?category=BBQ&limit=1`);
    const data = await response.json();
    
    expect(data.pagination.total).toBeGreaterThanOrEqual(5);
  });
});

test.describe('Multiple Categories', () => {
  const categories = [
    { name: 'Mexican', slug: 'mexican' },
    { name: 'American', slug: 'american' },
    { name: 'Italian', slug: 'italian' },
    { name: 'Asian', slug: 'asian' }
  ];

  for (const category of categories) {
    test(`should load ${category.name} category page`, async ({ page }) => {
      await page.goto(`${BASE_URL}/categories/${category.slug}`);
      
      // Verify page loads
      await expect(page.locator('h1')).toContainText(`${category.name} Restaurants in Katy`);
      
      // Verify breadcrumbs
      await expect(page.locator('nav')).toContainText(category.name);
    });
  }
});

test.describe('Error Handling', () => {
  test('should handle invalid category gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/categories/nonexistent-category`);
    
    // Should show "Category not found" or similar message
    const content = await page.content();
    expect(content.includes('not found') || content.includes('Category not found')).toBeTruthy();
  });
});
