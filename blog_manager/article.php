<?php
require_once 'blog_functions.php';

// Get article by slug or ID
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

$article = null;

if ($slug) {
    $article = getArticleBySlug($pdo, $slug);
} elseif ($id) {
    $article = getArticleById($pdo, $id);
}

if (!$article) {
    header('HTTP/1.0 404 Not Found');
    echo "<h1>Article Not Found</h1><p>The requested article could not be found.</p>";
    exit;
}

// Get related articles and tags
$related_articles = getRelatedArticles($pdo, $article['id'], $article['category_id'], 4);
$tags = getArticleTags($pdo, $article['id']);
$popular_articles = getPopularArticles($pdo, 5);

// Calculate reading time and format date
$reading_time = estimateReadingTime($article['content']);
$published_date = date('F j, Y', strtotime($article['published_date']));

// SEO optimization
$article['content'] = injectWebDesignKeywords($article['content']);

// Build canonical URL
$canonical_url = "https://stricklandtechnology.net/article.php?slug=" . urlencode($article['slug']);

header('Cache-Control: no-cache, must-revalidate');
header('Pragma: no-cache');
?>
<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo htmlspecialchars($article['title']); ?> | Strickland Technology Blog</title>
    <meta name="description" content="<?php echo htmlspecialchars($article['meta_description'] ?: generateExcerpt($article['content'])); ?>">
    <meta name="keywords" content="web design, houston web design, <?php echo htmlspecialchars($article['keywords']); ?>">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="<?php echo $canonical_url; ?>">
    
    <!-- Enhanced Open Graph tags for rich social sharing -->
    <meta property="og:title" content="<?php echo htmlspecialchars($article['title']); ?>">
    <meta property="og:description" content="<?php echo htmlspecialchars($article['meta_description'] ?: generateExcerpt($article['content'])); ?>">
    <meta property="og:type" content="article">
    <meta property="og:url" content="<?php echo $canonical_url; ?>">
    <meta property="og:site_name" content="Strickland Technology">
    <meta property="og:locale" content="en_US">
    
    <!-- Generate or use a default image for social sharing -->
    <?php 
    $og_image = 'https://stricklandtechnology.net/images/strickland-technology-og-image.jpg';
    // Check if article has a main image
    if (!empty($article['main_image'])) {
        $og_image = 'https://stricklandtechnology.net/' . $article['main_image'];
    } elseif (!empty($article['hero_image'])) {
        $og_image = 'https://stricklandtechnology.net/' . $article['hero_image'];
    } elseif (!empty($article['social_image'])) {
        $og_image = 'https://stricklandtechnology.net/' . $article['social_image'];
    }
    ?>
    <meta property="og:image" content="<?php echo $og_image; ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="<?php echo htmlspecialchars($article['title']); ?>">
    
    <!-- Article specific Open Graph tags -->
    <meta property="article:published_time" content="<?php echo date('c', strtotime($article['published_date'])); ?>">
    <meta property="article:modified_time" content="<?php echo date('c', strtotime($article['updated_at'] ?? $article['published_date'])); ?>">
    <meta property="article:author" content="https://stricklandtechnology.net/about">
    <meta property="article:publisher" content="https://www.facebook.com/stricklandtechnology">
    <meta property="article:section" content="Web Design">
    <?php foreach ($tags as $tag): ?>
    <meta property="article:tag" content="<?php echo htmlspecialchars($tag['name']); ?>">
    <?php endforeach; ?>
    
    <!-- Enhanced Twitter Card tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@StricklandTech">
    <meta name="twitter:creator" content="@JamesStrickland">
    <meta name="twitter:title" content="<?php echo htmlspecialchars($article['title']); ?>">
    <meta name="twitter:description" content="<?php echo htmlspecialchars(substr($article['meta_description'] ?: generateExcerpt($article['content']), 0, 200)); ?>">
    <meta name="twitter:image" content="<?php echo $og_image; ?>">
    <meta name="twitter:image:alt" content="<?php echo htmlspecialchars($article['title']); ?>">
    
    <!-- LinkedIn specific tags -->
    <meta property="og:linkedin:title" content="<?php echo htmlspecialchars($article['title']); ?>">
    <meta property="og:linkedin:description" content="<?php echo htmlspecialchars($article['meta_description'] ?: generateExcerpt($article['content'])); ?>">
    
    <!-- WhatsApp and other messaging apps -->
    <meta property="og:whatsapp:title" content="<?php echo htmlspecialchars($article['title']); ?>">
    <meta property="og:whatsapp:description" content="<?php echo htmlspecialchars(substr($article['meta_description'] ?: generateExcerpt($article['content']), 0, 100)); ?>">
    
    <?php include("include_header.php");?>
    
    <style>
        #grey_layer {
            background: #1a1a1a !important;
            border-bottom: none !important;
            min-height: auto !important;
        }
        
        .article-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            gap: 40px;
            padding: 50px 20px;
        }
        
        .article-container {
            flex: 1;
            max-width: 800px;
        }
        
        .article-header {
            margin-bottom: 40px;
        }
        
        .article-header h1 {
            font-size: 2.5rem;
            line-height: 1.2;
            margin-bottom: 25px;
            color: white;
            font-family: 'Raleway', sans-serif;
            font-weight: 700;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
        }
        
        .article-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            color: rgba(255,255,255,0.7);
            font-size: 0.95em;
            margin-bottom: 30px;
            padding-bottom: 25px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            font-family: 'Raleway', sans-serif;
        }
        
        .article-meta span {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            font-weight: 500;
        }
        
        .article-content {
            font-size: 1.15em;
            line-height: 1.8;
            color: rgba(255,255,255,0.9);
            font-family: 'Raleway', sans-serif;
        }
        
        .article-content h1, .article-content h2 {
            margin: 40px 0 25px;
            font-size: 1.8rem;
            color: #26d6fe;
            font-weight: 700;
        }
        
        .article-content h3 {
            margin: 35px 0 20px;
            font-size: 1.4rem;
            color: white;
            font-weight: 600;
        }
        
        .article-content p {
            margin-bottom: 25px;
        }
        
        .article-content ul, .article-content ol {
            margin: 25px 0;
            padding-left: 30px;
        }
        
        .article-content li {
            margin-bottom: 12px;
            line-height: 1.7;
        }
        
        .article-content blockquote {
            margin: 35px 0;
            padding: 25px;
            background: rgba(255,255,255,0.05);
            border-left: 4px solid #26d6fe;
            font-style: italic;
            color: rgba(255,255,255,0.9);
            border-radius: 0 8px 8px 0;
        }
        
        .article-content img {
            max-width: 100%;
            height: auto;
            margin: 25px 0;
            border-radius: 8px;
        }
        
        .article-tags {
            margin: 50px 0;
            padding-top: 35px;
            border-top: 1px solid rgba(255,255,255,0.2);
        }
        
        .article-tags h4 {
            margin-bottom: 20px;
            color: white;
            font-family: 'Raleway', sans-serif;
            font-weight: 600;
        }
        
        .tag {
            display: inline-block;
            background: rgba(255,255,255,0.1);
            padding: 8px 18px;
            margin: 6px 6px 6px 0;
            border-radius: 25px;
            font-size: 0.9em;
            text-decoration: none;
            color: rgba(255,255,255,0.8);
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.2);
            font-family: 'Raleway', sans-serif;
            font-weight: 500;
        }
        
        .tag:hover {
            background: #26d6fe;
            color: #1a1a1a;
            transform: translateY(-2px);
            border-color: #26d6fe;
            box-shadow: 0 4px 12px rgba(38, 214, 254, 0.3);
        }
        
        .sidebar {
            width: 350px;
            position: sticky;
            top: 20px;
            height: fit-content;
        }
        
        .sidebar-section {
            margin-bottom: 35px;
            padding: 30px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
        }
        
        .sidebar-section:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.2);
        }
        
        .sidebar-section h3 {
            margin-bottom: 25px;
            color: #26d6fe;
            font-size: 1.3rem;
            font-family: 'Raleway', sans-serif;
            font-weight: 700;
            position: relative;
            padding-bottom: 15px;
        }
        
        .sidebar-section h3::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 3px;
            background: #26d6fe;
            border-radius: 2px;
        }
        
        .related-article, .popular-article {
            margin-bottom: 25px;
            padding-bottom: 25px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
        }
        
        .related-article:last-child, .popular-article:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .related-article:hover, .popular-article:hover {
            padding-left: 15px;
        }
        
        .related-article h4, .popular-article h4 {
            margin-bottom: 8px;
            font-size: 1.05rem;
        }
        
        .related-article a, .popular-article a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            font-weight: 500;
            font-family: 'Raleway', sans-serif;
            transition: color 0.3s ease;
            display: block;
            line-height: 1.5;
        }
        
        .related-article a:hover, .popular-article a:hover {
            color: #26d6fe;
        }
        
        .share-section {
            margin: 50px 0;
            padding: 35px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .share-section h4 {
            margin-bottom: 25px;
            color: white;
            font-family: 'Raleway', sans-serif;
            font-weight: 600;
        }
        
        .share-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .share-button {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 12px 24px;
            background: transparent;
            color: #26d6fe;
            text-decoration: none;
            border-radius: 25px;
            transition: all 0.3s ease;
            border: 2px solid #26d6fe;
            font-family: 'Raleway', sans-serif;
            font-weight: 600;
        }
        
        .share-button:hover {
            background: #26d6fe;
            color: #1a1a1a;
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(38, 214, 254, 0.4);
        }
        
        .breadcrumb {
            max-width: 1200px;
            margin: 20px auto 0;
            padding: 0 20px;
            font-size: 0.9em;
            color: rgba(255,255,255,0.6);
            font-family: 'Raleway', sans-serif;
        }
        
        .breadcrumb a {
            color: #26d6fe;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .breadcrumb a:hover {
            color: white;
        }
        
        .author-bio {
            margin: 50px 0;
            padding: 35px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            display: flex;
            gap: 25px;
            align-items: center;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .author-bio-content h4 {
            margin-bottom: 10px;
            color: white;
            font-family: 'Raleway', sans-serif;
            font-weight: 600;
        }
        
        .author-bio-content p {
            color: rgba(255,255,255,0.8);
            line-height: 1.6;
            font-family: 'Raleway', sans-serif;
        }
        
        .cta-section {
            background: linear-gradient(135deg, #26d6fe, #4d95fb) !important;
            color: #1a1a1a !important;
            padding: 35px;
            border-radius: 12px;
            text-align: center;
            margin-top: 40px;
            position: relative;
            overflow: hidden;
        }
        
        .cta-section::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 4s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
            50% { transform: translateX(0%) translateY(0%) rotate(180deg); }
        }
        
        .cta-section h3 {
            color: #1a1a1a !important;
            margin-bottom: 15px;
            font-family: 'Raleway', sans-serif;
            font-weight: 700;
            position: relative;
            z-index: 1;
        }
        
        .cta-section p {
            margin-bottom: 25px;
            color: #1a1a1a !important;
            font-family: 'Raleway', sans-serif;
            position: relative;
            z-index: 1;
        }
        
        .cta-button {
            display: inline-block;
            padding: 15px 35px;
            background: #1a1a1a;
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 700;
            transition: all 0.3s ease;
            border: 2px solid #1a1a1a;
            font-family: 'Raleway', sans-serif;
            position: relative;
            z-index: 1;
        }
        
        .cta-button:hover {
            transform: translateY(-3px);
            background: white;
            color: #1a1a1a;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        
        @media (max-width: 1024px) {
            .article-wrapper {
                flex-direction: column;
                gap: 30px;
            }
            .sidebar {
                width: 100%;
                position: static;
            }
        }
        
        @media (max-width: 768px) {
            .article-header h1 {
                font-size: 2rem;
            }
            .article-content {
                font-size: 1.05em;
            }
            .article-wrapper {
                padding: 30px 15px;
            }
            .share-buttons {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
    
    <?php echo generateArticleSchema($article); ?>
</head>
<body id="articlepage">
    <header id="masthead">
        <?php include("navigation.php");?>
    </header>
    
    <main>
        <section id="featured_sub">
            <div id="feature_center">
                <div id="sub_header_left">
                    <h2>Technology</h2>
                    <h1>Blog</h1>
                </div>
                <div id="sub_header_right"></div>
                <div style="clear:both"></div>
            </div>
        </section>

        <section id="grey_layer">
            <!-- Breadcrumb -->
            <nav class="breadcrumb" aria-label="breadcrumb">
                <a href="/">Home</a> → 
                <a href="blog.php">Blog</a> → 
                <span><?php echo htmlspecialchars($article['title']); ?></span>
            </nav>
            
            <div class="article-wrapper">
                <article class="article-container">
                    <header class="article-header">
                        <h1><?php echo htmlspecialchars($article['title']); ?></h1>
                        <div class="article-meta">
                            <span>📅 <?php echo $published_date; ?></span>
                            <span>👤 <?php echo htmlspecialchars($article['author_name'] ?: 'James Strickland'); ?></span>
                            <span>⏱️ <?php echo $reading_time; ?> min read</span>
                        </div>
                    </header>
                    
                    <div class="article-content">
                        <?php echo $article['content']; ?>
                    </div>
                    
                    <?php if ($tags): ?>
                    <div class="article-tags">
                        <h4>Related Topics:</h4>
                        <?php foreach ($tags as $tag): ?>
                            <a href="blog.php?search=<?php echo urlencode($tag['name']); ?>" class="tag">
                                <?php echo htmlspecialchars($tag['name']); ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                    
                    <!-- Author Bio -->
                    <div class="author-bio">
                        <div class="author-bio-content">
                            <h4>About <?php echo htmlspecialchars($article['author_name'] ?: 'James Strickland'); ?></h4>
                            <p>James Strickland is a web design expert and founder of Strickland Technology, specializing in creating stunning, high-performance websites that drive business growth. With over 15 years of experience in web design and development, he helps businesses establish a powerful online presence.</p>
                        </div>
                    </div>
                    
                    <!-- Enhanced Social Share Widget -->
                    <?php 
                    require_once 'social_share_widget.php';
                    echo getSocialShareWidget($article['title'], $canonical_url, $article['excerpt'] ?? generateExcerpt($article['content']));
                    ?>
                </article>
                
                <!-- Sidebar -->
                <aside class="sidebar">
                    <?php if ($related_articles): ?>
                    <div class="sidebar-section">
                        <h3>Related Articles</h3>
                        <?php foreach ($related_articles as $related): ?>
                            <div class="related-article">
                                <h4><a href="article.php?slug=<?php echo urlencode($related['slug']); ?>"><?php echo htmlspecialchars($related['title']); ?></a></h4>
                                <p><?php echo htmlspecialchars(substr($related['excerpt'], 0, 100)) . '...'; ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($popular_articles): ?>
                    <div class="sidebar-section">
                        <h3>Popular Articles</h3>
                        <?php foreach ($popular_articles as $popular): ?>
                            <div class="popular-article">
                                <a href="article.php?slug=<?php echo urlencode($popular['slug']); ?>"><?php echo htmlspecialchars($popular['title']); ?></a>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                    
                    <!-- CTA for web design services -->
                    <div class="cta-section">
                        <h3>Need Professional Web Design?</h3>
                        <p>Transform your online presence with our expert web design services. We create stunning, responsive websites that drive results.</p>
                        <a href="/website_design.php" class="cta-button">Get Started Today</a>
                    </div>
                </aside>
            </div>
        </section>
    </main>
    
    <?php include("footer.php");?>
    
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script defer src="js/homepage.js"></script>
</body>
</html>