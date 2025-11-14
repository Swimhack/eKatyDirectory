-- Blog Manager Database Setup
-- Version: 1.0
-- Created: November 2025
-- Author: James Strickland / Strickland Technology

-- Create blog_articles table
CREATE TABLE IF NOT EXISTS `blog_articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `meta_description` text DEFAULT NULL,
  `keywords` varchar(500) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `author_name` varchar(100) DEFAULT 'James Strickland',
  `contact_email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `published_date` datetime DEFAULT current_timestamp(),
  `status` enum('draft','published') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_published_date` (`published_date`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample article (optional - remove if not needed)
INSERT INTO `blog_articles` 
(`title`, `content`, `meta_description`, `keywords`, `author_name`, `contact_email`, `phone_number`) 
VALUES
('Welcome to Your New Blog',
'<h2>Your Blog is Ready!</h2>
<p>Congratulations! Your AI-powered blog management system is now set up and ready to use.</p>
<h3>What You Can Do:</h3>
<ul>
<li><strong>Generate Articles:</strong> Create professional, SEO-optimized content in seconds</li>
<li><strong>Manage Content:</strong> Edit, publish, and organize your articles</li>
<li><strong>Fix Links:</strong> Automatically repair broken internal links</li>
<li><strong>Track Performance:</strong> Monitor your blog\'s growth</li>
</ul>
<p>Ready to get started? Head to the blog manager and create your first article!</p>
<p><a href="contact.php">Contact us</a> if you need any assistance.</p>',
'Get started with your new AI-powered blog management system. Create professional content in seconds.',
'blog, content management, AI writing, SEO, digital marketing',
'James Strickland',
'james@stricklandtechnology.net',
'713-444-6732');

-- Success message
SELECT 'Blog database setup complete!' AS Status;
SELECT COUNT(*) AS 'Articles Created' FROM blog_articles;
