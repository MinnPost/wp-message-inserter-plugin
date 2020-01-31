<?php

/**
 * Administrative interface features
 *
 * @package WP_Message_Inserter_Plugin
 */
class WP_Message_Inserter_Plugin_Admin {

	public $option_prefix;
	public $post_meta_prefix;
	public $version;
	public $slug;
	public $content_items;

	private $pages;

	public function __construct() {

		$this->option_prefix    = wp_message_inserter_plugin()->option_prefix;
		$this->post_meta_prefix = wp_message_inserter_plugin()->post_meta_prefix;
		$this->version          = wp_message_inserter_plugin()->version;
		$this->slug             = wp_message_inserter_plugin()->slug;
		$this->content_items    = wp_message_inserter_plugin()->content_items;

		$this->pages = $this->get_admin_pages();

		$this->add_actions();

	}

	/**
	* Create the action hooks to create the admin page(s)
	*
	*/
	private function add_actions() {
		if ( is_admin() ) {
			// for now, we don't need any settings.
			//add_action( 'admin_menu', array( $this, 'create_admin_menu' ) );
			//add_action( 'admin_init', array( $this, 'admin_settings_form' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts_and_styles' ) );
			add_filter( 'plugin_action_links', array( $this, 'plugin_action_links' ), 10, 2 );
			add_filter( 'manage_message_posts_columns', array( $this, 'filter_posts_columns' ) );
			add_action( 'manage_message_posts_custom_column', array( $this, 'message_column' ), 10, 2 );
			add_filter( 'manage_edit-message_sortable_columns', array( $this, 'message_sortable_columns' ) );
			add_action( 'pre_get_posts', array( $this, 'posts_orderby' ) );
		}
	}

	/**
	* Create WordPress admin options page
	*
	*/
	public function create_admin_menu() {
		$capability = 'manage_wp_message_inserter_options';
		$pages      = $this->get_admin_pages();
		foreach ( $pages as $key => $value ) {
			add_submenu_page( 'edit.php?post_type=message', $value['title'], $value['title'], $capability, $key, array( $this, 'show_admin_page' ) );
		}
		// Remove the default page because that's annoying
		remove_submenu_page( $this->slug, $this->slug );
	}

	/**
	* Create WordPress admin options menu pages
	*
	* @return array $pages
	*
	*/
	private function get_admin_pages() {
		$pages = array(
			$this->slug . '-settings' => array(
				'title'    => __( 'Settings', 'wp-message-inserter-plugin' ),
				'sections' => array(
					'plugin_settings' => __( 'Plugin settings' ),
				),
				'use_tabs' => false,
			),
		); // this creates the pages for the admin
		return $pages;
	}

	/**
	* Display the admin settings page
	*
	* @return void
	*/
	public function show_admin_page() {
		$get_data = filter_input_array( INPUT_GET, FILTER_SANITIZE_STRING );
		?>
		<div class="wrap">
			<h1><?php _e( get_admin_page_title(), 'wp-message-inserter-plugin' ); ?></h1>
			<?php
			$page     = isset( $get_data['page'] ) ? sanitize_key( $get_data['page'] ) : $this->slug . '-settings';
			$tab      = isset( $get_data['tab'] ) ? sanitize_key( $get_data['tab'] ) : $page;
			$section  = $tab;
			$sections = $this->pages[ $page ]['sections'];
			if ( ! empty( $sections ) && true === $this->pages[ $page ]['use_tabs'] ) {
				$tabs = $this->pages[ $page ]['sections'];
				if ( isset( $get_data['tab'] ) ) {
					$tab = sanitize_key( $get_data['tab'] );
				} else {
					reset( $tabs );
					$tab = key( $tabs );
				}
				$this->render_tabs( $page, $tabs, $tab );
			}
			switch ( $page ) {
				default:
					require_once( plugin_dir_path( __FILE__ ) . '/../templates/admin/settings.php' );
					break;
			} // End switch().*/
			?>

		</div>
		<?php
	}

