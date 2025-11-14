<?php
/**
 * Database Connection Template
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to your website root as 'dbconnect.php'
 * 2. Update the credentials below with your actual database information
 * 3. DO NOT commit dbconnect.php to version control
 * 4. Add dbconnect.php to your .gitignore file
 */

// Database Configuration
$host = 'localhost';              // Usually 'localhost' or '127.0.0.1'
$db   = 'your_database_name';     // Your database name
$user = 'your_username';          // Your database username
$pass = 'your_password';          // Your database password
$charset = 'utf8';                // Character set (leave as utf8)

// Create PDO connection
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$opt = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $opt);
} catch (PDOException $e) {
    // Log error but don't expose details to users
    error_log("Database connection failed: " . $e->getMessage());
    die("Database connection failed. Please check your configuration.");
}

/**
 * COMMON DATABASE CONFIGURATIONS:
 * 
 * Local Development (XAMPP/WAMP):
 * $host = 'localhost';
 * $db   = 'your_database';
 * $user = 'root';
 * $pass = '';  // Usually empty for local
 * 
 * cPanel Hosting:
 * $host = 'localhost';
 * $db   = 'username_dbname';
 * $user = 'username_dbuser';
 * $pass = 'your_password';
 * 
 * Remote MySQL:
 * $host = 'mysql.example.com';
 * $db   = 'database_name';
 * $user = 'username';
 * $pass = 'password';
 */
?>
