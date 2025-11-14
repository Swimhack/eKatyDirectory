<?php
/**
 * Fix Broken Links in Blog Articles
 * Replaces placeholder/broken links with actual website pages
 */

session_start();

// Simple authentication check
$is_logged_in = isset($_SESSION['admin_logged_in']) || 
                (isset($_SESSION['adminloggedin']) && $_SESSION['adminloggedin'] === 'Yes') ||
                isset($_GET['admin_key']);

if (!$is_logged_in && !isset($_GET['admin_key'])) {
    die('Access denied. Add ?admin_key=strickland2024 to URL');
}

// Admin key authentication
if (isset($_GET['admin_key']) && $_GET['admin_key'] === 'strickland2024') {
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['adminloggedin'] = 'Yes';
}

require_once '../dbconnect.php';

// Define valid internal links mapping
$valid_links = [
    // Services
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
    '/' => 'index.php',
    'home' => 'index.php',
];

// Function to fix links in content
function fixBrokenLinks($content, $link_map) {
    // Fix href links
    foreach ($link_map as $broken => $fixed) {
        // Match various link formats
        $patterns = [
            '/href=["\']' . preg_quote($broken, '/') . '["\']/',
            '/href=["\']' . preg_quote($broken, '/') . '\/["\']/',
        ];
        
        foreach ($patterns as $pattern) {
            $content = preg_replace($pattern, 'href="' . $fixed . '"', $content);
        }
    }
    
    // Remove any remaining placeholder links that don't go anywhere
    $content = preg_replace('/href=["\']\#["\']/i', 'href="contact.php"', $content);
    $content = preg_replace('/href=["\']\/"["\'](?!>)/i', 'href="index.php"', $content);
    
    return $content;
}

// Get all articles
try {
    $stmt = $pdo->query("SELECT id, title, content FROM blog_articles");
    $articles = $stmt->fetchAll();
    
    $fixed_count = 0;
    $results = [];
    
    foreach ($articles as $article) {
        $original_content = $article['content'];
        $fixed_content = fixBrokenLinks($original_content, $valid_links);
        
        if ($original_content !== $fixed_content) {
            // Update the article
            $update_stmt = $pdo->prepare("UPDATE blog_articles SET content = ? WHERE id = ?");
            $update_stmt->execute([$fixed_content, $article['id']]);
            
            $fixed_count++;
            $results[] = [
                'id' => $article['id'],
                'title' => $article['title'],
                'status' => 'Fixed'
            ];
        } else {
            $results[] = [
                'id' => $article['id'],
                'title' => $article['title'],
                'status' => 'No changes needed'
            ];
        }
    }
    
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Blog Link Fixer - Results</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 1200px;
                margin: 50px auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .header {
                background: #0056b3;
                color: white;
                padding: 20px;
                border-radius: 5px;
                margin-bottom: 30px;
            }
            .summary {
                background: white;
                padding: 20px;
                border-radius: 5px;
                margin-bottom: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .summary h2 {
                margin-top: 0;
                color: #0056b3;
            }
            table {
                width: 100%;
                background: white;
                border-collapse: collapse;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background: #0056b3;
                color: white;
            }
            .fixed {
                color: #28a745;
                font-weight: bold;
            }
            .no-change {
                color: #6c757d;
            }
            .back-link {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background: #0056b3;
                color: white;
                text-decoration: none;
                border-radius: 5px;
            }
            .back-link:hover {
                background: #003d82;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Blog Link Fixer - Results</h1>
            <p>Scanned and fixed broken internal links in all blog articles</p>
        </div>
        
        <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Articles:</strong> <?php echo count($articles); ?></p>
            <p><strong>Articles Fixed:</strong> <span class="fixed"><?php echo $fixed_count; ?></span></p>
            <p><strong>No Changes Needed:</strong> <?php echo count($articles) - $fixed_count; ?></p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Article Title</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($results as $result): ?>
                <tr>
                    <td><?php echo $result['id']; ?></td>
                    <td><?php echo htmlspecialchars($result['title']); ?></td>
                    <td class="<?php echo $result['status'] === 'Fixed' ? 'fixed' : 'no-change'; ?>">
                        <?php echo $result['status']; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        
        <a href="blog_manager.php" class="back-link">← Back to Blog Manager</a>
    </body>
    </html>
    <?php
    
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
?>
