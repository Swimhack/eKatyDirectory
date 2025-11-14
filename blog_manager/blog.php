<?php
header('Cache-Control: no-cache');
header('Pragma: no-cache');
?>
<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Strickland Technology Blog - Expert Web Design & SEO Articles</title>
    <meta name="description" content="Explore expert insights and tips on SEO, web design, digital marketing, and more from Strickland Technology. Stay ahead with our latest blog articles.">
    <meta name="keywords" content="houston seo articles, web design tips, digital marketing advice, online marketing blog, social media management, google ads management, internet marketing blog">
    <meta name="robots" content="index, follow">
    
    <?php include("include_header.php");?>
    
    <style>
        .article-list {
            max-width: 960px;
            margin: 50px auto;
            padding: 20px;
            background-color: #0056b3;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .article {
            margin-bottom: 30px;
            padding: 20px;
            background-color: #000;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .article h2 {
            font-size: 2rem;
            color: #ffffff; /* White for contrast on dark background */
        }

        .article h2 a {
            color: #26d6fe; /* Brand cyan for better visibility */
            text-decoration: none;
        }

        .article h2 a:hover {
            color: #0056b3; /* Dark blue for hover */
        }

        .article p {
            font-size: 1.1em;
            color: #e0e0e0; /* Light gray for readability on dark background */
        }

        .article .read-more {
            font-size: 1.1em;
            text-decoration: underline;
            color: #0056b3; /* Dark blue for "read more" link */
        }

        .article .read-more:hover {
            color: #26d6fe; /* Brand cyan on hover */
        }

        #featured_sub h1 {
            font-size: 2.5rem;
            line-height: 1.2;
        }

        /* Optimize for mobile */
        @media (max-width: 768px) {
            .article-list {
                padding: 10px;
            }

            .article h2 {
                font-size: 1.8rem;
            }
        }
    </style>
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Strickland Technology Blog",
      "description": "Stay informed on the latest web design, SEO, and digital marketing trends from Strickland Technology. Our blog covers everything you need to succeed online.",
      "publisher": {
        "@type": "Organization",
        "name": "Strickland Technology",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.stricklandtechnology.com/images/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.stricklandtechnology.com/blog.php"
      }
    }
    </script>
</head>
<body id="blogpage">

    <header id="masthead">
        <?php include("navigation.php");?>
    </header>

    <main>
        <section id="featured_sub">
            <div id="feature_center">
                <div id="sub_header_left">
                    <h2>Latest Articles</h2><h1>Stay Informed with Our Web Design & SEO Blog</h1>
                </div>
                <div id="sub_header_right"></div>
                <div style="clear:both"></div>
            </div>
        </section>

        <section id="grey_layer"> 
            <div class="article-list">
                <?php
                // Connect to database and fetch all published articles
                require_once 'dbconnect.php';
                
                // Define hardcoded articles that should always appear
                $hardcoded_articles = [
                    [
                        'title' => 'Patience as a Key Ingredient in AI Development: Insights from Strickland Technology',
                        'url' => 'article-patience-in-ai-development.php',
                        'excerpt' => 'In the fast-evolving world of artificial intelligence (AI), speed is often viewed as an essential component for success. However, as an AI pioneer with years of experience in AI-powered web technology and backend interfaces, I\'ve found that patience can be just as important...',
                        'date' => '2024-11-01'
                    ],
                    [
                        'title' => 'Top 10 SEO Tips to Boost Your Rankings in 2025',
                        'url' => 'article-seo-tips-2024.php',
                        'excerpt' => 'Discover the best SEO tips that can help your website rank higher in search engine results in 2025.',
                        'date' => '2024-10-15'
                    ],
                    [
                        'title' => 'How to Choose the Right Web Design Agency',
                        'url' => 'article-choose-web-design-agency.php',
                        'excerpt' => 'Learn the key factors to consider when choosing a web design agency to create or redesign your website.',
                        'date' => '2024-09-20'
                    ],
                    [
                        'title' => 'The Ultimate Guide to Local SEO',
                        'url' => 'article-local-seo-guide.php',
                        'excerpt' => 'Get comprehensive advice on optimizing your website for local search to drive traffic and grow your business.',
                        'date' => '2024-08-10'
                    ]
                ];
                
                $all_articles = [];
                
                try {
                    // Get database articles
                    $stmt = $pdo->prepare("
                        SELECT id, title, meta_description, slug, published_date 
                        FROM blog_articles 
                        WHERE status = 'published' OR status IS NULL
                        ORDER BY published_date DESC
                    ");
                    $stmt->execute();
                    $db_articles = $stmt->fetchAll();
                    
                    // Add database articles to combined array
                    foreach ($db_articles as $article) {
                        $all_articles[] = [
                            'title' => $article['title'],
                            'url' => !empty($article['slug']) ? "article-{$article['slug']}.php" : "article.php?id={$article['id']}",
                            'excerpt' => !empty($article['meta_description']) ? htmlspecialchars($article['meta_description']) : substr(strip_tags($article['content'] ?? ''), 0, 200) . '...',
                            'date' => $article['published_date'],
                            'source' => 'database'
                        ];
                    }
                } catch (PDOException $e) {
                    // Database error - will use hardcoded only
                }
                
                // Add hardcoded articles to combined array
                foreach ($hardcoded_articles as $article) {
                    $all_articles[] = [
                        'title' => $article['title'],
                        'url' => $article['url'],
                        'excerpt' => $article['excerpt'],
                        'date' => $article['date'],
                        'source' => 'hardcoded'
                    ];
                }
                
                // Sort all articles by date (newest first)
                usort($all_articles, function($a, $b) {
                    return strtotime($b['date']) - strtotime($a['date']);
                });
                
                // Display all articles
                if (count($all_articles) > 0) {
                    foreach ($all_articles as $article) {
                        echo "<div class='article'>";
                        echo "<h2><a href='{$article['url']}'>" . htmlspecialchars($article['title']) . "</a></h2>";
                        echo "<p>{$article['excerpt']}</p>";
                        echo "<a href='{$article['url']}' class='read-more'>Read more</a>";
                        echo "</div>\n";
                    }
                } else {
                    echo "<div class='article'>";
                    echo "<h2>No Articles Yet</h2>";
                    echo "<p>Check back soon for expert insights on web design, SEO, and digital marketing!</p>";
                    echo "</div>";
                }
                ?>
            </div>
        </section> 
    </main>
   
    <?php include("footer.php");?>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs" crossorigin="anonymous"></script>
    <script defer src="js/homepage.js"></script>
</body>
</html>
