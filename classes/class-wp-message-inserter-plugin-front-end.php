<?php
/**
 * Class file for the WP_Message_Inserter_Plugin_Front_End class.
 *
 * @file
 */

if ( ! class_exists( 'WP_Message_Inserter' ) ) {
	die();
}

/**
 * Create default structure for regions
 */
class WP_Message_Inserter_Plugin_Front_End {

	protected $option_prefix;
	protected $version;
	protected $slug;
	protected $regions;
	protected $content_items;

	/**
	* Constructor which sets up regions
	*
	* @param string $option_prefix
	* @param string $version
	* @param string $slug
	* @param object $regions
	* @param object $content_items
	* @throws \Exception
	*/
	public function __construct( $option_prefix, $version, $slug, $regions, $content_items ) {

		$this->option_prefix = $option_prefix;
		$this->version       = $version;
		$this->slug          = $slug;
		$this->regions       = $regions;
		$this->content_items = $content_items;

		$this->add_actions();

	}

	/**
	* Create the action hooks to create content items
	*
	*/
	public function add_actions() {
		add_action( 'wp_message_inserter', array( $this, 'insert_message' ) );
		//add_action( 'admin_menu', array( $this, 'create_sub_menus' ), 20 );
		//add_action( 'admin_menu', array( $this, 'remove_message_fields' ) );
		//add_action( 'cmb2_init', array( $this, 'create_message_fields' ) );
	}

	public function insert_message( $region ) {
		echo 'region is ' . $region;
	}

}
