<?php
// VERSION: Claude 3.5 Sonnet - Updated Nov 10, 2025 8:14pm
session_start();

// Simple authentication check - check both session variable names for compatibility
$is_logged_in = isset($_SESSION['admin_logged_in']) || 
                (isset($_SESSION['adminloggedin']) && $_SESSION['adminloggedin'] === 'Yes') ||
                isset($_GET['admin_key']);

if (!$is_logged_in) {
    header('Location: index.php');
    exit;
}

// Admin key authentication (for direct access)
if (isset($_GET['admin_key']) && $_GET['admin_key'] === 'strickland2024') {
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['adminloggedin'] = 'Yes'; // Set both for compatibility
}

require_once '../dbconnect.php';
require_once '../blog_functions_complete.php';

// Load .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        return false;
    }
    
    $content = file_get_contents($path);
    $lines = explode("\n", $content);
    
    foreach ($lines as $line) {
        $line = trim($line);
        
        // Skip empty lines and comments
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        
        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            $value = trim($value, '"\'');
            
            // Remove any trailing whitespace or newlines
            $value = rtrim($value);
            
            // Set as environment variable
            if (!empty($key) && !empty($value)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
    return true;
}

// Load environment variables - prioritize admin folder
if (!loadEnv(__DIR__ . '/.env')) {
    loadEnv(__DIR__ . '/../.env'); // Fallback to parent
}

// Handle form submissions
$message = '';
$message_type = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'quick_generate':
            $title = trim($_POST['title'] ?? '');
            
            if (!$title) {
                $message = 'Title is required for quick generation.';
                $message_type = 'error';
            } else {
                // Auto-generate everything from title
                $generated_article = generateArticleFromTitle($title);
                
                if ($generated_article['success']) {
                    // Auto-publish directly to database
                    try {
                        $slug = slugify($generated_article['title']);
                        
                        // Fix any broken links before saving
                        $cleaned_content = fixBrokenLinksInContent($generated_article['content']);
                        
                        $stmt = $pdo->prepare("
                            INSERT INTO blog_articles 
                            (title, content, keywords, meta_description, author_name, contact_email, phone_number, published_date) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                        ");
                        $stmt->execute([
                            $generated_article['title'],
                            $cleaned_content,
                            $generated_article['keywords'],
                            $generated_article['meta_description'],
                            'James Strickland',
                            'james@stricklandtechnology.net',
                            '713-444-6732'
                        ]);
                        
                        $message = '✅ Article generated and published successfully! View it on your blog.';
                        $message_type = 'success';
                    } catch (PDOException $e) {
                        $message = 'Article generated but failed to publish: ' . $e->getMessage();
                        $message_type = 'error';
                    }
                } else {
                    $message = 'Error generating article: ' . $generated_article['error'];
                    $message_type = 'error';
                }
            }
            break;
            
        case 'create':
            $title = trim($_POST['title'] ?? '');
            $content = trim($_POST['content'] ?? '');
            $keywords = trim($_POST['keywords'] ?? '');
            $meta_description = trim($_POST['meta_description'] ?? '');
            $author_name = trim($_POST['author_name'] ?? 'James Strickland');
            $contact_email = trim($_POST['contact_email'] ?? 'james@stricklandtechnology.net');
            $phone_number = trim($_POST['phone_number'] ?? '713-444-6732');
            
            if ($title && $content) {
                try {
                    $stmt = $pdo->prepare("
                        INSERT INTO blog_articles 
                        (title, content, keywords, meta_description, author_name, contact_email, phone_number, published_date) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                    ");
                    $stmt->execute([$title, $content, $keywords, $meta_description, $author_name, $contact_email, $phone_number]);
                    $message = 'Article created successfully!';
                    $message_type = 'success';
                } catch (PDOException $e) {
                    $message = 'Error creating article: ' . $e->getMessage();
                    $message_type = 'error';
                }
            } else {
                $message = 'Title and content are required.';
                $message_type = 'error';
            }
            break;
            
        case 'update':
            $id = intval($_POST['id'] ?? 0);
            $title = trim($_POST['title'] ?? '');
            $content = trim($_POST['content'] ?? '');
            $keywords = trim($_POST['keywords'] ?? '');
            $meta_description = trim($_POST['meta_description'] ?? '');
            $author_name = trim($_POST['author_name'] ?? 'James Strickland');
            $contact_email = trim($_POST['contact_email'] ?? 'james@stricklandtechnology.net');
            $phone_number = trim($_POST['phone_number'] ?? '713-444-6732');
            
            if ($id && $title && $content) {
                try {
                    $stmt = $pdo->prepare("
                        UPDATE blog_articles 
                        SET title = ?, content = ?, keywords = ?, meta_description = ?, 
                            author_name = ?, contact_email = ?, phone_number = ?
                        WHERE id = ?
                    ");
                    $stmt->execute([$title, $content, $keywords, $meta_description, $author_name, $contact_email, $phone_number, $id]);
                    $message = 'Article updated successfully!';
                    $message_type = 'success';
                } catch (PDOException $e) {
                    $message = 'Error updating article: ' . $e->getMessage();
                    $message_type = 'error';
                }
            } else {
                $message = 'ID, title and content are required.';
                $message_type = 'error';
            }
            break;
            
        case 'delete':
            $id = intval($_POST['id'] ?? 0);
            if ($id) {
                try {
                    $stmt = $pdo->prepare("DELETE FROM blog_articles WHERE id = ?");
                    $stmt->execute([$id]);
                    $message = 'Article deleted successfully!';
                    $message_type = 'success';
                } catch (PDOException $e) {
                    $message = 'Error deleting article: ' . $e->getMessage();
                    $message_type = 'error';
                }
            }
            break;
    }
}

// AI Article Generation Function
function generateArticleWithAI($topic, $keywords, $tone, $length, $include_seo) {
    // Get API key from environment variables (with fallback)
    $api_key = $_ENV['ANTHROPIC_API_KEY'] ?? $_SERVER['ANTHROPIC_API_KEY'] ?? getenv('ANTHROPIC_API_KEY') ?? '';
    
    // If still empty, try reading directly from .env file as fallback
    if (empty($api_key)) {
        $env_files = [__DIR__ . '/.env', __DIR__ . '/../.env'];
        foreach ($env_files as $env_file) {
            if (file_exists($env_file)) {
                $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line) || strpos($line, '#') === 0) {
                        continue;
                    }
                    if (strpos($line, 'ANTHROPIC_API_KEY=') === 0) {
                        $api_key = trim(substr($line, strlen('ANTHROPIC_API_KEY=')));
                        break 2; // Break out of both loops
                    }
                }
            }
        }
    }
    
    // Trim whitespace and newlines
    $api_key = trim($api_key);
    
    if (!$api_key) {
        $env_file = file_exists(__DIR__ . '/.env') ? __DIR__ . '/.env' : __DIR__ . '/../.env';
        return [
            'success' => false,
            'error' => 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY=your-key-here to your .env file. ' .
                       'Expected location: ' . $env_file . ' | Get your key from https://console.anthropic.com/'
        ];
    }
    
    // Validate API key format (should start with sk-ant-)
    if (strpos($api_key, 'sk-ant-') !== 0) {
        return [
            'success' => false,
            'error' => 'Invalid API key format. Anthropic API keys should start with "sk-ant-". ' .
                       'Please check your ANTHROPIC_API_KEY in the .env file. Current key starts with: ' . substr($api_key, 0, 10)
        ];
    }
    
    // Determine word count based on length
    $word_counts = [
        'short' => '500-700',
        'medium' => '1000-1500',
        'long' => '2000-2500'
    ];
    $word_count = $word_counts[$length] ?? '1000-1500';
    
    // Build the system prompt with enhanced credibility focus
    $system_prompt = "You are an expert technology journalist and content strategist writing for Strickland Technology, led by James Strickland, a Houston-based web design and digital marketing innovator. ";
    $system_prompt .= "Your articles are research-driven, citing industry best practices, recent technology developments, and credible sources. ";
    $system_prompt .= "You position James Strickland and Strickland Technology as thought leaders who implement cutting-edge solutions. ";
    $system_prompt .= "Your writing is authoritative, data-backed, and showcases how Strickland Technology stays ahead of industry trends. ";
    $system_prompt .= "Always reference current technology news, industry statistics, and expert insights to build credibility.";
    
    // Build the user prompt with news and research focus
    $user_prompt = "Write a comprehensive, research-driven blog article about: {$topic}\n\n";
    $user_prompt .= "CRITICAL REQUIREMENTS:\n";
    $user_prompt .= "- Tone: {$tone}\n";
    $user_prompt .= "- Length: {$word_count} words\n";
    $user_prompt .= "- Reference recent industry news, trends, and developments (2025)\n";
    $user_prompt .= "- Include statistics, data points, and expert insights where relevant\n";
    $user_prompt .= "- Use interview-style citations: 'According to [Source/Expert], ...' or 'As [Company] notes in their 2025 report, ...'\n";
    $user_prompt .= "- Cite best practices from industry leaders (Google, Microsoft, Adobe, Meta, Amazon, etc.)\n";
    $user_prompt .= "- Position James Strickland and Strickland Technology as implementing these innovations\n";
    $user_prompt .= "- Show how Strickland Technology's approach aligns with or exceeds industry standards\n";
    
    if ($keywords) {
        $user_prompt .= "- Target keywords: {$keywords}\n";
    }
    
    if ($include_seo) {
        $user_prompt .= "- Include SEO best practices: use keywords naturally, optimize for featured snippets\n";
        $user_prompt .= "- Emphasize Houston market leadership and local expertise\n";
        $user_prompt .= "- Highlight James Strickland's technical expertise and forward-thinking approach\n";
        $user_prompt .= "- Add internal linking opportunities (use placeholder links like '/services/web-design')\n";
        $user_prompt .= "- Include a section on 'How Strickland Technology Implements This' or similar\n";
    }
    
    $user_prompt .= "\nCONTENT STRUCTURE:\n";
    $user_prompt .= "1. Opening Hook: Start with a recent industry development or statistic\n";
    $user_prompt .= "2. Industry Context: Reference current trends and expert opinions\n";
    $user_prompt .= "3. Best Practices: Cite industry standards and recommendations\n";
    $user_prompt .= "4. Strickland Technology's Approach: Show how James Strickland implements these practices\n";
    $user_prompt .= "5. Real-World Impact: Include data, case study insights, or measurable benefits\n";
    $user_prompt .= "6. Future Outlook: Discuss upcoming trends and how Strickland Technology is prepared\n";
    $user_prompt .= "7. Call-to-Action: Invite readers to experience Strickland Technology's expertise\n";
    
    $user_prompt .= "\nHTML FORMATTING:\n";
    $user_prompt .= "- Use <h2> and <h3> tags for section headings\n";
    $user_prompt .= "- Use <p> tags for paragraphs\n";
    $user_prompt .= "- Use <ul> or <ol> with <li> for lists\n";
    $user_prompt .= "- Use <strong> and <em> for emphasis\n";
    $user_prompt .= "- Use <blockquote> for statistics or expert quotes\n";
    $user_prompt .= "- CITATION EXAMPLES: 'According to Google's 2025 Web Vitals Report, ...' or 'As Microsoft Azure's recent analysis shows, ...' or 'Meta's engineering team notes that...'\n";
    $user_prompt .= "- Make citations feel natural and conversational, as if quoting from interviews or recent publications\n";
    $user_prompt .= "- Include a compelling introduction that hooks the reader immediately\n";
    $user_prompt .= "- End with a strong call-to-action highlighting James Strickland's expertise\n";
    $user_prompt .= "\nDo NOT include <!DOCTYPE>, <html>, <head>, or <body> tags. Only return the article content HTML.\n";
    
    $user_prompt .= "\nPROVIDE IN JSON FORMAT:\n";
    $user_prompt .= "1. title: A compelling, SEO-optimized title (60 characters or less) that includes credibility markers\n";
    $user_prompt .= "2. content: The full HTML article following the structure above\n";
    $user_prompt .= "3. meta_description: 150-160 characters highlighting expertise and value\n";
    $user_prompt .= "4. keywords: 5-8 relevant keywords including 'James Strickland', 'Houston', and topic-specific terms\n";
    $user_prompt .= "\nFormat your response as JSON with keys: title, content, meta_description, keywords";
    $user_prompt .= "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just the raw JSON object.";
    
    // Prepare API request for Claude
    // Using claude-sonnet-4-20250514 (Claude Sonnet 4) - the current recommended model
    // Old models claude-3-5-sonnet-20240620 and claude-3-5-sonnet-20241022 were deprecated Oct 22, 2025
    $data = [
        'model' => 'claude-sonnet-4-20250514',
        'max_tokens' => 4000,
        'temperature' => 0.7,
        'system' => $system_prompt,
        'messages' => [
            [
                'role' => 'user',
                'content' => $user_prompt
            ]
        ]
    ];
    
    // Make API call to Claude
    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    // Ensure API key is trimmed before sending
    $api_key_clean = trim($api_key);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $api_key_clean,
        'anthropic-version: 2023-06-01'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    if ($curl_error) {
        return ['success' => false, 'error' => 'Network error: ' . $curl_error];
    }
    
    if ($http_code !== 200) {
        $error_data = json_decode($response, true);
        $error_message = $error_data['error']['message'] ?? 'API request failed with code ' . $http_code;
        $error_type = $error_data['error']['type'] ?? 'unknown';
        
        // Log the actual error for debugging (remove in production)
        $key_for_log = isset($api_key_clean) ? $api_key_clean : (isset($api_key) ? $api_key : 'not set');
        error_log("Anthropic API Error - HTTP Code: $http_code, Type: $error_type, Message: $error_message");
        error_log("API Key used (first 20 chars): " . substr($key_for_log, 0, 20) . "...");
        error_log("Model used: " . ($data['model'] ?? 'not set'));
        
        // Check for model-related errors
        if (strpos(strtolower($error_message), 'model') !== false || 
            strpos(strtolower($error_type), 'invalid_request_error') !== false ||
            strpos(strtolower($error_message), 'not found') !== false ||
            strpos(strtolower($error_message), 'deprecated') !== false) {
            $error_message = 'Model error: ' . $error_message . ' | ' .
                           'Current model: ' . ($data['model'] ?? 'not set') . ' | ' .
                           'Please check Anthropic API documentation for available models: https://docs.anthropic.com/en/api/messages';
        }
        // Check for authentication errors
        else if (strpos(strtolower($error_message), 'invalid') !== false || 
                 strpos(strtolower($error_type), 'authentication') !== false ||
                 strpos(strtolower($error_type), 'invalid') !== false) {
            $error_message = 'Invalid API key. Please check your ANTHROPIC_API_KEY in the .env file. ' . 
                           'Get a valid key from https://console.anthropic.com/ | ' .
                           'Actual error: ' . $error_message;
        }
        
        return ['success' => false, 'error' => $error_message];
    }
    
    $result = json_decode($response, true);
    
    // Claude's response format
    if (!isset($result['content'][0]['text'])) {
        return ['success' => false, 'error' => 'Invalid API response format'];
    }
    
    $content_text = $result['content'][0]['text'];
    $article_data = json_decode($content_text, true);
    
    if (!$article_data || !isset($article_data['title']) || !isset($article_data['content'])) {
        return ['success' => false, 'error' => 'Failed to parse article data from AI response'];
    }
    
    return [
        'success' => true,
        'title' => $article_data['title'] ?? 'Untitled Article',
        'content' => $article_data['content'] ?? '',
        'meta_description' => $article_data['meta_description'] ?? '',
        'keywords' => $article_data['keywords'] ?? ''
    ];
}

