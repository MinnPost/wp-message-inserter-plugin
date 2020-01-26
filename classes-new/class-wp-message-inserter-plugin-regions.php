<?php

/**
 * Create default structure for regions
 *
 * @package WP_Message_Inserter_Plugin
 */
class WP_Message_Inserter_Plugin_Regions {

	public $option_prefix;
	public $post_meta_prefix;
	public $version;
	public $slug;

	public function __construct() {

		$this->option_prefix    = wp_message_inserter_plugin()->option_prefix;
		$this->post_meta_prefix = wp_message_inserter_plugin()->post_meta_prefix;
		$this->version          = wp_message_inserter_plugin()->version;
		$this->slug             = wp_message_inserter_plugin()->slug;

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
		$regions = apply_filters( $this->option_prefix . 'regions', $regions );
		do_action( $this->option_prefix . 'regions', $regions, null );
		return $regions;
	}

}