	/**
	* Render tabs for settings pages in admin
	* @param string $page
	* @param array $tabs
	* @param string $tab
	*/
	private function render_tabs( $page, $tabs, $tab = 'default' ) {
		$get_data = filter_input_array( INPUT_GET, FILTER_SANITIZE_STRING );

		$current_tab = $tab;
		echo '<h2 class="nav-tab-wrapper">';
		foreach ( $tabs as $tab_key => $tab_caption ) {
			$active = $current_tab === $tab_key ? ' nav-tab-active' : '';
			echo sprintf(
				'<a class="nav-tab%1$s" href="%2$s">%3$s</a>',
				esc_attr( $active ),
				esc_url( '?page=' . $page . '&tab=' . $tab_key ),
				esc_html( $tab_caption )
			);

		}
		echo '</h2>';

		if ( isset( $get_data['tab'] ) ) {
			$tab = sanitize_key( $get_data['tab'] );
		}
	}

	/**
	* Register items for the settings api
	* @return void
	*
	*/
	public function admin_settings_form() {

		$get_data = filter_input_array( INPUT_GET, FILTER_SANITIZE_STRING );
		$page     = isset( $get_data['page'] ) ? sanitize_key( $get_data['page'] ) : $this->slug . '-settings';
		if ( false === strpos( $page, $this->slug ) ) {
			return;
		}
		$tab     = isset( $get_data['tab'] ) ? sanitize_key( $get_data['tab'] ) : $page;
		$section = $tab;

		$input_callback_default   = array( $this, 'display_input_field' );
		$input_checkboxes_default = array( $this, 'display_checkboxes' );
		$input_select_default     = array( $this, 'display_select' );
		$textarea_default         = array( $this, 'display_textarea' );
		$editor_default           = array( $this, 'display_editor' );
		$link_default             = array( $this, 'display_link' );

		$all_field_callbacks = array(
			'text'       => $input_callback_default,
			'checkboxes' => $input_checkboxes_default,
			'select'     => $input_select_default,
			'textarea'   => $textarea_default,
			'editor'     => $editor_default,
			'link'       => $link_default,
		);

		$this->general_settings( $page, $all_field_callbacks );

	}

