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
	protected $post_meta_prefix;
	protected $version;
	protected $slug;
	protected $regions;
	protected $content_items;

	/**
	* Constructor which sets up regions
	*
	* @param string $option_prefix
	* @param string $post_meta_prefix
	* @param string $version
	* @param string $slug
	* @param object $regions
	* @param object $content_items
	* @throws \Exception
	*/
	public function __construct( $option_prefix, $post_meta_prefix, $version, $slug, $regions, $content_items ) {

		$this->option_prefix    = $option_prefix;
		$this->post_meta_prefix = $post_meta_prefix;
		$this->version          = $version;
		$this->slug             = $slug;
		$this->regions          = $regions;
		$this->content_items    = $content_items;

		$this->add_actions();

	}

	/**
	* Create the action hooks to create content items
	*
	*/
	public function add_actions() {
		add_action( 'wp_message_inserter', array( $this, 'insert_message' ) );
	}

	/**
	* Insert the message via the template, if the message data is not empty
	* @param string $region
	*
	*/
	public function insert_message( $region ) {
		$message = $this->get_eligible_message( $region );
		if ( ! empty( $message ) ) {
			$params['meta_prefix'] = $this->post_meta_prefix;
			$params['message']     = array_merge( $message, $message['meta'] );
			echo $this->get_template_html( 'message', $region, 'front-end', $params );
		}
	}

	/**
	* Load the message based on the conditional(s) and region
	* @param string $region
	* @return array $post
	*
	*/
	private function get_eligible_message( $region ) {
		$post               = array();
		$conditionals       = $this->content_items->get_conditionals();
		$true_conditionals  = array();
		$false_conditionals = array();
		foreach ( $conditionals as $conditional ) {
			$name = $conditional['name'];
			if ( isset( $conditional['method'] ) && '' !== $conditional['method'] ) {
				$name = $conditional['method'];
			}
			if ( false === $conditional['has_params'] ) {
				if ( true === $name() ) {
					$true_conditionals[] = $name;
				} else {
					$false_conditionals[] = $name;
				}
			}
		}
		$args  = array(
			'post_type'      => 'message',
			'post_status'    => 'publish',
			'orderby'        => 'menu_order',
			'posts_per_page' => -1,
			'meta_query'     => array(
				array(
					'key'     => $this->post_meta_prefix . 'region',
					'value'   => $region,
					'compare' => '=',
				),
			),
		);
		$args  = apply_filters( 'wp_message_inserter_post_args', $args );
		$query = new WP_Query( $args );
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$message_meta = get_post_meta( get_the_ID() );
				$conditional  = isset( $message_meta['conditional_group_id'][0] ) ? $message_meta['conditional_group_id'][0] : '';
				$conditional  = maybe_unserialize( $conditional );

				$conditional_result = $conditional[0]['_wp_inserted_message_conditional_result'];
				$conditional        = $conditional[0]['_wp_inserted_message_conditional'];

				// If our key is equal to a conditional with a method?
				$key = array_search( $conditional, array_column( $conditionals, 'name' ), true );
				if ( false !== $key && isset( $conditionals[ $key ]['method'] ) ) {
					$conditional = $conditionals[ $key ]['method'];
				}

				// Conditional Value only appears for certain types of conditions. It is a text box that says "Enter the value expected for this conditional"
				// is_logged_in doesn't have one
				// TODO Figure out where this comes into play
				$conditional_value  = isset( $message_meta[ $this->post_meta_prefix . 'conditional_value' ][0] ) ? $message_meta[ $this->post_meta_prefix . 'conditional_value' ][0] : '';
				$conditional_result = isset( $conditional_result ) ? filter_var( $conditional_result, FILTER_VALIDATE_BOOLEAN ) : false;

				// If no conditional is set
				if ( '' === $conditional ) {
					// Grab whatever we can?
					$post         = get_post( get_the_ID(), ARRAY_A );
					$post['meta'] = $message_meta;
				} else {
					// If there isn't a value...
					if ( '' === $conditional_value ) {
						if ( function_exists( $conditional ) && $conditional_result === $conditional() ) {
							$post         = get_post( get_the_ID(), ARRAY_A );
							$post['meta'] = $message_meta;
						}
					} else { // If there is a value
						if ( function_exists( $conditional ) && $conditional_result === $conditional( $conditional_value ) ) {
							$post         = get_post( get_the_ID(), ARRAY_A );
							$post['meta'] = $message_meta;
						}
					}
				}
			}
			wp_reset_postdata();
			return $post;
		} else {
			return $post;
		}
	}

	/**
	 * Renders the contents of the given template to a string and returns it.
	 *
	 * @param string $template_name The name of the template to render (without .php)
	 * @param string $location      Folder location for the template (ie front-end or admin)
	 * @param array  $attributes    The PHP variables for the template
	 *
	 * @return string               The contents of the template.
	 */
	public function get_template_html( $template_name, $region = '', $location = '', $attributes = null ) {
		if ( ! $attributes ) {
			$attributes = array();
		}

		if ( '' !== $location ) {
			$location = $location . '/';
		}

		ob_start();

		do_action( 'wp_message_inserter_plugin_before_' . $template_name );

		// allow users to put templates into their theme
		$file = '';
		if ( '' !== $region ) {
			if ( file_exists( get_theme_file_path() . '/' . $this->slug . '-templates/' . $location . $template_name . '-' . $region . '.php' ) ) {
				$file = get_theme_file_path() . '/' . $this->slug . '-templates/' . $location . $template_name . '-' . $region . '.php';
			} elseif ( file_exists( plugin_dir_path( __FILE__ ) . '../templates/' . $location . $template_name . '-' . $region . '.php' ) ) {
				$file = plugin_dir_path( __FILE__ ) . '../templates/' . $location . $template_name . '-' . $region . '.php';
			}
		}
		if ( '' === $file ) {
			if ( file_exists( get_theme_file_path() . '/' . $this->slug . '-templates/' . $location . $template_name . '.php' ) ) {
				$file = get_theme_file_path() . '/' . $this->slug . '-templates/' . $location . $template_name . '.php';
			} else {
				$file = plugin_dir_path( __FILE__ ) . '../templates/' . $location . $template_name . '.php';
			}
		}

		require( $file );

		do_action( 'wp_message_inserter_plugin_after_' . $template_name );

		$html = ob_get_contents();
		ob_end_clean();

		return $html;
	}

}
