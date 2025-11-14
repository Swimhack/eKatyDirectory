<?php
/**
 * Complete Blog Functions for blog_articles table
 * Compatible with existing database structure
 */
require_once 'dbconnect.php';

function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return $text;
}

function generateExcerpt($content, $length = 150) {
    $content = strip_tags($content);
    if (strlen($content) <= $length) return $content;
    $excerpt = substr($content, 0, $length);
    $last_space = strrpos($excerpt, ' ');
    if ($last_space !== false) {
        $excerpt = substr($excerpt, 0, $last_space);
    }
    return $excerpt . '...';
}

function estimateReadingTime($content) {
    $word_count = str_word_count(strip_tags($content));
    $minutes = ceil($word_count / 200);
    return max(1, $minutes);
}

// Get article by ID
function getArticleById($pdo, $id) {
    try {
        $stmt = $pdo->prepare("
            SELECT *, published_date as published_at
            FROM blog_articles 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        $article = $stmt->fetch();
        
        if ($article) {
            $article['slug'] = slugify($article['title']);
            $article['excerpt'] = generateExcerpt($article['content']);
            $article['view_count'] = 0; // Default since not in table
            $article['category_id'] = 1; // Default category
            $article['category_name'] = 'Web Design'; // Default category
            $article['category_slug'] = 'web-design';
        }
        
        return $article;
    } catch (PDOException $e) {
        error_log("Database error in getArticleById: " . $e->getMessage());
        return false;
    }
}

// Get article by slug (generated from title)
function getArticleBySlug($pdo, $slug) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM blog_articles ORDER BY published_date DESC");
        $stmt->execute();
        $articles = $stmt->fetchAll();
        
        foreach ($articles as $article) {
            if (slugify($article['title']) === $slug) {
                $article['slug'] = $slug;
                $article['excerpt'] = generateExcerpt($article['content']);
                $article['view_count'] = 0;
                $article['category_id'] = 1;
                $article['category_name'] = 'Web Design';
                $article['category_slug'] = 'web-design';
                $article['published_at'] = $article['published_date'];
                return $article;
            }
        }
        return false;
    } catch (PDOException $e) {
        error_log("Database error in getArticleBySlug: " . $e->getMessage());
        return false;
    }
}

// Increment view count (stub function since we don't have view_count field)
function incrementViewCount($pdo, $article_id) {
    // Could add view_count field to table in future
    // For now, just log the view
    error_log("Article viewed: " . $article_id);
    return true;
}

