<?php

/**
 * Create default structure for regions
 *
 * @package WP_Message_Inserter_Plugin
 */
class WP_Message_Inserter_Plugin_Front_End {

	public $option_prefix;
	public $post_meta_prefix;
	public $version;
	public $slug;
	public $regions;
	public $content_items;

	private $cache;
	private $cache_group;
	private $cache_expiration;

	public function __construct() {

		$this->option_prefix    = wp_message_inserter_plugin()->option_prefix;
		$this->post_meta_prefix = wp_message_inserter_plugin()->post_meta_prefix;
		$this->version          = wp_message_inserter_plugin()->version;
		$this->slug             = wp_message_inserter_plugin()->slug;
		$this->regions          = wp_message_inserter_plugin()->regions;
		$this->content_items    = wp_message_inserter_plugin()->content_items;

		$this->cache            = true;
		$this->cache_group      = 'wp_message_inserter_plugin';
		$this->cache_expiration = MINUTE_IN_SECONDS * 30;

		$this->add_actions();

	}

	/**
	* Create the action hooks to create content items
	*
	*/
	public function add_actions() {
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts_and_styles' ) );
		add_action( 'wp_message_inserter', array( $this, 'insert_messages' ), 10, 2 );
	}

	/**
	 * Frontend styles. Load the CSS and/or JavaScript.
	 *
	 * @return void
	 */
	public function frontend_scripts_and_styles() {
		$javascript_dependencies = array( 'jquery' );
		$css_dependencies        = array();
		wp_enqueue_script( $this->slug . '-front-end', plugins_url( 'assets/js/' . $this->slug . '-front-end.js', dirname( __FILE__ ) ), $javascript_dependencies, filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/js/' . $this->slug . '-front-end.min.js' ), true );
		wp_enqueue_style( $this->slug . '-front-end', plugins_url( 'assets/css/' . $this->slug . '-front-end.min.css', dirname( __FILE__ ) ), $css_dependencies, filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/css/' . $this->slug . '-front-end.min.css' ), 'all' );
	}

	/**
	* Insert the messages via the template, if there are eligible messages
	* @param string $region
	*
	*/
	public function insert_messages( $region, $delivery_method = 'front-end' ) {
		$messages = $this->get_eligible_messages( $region );
		foreach ( $messages as $key => $message ) {
			if ( 0 !== sizeof( $message ) ) {
				$params['meta_prefix']     = $this->post_meta_prefix;
				$params['message_counter'] = $key;
				$params['message']         = array_merge( $message, $message['meta'] );
				echo $this->get_template_html( 'message', $region, $delivery_method, $params );
			}
		}
	}

	/**
	* Load the messages based on the conditional(s) and region
	* @param string $region
	* @return array $groupedposts
	*
	*/
	private function get_eligible_messages( $region ) {
		// todo: figure out if any of this can be cached
		$current_id       = get_the_ID();
		$post             = array();
		$all_conditionals = $this->content_items->get_conditionals();
		$groupedposts     = array();

		// allow cache settings to be filtered
		$this->cache            = apply_filters( $this->option_prefix . 'cache', $this->cache );
		$this->cache_group      = apply_filters( $this->option_prefix . 'cache_group', $this->cache_group );
		$this->cache_expiration = apply_filters( $this->option_prefix . 'cache_expiration', $this->cache_expiration );

		if ( true === $this->cache ) {
			$cache_key = md5( $region );
			$query     = wp_cache_get( $cache_key, $this->cache_group );
		}

		if ( isset( $query ) && false === $query || ( false === $this->cache ) ) {
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
			if ( true === $this->cache ) {
				wp_cache_set( $cache_key, $query, $this->cache_group, $this->cache_expiration );
			}
		}

		// if there are any published messages for this region, loop through them and check their conditionals
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();

				$message_meta = get_post_meta( get_the_ID() );
				$operator     = $message_meta[ $this->post_meta_prefix . 'conditional_operator' ][0];

				// Array of Conditions set on a banner
				$conditional = isset( $message_meta['conditional_group_id'][0] ) ? $message_meta['conditional_group_id'][0] : '';
				$conditional = maybe_unserialize( $conditional );

				// If no conditional is set at all
				if ( '' === $conditional || empty( $conditional ) ) {
					// Grab whatever we can?
					$post         = get_post( get_the_ID(), ARRAY_A );
					$post['meta'] = $message_meta;
				} else {
					$show_message = false;

					foreach ( $conditional as $condkey => $condvalue ) {
						$conditional_method = isset( $condvalue[ $this->post_meta_prefix . 'conditional' ] ) ? $condvalue[ $this->post_meta_prefix . 'conditional' ] : '';
						$conditional_value  = isset( $condvalue[ $this->post_meta_prefix . 'conditional_value' ] ) ? $condvalue[ $this->post_meta_prefix . 'conditional_value' ] : '';
						$conditional_result = isset( $condvalue[ $this->post_meta_prefix . 'conditional_result' ] ) ? $condvalue[ $this->post_meta_prefix . 'conditional_result' ] : '';
						$conditional_result = isset( $conditional_result ) ? filter_var( $conditional_result, FILTER_VALIDATE_BOOLEAN ) : false;

						$conditional_value = apply_filters( $this->option_prefix . 'add_conditional_value', $conditional_value, $condvalue );

						// if the only conditional is a "conditional_result" of true, but there is no actual conditional, we should show this message
						if ( true === $conditional_result && '' === $conditional_value ) {
							$show_message = true;
						}

						// this method exists in the supported condtionals for the plugin
						$all_conditionals_key = array_search( $conditional_method, array_column( $all_conditionals, 'name' ), true );
						if ( false === $all_conditionals_key ) {
							continue;
						}

						$conditional_to_check = $all_conditionals[ $all_conditionals_key ];
						$method_to_call       = '';
						$params               = $conditional_value;

						// this means this conditional has a callback
						if ( isset( $conditional_to_check['method'] ) ) {
							if ( function_exists( $conditional_to_check['method'] ) ) {
								$method_to_call = $conditional_to_check['method'];
							} elseif ( method_exists( $this, $conditional_to_check['method'] ) ) {
								$method_to_call = $conditional_to_check['method'];
							}
							$params = $conditional_value;
						} else {
							$method_to_call = $conditional_method;
						}

						// the conditional has parameters
						$has_params = isset( $conditional_to_check['has_params'] ) ? filter_var( $conditional_to_check['has_params'], FILTER_VALIDATE_BOOLEAN ) : false;
						if ( true === $has_params ) {
							// if there's no value for the parameter, try it with empty params
							if ( '' === $conditional_value ) {
								$params = array();
							}
							if ( isset( $conditional_to_check['params'] ) && ! empty( $conditional_to_check['params'] ) ) {
								if ( 1 === sizeof( $conditional_to_check['params'] ) ) {
									$params = $conditional_value;
								} else {
									$params = array();
									foreach ( $conditional_to_check['params'] as $key => $name ) {
										if ( 'current_post' === $name ) {
											$params['current_post'] = $current_id;
										} elseif ( 'current_user' === $name ) {
											$params['current_user'] = get_current_user_id();
										} else {
											if ( is_array( $conditional_value ) && isset( $conditional_value[ $key ] ) ) {
												$params[ $name ] = $conditional_value[ $key ];
											} else {
												$params[ $name ] = $conditional_value;
											}
										}
									}
								}
							}
						}

						$exploded = false;
						if ( isset( $conditional_to_check['method'] ) && ( function_exists( $conditional_to_check['method'] ) || method_exists( $this, $conditional_to_check['method'] ) ) ) {
							if ( ! is_array( $params ) ) {
								$exploded = true;
								$params   = array_map( 'trim', explode( ',', $params ) );
								array_unshift( $params, $conditional_method );
							}
						}

						// the method does not exist
						if ( '' === $method_to_call || ( ! function_exists( $method_to_call ) && ! method_exists( $this, $method_to_call ) ) ) {
							continue;
						}

						if ( is_array( $params ) ) {
							if ( function_exists( $method_to_call ) ) {
								$called_method = call_user_func_array( $method_to_call, $params );
							} elseif ( method_exists( $this, $method_to_call ) ) {
								$called_method = call_user_func_array( array( $this, $method_to_call ), $params );
							}
						} else {
							if ( function_exists( $method_to_call ) ) {
								$called_method = $method_to_call( $params );
							} elseif ( method_exists( $this, $method_to_call ) ) {
								$called_method = $this->$method_to_call( $params );
							}
						}

						$called_method = filter_var( $called_method, FILTER_VALIDATE_BOOLEAN );
						// Handle our OR operator. This means ANY of the condtionals on this message are true.
						if ( 'or' === $operator ) {
							if ( $conditional_result === $called_method ) {
								$show_message = true;
								break; // break out if any of them are true
							} else {
								$show_message = false;
								continue;
							}
						}

						// Handle our AND operator. This means ALL of the conditionals on this message are true.
						if ( 'and' === $operator ) {
							if ( $conditional_result === $called_method ) {
								$show_message = true;
								continue;
							} else {
								$show_message = false;
								break; // break out if any of them are false
							}
						}
					} // end foreach

					$show_message = apply_filters( $this->option_prefix . 'show_message', $show_message, $region );

					if ( true === filter_var( $show_message, FILTER_VALIDATE_BOOLEAN ) ) {
						$post         = get_post( get_the_ID(), ARRAY_A );
						$post['meta'] = $message_meta;
					}
				}

				if ( ! in_array( $post, $groupedposts, true ) ) {
					array_push( $groupedposts, $post );
				}
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

	/**
	* Check to see if the current post has the specified meta key and value
	*
	* @param int $current_post
	* @param array $params
	* @return bool $has_meta_value
	*/
	public function post_has_meta_value( $current_post, $params ) {
		$has_meta_value = false;
		$has_meta_value = $this->has_meta_value( 'get_post_meta', $current_post, $params );
		return $has_meta_value;
	}

	/**
	* Check to see if the current user has the specified meta key and value
	*
	* @param int $current_user
	* @param array $params
	* @return bool $has_meta_value
	*/
	public function user_has_meta_value( $current_user, $params ) {
		$has_meta_value = false;
		$has_meta_value = $this->has_meta_value( 'get_user_meta', $current_user, $params );
		return $has_meta_value;
	}

	/**
	* Check to see if the current object has the specified meta key and value
	*
	* @param string $method
	* @param int $current_id
	* @param array $params
	* @return bool $has_meta_value
	*/
	private function has_meta_value( $method, $current_id, $params ) {
		$has_meta_value = false;
		if ( ! is_array( $params ) ) {
			$params = array_map( 'trim', explode( ',', $params ) );
		}
		$meta_key          = $params[0];
		$meta_value        = $params[1];
		$actual_meta_value = $method( $current_id, $meta_key, true );
		if ( $meta_value === $actual_meta_value ) {
			$has_meta_value = true;
		}
		return $has_meta_value;
	}

	/**
	* Check to see if the current post was posted before the specified datetime
	*
	* @param int $current_post
	* @param array $params
	* @return bool $comparison
	*/
	public function posted_before_date( $current_post, $params ) {
		$comparison = $this->compare_post_datetimes( $current_post, $params, '<' );
		return $comparison;
	}

	/**
	* Check to see if the current post was posted after the specified datetime
	*
	* @param int $current_post
	* @param array $params
	* @return bool $comparison
	*/
	public function posted_after_date( $current_post, $params ) {
		error_log( 'current post is ' . $current_post );
		$comparison = $this->compare_post_datetimes( $current_post, $params, '>' );
		return $comparison;
	}

	/**
	* Make the comparison between the post date and the specified date
	*
	* @param int $post_id
	* @param array $params
	* @param string $operator
	* @return bool $comparison
	*/
	private function compare_post_datetimes( $post_id, $params, $operator ) {
		if ( ! is_array( $params ) ) {
			$params = array_map( 'trim', explode( ',', $params ) );
		}

		$datetime_to_check = new DateTime( $params[0], wp_timezone() );
		$post_datetime     = get_post_datetime( $post_id );

		switch ( $operator ) {
			case '<': // Less than
				return $post_datetime < $datetime_to_check;
			case '<=': // Less than or equal to
				return $post_datetime <= $datetime_to_check;
			case '>': // Greater than
				return $post_datetime > $datetime_to_check;
			case '>=': // Greater than or equal to
				return $post_datetime >= $datetime_to_check;
			case '==': // Equal
				return $post_datetime == $datetime_to_check;
			case '===': // Identical
				return $post_datetime === $datetime_to_check;
			case '!==': // Not Identical
				return $post_datetime !== $datetime_to_check;
			case '!=': // Not equal
			case '<>': // Not equal
				return $post_datetime != $datetime_to_check;
			case '||': // Or
			case 'or': // Or
				return $post_datetime || $datetime_to_check;
			case '&&': // And
			case 'and': // And
				return $post_datetime && $datetime_to_check;
			case 'xor': // Or
				return $post_datetime xor $datetime_to_check;
			default:
				return false;
		}
	}

}
