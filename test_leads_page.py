from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Test the monetization leads page
    try:
        response = page.goto('https://ekaty.fly.dev/admin/monetization/leads')
        print(f"Status code: {response.status}")
        print(f"URL: {response.url}")

        page.wait_for_load_state('networkidle')

        # Take screenshot
        page.screenshot(path='leads_page_screenshot.png', full_page=True)
        print("Screenshot saved as leads_page_screenshot.png")

        # Get page content
        content = page.content()
        print(f"\nPage title: {page.title()}")

        # Check if it's a 404
        if response.status == 404:
            print("\n❌ 404 ERROR CONFIRMED")
            print("The /admin/monetization/leads page does not exist")
        else:
            print(f"\n✅ Page loaded successfully with status {response.status}")

    except Exception as e:
        print(f"Error: {e}")

    browser.close()
