<?php
/**
 * Plugin Name: Custom Posts Flip Book 3D
 * Plugin URI: http://webcodingplace.com/custom-posts-book-3d-wordpress-plugin
 * Description: Displays Posts, WooCommerce Products and Custom Post Types as 3d Flip Book
 * Version: 1.0
 * Author: Fayaz Ahmad Arslan
 * Author URI: http://webcodingplace.com/
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: post-book
 */

/*
  Copyright (C) 2015  WebCodingPlace  help@webcodingplace.com
*/

require_once('book.class.php');

if( class_exists('WCP_Posts_Booklet')){
	
	$just_initialize = new WCP_Posts_Booklet;
}

?>