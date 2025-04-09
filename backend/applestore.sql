-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 09, 2025 at 06:02 PM
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
-- Database: `applestore`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('normal_person','legal_person') NOT NULL,
  `county` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `full_address` text NOT NULL,
  `default_delivery` tinyint(1) DEFAULT NULL,
  `default_billing` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `type`, `county`, `city`, `full_address`, `default_delivery`, `default_billing`) VALUES
(7, 5, 'normal_person', 'Cluj', 'Cluj-Napoca', 'Str. Spataru Preda nr. 13 B', 0, 1),
(10, 5, 'normal_person', 'Constanța', 'Constanța', 'Str. Spataru Preda nr. 13 B', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `address_delivery`
--

CREATE TABLE `address_delivery` (
  `id` int(11) NOT NULL,
  `address_id` int(11) NOT NULL,
  `delivery_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `address_delivery`
--

INSERT INTO `address_delivery` (`id`, `address_id`, `delivery_type_id`) VALUES
(72, 7, 1);

-- --------------------------------------------------------

--
-- Table structure for table `apple_stores`
--

CREATE TABLE `apple_stores` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `hours` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `apple_stores`
--

INSERT INTO `apple_stores` (`id`, `name`, `latitude`, `longitude`, `address`, `phone`, `hours`) VALUES
(1, 'Apple Store - Downtown', 40.712800, -74.006000, '123 Main Street, New York, NY 10001', '+1 (212) 555-1234', 'Mon-Sat: 10AM-9PM, Sun: 11AM-7PM'),
(2, 'Apple Store - Westside', 34.052200, -118.243700, '456 Sunset Blvd, Los Angeles, CA 90028', '+1 (310) 555-5678', 'Mon-Sat: 9AM-10PM, Sun: 10AM-8PM'),
(3, 'Apple Store - North Center', 41.878100, -87.629800, '789 Michigan Ave, Chicago, IL 60611', '+1 (312) 555-9012', 'Mon-Sat: 10AM-9PM, Sun: 11AM-6PM');

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` int(11) NOT NULL,
  `county_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cities`
--

INSERT INTO `cities` (`id`, `county_id`, `name`) VALUES
(1, 1, 'București'),
(2, 2, 'Cluj-Napoca'),
(3, 3, 'Timișoara'),
(4, 4, 'Iași'),
(5, 5, 'Constanța'),
(6, 6, 'Brașov'),
(7, 7, 'Craiova'),
(8, 8, 'Sibiu'),
(9, 9, 'Galați'),
(10, 10, 'Ploiești');

-- --------------------------------------------------------

--
-- Table structure for table `counties`
--

CREATE TABLE `counties` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `counties`
--

INSERT INTO `counties` (`id`, `name`) VALUES
(6, 'Brașov'),
(1, 'București'),
(2, 'Cluj'),
(5, 'Constanța'),
(7, 'Dolj'),
(9, 'Galați'),
(4, 'Iași'),
(10, 'Prahova'),
(8, 'Sibiu'),
(3, 'Timiș');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed_amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_purchase` decimal(10,2) DEFAULT 0.00,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `usage_limit` int(11) DEFAULT 1,
  `used_count` int(11) DEFAULT 0,
  `status` enum('active','expired','disabled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_purchase`, `max_discount`, `valid_from`, `valid_until`, `usage_limit`, `used_count`, `status`, `created_at`, `updated_at`) VALUES
(1, 'SUMMER10', 'percentage', 10.00, 50.00, 20.00, '2025-06-01', '2025-08-31', 100, 0, 'active', '2025-04-03 15:54:56', '2025-04-03 15:54:56'),
(2, 'WELCOME5', 'fixed_amount', 5.00, 20.00, NULL, '2025-01-01', '2025-12-31', 1, 0, 'active', '2025-04-03 15:54:56', '2025-04-03 15:54:56'),
(3, 'BLACKFRIDAY50', 'percentage', 50.00, 100.00, 50.00, '2024-11-25', '2025-11-30', 200, 0, 'active', '2025-04-03 15:54:56', '2025-04-03 16:17:24'),
(4, 'BLACKFRIDAY25', 'percentage', 50.00, 80.00, 50.00, '2024-02-24', '2025-11-29', 200, 0, 'active', '2025-04-03 12:54:56', '2025-04-03 13:17:24');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_types`
--

CREATE TABLE `delivery_types` (
  `id` int(11) NOT NULL,
  `name` enum('default_delivery','default_billing') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_types`
--

INSERT INTO `delivery_types` (`id`, `name`) VALUES
(1, 'default_delivery'),
(2, 'default_billing');

-- --------------------------------------------------------

--
-- Table structure for table `device`
--

CREATE TABLE `device` (
  `ID` int(11) NOT NULL,
  `device_type` int(11) NOT NULL,
  `model` varchar(100) NOT NULL,
  `specs` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `keyboard_layout` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `production_date` date DEFAULT NULL,
  `in_stock` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device`
--

INSERT INTO `device` (`ID`, `device_type`, `model`, `specs`, `price`, `weight`, `keyboard_layout`, `image_url`, `production_date`, `in_stock`) VALUES
(1, 1, 'iPhone 15 Pro Max', 1, 1200.00, 0.22, 'QWERTY', 'iphone_15_pro_max_natural_titanium_pdp_image1.jpg', '2023-09-12', 0),
(2, 2, 'iPad Pro 12.9', 2, 1299.99, 0.68, 'QWERTY', 'ipad_pro_11_m4_wifi_space_black_pdp_image1.jpg', '2022-10-18', 1),
(3, 3, 'MacBook Air M2 15-inch', 3, 1499.99, 1.51, 'MIN', 'macbook_air_15_in_m3_starlight_pdp_image1.jpg', '2023-06-01', 1),
(4, 1, 'iPhone SE (2022)', 4, 429.99, 0.14, 'QWERTY', 'iphone_se3_starlight_pdp_image1.jpg', '2022-03-08', 1),
(5, 1, 'iPhone 15', 5, 799.99, 0.17, 'QWERTY', 'iphone_15_blue_pdp_image1.jpg', '2023-09-12', 1),
(6, 1, 'iPhone 15 Plus', 6, 899.99, 0.20, 'QWERTY', '	\r\niphone_15_blue_pdp_image1.jpg', '2023-09-12', 1),
(7, 1, 'iPhone 14', 7, 699.99, 0.17, 'QWERTY', 'iphone14_q422_blue_pdp_image1.jpg', '2022-09-12', 1),
(8, 2, 'iPad Air (5th Gen)', 8, 599.99, 0.46, 'QWERTY', 'ipad-air-5gen_image1.png', '2022-03-18', 1),
(9, 3, 'MacBook Pro 14-inch (M3 Pro)', 9, 1999.99, 1.55, 'QWERTY', 'macbook_pro_m3_space_gray_pdp_image1.jpg', '2023-10-30', 1),
(10, 3, 'MacBook Pro 16-inch (M3 Max)', 10, 3499.99, 2.16, 'QWERTY', 'macbook_pro_16-inch_m4_pro_or_max_chip_space_black_pdp_image1.jpg', '2023-11-07', 1);

-- --------------------------------------------------------

--
-- Table structure for table `device_capacity`
--

CREATE TABLE `device_capacity` (
  `ID` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `capacity` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device_capacity`
--

INSERT INTO `device_capacity` (`ID`, `device_id`, `capacity`) VALUES
(1, 1, '256GB'),
(2, 2, '512GB'),
(3, 3, '1TB'),
(4, 4, '128GB'),
(5, 5, '256GB'),
(6, 6, '512GB'),
(7, 7, '128GB'),
(8, 8, '256GB'),
(9, 9, '1TB'),
(10, 10, '2TB');

-- --------------------------------------------------------

--
-- Table structure for table `device_color`
--

CREATE TABLE `device_color` (
  `ID` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `color` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device_color`
--

INSERT INTO `device_color` (`ID`, `device_id`, `color`) VALUES
(1, 1, 'Natural Titanium'),
(2, 2, 'Silver'),
(3, 3, 'Midnight'),
(4, 4, 'Midnight'),
(5, 5, 'Blue'),
(6, 6, 'Pink'),
(7, 7, 'Purple'),
(8, 8, 'Space Gray'),
(9, 9, 'Silver'),
(10, 10, 'Space Black'),
(11, 1, 'Graphite'),
(12, 1, 'Gold'),
(13, 2, 'Space Gray'),
(14, 2, 'Starlight'),
(15, 3, 'Deep Purple'),
(16, 3, 'Midnight'),
(17, 4, 'Silver'),
(18, 4, 'Red'),
(19, 5, 'Blue'),
(20, 6, 'Pink'),
(21, 7, 'Green'),
(22, 8, 'Yellow'),
(23, 9, 'Titanium'),
(24, 10, 'Pacific Blue');

-- --------------------------------------------------------

--
-- Table structure for table `device_images`
--

CREATE TABLE `device_images` (
  `ID` int(11) NOT NULL,
  `device_ID` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device_images`
--

INSERT INTO `device_images` (`ID`, `device_ID`, `image_url`) VALUES
(1, 1, 'iphone_15_pro_max_natural_titanium_pdp_image2.jpg'),
(2, 1, 'hero_medium_2x.png'),
(3, 1, 'chip_large_2x.png'),
(4, 1, 'design_medium_2x.png'),
(5, 1, 'portrait_medium_2x.png'),
(6, 1, 'connectivity_medium_2x.png'),
(7, 1, 'action_button_medium_2x.png'),
(8, 2, 'ipadpro12_9.avif'),
(9, 2, 'ipad-pro-banner.jpeg'),
(10, 2, 'apple-ipad-pro-2017.jpg'),
(11, 2, 'ipadproM2Chip.jpeg'),
(12, 8, 'Apple-iPad-Air-hero-color.jpg'),
(13, 8, 'Apple-iPad-Air-usbc.jpg'),
(14, 8, 'Apple-iPad-Air-Magic-Keyboard.jpg'),
(15, 8, 'Apple-iPad-Air-iPadOS-Quick-Note.jpg'),
(16, 8, 'Apple-iPad-Air-iPadOS-Split-View.jpg'),
(17, 5, 'iphone_15_blue_pdp_image_position.jpg'),
(18, 5, 'iphone_15_blue_pdp_image_position2.jpg'),
(19, 5, 'iphone_15_blue_pdp_image_position5.jpg'),
(20, 5, 'iphone_15_blue_pdp_image_position-9__en-us_2_1.jpg'),
(21, 6, 'iphone_15_blue_pdp_image_position.jpg'),
(22, 6, 'iphone_15_blue_pdp_image_position2.jpg'),
(23, 6, 'iphone_15_blue_pdp_image_position5.jpg'),
(24, 6, 'iphone_15_blue_pdp_image_position-9__en-us_2_1.jpg'),
(25, 7, 'czcs_iphone14_q422_blue_pdp_image_position1b.jpg'),
(26, 7, 'czcs_iphone14_q422_blue_pdp_image_position-1a_t_1_1_8.jpg'),
(27, 7, 'czcs_iphone14_q422_blue_pdp_image_position-2_t_1_1_8.jpg'),
(28, 7, 'czcs_iphone14_q422_blue_pdp_image_position-3_t_1_1_8.jpg'),
(29, 7, 'wwen_iphone14_q223_yellow_pdp_image_position-4-min_17.jpg'),
(30, 7, 'wwen_iphone14_q223_yellow_pdp_image_position-5-min_13.jpg'),
(31, 4, 'iphone_se3_starlight_pdp_image_position-1b__wwen_10_2.jpg'),
(32, 4, 'iphone_se3_starlight_pdp_image_position-2__wwen_10_2.jpg'),
(33, 4, 'iphone_se3_starlight_pdp_image_position-3__wwen_10_2.jpg'),
(34, 4, 'iphone_se3_starlight_pdp_image_position-4__wwen_10_2.jpg'),
(35, 4, 'iphone_se3_starlight_pdp_image_position-6_5g__wwen_7_2.jpg'),
(36, 4, 'iphone_se3_starlight_pdp_image_position-5__wwen_7_2.jpg'),
(37, 3, 'macbook_air_15_in_m3_starlight_pdp_image_position_2__wwen_2.jpg'),
(38, 3, 'macbook_air_15_in_m3_starlight_pdp_image_position_3__wwen_2.jpg'),
(39, 3, 'macbook_air_15_in_m3_starlight_pdp_image_position_4__wwen_2.jpg'),
(40, 3, 'macbook_air_15_in_m3_starlight_pdp_image_position_5__wwen_2.jpg'),
(41, 3, 'macbook_air_15_in_m3_starlight_pdp_image_position_6__wwen_2.jpg'),
(42, 3, 'macbook_air_15_in_m3_starlight_pdp_image_position_7__wwen_2.jpg'),
(43, 3, 'macbook_air_15_in_m3_starlight_pdp_image_position_8__wwen_2.jpg'),
(44, 3, 'macbook_air_15_in_m3_starlight_pdp_image_position_9__wwen_2.jpg'),
(45, 9, 'macbook_pro_m3_space_gray_pdp_image_position-2__en-us_2_1_2_1.jpg'),
(46, 9, 'macbook_pro_m3_space_gray_pdp_image_position-3__en-us_2_1_2_1.jpg'),
(47, 9, 'macbook_pro_m3_space_gray_pdp_image_position-4__en-us_2_2_1.jpg'),
(48, 9, 'macbook_pro_m3_space_gray_pdp_image_position-5__en-us_2_2_1.jpg'),
(49, 9, 'macbook_pro_m3_space_gray_pdp_image_position-6__en-us_2_2_1.jpg'),
(50, 9, 'macbook_pro_m3_space_gray_pdp_image_position-7__en-us_2_2_1.jpg'),
(51, 9, 'macbook_pro_m3_space_gray_pdp_image_position-9__en-us_2_1_2_1.jpg'),
(52, 10, 'macbook_pro_16-inch_m4_pro_or_max_chip_space_black_pdp_image_position_2__ce-ww_t_3_1.jpg'),
(53, 10, 'macbook_pro_16-inch_m4_pro_or_max_chip_space_black_pdp_image_position_3__ce-ww_t_3_1.jpg'),
(54, 10, 'macbook_pro_16-inch_m4_pro_or_max_chip_space_black_pdp_image_position_4__ce-ww_t_3_1.jpg'),
(55, 10, 'macbook_pro_16-inch_m4_pro_or_max_chip_space_black_pdp_image_position_5__ce-ww_t_3_1.jpg'),
(56, 10, 'macbook_pro_16-inch_m4_pro_or_max_chip_space_black_pdp_image_position_6__ce-ww_t_3_1.jpg'),
(57, 10, 'macbook_pro_16-inch_m4_pro_or_max_chip_space_black_pdp_image_position_7__ce-ww_t_3_1.jpg'),
(58, 10, 'macbook_pro_16-inch_m4_pro_or_max_chip_space_black_pdp_image_position_8__ce-ww_t_3_1.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `device_promo`
--

CREATE TABLE `device_promo` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `imageUrl` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device_promo`
--

INSERT INTO `device_promo` (`id`, `name`, `imageUrl`, `link`) VALUES
(1, 'Macbook', 'macbook-pro.jpg', '/macbook'),
(2, 'iPad', 'ipadairM2.jpg', '/ipad'),
(3, 'iPhone', 'iphone16pro.jpg', '/iphone');

-- --------------------------------------------------------

--
-- Table structure for table `device_specs`
--

CREATE TABLE `device_specs` (
  `ID` int(11) NOT NULL,
  `display_specs` varchar(255) NOT NULL,
  `promotion_display` tinyint(1) DEFAULT 0,
  `material` varchar(100) NOT NULL,
  `button_specs` varchar(255) DEFAULT NULL,
  `front_camera` varchar(255) DEFAULT NULL,
  `CPU` varchar(255) NOT NULL,
  `GPU` varchar(255) DEFAULT NULL,
  `back_camera` varchar(255) DEFAULT NULL,
  `battery_life` int(11) DEFAULT NULL,
  `security` enum('Face ID','Touch ID') NOT NULL,
  `wifi_tech` enum('5G','4G') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device_specs`
--

INSERT INTO `device_specs` (`ID`, `display_specs`, `promotion_display`, `material`, `button_specs`, `front_camera`, `CPU`, `GPU`, `back_camera`, `battery_life`, `security`, `wifi_tech`) VALUES
(1, '6.7-inch OLED, 2796x1290', 1, 'Titanium', 'No Home Button', '12MP', 'A17 Pro Chip', NULL, '48MP (5x Zoom)', 29, 'Face ID', '5G'),
(2, '12.9-inch Liquid Retina XDR, 2732x2048', 1, 'Aluminum', 'No Home Button', '12MP', 'M2 Chip', NULL, '12MP Ultra Wide', 10, 'Face ID', '5G'),
(3, '15.3-inch Liquid Retina, 2880x1864', 0, 'Aluminum', 'Touch ID Button', '1080p', 'M2 Chip', '10-core GPU', NULL, 18, 'Touch ID', ''),
(4, '4.7-inch Retina HD, 1334x750', 0, 'Aluminum', 'Home Button', '7MP', 'A15 Bionic Chip', NULL, '12MP Wide', 15, 'Touch ID', '5G'),
(5, '6.1-inch OLED, 2556x1179', 1, 'Aluminum', 'No Home Button', '12MP', 'A16 Bionic Chip', NULL, '48MP (2x Zoom)', 20, 'Face ID', '5G'),
(6, '6.7-inch OLED, 2796x1290', 1, 'Aluminum', 'No Home Button', '12MP', 'A16 Bionic Chip', NULL, '48MP (2x Zoom)', 26, 'Face ID', '5G'),
(7, '6.1-inch OLED, 2532x1170', 1, 'Aluminum', 'No Home Button', '12MP', 'A15 Bionic Chip', NULL, '12MP Ultra Wide', 20, 'Face ID', '5G'),
(8, '10.9-inch Liquid Retina, 2360x1640', 0, 'Aluminum', 'No Home Button', '12MP', 'M1 Chip', NULL, '12MP Ultra Wide', 10, 'Touch ID', '5G'),
(9, '14.2-inch Liquid Retina XDR, 3024x1964', 1, 'Aluminum', 'Touch ID Button', '1080p', 'M3 Pro Chip', '14-core GPU', NULL, 18, 'Touch ID', ''),
(10, '16.2-inch Liquid Retina XDR, 3456x2234', 1, 'Aluminum', 'Touch ID Button', '1080p', 'M3 Max Chip', '40-core GPU', NULL, 22, 'Touch ID', '');

-- --------------------------------------------------------

--
-- Table structure for table `device_type`
--

CREATE TABLE `device_type` (
  `ID` int(11) NOT NULL,
  `device_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device_type`
--

INSERT INTO `device_type` (`ID`, `device_type`) VALUES
(2, 'iPad'),
(1, 'iPhone'),
(3, 'MacBook');

-- --------------------------------------------------------

--
-- Table structure for table `device_unifiedmemory`
--

CREATE TABLE `device_unifiedmemory` (
  `ID` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `unified_memory` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device_unifiedmemory`
--

INSERT INTO `device_unifiedmemory` (`ID`, `device_id`, `unified_memory`) VALUES
(1, 1, '8GB RAM'),
(2, 2, '8GB RAM'),
(3, 3, '16GB RAM'),
(4, 4, '4GB RAM'),
(5, 5, '6GB RAM'),
(6, 6, '6GB RAM'),
(7, 7, '6GB RAM'),
(8, 8, '8GB RAM'),
(9, 9, '18GB RAM'),
(10, 10, '36GB RAM');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_user`
--

CREATE TABLE `newsletter_user` (
  `id` int(11) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `newsletter_user`
--

INSERT INTO `newsletter_user` (`id`, `firstname`, `lastname`, `email`, `subscribed_at`) VALUES
(1, 'x', 'y', 'ads@mta.ro', '2025-03-07 12:13:11'),
(2, 'x', 'y', 'x@m.ro', '2025-03-07 21:04:41'),
(3, 'Tudor', 'Lepadatu', 'x@y.ro', '2025-03-19 06:09:19');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `device_id`, `user_id`, `order_id`, `order_date`, `last_updated`, `quantity`, `price`) VALUES
(33, 7, 5, 14, '2025-04-04 08:24:12', '2025-04-05 08:58:09', 2, 699.99),
(35, 5, 5, 16, '2025-04-05 09:28:21', '2025-04-05 09:28:21', 1, 799.99),
(36, 9, 5, 17, '2025-04-05 09:37:33', '2025-04-05 09:37:33', 1, 1999.99),
(37, 3, 5, 17, '2025-04-05 09:49:33', '2025-04-05 09:49:33', 1, 1499.99),
(38, 9, 5, 18, '2025-04-05 09:50:00', '2025-04-05 09:50:00', 1, 1999.99),
(39, 8, 5, 18, '2025-04-05 09:50:31', '2025-04-05 11:40:24', 2, 599.99),
(40, 5, 5, 19, '2025-04-05 11:40:40', '2025-04-05 11:40:40', 1, 799.99),
(41, 2, 5, 19, '2025-04-05 11:40:47', '2025-04-05 11:40:47', 1, 1299.99),
(43, 8, 5, 21, '2025-04-06 20:16:31', '2025-04-06 20:16:37', 2, 599.99),
(64, 5, 5, 29, '2025-04-09 13:21:39', '2025-04-09 13:35:22', 6, 799.99),
(65, 3, 5, 29, '2025-04-09 13:22:08', '2025-04-09 13:22:14', 2, 1499.99),
(66, 9, 5, 29, '2025-04-09 13:22:22', '2025-04-09 13:27:01', 2, 1999.99),
(67, 4, 5, 29, '2025-04-09 13:22:30', '2025-04-09 13:22:39', 2, 429.99),
(68, 7, 5, 29, '2025-04-09 13:36:02', '2025-04-09 13:36:03', 2, 699.99),
(69, 8, 5, 30, '2025-04-09 13:36:25', '2025-04-09 13:36:35', 4, 599.99),
(70, 7, 5, 30, '2025-04-09 13:36:42', '2025-04-09 13:36:42', 1, 699.99);

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nb_orders` int(11) DEFAULT NULL,
  `address_delivery_id` int(11) DEFAULT NULL,
  `status` enum('pending','shipped','delivered','cancelled') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`id`, `user_id`, `nb_orders`, `address_delivery_id`, `status`) VALUES
(14, 5, 1, 10, 'shipped'),
(16, 5, 1, 10, 'shipped'),
(17, 5, 2, 10, 'cancelled'),
(18, 5, 3, 10, 'shipped'),
(19, 5, 2, 10, 'shipped'),
(21, 5, 1, 10, 'shipped'),
(29, 5, 14, 10, 'shipped'),
(30, 5, 5, 10, 'shipped');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `user_type` int(11) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `password`, `phone`, `address`, `user_type`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'User', 'admin@apple.com', '$2b$10$mvflw9k/vEPwaH3g1Y74VeTQATMU1SAoN/3T6UdQKTdULoQR.5obS', '+1234567890', '123 Admin Street, Admin City', 2, NULL, NULL, '2025-03-15 09:30:27', '2025-04-05 19:37:35'),
(5, 'Tudor', 'Lepadatu', 'tudorlepadatu@yahoo.com', '$2b$10$VgDmDwMFKCfmKBsrmMFeyeS9b86jVTQ3nenYx9P1t5qGQyaj4UI6m', '0734324325', 'Str. 1 Decembrie 1918', 1, NULL, NULL, '2025-03-27 18:45:43', '2025-04-09 12:27:26'),
(6, 'Razvan', 'Popescu', 'razvan.popescu@mta.ro', '$2b$10$ZWmklBfIBbsCN8slZrqiAuZ2Yb9AfIzMmjypjpWvD29EeqyqSh77K', '0734324325', NULL, 1, NULL, NULL, '2025-04-05 21:21:12', '2025-04-05 21:21:12'),
(7, 'Razvan', 'Georgescu', 'r@mta.ro', '$2b$10$p/3gJ7MNx4IuW17Oe2OdXeGrma32h2tWSDRO2ylTYgSRVcptlNyby', '0734324325', 'Str. Viilor', 1, NULL, NULL, '2025-04-09 12:25:14', '2025-04-09 12:25:14');

-- --------------------------------------------------------

--
-- Table structure for table `user_types`
--

CREATE TABLE `user_types` (
  `id` int(11) NOT NULL,
  `type_name` enum('normal_user','admin') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_types`
--

INSERT INTO `user_types` (`id`, `type_name`) VALUES
(1, 'normal_user'),
(2, 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `address_delivery`
--
ALTER TABLE `address_delivery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `address_id` (`address_id`),
  ADD KEY `delivery_type_id` (`delivery_type_id`);

--
-- Indexes for table `apple_stores`
--
ALTER TABLE `apple_stores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `county_id` (`county_id`);

--
-- Indexes for table `counties`
--
ALTER TABLE `counties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `delivery_types`
--
ALTER TABLE `delivery_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `device`
--
ALTER TABLE `device`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `device_type` (`device_type`),
  ADD KEY `specs` (`specs`);

--
-- Indexes for table `device_capacity`
--
ALTER TABLE `device_capacity`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `device_id` (`device_id`);

--
-- Indexes for table `device_color`
--
ALTER TABLE `device_color`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `device_id` (`device_id`);

--
-- Indexes for table `device_images`
--
ALTER TABLE `device_images`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `device_ID` (`device_ID`);

--
-- Indexes for table `device_promo`
--
ALTER TABLE `device_promo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `device_specs`
--
ALTER TABLE `device_specs`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `device_type`
--
ALTER TABLE `device_type`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `device_type` (`device_type`);

--
-- Indexes for table `device_unifiedmemory`
--
ALTER TABLE `device_unifiedmemory`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `device_id` (`device_id`);

--
-- Indexes for table `newsletter_user`
--
ALTER TABLE `newsletter_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `device_id` (`device_id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `address_delivery_id` (`address_delivery_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `user_type` (`user_type`);

--
-- Indexes for table `user_types`
--
ALTER TABLE `user_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `address_delivery`
--
ALTER TABLE `address_delivery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `apple_stores`
--
ALTER TABLE `apple_stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `counties`
--
ALTER TABLE `counties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `delivery_types`
--
ALTER TABLE `delivery_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `device`
--
ALTER TABLE `device`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `device_capacity`
--
ALTER TABLE `device_capacity`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `device_color`
--
ALTER TABLE `device_color`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `device_images`
--
ALTER TABLE `device_images`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `device_promo`
--
ALTER TABLE `device_promo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `device_specs`
--
ALTER TABLE `device_specs`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `device_type`
--
ALTER TABLE `device_type`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `device_unifiedmemory`
--
ALTER TABLE `device_unifiedmemory`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `newsletter_user`
--
ALTER TABLE `newsletter_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_types`
--
ALTER TABLE `user_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `address_delivery`
--
ALTER TABLE `address_delivery`
  ADD CONSTRAINT `address_delivery_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `address_delivery_ibfk_2` FOREIGN KEY (`delivery_type_id`) REFERENCES `delivery_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`county_id`) REFERENCES `counties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `device`
--
ALTER TABLE `device`
  ADD CONSTRAINT `device_ibfk_1` FOREIGN KEY (`device_type`) REFERENCES `device_type` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `device_ibfk_2` FOREIGN KEY (`specs`) REFERENCES `device_specs` (`ID`) ON DELETE SET NULL;

--
-- Constraints for table `device_capacity`
--
ALTER TABLE `device_capacity`
  ADD CONSTRAINT `device_capacity_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `device` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `device_color`
--
ALTER TABLE `device_color`
  ADD CONSTRAINT `device_color_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `device` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `device_images`
--
ALTER TABLE `device_images`
  ADD CONSTRAINT `device_images_ibfk_1` FOREIGN KEY (`device_ID`) REFERENCES `device` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `device_unifiedmemory`
--
ALTER TABLE `device_unifiedmemory`
  ADD CONSTRAINT `device_unifiedmemory_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `device` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `order_details` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`device_id`) REFERENCES `device` (`ID`);

--
-- Constraints for table `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`address_delivery_id`) REFERENCES `addresses` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`user_type`) REFERENCES `user_types` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
