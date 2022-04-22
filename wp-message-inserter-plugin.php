<?php
/*
Plugin Name: WP Message Inserter Plugin
Description: Inserts site messaging into WordPress layouts
Version: 0.2.0
Author: Jonathan Stegall
Author URI: https://code.minnpost.com
Text Domain: wp-message-inserter-plugin
License: GPL2+
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

/* Exit if accessed directly */
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * The full path to the main file of this plugin
 *
 * This can later be passed to functions such as
 * plugin_dir_path(), plugins_url() and plugin_basename()
 * to retrieve information about plugin paths
 *
 * @since 0.0.6
 * @var string
 */
define( 'WP_MESSAGE_INSERTER_PLUGIN_FILE', __FILE__ );

/**
 * The plugin's current version
 *
 * @since 0.0.6
 * @var string
 */
define( 'WP_MESSAGE_INSERTER_PLUGIN_VERSION', '0.2.0' );

// Load the autoloader.
require_once( 'lib/autoloader.php' );

/**
 * Retrieve the instance of the main plugin class
 *
 * @since 0.0.6
 * @return WP_Message_Inserter_Plugin
 */
function wp_message_inserter_plugin() {
	static $plugin;

	if ( is_null( $plugin ) ) {
		$plugin = new WP_Message_Inserter_Plugin( WP_MESSAGE_INSERTER_PLUGIN_VERSION, WP_MESSAGE_INSERTER_PLUGIN_FILE );
	}

	return $plugin;
}

wp_message_inserter_plugin()->init();