// Fix broken links in content - replace placeholder/invalid links with actual pages
function fixBrokenLinksInContent($content) {
    // Define valid internal links mapping
    $link_replacements = [
        // Services - various formats to actual pages
        '/services/web-design' => 'website_design.php',
        '/web-design' => 'website_design.php',
        '/website-design' => 'website_design.php',
        'web-design' => 'website_design.php',
        'website-design' => 'website_design.php',
        
        '/services/seo' => 'search_engine_optimization.php',
        '/seo' => 'search_engine_optimization.php',
        'seo' => 'search_engine_optimization.php',
        
        '/services/internet-marketing' => 'internet_marketing.php',
        '/internet-marketing' => 'internet_marketing.php',
        '/marketing' => 'internet_marketing.php',
        'internet-marketing' => 'internet_marketing.php',
        'marketing' => 'internet_marketing.php',
        
        '/services/web-applications' => 'internet_applications.php',
        '/web-applications' => 'internet_applications.php',
        '/applications' => 'internet_applications.php',
        'web-applications' => 'internet_applications.php',
        'applications' => 'internet_applications.php',
        
        '/services/ai-consulting' => 'ai_consulting.php',
        '/ai-consulting' => 'ai_consulting.php',
        'ai-consulting' => 'ai_consulting.php',
        
        // Pages
        '/contact' => 'contact.php',
        'contact' => 'contact.php',
        '/portfolio' => 'portfolio.php',
        'portfolio' => 'portfolio.php',
        '/blog' => 'blog.php',
        'blog' => 'blog.php',
    ];
    
    // Fix href links
    foreach ($link_replacements as $broken => $fixed) {
        // Match various link formats
        $patterns = [
            '/href=["\']' . preg_quote($broken, '/') . '["\']/',
            '/href=["\']' . preg_quote($broken, '/') . '\/["\']/',
        ];
        
        foreach ($patterns as $pattern) {
            $content = preg_replace($pattern, 'href="' . $fixed . '"', $content);
        }
    }
    
    // Fix any remaining placeholder links
    $content = preg_replace('/href=["\']\#["\']/i', 'href="contact.php"', $content);
    $content = preg_replace('/href=["\']\/["\']/i', 'href="index.php"', $content);
    
    return $content;
}