	/**
	* Admin styles. Load the CSS and/or JavaScript for the plugin's settings
	*
	* @return void
	*/
	public function admin_scripts_and_styles( $hook ) {

		$cpt = 'message';
		if ( in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
			$screen = get_current_screen();
			if ( is_object( $screen ) && $cpt === $screen->post_type ) {

				// I think some developers might not want to bother with select2 or selectwoo, so let's allow that to be changeable
				$select_library = apply_filters( 'wp_message_inserter_plugin_select_library', 'selectwoo' );

				/*
				 * example to modify the select library
				 * add_filter( 'wp_message_inserter_plugin_select_library', 'select_library', 10, 1 );
				 * function select_library( $select_library ) {
				 * 	$select_library = 'select2';
				 *  // this could also be empty; in that case we would just use default browser select
				 * 	return $select_library;
				 * }
				*/

				$javascript_dependencies = array( 'jquery' );
				$css_dependencies        = array();
				if ( '' !== $select_library ) {
					wp_enqueue_script( $select_library . 'js', plugins_url( 'assets/js/' . $select_library . '.min.js', dirname( __FILE__ ) ), array( 'jquery' ), filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/js/' . $select_library . '.min.js' ), true );
					$javascript_dependencies[] = $select_library . 'js';

					wp_enqueue_style( $select_library . 'css', plugins_url( 'assets/css/' . $select_library . '.min.css', dirname( __FILE__ ) ), array(), filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/css/' . $select_library . '.min.css' ), 'all' );
					$css_dependencies[] = $select_library . 'css';
				}

				wp_enqueue_script( $this->slug . '-admin', plugins_url( 'assets/js/' . $this->slug . '-admin.min.js', dirname( __FILE__ ) ), $javascript_dependencies, filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/js/' . $this->slug . '-admin.min.js' ), true );
				wp_enqueue_style( $this->slug . '-admin', plugins_url( 'assets/css/' . $this->slug . '-admin.min.css', dirname( __FILE__ ) ), $css_dependencies, filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/css/' . $this->slug . '-admin.min.css' ), 'all' );

			}
		}

	}

	/**
	* Display a Settings link on the main Plugins page
	*
	* @param array $links
	* @param string $file
	* @return array $links
	*   These are the links that go with this plugin's entry
	*/
	public function plugin_action_links( $links, $file ) {
		if ( plugin_basename( WP_MESSAGE_INSERTER_PLUGIN_FILE ) === $file ) {
			array_unshift(
				$links,
				sprintf(
					'<a href="%1$s">%2$s</a>',
					wp_message_inserter_plugin()->get_menu_url(),
					__( 'Settings', 'wp-message-inserter-plugin' )
				)
			);
		} // End if()
		return $links;
	}

	/**
	* Add and reorder columns on the post table for messages
	*
	* @param array $columns
	* @return array $columns
	*/
	public function filter_posts_columns( $columns ) {
		$columns['type']   = __( 'Type', 'wp-message-inserter-plugin' );
		$columns['region'] = __( 'Region', 'wp-message-inserter-plugin' );

		$column_order = array( 'cb', 'title', 'type', 'region', 'date' );
		foreach ( $column_order as $column_name ) {
			$new_columns[ $column_name ] = $columns[ $column_name ];
		}
		return $new_columns;
	}

	/**
	* Populate columns on the post table for messages
	*
	* @param string $column
	* @param int $post_id
	*/
	public function message_column( $column, $post_id ) {
		// message type
		if ( 'type' === $column ) {
			echo ( '' !== get_post_meta( $post_id, $this->post_meta_prefix . 'message_type', true ) ) ? get_post_meta( $post_id, $this->post_meta_prefix . 'message_type', true ) : '';
		}
		// message region
		if ( 'region' === $column ) {
			echo ( '' !== get_post_meta( $post_id, $this->post_meta_prefix . 'region', true ) ) ? get_post_meta( $post_id, $this->post_meta_prefix . 'region', true ) : '';
		}
	}

	/**
	* Add and reorder columns on the post table for messages
	*
	* @param array $columns
	* @return array $columns
	*/
	public function message_sortable_columns( $columns ) {
		$columns['type']   = 'type';
		$columns['region'] = 'region';
		return $columns;
	}

	/**
	* Order column data on the post table for messages
	*
	* @param object $query
	*/
	public function posts_orderby( $query ) {
		if ( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}

		// sort by type
		if ( 'type' === $query->get( 'orderby' ) ) {
			$query->set(
				'meta_query',
				array(
					'relation' => 'OR',
					array(
						'key'     => $this->post_meta_prefix . 'message_type',
						'compare' => 'EXISTS',
					),
					array(
						'key'     => $this->post_meta_prefix . 'message_type',
						'compare' => 'NOT EXISTS',
						'value'   => 'bug #23268', // arbitrary value
					),
				)
			);
			$query->set( 'orderby', 'meta_value' );
		}

		// sort by region
		if ( 'region' === $query->get( 'orderby' ) ) {
			$query->set(
				'meta_query',
				array(
					'relation' => 'OR',
					array(
						'key'     => $this->post_meta_prefix . 'region',
						'compare' => 'EXISTS',
					),
					array(
						'key'     => $this->post_meta_prefix . 'region',
						'compare' => 'NOT EXISTS',
						'value'   => 'bug #23268', // arbitrary value
					),
				)
			);
			$query->set( 'orderby', 'meta_value' );
		}
	}
		}
	}

	/**
	* Fields for the General Settings page
	* This runs add_settings_section once, as well as add_settings_field and register_setting methods for each option
	*
	* @param string $page
	* @param array $callbacks
	*/
	private function general_settings( $page, $callbacks ) {
		if ( isset( $this->get_admin_pages()[ $page ] ) ) {

			$sections = $this->get_admin_pages()[ $page ]['sections'];
			if ( ! empty( $sections ) ) {
				foreach ( $sections as $key => $value ) {
					add_settings_section( $key, $value, null, $page );
				}
			} else {
				$section = $page;
				$title   = $this->get_admin_pages()[ $page ]['title'];
				add_settings_section( $section, $title, null, $page );
			}

			$settings = array(
				'test_field' => array(
					'title'    => __( 'Test field', 'wp-message-inserter-plugin' ),
					'callback' => $callbacks['text'],
					'page'     => $page,
					'section'  => 'plugin_settings',
					'args'     => array(
						'type'     => 'text',
						'desc'     => '',
						'constant' => '',
					),
				),
			);

			foreach ( $settings as $key => $attributes ) {
				$id       = $this->option_prefix . $key;
				$name     = $this->option_prefix . $key;
				$title    = $attributes['title'];
				$callback = $attributes['callback'];
				$page     = $attributes['page'];
				$section  = $attributes['section'];
				$class    = isset( $attributes['class'] ) ? $attributes['class'] : 'minnpost-member-field ' . $id;
				$args     = array_merge(
					$attributes['args'],
					array(
						'title'     => $title,
						'id'        => $id,
						'label_for' => $id,
						'name'      => $name,
						'class'     => $class,
					)
				);

				// if there is a constant and it is defined, don't run a validate function if there is one
				if ( isset( $attributes['args']['constant'] ) && defined( $attributes['args']['constant'] ) ) {
					$validate = '';
				}
				add_settings_field( $id, $title, $callback, $page, $section, $args );
				register_setting( $page, $id );
			}
		}
	}

	/**
	* Default display for <input> fields
	*
	* @param array $args
	*/
	public function display_input_field( $args ) {
		$type    = $args['type'];
		$id      = $args['label_for'];
		$name    = $args['name'];
		$desc    = $args['desc'];
		$checked = '';

		$class = 'regular-text';

		if ( 'checkbox' === $type ) {
			$class = 'checkbox';
		}

		if ( ! isset( $args['constant'] ) || ! defined( $args['constant'] ) ) {
			$value = esc_attr( get_option( $id, '' ) );
			if ( 'checkbox' === $type ) {
				if ( '1' === $value ) {
					$checked = 'checked ';
				}
				$value = 1;
			}
			if ( '' === $value && isset( $args['default'] ) && '' !== $args['default'] ) {
				$value = $args['default'];
			}

			echo sprintf(
				'<input type="%1$s" value="%2$s" name="%3$s" id="%4$s" class="%5$s"%6$s>',
				esc_attr( $type ),
				esc_attr( $value ),
				esc_attr( $name ),
				esc_attr( $id ),
				sanitize_html_class( $class . esc_html( ' code' ) ),
				esc_html( $checked )
			);
			if ( '' !== $desc ) {
				echo sprintf(
					'<p class="description">%1$s</p>',
					esc_html( $desc )
				);
			}
		} else {
			echo sprintf(
				'<p><code>%1$s</code></p>',
				esc_html__( 'Defined in wp-config.php', 'wp-message-inserter-plugin' )
			);
		}
	}

	/**
	* Display for multiple checkboxes
	* Above method can handle a single checkbox as it is
	*
	* @param array $args
	*/
	public function display_checkboxes( $args ) {
		$type = 'checkbox';
		if ( 'radio' === $args['type'] ) {
			$type = 'radio';
		}

		$name       = $args['name'];
		$group_desc = $args['desc'];
		$options    = get_option( $name, array() );

		foreach ( $args['items'] as $key => $value ) {
			$text = $value['text'];
			$id   = $value['id'];
			$desc = $value['desc'];
			if ( isset( $value['value'] ) ) {
				$item_value = $value['value'];
			} else {
				$item_value = $key;
			}
			$checked = '';
			if ( is_array( $options ) && in_array( (string) $item_value, $options, true ) ) {
				$checked = 'checked';
			} elseif ( is_array( $options ) && empty( $options ) ) {
				if ( isset( $value['default'] ) && true === $value['default'] ) {
					$checked = 'checked';
				}
			}

			$input_name = $name;

			if ( ! isset( $args['label'] ) || 'parallel' !== $args['label'] ) {
				echo sprintf(
					'<div class="checkbox"><label><input type="%1$s" value="%2$s" name="%3$s[]" id="%4$s"%5$s>%6$s</label></div>',
					esc_attr( $type ),
					esc_attr( $item_value ),
					esc_attr( $input_name ),
					esc_attr( $id ),
					esc_html( $checked ),
					esc_html( $text )
				);
			} else {
				echo sprintf(
					'<div class="checkbox"><input type="%1$s" value="%2$s" name="%3$s[]" id="%4$s"%5$s><label for="%4$s">%6$s</label></div>',
					esc_attr( $type ),
					esc_attr( $item_value ),
					esc_attr( $input_name ),
					esc_attr( $id ),
					esc_html( $checked ),
					esc_html( $text )
				);
			}
			if ( '' !== $desc ) {
				echo sprintf(
					'<p class="description">%1$s</p>',
					esc_html( $desc )
				);
			}
		}

		if ( '' !== $group_desc ) {
			echo sprintf(
				'<p class="description">%1$s</p>',
				esc_html( $group_desc )
			);
		}

	}

	/**
	* Display for a dropdown/select
	*
	* @param array $args
	*/
	public function display_select( $args ) {
		$type = $args['type'];
		$id   = $args['label_for'];
		$name = $args['name'];
		$desc = $args['desc'];
		if ( ! isset( $args['constant'] ) || ! defined( $args['constant'] ) ) {
			$current_value = get_option( $name );

			echo sprintf(
				'<div class="select"><select id="%1$s" name="%2$s"><option value="">- ' . esc_html__( 'Select one', 'wp-message-inserter-plugin' ) . ' -</option>',
				esc_attr( $id ),
				esc_attr( $name )
			);

			foreach ( $args['items'] as $key => $value ) {
				$text     = $value['text'];
				$value    = $value['value'];
				$selected = '';
				if ( $key === $current_value || $value === $current_value ) {
					$selected = ' selected';
				}

				echo sprintf(
					'<option value="%1$s"%2$s>%3$s</option>',
					esc_attr( $value ),
					esc_attr( $selected ),
					esc_html( $text )
				);

			}
			echo '</select>';
			if ( '' !== $desc ) {
				echo sprintf(
					'<p class="description">%1$s</p>',
					esc_html( $desc )
				);
			}
			echo '</div>';
		} else {
			echo sprintf(
				'<p><code>%1$s</code></p>',
				esc_html__( 'Defined in wp-config.php', 'wp-message-inserter-plugin' )
			);
		}
	}

	/**
	* Display for a dropdown/select
	*
	* @param array $args
	*/
	public function display_textarea( $args ) {
		$id    = $args['label_for'];
		$name  = $args['name'];
		$desc  = $args['desc'];
		$rows  = $args['rows'];
		$cols  = $args['cols'];
		$class = 'regular-text';
		if ( ! isset( $args['constant'] ) || ! defined( $args['constant'] ) ) {
			$value = esc_attr( get_option( $id, '' ) );
			if ( '' === $value && isset( $args['default'] ) && '' !== $args['default'] ) {
				$value = $args['default'];
			}

			if ( '' !== $rows ) {
				$rows_attr = ' rows="' . esc_attr( $rows ) . '"';
			} else {
				$rows_attr = '';
			}

			if ( '' !== $cols ) {
				$cols_attr = ' cols="' . esc_attr( $cols ) . '"';
			} else {
				$cols_attr = '';
			}

			echo sprintf(
				'<textarea name="%1$s" id="%2$s" class="%3$s"%4$s%5$s>%6$s</textarea>',
				esc_attr( $name ),
				esc_attr( $id ),
				sanitize_html_class( $class . esc_html( ' code' ) ),
				$rows_attr,
				$cols_attr,
				esc_attr( $value )
			);
			if ( '' !== $desc ) {
				echo sprintf(
					'<p class="description">%1$s</p>',
					esc_html( $desc )
				);
			}
		} else {
			echo sprintf(
				'<p><code>%1$s</code></p>',
				esc_html__( 'Defined in wp-config.php', 'wp-message-inserter-plugin' )
			);
		}
	}

	/**
	* Display for a wysiwyg editir
	*
	* @param array $args
	*/
	public function display_editor( $args ) {
		$id      = $args['label_for'];
		$name    = $args['name'];
		$desc    = $args['desc'];
		$checked = '';

		$class = 'regular-text';

		if ( ! isset( $args['constant'] ) || ! defined( $args['constant'] ) ) {
			$value = wp_kses_post( get_option( $id, '' ) );
			if ( '' === $value && isset( $args['default'] ) && '' !== $args['default'] ) {
				$value = $args['default'];
			}

			$settings = array();
			if ( isset( $args['wpautop'] ) ) {
				$settings['wpautop'] = $args['wpautop'];
			}
			if ( isset( $args['media_buttons'] ) ) {
				$settings['media_buttons'] = $args['media_buttons'];
			}
			if ( isset( $args['default_editor'] ) ) {
				$settings['default_editor'] = $args['default_editor'];
			}
			if ( isset( $args['drag_drop_upload'] ) ) {
				$settings['drag_drop_upload'] = $args['drag_drop_upload'];
			}
			if ( isset( $args['name'] ) ) {
				$settings['textarea_name'] = $args['name'];
			}
			if ( isset( $args['rows'] ) ) {
				$settings['textarea_rows'] = $args['rows']; // default is 20
			}
			if ( isset( $args['tabindex'] ) ) {
				$settings['tabindex'] = $args['tabindex'];
			}
			if ( isset( $args['tabfocus_elements'] ) ) {
				$settings['tabfocus_elements'] = $args['tabfocus_elements'];
			}
			if ( isset( $args['editor_css'] ) ) {
				$settings['editor_css'] = $args['editor_css'];
			}
			if ( isset( $args['editor_class'] ) ) {
				$settings['editor_class'] = $args['editor_class'];
			}
			if ( isset( $args['teeny'] ) ) {
				$settings['teeny'] = $args['teeny'];
			}
			if ( isset( $args['dfw'] ) ) {
				$settings['dfw'] = $args['dfw'];
			}
			if ( isset( $args['tinymce'] ) ) {
				$settings['tinymce'] = $args['tinymce'];
			}
			if ( isset( $args['quicktags'] ) ) {
				$settings['quicktags'] = $args['quicktags'];
			}

			wp_editor( $value, $id, $settings );
			if ( '' !== $desc ) {
				echo sprintf(
					'<p class="description">%1$s</p>',
					esc_html( $desc )
				);
			}
		} else {
			echo sprintf(
				'<p><code>%1$s</code></p>',
				esc_html__( 'Defined in wp-config.php', 'wp-message-inserter-plugin' )
			);
		}
	}

	/**
	* Default display for <a href> links
	*
	* @param array $args
	*/
	public function display_link( $args ) {
		$label = $args['label'];
		$desc  = $args['desc'];
		$url   = $args['url'];
		if ( isset( $args['link_class'] ) ) {
			echo sprintf(
				'<p><a class="%1$s" href="%2$s">%3$s</a></p>',
				esc_attr( $args['link_class'] ),
				esc_url( $url ),
				esc_html( $label )
			);
		} else {
			echo sprintf(
				'<p><a href="%1$s">%2$s</a></p>',
				esc_url( $url ),
				esc_html( $label )
			);
		}
		if ( '' !== $desc ) {
			echo sprintf(
				'<p class="description">%1$s</p>',
				esc_html( $desc )
			);
		}
	}

}