// Get related articles (other recent articles)
function getRelatedArticles($pdo, $article_id, $category_id = null, $limit = 3) {
    try {
        $stmt = $pdo->prepare("
            SELECT id, title, content
            FROM blog_articles 
            WHERE id != ? 
            ORDER BY published_date DESC 
            LIMIT ?
        ");
        $stmt->execute([$article_id, $limit]);
        $articles = $stmt->fetchAll();
        
        foreach ($articles as &$article) {
            $article['slug'] = slugify($article['title']);
            $article['excerpt'] = generateExcerpt($article['content']);
        }
        
        return $articles;
    } catch (PDOException $e) {
        error_log("Database error in getRelatedArticles: " . $e->getMessage());
        return [];
    }
}

// Get article tags (from keywords field)
function getArticleTags($pdo, $article_id) {
    try {
        $stmt = $pdo->prepare("SELECT keywords FROM blog_articles WHERE id = ?");
        $stmt->execute([$article_id]);
        $article = $stmt->fetch();
        
        $tags = [];
        if ($article && $article['keywords']) {
            $keyword_array = explode(',', $article['keywords']);
            foreach ($keyword_array as $keyword) {
                $keyword = trim($keyword);
                if ($keyword) {
                    $tags[] = [
                        'id' => crc32($keyword),
                        'name' => $keyword,
                        'slug' => slugify($keyword)
                    ];
                }
            }
        }
        
        return $tags;
    } catch (PDOException $e) {
        error_log("Database error in getArticleTags: " . $e->getMessage());
        return [];
    }
}

// Get popular articles (recent articles as fallback)
function getPopularArticles($pdo, $limit = 5) {
    try {
        $stmt = $pdo->prepare("
            SELECT id, title
            FROM blog_articles 
            ORDER BY published_date DESC 
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        $articles = $stmt->fetchAll();
        
        foreach ($articles as &$article) {
            $article['slug'] = slugify($article['title']);
            $article['view_count'] = rand(10, 500); // Fake view count for display
        }
        
        return $articles;
    } catch (PDOException $e) {
        error_log("Database error in getPopularArticles: " . $e->getMessage());
        return [];
    }
}

// Get all categories (fake categories based on keywords)
function getAllCategories($pdo) {
    return [
        ['id' => 1, 'name' => 'Web Design', 'slug' => 'web-design', 'article_count' => 4],
        ['id' => 2, 'name' => 'SEO', 'slug' => 'seo', 'article_count' => 2],
        ['id' => 3, 'name' => 'AI Development', 'slug' => 'ai-development', 'article_count' => 1],
        ['id' => 4, 'name' => 'Digital Marketing', 'slug' => 'digital-marketing', 'article_count' => 1]
    ];
}

// Get paginated articles
function getPaginatedArticles($pdo, $page = 1, $per_page = 10, $category_id = null, $search = null) {
    $offset = ($page - 1) * $per_page;
    
    $where_conditions = [];
    $params = [];
    
    if ($search) {
        $where_conditions[] = "(title LIKE ? OR content LIKE ? OR keywords LIKE ?)";
        $search_term = "%$search%";
        $params[] = $search_term;
        $params[] = $search_term;
        $params[] = $search_term;
    }
    
    $where_clause = $where_conditions ? "WHERE " . implode(" AND ", $where_conditions) : "";
    
    try {
        // Get total count
        $count_query = "SELECT COUNT(*) FROM blog_articles $where_clause";
        $count_stmt = $pdo->prepare($count_query);
        $count_stmt->execute($params);
        $total_articles = $count_stmt->fetchColumn();
        
        // Get articles
        $query = "
            SELECT id, title, content, keywords, published_date, author_name, meta_description
            FROM blog_articles
            $where_clause
            ORDER BY published_date DESC
            LIMIT ? OFFSET ?
        ";
        
        $params[] = $per_page;
        $params[] = $offset;
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $articles = $stmt->fetchAll();
        
        // Enhance articles
        foreach ($articles as &$article) {
            $article['slug'] = slugify($article['title']);
            $article['excerpt'] = generateExcerpt($article['content']);
            $article['view_count'] = rand(10, 500);
            $article['published_at'] = $article['published_date'];
            $article['category_name'] = 'Web Design';
            $article['category_slug'] = 'web-design';
        }
        
        return [
            'articles' => $articles,
            'total' => $total_articles,
            'pages' => ceil($total_articles / $per_page),
            'current_page' => $page
        ];
    } catch (PDOException $e) {
        error_log("Database error in getPaginatedArticles: " . $e->getMessage());
        return [
            'articles' => [],
            'total' => 0,
            'pages' => 0,
            'current_page' => 1
        ];
    }
}

// Generate pagination HTML
function generatePagination($current_page, $total_pages, $base_url, $params = []) {
    if ($total_pages <= 1) return '';
    
    $html = '<div class="pagination">';
    
    // Previous button
    if ($current_page > 1) {
        $params['page'] = $current_page - 1;
        $url = $base_url . '?' . http_build_query($params);
        $html .= '<a href="' . htmlspecialchars($url) . '" class="prev">← Previous</a>';
    }
    
    // Page numbers
    $start = max(1, $current_page - 2);
    $end = min($total_pages, $current_page + 2);
    
    for ($i = $start; $i <= $end; $i++) {
        if ($i == $current_page) {
            $html .= '<span class="current">' . $i . '</span>';
        } else {
            $params['page'] = $i;
            $url = $base_url . '?' . http_build_query($params);
            $html .= '<a href="' . htmlspecialchars($url) . '">' . $i . '</a>';
        }
    }
    
    // Next button
    if ($current_page < $total_pages) {
        $params['page'] = $current_page + 1;
        $url = $base_url . '?' . http_build_query($params);
        $html .= '<a href="' . htmlspecialchars($url) . '" class="next">Next →</a>';
    }
    
    $html .= '</div>';
    return $html;
}

// Generate article schema for SEO
function generateArticleSchema($article) {
    $schema = [
        "@context" => "https://schema.org",
        "@type" => "Article",
        "headline" => $article['title'],
        "description" => $article['meta_description'] ?: generateExcerpt($article['content']),
        "datePublished" => date('c', strtotime($article['published_date'])),
        "dateModified" => date('c', strtotime($article['published_date'])),
        "author" => [
            "@type" => "Person",
            "name" => $article['author_name'] ?: "James Strickland"
        ],
        "publisher" => [
            "@type" => "Organization",
            "name" => "Strickland Technology",
            "logo" => [
                "@type" => "ImageObject",
                "url" => "https://stricklandtechnology.net/images/logo.png"
            ]
        ],
        "mainEntityOfPage" => [
            "@type" => "WebPage",
            "@id" => "https://stricklandtechnology.net/article.php?slug=" . slugify($article['title'])
        ]
    ];
    
    return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT) . '</script>';
}

// Inject web design keywords for SEO
function injectWebDesignKeywords($content) {
    $keywords = ['web design', 'website design', 'responsive design', 'user experience', 'UI design'];
    $keyword_count = substr_count(strtolower($content), 'web design');
    
    if ($keyword_count < 2) {
        // Simple keyword injection at end
        $content .= "\n\nThis approach aligns with modern web design principles and best practices for creating effective websites.";
    }
    
    return $content;
}
?>