<?php
/*
Plugin Name: WP Message Inserter Plugin
Description: Inserts site messaging into WordPress layouts
Version: 0.0.1
Author: Jonathan Stegall
Author URI: https://code.minnpost.com
Text Domain: wp-message-inserter-plugin
License: GPL2+
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

class WP_Message_Inserter {

	/**
	* @var string
	* The plugin version
	*/
	private $version;

	/**
	* @var string
	* The plugin's slug
	*/
	protected $slug;

	/**
	* @var string
	* The plugin's prefix for saving options
	*/
	protected $option_prefix;

	/**
	* @var object
	* Load and initialize the WP_Message_Inserter_Plugin_Regions class
	*/
	public $regions;

	/**
	* @var object
	* Load and initialize the WP_Message_Inserter_Plugin_Content_Items class
	*/
	public $content_items;

	/**
	* @var object
	* Load and initialize the WP_Message_Inserter_Plugin_Admin class
	*/
	public $admin;

	/**
	* @var object
	* Load and initialize the WP_Message_Inserter_Plugin_Front_End class
	*/
	public $front_end;

	/**
	 * @var object
	 * Static property to hold an instance of the class; this seems to make it reusable
	 *
	 */
	static $instance = null;

	/**
	* Load the static $instance property that holds the instance of the class.
	* This instance makes the class reusable by other plugins
	*
	* @return object
	*
	*/
	static public function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new WP_Message_Inserter();
		}
		return self::$instance;
	}

	/**
	 * This is our constructor
	 *
	 * @return void
	 */
	public function __construct() {

		$this->version       = '0.0.1';
		$this->slug          = 'wp-message-inserter-plugin';
		$this->option_prefix = 'wp_message_inserter_';

		// wp cache settings
		//$this->cache = $this->cache();
		// regions
		$this->regions = $this->regions();
		// content items
		$this->content_items = $this->content_items();
		// admin settings
		$this->admin = $this->admin();
		// front end settings
		$this->front_end = $this->front_end();

		$this->add_actions();

	}

	/**
	* Do actions
	*
	*/
	private function add_actions() {
		add_action( 'plugins_loaded', array( $this, 'textdomain' ) );
		//register_activation_hook( __FILE__, array( $this, 'add_roles_capabilities' ) );
	}

	/**
	 * Plugin regions
	 *
	 * @return object $regions
	 */
	public function regions() {
		require_once( plugin_dir_path( __FILE__ ) . 'classes/class-' . $this->slug . '-regions.php' );
		$regions = new WP_Message_Inserter_Plugin_Regions( $this->option_prefix, $this->version, $this->slug );
		return $regions;
	}

	/**
	 * Plugin content items
	 *
	 * @return object $content_items
	 */
	public function content_items() {
		require_once( plugin_dir_path( __FILE__ ) . 'classes/class-' . $this->slug . '-content-items.php' );
		$content_items = new WP_Message_Inserter_Plugin_Content_Items( $this->option_prefix, $this->version, $this->slug, $this->regions );
		return $content_items;
	}

	/**
	 * Plugin admin
	 *
	 * @return object $admin
	 */
	public function admin() {
		require_once( plugin_dir_path( __FILE__ ) . 'classes/class-' . $this->slug . '-admin.php' );
		$admin = new WP_Message_Inserter_Plugin_Admin( $this->option_prefix, $this->version, $this->slug, $this->content_items );
		add_filter( 'plugin_action_links', array( $this, 'plugin_action_links' ), 10, 2 );
		return $admin;
	}

	/**
	 * Plugin front end
	 *
	 * @return object $front_end
	 */
	public function front_end() {
		require_once( plugin_dir_path( __FILE__ ) . 'classes/class-' . $this->slug . '-front-end.php' );
		$front_end = new WP_Message_Inserter_Plugin_Front_End( $this->option_prefix, $this->version, $this->slug, $this->regions, $this->content_items );
		return $front_end;
	}

	/**
	 * Load textdomain
	 *
	 * @return void
	 */
	public function textdomain() {
		load_plugin_textdomain( 'wp-message-inserter-plugin', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
	}

	/**
	* Display a Settings link on the main Plugins page
	*
	* @param array $links
	* @param string $file
	* @return array $links
	* These are the links that go with this plugin's entry
	*/
	public function plugin_action_links( $links, $file ) {
		if ( plugin_basename( __FILE__ ) === $file ) {
			$settings = '<a href="' . get_admin_url() . 'admin.php?page=' . $this->slug . '">' . __( 'Settings', 'wp-message-inserter-plugin' ) . '</a>';
			array_unshift( $links, $settings );
		}
		return $links;
	}

}

// Instantiate our class
$wp_message_inserter = WP_Message_Inserter::get_instance();