// Quick Generate: Create complete article from title only
function generateArticleFromTitle($title) {
    // Get API key from environment variables (with fallback)
    $api_key = $_ENV['ANTHROPIC_API_KEY'] ?? $_SERVER['ANTHROPIC_API_KEY'] ?? getenv('ANTHROPIC_API_KEY') ?? '';
    
    // If still empty, try reading directly from .env file as fallback
    if (empty($api_key)) {
        $env_files = [__DIR__ . '/.env', __DIR__ . '/../.env'];
        foreach ($env_files as $env_file) {
            if (file_exists($env_file)) {
                $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line) || strpos($line, '#') === 0) {
                        continue;
                    }
                    if (strpos($line, 'ANTHROPIC_API_KEY=') === 0) {
                        $api_key = trim(substr($line, strlen('ANTHROPIC_API_KEY=')));
                        break 2; // Break out of both loops
                    }
                }
            }
        }
    }
    
    // Trim whitespace and newlines
    $api_key = trim($api_key);
    
    // Debug: Log key loading (remove in production)
    if (empty($api_key)) {
        error_log("DEBUG: API key not found in \$_ENV, \$_SERVER, getenv(), or .env files");
        error_log("DEBUG: \$_ENV['ANTHROPIC_API_KEY'] = " . ($_ENV['ANTHROPIC_API_KEY'] ?? 'NOT SET'));
        error_log("DEBUG: \$_SERVER['ANTHROPIC_API_KEY'] = " . ($_SERVER['ANTHROPIC_API_KEY'] ?? 'NOT SET'));
    } else {
        error_log("DEBUG: API key loaded successfully, length: " . strlen($api_key) . ", starts with: " . substr($api_key, 0, 10));
    }
    
    if (!$api_key) {
        $env_file = file_exists(__DIR__ . '/.env') ? __DIR__ . '/.env' : __DIR__ . '/../.env';
        $env_exists = file_exists($env_file) ? 'exists' : 'does not exist';
        return [
            'success' => false,
            'error' => 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY=your-key-here to your .env file. ' .
                       'Expected location: ' . $env_file . ' (file ' . $env_exists . ') | Get your key from https://console.anthropic.com/'
        ];
    }
    
    // Validate API key format (should start with sk-ant-)
    if (strpos($api_key, 'sk-ant-') !== 0) {
        return [
            'success' => false,
            'error' => 'Invalid API key format. Anthropic API keys should start with "sk-ant-". ' .
                       'Please check your ANTHROPIC_API_KEY in the .env file. Current key starts with: ' . substr($api_key, 0, 10)
        ];
    }
    
    // Enhanced system prompt for title-only generation
    $system_prompt = "You are an expert technology journalist and content strategist writing for Strickland Technology, led by James Strickland, a Houston-based web design and digital marketing innovator. ";
    $system_prompt .= "Your articles are research-driven, citing industry best practices, recent technology developments, and credible sources. ";
    $system_prompt .= "You position James Strickland and Strickland Technology as thought leaders who implement cutting-edge solutions. ";
    $system_prompt .= "Your writing is authoritative, data-backed, and showcases how Strickland Technology stays ahead of industry trends.";
    
    // Build comprehensive prompt from title
    $user_prompt = "Based on this article title: \"{$title}\"\n\n";
    $user_prompt .= "Create a complete, professional blog article (1200-1500 words) that:\n\n";
    
    $user_prompt .= "CONTENT REQUIREMENTS:\n";
    $user_prompt .= "- Research and reference recent industry news, trends, and developments (2025)\n";
    $user_prompt .= "- Include relevant statistics, data points, and expert insights\n";
    $user_prompt .= "- Use interview-style citations: 'According to [Source/Expert], ...' or 'As [Company] notes in their 2025 report, ...'\n";
    $user_prompt .= "- Cite best practices from industry leaders (Google, Microsoft, Adobe, Meta, Amazon, etc.)\n";
    $user_prompt .= "- Position James Strickland and Strickland Technology as implementing these innovations\n";
    $user_prompt .= "- Show how Strickland Technology's approach aligns with or exceeds industry standards\n";
    $user_prompt .= "- Emphasize Houston market leadership and local expertise\n";
    $user_prompt .= "- Include 2-3 internal links using ONLY these exact URLs:\n";
    $user_prompt .= "  * website_design.php (for web design topics)\n";
    $user_prompt .= "  * search_engine_optimization.php (for SEO topics)\n";
    $user_prompt .= "  * internet_marketing.php (for marketing topics)\n";
    $user_prompt .= "  * internet_applications.php (for web apps/development)\n";
    $user_prompt .= "  * ai_consulting.php (for AI/consulting topics)\n";
    $user_prompt .= "  * contact.php (for CTAs)\n";
    $user_prompt .= "  * blog.php (for other articles)\n";
    
    $user_prompt .= "\nARTICLE STRUCTURE:\n";
    $user_prompt .= "1. Opening Hook: Start with a recent industry development or compelling statistic\n";
    $user_prompt .= "2. Industry Context: Reference current trends and expert opinions\n";
    $user_prompt .= "3. Best Practices: Cite industry standards and recommendations\n";
    $user_prompt .= "4. Strickland Technology's Approach: Show how James Strickland implements these practices\n";
    $user_prompt .= "5. Real-World Impact: Include data, case study insights, or measurable benefits\n";
    $user_prompt .= "6. Future Outlook: Discuss upcoming trends and how Strickland Technology is prepared\n";
    $user_prompt .= "7. Call-to-Action: Invite readers to experience Strickland Technology's expertise\n";
    
    $user_prompt .= "\nHTML FORMATTING:\n";
    $user_prompt .= "- Use <h2> and <h3> tags for section headings\n";
    $user_prompt .= "- Use <p> tags for paragraphs\n";
    $user_prompt .= "- Use <ul> or <ol> with <li> for lists\n";
    $user_prompt .= "- Use <strong> and <em> for emphasis\n";
    $user_prompt .= "- Use <blockquote> for statistics or expert quotes\n";
    $user_prompt .= "- CITATION EXAMPLES: 'According to Google's 2025 Web Vitals Report, ...' or 'As Microsoft Azure's recent analysis shows, ...' or 'Meta's engineering team notes that...'\n";
    $user_prompt .= "- Make citations feel natural and conversational, as if quoting from interviews or recent publications\n";
    $user_prompt .= "- Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags\n";
    
    $user_prompt .= "\nPROVIDE IN JSON FORMAT:\n";
    $user_prompt .= "{\n";
    $user_prompt .= '  "title": "SEO-optimized title (60 characters or less, may refine the original)",'."\n";
    $user_prompt .= '  "content": "Full HTML article content",'."\n";
    $user_prompt .= '  "meta_description": "150-160 characters highlighting expertise and value",'."\n";
    $user_prompt .= '  "keywords": "5-8 relevant keywords including James Strickland, Houston, and topic terms (comma-separated)"'."\n";
    $user_prompt .= "}";
    $user_prompt .= "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just the raw JSON object.";
    
    // Prepare API request for Claude
    // Using claude-sonnet-4-20250514 (Claude Sonnet 4) - the current recommended model
    // Old models claude-3-5-sonnet-20240620 and claude-3-5-sonnet-20241022 were deprecated Oct 22, 2025
    $data = [
        'model' => 'claude-sonnet-4-20250514',
        'max_tokens' => 4000,
        'temperature' => 0.7,
        'system' => $system_prompt,
        'messages' => [
            [
                'role' => 'user',
                'content' => $user_prompt
            ]
        ]
    ];
    
    // Make API call to Claude
    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    // Ensure API key is trimmed before sending
    $api_key_clean = trim($api_key);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $api_key_clean,
        'anthropic-version: 2023-06-01'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    if ($curl_error) {
        return ['success' => false, 'error' => 'Network error: ' . $curl_error];
    }
    
    if ($http_code !== 200) {
        $error_data = json_decode($response, true);
        $error_message = $error_data['error']['message'] ?? 'API request failed with code ' . $http_code;
        $error_type = $error_data['error']['type'] ?? 'unknown';
        
        // Log the actual error for debugging (remove in production)
        $key_for_log = isset($api_key_clean) ? $api_key_clean : (isset($api_key) ? $api_key : 'not set');
        error_log("Anthropic API Error - HTTP Code: $http_code, Type: $error_type, Message: $error_message");
        error_log("API Key used (first 20 chars): " . substr($key_for_log, 0, 20) . "...");
        error_log("Model used: " . ($data['model'] ?? 'not set'));
        
        // Check for model-related errors
        if (strpos(strtolower($error_message), 'model') !== false || 
            strpos(strtolower($error_type), 'invalid_request_error') !== false ||
            strpos(strtolower($error_message), 'not found') !== false ||
            strpos(strtolower($error_message), 'deprecated') !== false) {
            $error_message = 'Model error: ' . $error_message . ' | ' .
                           'Current model: ' . ($data['model'] ?? 'not set') . ' | ' .
                           'Please check Anthropic API documentation for available models: https://docs.anthropic.com/en/api/messages';
        }
        // Check for authentication errors
        else if (strpos(strtolower($error_message), 'invalid') !== false || 
                 strpos(strtolower($error_type), 'authentication') !== false ||
                 strpos(strtolower($error_type), 'invalid') !== false) {
            $error_message = 'Invalid API key. Please check your ANTHROPIC_API_KEY in the .env file. ' . 
                           'Get a valid key from https://console.anthropic.com/ | ' .
                           'Actual error: ' . $error_message;
        }
        
        return ['success' => false, 'error' => $error_message];
    }
    
    $result = json_decode($response, true);
    
    // Claude's response format
    if (!isset($result['content'][0]['text'])) {
        return ['success' => false, 'error' => 'Invalid API response format'];
    }
    
    $content_text = $result['content'][0]['text'];
    $article_data = json_decode($content_text, true);
    
    if (!$article_data || !isset($article_data['title']) || !isset($article_data['content'])) {
        return ['success' => false, 'error' => 'Failed to parse article data from AI response'];
    }
    
    return [
        'success' => true,
        'title' => $article_data['title'] ?? $title,
        'content' => $article_data['content'] ?? '',
        'meta_description' => $article_data['meta_description'] ?? '',
        'keywords' => $article_data['keywords'] ?? ''
    ];
}

