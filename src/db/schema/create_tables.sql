-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 09, 2025 at 09:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `my_dekho`
--

-- --------------------------------------------------------

--
-- Table structure for table `bd_auto_post_details`
--

CREATE TABLE `bd_auto_post_details` (
  `id` mediumint(7) NOT NULL,
  `user_id` mediumint(7) DEFAULT NULL,
  `keywords` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_at` time DEFAULT NULL,
  `scheduled_on` date DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bd_blogs_listing`
--

CREATE TABLE `bd_blogs_listing` (
  `id` mediumint(7) NOT NULL,
  `userid` varchar(100) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `excerpt` varchar(100) DEFAULT NULL,
  `img_url` varchar(100) DEFAULT NULL,
  `mode` varchar(15) DEFAULT NULL,
  `created-at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bd_likes`
--

CREATE TABLE `bd_likes` (
  `id` mediumint(7) NOT NULL,
  `liked_by` mediumint(7) DEFAULT NULL,
  `liked_user_id` mediumint(7) DEFAULT NULL,
  `liked_blog_id` mediumint(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bd_subscriptions`
--

CREATE TABLE `bd_subscriptions` (
  `id` mediumint(7) NOT NULL,
  `subscribed_by` mediumint(7) DEFAULT NULL,
  `subscribed_channel_id` mediumint(7) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bd_user`
--

CREATE TABLE `bd_user` (
  `id` mediumint(7) NOT NULL,
  `userid` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `subscribers` mediumint(7) NOT NULL,
  `email` varchar(100) NOT NULL,
  `about` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profilepic` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` mediumint(7) DEFAULT NULL,
  `token` text DEFAULT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bd_auto_post_details`
--
ALTER TABLE `bd_auto_post_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bd_blogs_listing`
--
ALTER TABLE `bd_blogs_listing`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bd_likes`
--
ALTER TABLE `bd_likes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bd_subscriptions`
--
ALTER TABLE `bd_subscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bd_user`
--
ALTER TABLE `bd_user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bd_auto_post_details`
--
ALTER TABLE `bd_auto_post_details`
  MODIFY `id` mediumint(7) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bd_blogs_listing`
--
ALTER TABLE `bd_blogs_listing`
  MODIFY `id` mediumint(7) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bd_likes`
--
ALTER TABLE `bd_likes`
  MODIFY `id` mediumint(7) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bd_subscriptions`
--
ALTER TABLE `bd_subscriptions`
  MODIFY `id` mediumint(7) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bd_user`
--
ALTER TABLE `bd_user`
  MODIFY `id` mediumint(7) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
