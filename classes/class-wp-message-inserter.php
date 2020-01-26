<?php

/**
 * The main plugin class
 *
 * @package WP_Message_Inserter
 */
class WP_Message_Inserter {

	/**
	 * The version number for this release of the plugin.
	 * This will later be used for upgrades and enqueuing files
	 *
	 * This should be set to the 'Plugin Version' value defined
	 * in the plugin header.
	 *
	 * @var string A PHP-standardized version number string
	 */
	public $version;

	/**
	 * Filesystem path to the main plugin file
	 * @var string
	 */
	public $file;

	/**
	 * Prefix for plugin options
	 * @var string
	 */
	public $option_prefix;

	/**
	 * Prefix for post meta records
	 * @var string
	 */
	public $post_meta_prefix;

	/**
	 * Plugin slug
	 * @var string
	 */
	public $slug;

	/**
	 * Regions where messages can be loaded
	 * @var object
	 */
	public $regions;

	/**
	 * Custom content type features for messages
	 * @var object
	 */
	public $content_items;

	/**
	 * @var object
	 * Administrative interface features
	 */
	public $admin;

	/**
	 * Front end interface features
	 * @var object
	 */
	public $front_end;

	/**
	 * Class constructor
	 *
	 * @param string $version The current plugin version
	 * @param string $file The main plugin file
	 */
	public function __construct( $version, $file ) {
		$this->version          = $version;
		$this->file             = $file;
		$this->option_prefix    = 'wp_message_inserter_';
		$this->post_meta_prefix = '_wp_inserted_message_';
		$this->slug             = 'wp-message-inserter-plugin';

		add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );

	}

	public function init() {

		// Region features
		$this->regions = new WP_Message_Inserter_Regions();

		// Content items
		$this->content_items = new WP_Message_Inserter_Content_Items();

		// Admin features
		$this->admin = new WP_Message_Inserter_Admin();

		// Front end features
		$this->front_end = new WP_Message_Inserter_Front_End();

	}

	/**
	 * Get the URL to the plugin admin menu
	 *
	 * @return string          The menu's URL
	 */
	public function get_menu_url() {
		$url = 'options-general.php?page=' . $this->slug;
		return admin_url( $url );
	}

	/**
	 * Load up the localization file if we're using WordPress in a different language.
	 *
	 */
	public function load_textdomain() {
		load_plugin_textdomain( 'wp-message-inserter', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
	}

}
