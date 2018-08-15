<?php
/**
 * Class file for the WP_Message_Inserter_Plugin_Regions class.
 *
 * @file
 */

if ( ! class_exists( 'WP_Message_Inserter' ) ) {
	die();
}

/**
 * Create default structure for regions
 */
class WP_Message_Inserter_Plugin_Regions {

	protected $option_prefix;
	protected $post_meta_prefix;
	protected $version;
	protected $slug;

	/**
	* Constructor which sets up regions
	*
	* @param string $option_prefix
	* @param string $post_meta_prefix
	* @param string $version
	* @param string $slug
	* @throws \Exception
	*/
	public function __construct( $option_prefix, $post_meta_prefix, $version, $slug ) {

		$this->option_prefix    = $option_prefix;
		$this->post_meta_prefix = $post_meta_prefix;
		$this->version          = $version;
		$this->slug             = $slug;

		$this->add_actions();

	}

	/**
	* Create the action hooks to create content items
	*
	*/
	public function add_actions() {
		add_action( 'init', array( $this, 'get_regions' ) );
	}

	/**
	* Get the full list of regions where messages can go
	*
	* @return array $regions
	*
	*/
	public function get_regions() {
		$regions = array();
		$regions = apply_filters( 'wp_message_inserter_regions', $regions );
		return $regions;
	}

}
