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
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts_and_styles' ) );
		add_action( 'wp_message_inserter', array( $this, 'insert_message' ) );
	}

	/**
	 * Frontend styles. Load the CSS and/or JavaScript.
	 *
	 * @return void
	 */
	public function frontend_scripts_and_styles() {
		$javascript_dependencies = array( 'jquery' );
		$css_dependencies        = array();
		wp_enqueue_script( $this->slug . '-front-end', plugins_url( 'assets/js/' . $this->slug . '-front-end.min.js', dirname( __FILE__ ) ), $javascript_dependencies, filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/js/' . $this->slug . '-front-end.min.js' ), true );
		wp_enqueue_style( $this->slug . '-front-end', plugins_url( 'assets/css/' . $this->slug . '-front-end.min.css', dirname( __FILE__ ) ), $css_dependencies, filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/css/' . $this->slug . '-front-end.min.css' ), 'all' );
	}

	/**
	* Insert the message via the template, if the message data is not empty
	* @param string $region
	*
	*/
	public function insert_message( $region ) {
		$messages = array_reverse( $this->get_eligible_message( $region ) );
		foreach ( $messages as $message ) {
			if ( 0 !== sizeof( $message ) ) {
				$params['meta_prefix'] = $this->post_meta_prefix;
				$params['message']     = array_merge( $message, $message['meta'] );
				echo $this->get_template_html( 'message', $region, 'front-end', $params );
			}
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
		$groupedposts = array();
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
		// load all possible messges for the given region
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
		$args  = apply_filters( $this->option_prefix . 'post_args', $args );
		$query = new WP_Query( $args );

		// if there are any published messages for this region, loop through them and check their conditionals
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();

				$message_meta = get_post_meta( get_the_ID() );
				$operator     = $message_meta['_wp_inserted_message_conditional_operator'][0];

				// Array of Conditions set on a banner
				$conditional = isset( $message_meta['conditional_group_id'][0] ) ? $message_meta['conditional_group_id'][0] : '';
				$conditional = maybe_unserialize( $conditional );

				// Set conditional if it has a method associated with it in the $conditionals array
				$key = array_search( $conditional, array_column( $conditionals, 'name' ), true );
				if ( false !== $key && isset( $conditionals[ $key ]['method'] ) ) {
					$conditional = $conditionals[ $key ]['method'];
				}

				// If no conditional is set
				if ( '' === $conditional ) {
					// Grab whatever we can?
					$post         = get_post( get_the_ID(), ARRAY_A );
					$post['meta'] = $message_meta;
				} else {
					$show_banner = false;
					foreach ( $conditional as $condkey => $condvalue ) {
						$conditional_method = isset( $condvalue['_wp_inserted_message_conditional'] ) ? $condvalue['_wp_inserted_message_conditional'] : '';
						$conditional_value  = isset( $condvalue['_wp_inserted_message_conditional_value'] ) ? $condvalue['_wp_inserted_message_conditional_value'] : '';
						$conditional_result = isset( $condvalue['_wp_inserted_message_conditional_result'] ) ? $condvalue['_wp_inserted_message_conditional_result'] : '';
						$conditional_result = isset( $conditional_result ) ? filter_var( $conditional_result, FILTER_VALIDATE_BOOLEAN ) : false;

						// Handle our OR operator
						if ( 'or' === $operator ) {
							if ( ! function_exists( $conditional_method ) || $conditional_result === $conditional_method( $conditional_value ) ) {
								$show_banner = true;
								break;
							}
						}

						// Handle our AND operator
						if ( 'and' === $operator ) {
							if ( ! function_exists( $conditional_method ) || $conditional_result === $conditional_method( $conditional_value ) ) {
								$show_banner = true;
							} else {
								$show_banner = false;
							}
						}
					}

					if ( true === $show_banner ) {
						$post         = get_post( get_the_ID(), ARRAY_A );
						$post['meta'] = $message_meta;
					}
				}

				array_push( $groupedposts, $post );

			}
			wp_reset_postdata();
			return $groupedposts;
		} else {

			// Does this ever return anything? I don't think so?
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

		do_action( $this->option_prefix . 'plugin_before_' . $template_name );

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

		do_action( $this->option_prefix . 'plugin_after_' . $template_name );

		$html = ob_get_contents();
		ob_end_clean();

		return $html;
	}
}