// Check which API is configured
$anthropic_key = $_ENV['ANTHROPIC_API_KEY'] ?? $_SERVER['ANTHROPIC_API_KEY'] ?? getenv('ANTHROPIC_API_KEY') ?? '';
if ($anthropic_key) {
    $api_status = '<span style="color: #10b981; font-weight: bold;">✓ Claude API Connected</span>';
} else {
    $api_status = '<span style="color: #ef4444; font-weight: bold;">✗ Claude API Not Configured</span>';
}

// Get current action
$current_action = $_GET['action'] ?? 'list';
$edit_id = intval($_GET['id'] ?? 0);

// Get article for editing if needed
$edit_article = null;
if ($current_action === 'edit' && $edit_id) {
    $edit_article = getArticleById($pdo, $edit_id);
}

// Get all articles for listing
$all_articles = [];
try {
    $stmt = $pdo->prepare("SELECT * FROM blog_articles ORDER BY published_date DESC");
    $stmt->execute();
    $all_articles = $stmt->fetchAll();
} catch (PDOException $e) {
    $message = 'Error fetching articles: ' . $e->getMessage();
    $message_type = 'error';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Manager - Strickland Technology Admin</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: #1a1a1a;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .nav {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .nav a {
            padding: 10px 20px;
            background: #26d6fe;
            color: #1a1a1a;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .nav a:hover, .nav a.active {
            background: white;
            transform: translateY(-2px);
        }
        
        .message {
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .message.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .message.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        
        .card {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #26d6fe;
        }
        
        .form-group textarea {
            min-height: 200px;
            resize: vertical;
        }
        
        .form-group.large textarea {
            min-height: 400px;
        }
        
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: #26d6fe;
            color: #1a1a1a;
        }
        
        .btn-primary:hover {
            background: #1ac5e8;
            transform: translateY(-2px);
        }
        
        .btn-danger {
            background: #dc3545;
            color: white;
        }
        
        .btn-danger:hover {
            background: #c82333;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .table th,
        .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #555;
        }
        
        .table tr:hover {
            background: #f8f9fa;
        }
        
        .actions {
            display: flex;
            gap: 10px;
        }
        
        .actions a,
        .actions button {
            padding: 6px 12px;
            font-size: 14px;
            text-decoration: none;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            font-size: 2rem;
            color: #26d6fe;
            margin-bottom: 10px;
        }
        
        .stat-card p {
            color: #666;
            font-weight: 500;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .nav {
                flex-direction: column;
                align-items: center;
            }
            
            .actions {
                flex-direction: column;
            }
        }
        
        .preview {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-top: 10px;
            border-left: 4px solid #26d6fe;
        }
        
        .help-text {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- NEW VERSION LOADED -->
        <div style="background: #ef4444; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; border-radius: 10px;">
            🔥 NEW CLAUDE VERSION LOADED - NOV 10 8:14PM 🔥
        </div>
        <div class="header">
            <h1>🚀 Blog Manager</h1>
            <p>Manage your Strickland Technology blog articles</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                ✨ Powered by Claude 3.5 Sonnet
            </div>
            <div style="margin-top: 10px; font-size: 14px;">
                API Status: <?php echo $api_status; ?>
            </div>
            <div class="nav">
                <a href="?action=list" class="<?php echo $current_action === 'list' ? 'active' : ''; ?>">📋 All Articles</a>
                <a href="?action=quick_generate" class="<?php echo $current_action === 'quick_generate' ? 'active' : ''; ?>">⚡ Quick Generate</a>
                <a href="?action=create" class="<?php echo $current_action === 'create' ? 'active' : ''; ?>">✍️ Create New</a>
                <a href="../blog.php" target="_blank">🌐 View Blog</a>
                <a href="index.php">🏠 Admin Home</a>
            </div>
        </div>

        <?php if ($message): ?>
        <div class="message <?php echo $message_type; ?>">
            <?php echo htmlspecialchars($message); ?>
        </div>
        <?php endif; ?>

        <?php if ($current_action === 'list'): ?>
        <!-- Statistics -->
        <div class="stats">
            <div class="stat-card">
                <h3><?php echo count($all_articles); ?></h3>
                <p>Total Articles</p>
            </div>
            <div class="stat-card">
                <h3><?php echo count(array_filter($all_articles, function($a) { return strtotime($a['published_date']) > strtotime('-30 days'); })); ?></h3>
                <p>Last 30 Days</p>
            </div>
            <div class="stat-card">
                <h3><?php echo count(array_filter($all_articles, function($a) { return strtotime($a['published_date']) > strtotime('-7 days'); })); ?></h3>
                <p>Last 7 Days</p>
            </div>
        </div>

        <!-- Articles List -->
        <div class="card">
            <h2>📚 All Articles</h2>
            
            <?php if (empty($all_articles)): ?>
            <p>No articles found. <a href="?action=create">Create your first article</a>!</p>
            <?php else: ?>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Keywords</th>
                        <th>Published Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($all_articles as $article): ?>
                    <tr>
                        <td><?php echo $article['id']; ?></td>
                        <td>
                            <strong><?php echo htmlspecialchars($article['title']); ?></strong>
                            <br>
                            <small style="color: #666;"><?php echo htmlspecialchars(substr(strip_tags($article['content']), 0, 100)); ?>...</small>
                        </td>
                        <td><?php echo htmlspecialchars(substr($article['keywords'], 0, 30)); ?><?php echo strlen($article['keywords']) > 30 ? '...' : ''; ?></td>
                        <td><?php echo date('M j, Y', strtotime($article['published_date'])); ?></td>
                        <td>
                            <div class="actions">
                                <a href="../article_fixed.php?slug=<?php echo urlencode(slugify($article['title'])); ?>" 
                                   target="_blank" class="btn btn-secondary">👁️ View</a>
                                <a href="?action=edit&id=<?php echo $article['id']; ?>" 
                                   class="btn btn-primary">✏️ Edit</a>
                                <form method="post" style="display: inline;" 
                                      onsubmit="return confirm('Are you sure you want to delete this article?');">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="id" value="<?php echo $article['id']; ?>">
                                    <button type="submit" class="btn btn-danger">🗑️ Delete</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php endif; ?>
        </div>

        <?php elseif ($current_action === 'quick_generate'): ?>
        <!-- Quick Generate Form -->
        <div class="card">
            <h2>⚡ Quick Generate Article</h2>
            <p style="color: #666; margin-bottom: 20px;">
                Enter just a title and AI will generate a complete, research-driven article with credible sources, 
                industry insights, and positioning for James Strickland as a thought leader. 
                <strong>Article will be published immediately!</strong>
            </p>
            
            <form method="post" id="quickGenerateForm">
                <input type="hidden" name="action" value="quick_generate">
                
                <div class="form-group">
                    <label for="quick_title">Article Title *</label>
                    <input type="text" id="quick_title" name="title" required 
                           placeholder="e.g., AI-Powered Web Design Trends for Houston Businesses in 2025"
                           style="font-size: 1.1rem; padding: 15px;">
                    <small style="color: #666;">
                        💡 Tips: Use current topics, include "2025", mention technology trends, or reference industry developments
                    </small>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #26d6fe;">✨ What AI Will Generate:</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>✅ Research-driven content with industry statistics</li>
                        <li>✅ Credible source citations (Google, Microsoft, Adobe, etc.)</li>
                        <li>✅ James Strickland positioned as thought leader</li>
                        <li>✅ Houston market leadership emphasis</li>
                        <li>✅ SEO-optimized title, meta description, and keywords</li>
                        <li>✅ 1200-1500 words of professional content</li>
                        <li>✅ Structured with best practices and call-to-action</li>
                    </ul>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <strong>⚠️ Note:</strong> Generation takes 30-60 seconds. Article will be published immediately upon completion.
                    Cost: ~$0.004 per article. All internal links are automatically validated.
                </div>
                
                <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #0c5460; margin: 20px 0;">
                    <strong>🔧 Maintenance:</strong> <a href="fix_blog_links.php?admin_key=strickland2024" style="color: #0c5460; text-decoration: underline;">Fix broken links in all existing articles</a>
                </div>
                
                <div style="display: flex; gap: 15px; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">
                        ⚡ Generate & Publish Article
                    </button>
                    <a href="?action=list" class="btn" style="background: #6c757d; text-align: center; padding: 12px 24px;">
                        Cancel
                    </a>
                </div>
            </form>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
                <h3 style="color: #26d6fe;">💡 Suggested Topics:</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; margin-top: 15px;">
                    <button onclick="document.getElementById('quick_title').value='AI-Powered Web Design Trends for Houston Businesses in 2025'; return false;" 
                            style="padding: 10px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; cursor: pointer; text-align: left;">
                        AI-Powered Web Design Trends...
                    </button>
                    <button onclick="document.getElementById('quick_title').value='Latest Google Algorithm Updates and SEO Best Practices'; return false;" 
                            style="padding: 10px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; cursor: pointer; text-align: left;">
                        Latest Google Algorithm Updates...
                    </button>
                    <button onclick="document.getElementById('quick_title').value='Mobile-First Design: Industry Standards for 2025'; return false;" 
                            style="padding: 10px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; cursor: pointer; text-align: left;">
                        Mobile-First Design Standards...
                    </button>
                    <button onclick="document.getElementById('quick_title').value='Cybersecurity Best Practices for Business Websites'; return false;" 
                            style="padding: 10px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; cursor: pointer; text-align: left;">
                        Cybersecurity Best Practices...
                    </button>
                </div>
            </div>
        </div>

        <?php elseif ($current_action === 'create' || $current_action === 'edit'): ?>
        <!-- Create/Edit Form -->
        <div class="card">
            <h2><?php echo $current_action === 'create' ? '✍️ Create New Article' : '✏️ Edit Article'; ?></h2>
            
            <form method="post">
                <input type="hidden" name="action" value="<?php echo $current_action === 'create' ? 'create' : 'update'; ?>">
                <?php if ($current_action === 'edit'): ?>
                <input type="hidden" name="id" value="<?php echo $edit_id; ?>">
                <?php endif; ?>
                
                <div class="form-group">
                    <label for="title">Article Title *</label>
                    <input type="text" id="title" name="title" required 
                           value="<?php echo htmlspecialchars($edit_article['title'] ?? ''); ?>"
                           placeholder="Enter a compelling article title">
                    <div class="help-text">This will be used to generate the URL slug automatically</div>
                </div>
                
                <div class="form-group large">
                    <label for="content">Article Content *</label>
                    <textarea id="content" name="content" required 
                              placeholder="Write your article content here. You can use HTML tags for formatting."><?php echo htmlspecialchars($edit_article['content'] ?? ''); ?></textarea>
                    <div class="help-text">HTML tags are supported. Use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, etc. for formatting.</div>
                </div>
                
                <div class="form-group">
                    <label for="meta_description">Meta Description</label>
                    <textarea id="meta_description" name="meta_description" rows="3"
                              placeholder="Brief description for search engines (150-160 characters recommended)"><?php echo htmlspecialchars($edit_article['meta_description'] ?? ''); ?></textarea>
                    <div class="help-text">Used for search engine results. Leave blank to auto-generate from content.</div>
                </div>
                
                <div class="form-group">
                    <label for="keywords">Keywords</label>
                    <input type="text" id="keywords" name="keywords" 
                           value="<?php echo htmlspecialchars($edit_article['keywords'] ?? ''); ?>"
                           placeholder="web design, SEO, digital marketing, Houston">
                    <div class="help-text">Comma-separated keywords for SEO and article tags</div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="author_name">Author Name</label>
                        <input type="text" id="author_name" name="author_name" 
                               value="<?php echo htmlspecialchars($edit_article['author_name'] ?? 'James Strickland'); ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="contact_email">Contact Email</label>
                        <input type="email" id="contact_email" name="contact_email" 
                               value="<?php echo htmlspecialchars($edit_article['contact_email'] ?? 'james@stricklandtechnology.net'); ?>">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="phone_number">Phone Number</label>
                    <input type="text" id="phone_number" name="phone_number" 
                           value="<?php echo htmlspecialchars($edit_article['phone_number'] ?? '713-444-6732'); ?>">
                </div>
                
                <div style="margin-top: 30px;">
                    <button type="submit" class="btn btn-primary">
                        <?php echo $current_action === 'create' ? '🚀 Publish Article' : '💾 Update Article'; ?>
                    </button>
                    <a href="?action=list" class="btn btn-secondary">❌ Cancel</a>
                </div>
            </form>
        </div>
        <?php endif; ?>
    </div>

    <script>
        // Auto-resize textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        });

        // Character counter for meta description
        const metaDesc = document.getElementById('meta_description');
        if (metaDesc) {
            const helpText = metaDesc.nextElementSibling;
            metaDesc.addEventListener('input', function() {
                const length = this.value.length;
                const color = length > 160 ? 'red' : length > 150 ? 'orange' : 'green';
                helpText.innerHTML = `Used for search engine results. Leave blank to auto-generate from content. <span style="color: ${color};">${length}/160 characters</span>`;
            });
        }
        
        // Quick Generate loading state
        const quickGenForm = document.getElementById('quickGenerateForm');
        if (quickGenForm) {
            quickGenForm.addEventListener('submit', function() {
                const button = this.querySelector('button[type="submit"]');
                button.disabled = true;
                button.innerHTML = '⏳ Generating Article... Please wait (30-60 seconds)';
                button.style.opacity = '0.7';
            });
        }
    </script>
</body>
</html>