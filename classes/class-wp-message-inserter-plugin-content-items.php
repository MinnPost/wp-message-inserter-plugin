<?php

/**
 * Create default structure for content items
 *
 * @package WP_Message_Inserter_Plugin
 */
class WP_Message_Inserter_Plugin_Content_Items {

	public $option_prefix;
	public $post_meta_prefix;
	public $version;
	public $slug;
	public $regions;

	private $default_type;

	public function __construct() {

		$this->option_prefix    = wp_message_inserter_plugin()->option_prefix;
		$this->post_meta_prefix = wp_message_inserter_plugin()->post_meta_prefix;
		$this->version          = wp_message_inserter_plugin()->version;
		$this->slug             = wp_message_inserter_plugin()->slug;
		$this->regions          = wp_message_inserter_plugin()->regions;

		$this->default_type = 'image';

		$this->add_actions();

	}

	/**
	* Create the action hooks to create content items
	*
	*/
	public function add_actions() {
		add_action( 'init', array( $this, 'create_message' ), 0 );
		add_action( 'cmb2_init', array( $this, 'create_message_fields' ) );

		add_action( 'restrict_manage_posts', array( $this, 'filter_restrict_manage_posts' ) );
		add_filter( 'parse_query', array( $this, 'posts_filter' ) );
	}

	/**
	* Dropdown for filtering messages by type and region.
	*
	*/
	function filter_restrict_manage_posts() {
		$type = 'post';
		if ( isset( $_GET['post_type'] ) ) {
			$type = esc_attr( $_GET['post_type'] );
		}
		//add filter to the post type you want
		if ( 'message' === $type ) { //Replace NAME_OF_YOUR_POST with the name of custom post
			$type_values = $this->get_type_options( array( 'description' ) );
			$region_values = $this->get_region_options();
			?>
			<select name="admin_filter_by_type">
				<option value=""><?php echo esc_html__( 'All site message types', 'wp-message-inserter-plugin' ); ?></option>
				<?php
				$current_type = isset( $_GET['admin_filter_by_type'] ) ? esc_attr( $_GET['admin_filter_by_type'] ) : '';
				foreach ( $type_values as $key => $value ) {
					printf(
						'<option value="%1$s"%2$s>%3$s</option>',
						esc_attr( $key ),
						$key === $current_type ? ' selected="selected"' : '',
						esc_html( $value )
					);
				}
				?>
			</select>
			<select name="admin_filter_by_region">
				<option value=""><?php echo esc_html__( 'All site message regions', 'wp-message-inserter-plugin' ); ?></option>
				<?php
				$current_region = isset( $_GET['admin_filter_by_region'] ) ? esc_attr( $_GET['admin_filter_by_region'] ) : '';
				foreach ( $region_values as $key => $value ) {
					printf(
						'<option value="%1$s"%2$s>%3$s</option>',
						esc_attr( $key ),
						$key === $current_region ? ' selected="selected"' : '',
						esc_html( $value )
					);
				}
				?>
			</select>
			<?php
		}
	}

	/**
	* Filter the admin query for messages by what type or region they are, if one is present.
	* @param object $query
	* @return object $query
	*
	*/
	function posts_filter( $query ) {
		global $pagenow;
		$type = 'post';
		if ( isset( $_GET['post_type'] ) ) {
			$type = esc_attr( $_GET['post_type'] );
		}
		if ( 'message' === $type && is_admin() && 'edit.php' === $pagenow ) {
			// filter by type
			if ( isset( $_GET['admin_filter_by_type'] ) && '' !== $_GET['admin_filter_by_type'] ) {
				$query->query_vars['meta_key']   = $this->post_meta_prefix . 'message_type';
				$query->query_vars['meta_value'] = esc_attr( $_GET['admin_filter_by_type'] );
			}
			// filter by region
			if ( isset( $_GET['admin_filter_by_region'] ) && '' !== $_GET['admin_filter_by_region'] ) {
				$query->query_vars['meta_key']   = $this->post_meta_prefix . 'region';
				$query->query_vars['meta_value'] = esc_attr( $_GET['admin_filter_by_region'] );
			}
		}
	}

	/**
	* Create the message content type
	*
	*/
	public function create_message() {

		$labels = array(
			'name'                  => _x( 'Messages', 'Post Type General Name', 'wp-message-inserter-plugin' ),
			'singular_name'         => _x( 'Message', 'Post Type Singular Name', 'wp-message-inserter-plugin' ),
			'menu_name'             => __( 'Site Messages', 'wp-message-inserter-plugin' ),
			'name_admin_bar'        => __( 'Message', 'wp-message-inserter-plugin' ),
			'archives'              => __( 'Message Archives', 'wp-message-inserter-plugin' ),
			'attributes'            => __( 'Message Attributes', 'wp-message-inserter-plugin' ),
			'parent_item_colon'     => __( 'Parent Message:', 'wp-message-inserter-plugin' ),
			'all_items'             => __( 'All Messages', 'wp-message-inserter-plugin' ),
			'add_new_item'          => __( 'Add New Message', 'wp-message-inserter-plugin' ),
			'add_new'               => __( 'Add New', 'wp-message-inserter-plugin' ),
			'new_item'              => __( 'New Message', 'wp-message-inserter-plugin' ),
			'edit_item'             => __( 'Edit Message', 'wp-message-inserter-plugin' ),
			'update_item'           => __( 'Update Message', 'wp-message-inserter-plugin' ),
			'view_item'             => __( 'View Message', 'wp-message-inserter-plugin' ),
			'view_items'            => __( 'View Messages', 'wp-message-inserter-plugin' ),
			'search_items'          => __( 'Search Messages', 'wp-message-inserter-plugin' ),
			'not_found'             => __( 'Not found', 'wp-message-inserter-plugin' ),
			'not_found_in_trash'    => __( 'Not found in Trash', 'wp-message-inserter-plugin' ),
			'featured_image'        => __( 'Featured Image', 'wp-message-inserter-plugin' ),
			'set_featured_image'    => __( 'Set featured image', 'wp-message-inserter-plugin' ),
			'remove_featured_image' => __( 'Remove featured image', 'wp-message-inserter-plugin' ),
			'use_featured_image'    => __( 'Use as featured image', 'wp-message-inserter-plugin' ),
			'insert_into_item'      => __( 'Insert into message', 'wp-message-inserter-plugin' ),
			'uploaded_to_this_item' => __( 'Uploaded to this message', 'wp-message-inserter-plugin' ),
			'items_list'            => __( 'Messages list', 'wp-message-inserter-plugin' ),
			'items_list_navigation' => __( 'Messages list navigation', 'wp-message-inserter-plugin' ),
			'filter_items_list'     => __( 'Filter message list', 'wp-message-inserter-plugin' ),
		);
		$args   = array(
			'label'               => 'Message',
			'description'         => 'A site message.',
			'labels'              => $labels,
			'supports'            => array( 'title', 'revisions', 'page-attributes' ),
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_admin_bar'   => true,
			'show_in_nav_menus'   => true,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => true,
			'capability_type'     => 'page',
			'menu_icon'           => 'dashicons-welcome-view-site',
		);
		$args   = apply_filters( 'wp_message_inserter_message_type_args', $args );
		register_post_type( 'message', $args );
	}

	/**
	* Create the message fields with CMB2
	*
	*/
	public function create_message_fields() {
		$object_type = 'message';
		$prefix      = $this->post_meta_prefix;

		$select_type = 'select';
		if ( class_exists( 'Select_Plus_CMB2_Field' ) ) {
			$select_type = 'select_plus';
		}

		$screen_size_box = new_cmb2_box(
			array(
				'id'           => $prefix . 'all_screen_sizes',
				'title'        => esc_html__( 'Message', 'wp-message-inserter-plugin' ),
				'object_types' => $object_type,
				'context'      => 'normal',
				//'priority'     => 'high',
				'classes'      => 'cmb2-insertable-message',
			)
		);

		$screen_size_box->add_field(
			array(
				'name'       => sprintf(
					esc_html( 'Message Type %1$s', 'wp-message-inserter-plugin' ),
					'<span class="required">*</span>'
				),
				'id'         => $prefix . 'message_type',
				'type'       => 'radio_inline',
				'desc'       => '',
				'options'    => $this->get_type_options(),
				'default'    => $this->default_type,
				'classes'    => 'cmb2-message-type-selector',
				'attributes' => array(
					'required' => true,
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'       => esc_html__( 'Link URL', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'link_url',
				'type'       => 'text_url',
				'desc'       => esc_html__( 'If you enter a URL here, your entire image will link to the URL.', 'wp-message-inserter-plugin' ),
				'attributes' => array(
					'required'               => false,
					'data-conditional-id'    => $prefix . 'message_type',
					'data-conditional-value' => 'image',
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'             => sprintf(
					esc_html( 'Delivery Method %1$s', 'wp-message-inserter-plugin' ),
					'<span class="required">*</span>'
				),
				'id'               => $prefix . 'delivery_method',
				'type'             => 'radio_inline',
				'show_option_none' => false,
				'desc'             => esc_html__( 'How the content containing this message will be delivered.', 'wp-message-inserter-plugin' ),
				'options'          => array(
					'front-end' => esc_html__( 'Website', 'wp-message-inserter-plugin' ),
					'email'     => esc_html__( 'Email', 'wp-message-inserter-plugin' ),
				),
				'default'          => 'front-end',
				'classes'          => 'cmb2-message-delivery-selector',
				'attributes'       => array(
					'required' => true,
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'             => sprintf(
					esc_html( 'Region %1$s', 'wp-message-inserter-plugin' ),
					'<span class="required">*</span>'
				),
				'id'               => $prefix . 'region',
				'type'             => $select_type,
				'show_option_none' => true,
				//'desc'             => esc_html__( 'Where on the site this message will appear. If popup is selected it will load the banner but need to be triggered with Google Optimize.', 'wp-message-inserter-plugin' ),
				'desc'             => esc_html__( 'Where on the site this message will appear.', 'wp-message-inserter-plugin' ),
				'options'          => $this->get_region_options(),
				'default'          => 'none',
				'attributes'       => array(
					'required' => true,
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'       => esc_html__( 'Popup Close Time - Days', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'close_time_days',
				'type'       => 'text',
				'default'    => 1,
				'desc'       => esc_html__( 'How many days should this be hidden on close? The hours field will add on to this value.', 'wp-message-inserter-plugin' ),
				'attributes' => array(
					'type'                   => 'number',
					'pattern'                => '\d*',
					'data-conditional-id'    => $prefix . 'region',
					'data-conditional-value' => 'popup',
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'       => esc_html__( 'Popup Close Time - Hours', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'close_time_hours',
				'type'       => 'text',
				'desc'       => esc_html__( 'How many hours should this be hidden on close? This will add on to the days amount.', 'wp-message-inserter-plugin' ),
				'attributes' => array(
					'type'                   => 'number',
					'pattern'                => '\d*',
					'max'                    => '24',
					'data-conditional-id'    => $prefix . 'region',
					'data-conditional-value' => 'popup',
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'       => esc_html__( 'Check Sessions?', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'check_session',
				'type'       => 'checkbox',
				'desc'       => esc_html__( 'This determines whether or not to check how many sessions a user has when determing what to show them.', 'wp-message-inserter-plugin' ),
				'attributes' => array(
					'data-conditional-id'    => $prefix . 'delivery_method',
					'data-conditional-value' => 'front-end',
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'       => esc_html__( 'Number of Sessions', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'number_of_sessions',
				'type'       => 'text',
				'desc'       => esc_html__( 'How many sessions a user should have for banner display to apply.', 'wp-message-inserter-plugin' ),
				'attributes' => array(
					'type'                   => 'number',
					'pattern'                => '\d*',
					'data-conditional-id'    => $prefix . 'check_session',
					'data-conditional-value' => 'on',
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'       => esc_html__( 'Session Check Operator', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'operator_session',
				'type'       => 'radio',
				'desc'       => esc_html__( 'Which operator the banner uses to compare the session count.', 'wp-message-inserter-plugin' ),
				'options'    => array(
					'gt' => __( 'Greater Than or Equal to', 'cmb2' ),
					'lt' => __( 'Less Than or Equal to', 'cmb2' ),
				),
				'attributes' => array(
					'data-conditional-id'    => $prefix . 'check_session',
					'data-conditional-value' => 'on',
				),
			)
		);

		$conditional_group_id = $screen_size_box->add_field(
			array(
				'id'         => 'conditional_group_id',
				'type'       => 'group',
				'repeatable' => true,
				'options'    => array(
					'group_title'   => esc_html__( 'Conditional {#}', 'wp-message-inserter-plugin' ),
					'add_button'    => esc_html__( 'Add Another Conditional', 'wp-message-inserter-plugin' ),
					'remove_button' => 'Remove Conditional',
					'closed'        => false,  // Repeater fields closed by default - neat & compact.
					'sortable'      => false,  // Allow changing the order of repeated groups.
				),
			)
		);
		$screen_size_box->add_group_field(
			$conditional_group_id,
			array(
				'name'             => esc_html__( 'Conditional', 'wp-message-inserter-plugin' ),
				'desc'             => esc_html__( 'Pick a conditional.', 'wp-message-inserter-plugin' ),
				'id'               => $prefix . 'conditional',
				'type'             => $select_type,
				'show_option_none' => true,
				'classes'          => 'cmb2-message-conditional',
				'options'          => $this->get_conditional_options( $select_type ),
				'default'          => 'none',
				'attributes'       => array(
					'required' => false,
				),
			)
		);
		$screen_size_box->add_group_field(
			$conditional_group_id,
			array(
				'name'       => esc_html__( 'Conditional Value', 'wp-message-inserter-plugin' ),
				'desc'       => esc_html__( 'Enter the value(s) expected for this conditional.', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'conditional_value',
				'type'       => 'text',
				'classes'    => 'cmb2-message-conditional-value',
				'attributes' => array(
					'required'               => false,
					'data-conditional-id'    => wp_json_encode( array( $conditional_group_id, $prefix . 'conditional' ) ),
					'data-conditional-value' => wp_json_encode( $this->get_conditional_options( $select_type, true ) ),
				),
			)
		);
		$conditional_fields = apply_filters( $this->option_prefix . 'add_group_conditional_fields', array(), $conditional_group_id, $prefix );
		if ( ! empty( $conditional_fields ) ) {
			foreach ( $conditional_fields as $field_args ) {
				$screen_size_box->add_group_field(
					$conditional_group_id,
					$field_args
				);
			}
		}
		$screen_size_box->add_group_field(
			$conditional_group_id,
			array(
				'name'       => sprintf(
					esc_html( 'Condition Result %1$s', 'wp-message-inserter-plugin' ),
					'<span class="required">*</span>'
				),
				'id'         => $prefix . 'conditional_result',
				'type'       => 'radio_inline',
				'desc'       => '',
				'options'    => array(
					'true'  => esc_html__( 'True', 'wp-message-inserter-plugin' ),
					'false' => esc_html__( 'False', 'wp-message-inserter-plugin' ),
				),
				'default'    => 'true',
				'attributes' => array(
					'required'            => true,
					'data-conditional-id' => $prefix . 'conditional',
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'       => esc_html__( 'Conditional Operator', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'conditional_operator',
				'type'       => 'radio_inline',
				'desc'       => '',
				'options'    => array(
					'and' => esc_html__( 'AND', 'wp-message-inserter-plugin' ),
					'or'  => esc_html__( 'OR', 'wp-message-inserter-plugin' ),
				),
				'default'    => 'and',
				'attributes' => array(
					'required' => false,
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'id'          => $prefix . 'screen_size',
				'type'        => 'group',
				'description' => '',
				'options'     => array(
					'group_title'   => esc_html__( 'Screen Size {#}', 'wp-message-inserter-plugin' ), // {#} gets replaced by row number
					'add_button'    => esc_html__( 'Add Another Screen Size', 'wp-message-inserter-plugin' ),
					'remove_button' => esc_html__( 'Remove Screen Size', 'wp-message-inserter-plugin' ),
					'sortable'      => true,
					// 'closed'     => true, // true to have the groups closed by default
				),
			)
		);

		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html( 'Minimum Screen Width', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'minimum_width',
				'type'       => 'text_small',
				'default'    => 0,
				'desc'       => esc_html__( 'in pixels', 'wp-message-inserter-plugin' ),
				'attributes' => array(
					'required' => false,
				),
			)
		);

		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Maximum Screen Width', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'maximum_width',
				'type'       => 'text_small',
				'desc'       => esc_html__( 'in pixels', 'wp-message-inserter-plugin' ),
				'classes'    => 'cmb2-maximum-screen-width',
				'attributes' => array(
					'required' => false,
				),
			)
		);

		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'No Maximum Screen Width', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'no_maximum_width',
				'type'       => 'checkbox',
				'desc'       => '',
				'classes'    => 'cmb2-no-maximum-screen-width',
				'attributes' => array(
					'required' => false,
				),
			)
		);

		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'         => esc_html__( 'Image', 'wp-message-inserter-plugin' ),
				'desc'         => esc_html__( 'Upload an image or enter an URL.', 'wp-message-inserter-plugin' ),
				'id'           => $prefix . 'message_image',
				'type'         => 'file',
				'preview_size' => array( 130, 85 ),
				'options'      => array(
					//'url' => false, // Hide the text input for the url
				),
				'text'         => array(
					//'add_upload_file_text' => 'Add Image', // Change upload button text. Default: "Add or Upload File"
				),
				// query_args are passed to wp.media's library query.
				'query_args'   => array(
					'type' => 'image',
				),
				'classes'      => 'cmb2-message-type cmb2-message-type-image',
				'attributes'   => array(
					'required' => false,
				),
			)
		);

		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Editor', 'wp-message-inserter-plugin' ),
				'desc'       => esc_html__( 'Add content for this message', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'message_editor',
				'type'       => 'wysiwyg',
				'options'    => array(
					'media_buttons' => false, // show insert/upload button(s)
					'textarea_rows' => 5,
					'teeny'         => true, // output the minimal editor config used in Press This
				),
				'classes'    => 'cmb2-message-type cmb2-message-type-editor',
				'attributes' => array(
					'required' => false,
				),
			)
		);

		// New Boxes for Custom Banners / Popups

		// pick a preselected width
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => sprintf(
					esc_html( 'Maximum Banner Width %1$s', 'wp-message-inserter-plugin' ),
					'<span class="required">*</span>'
				),
				'id'         => $prefix . 'banner_max_width',
				'type'       => 'select',
				'desc'       => esc_html__( 'A banner will take up this amount of its container. For example, a 100% banner inside a full width container will be the whole width of the browser window. A full container width banner will take up the default site width, which is smaller than the browser window and horizontally centered within it.', 'wp-message-inserter-plugin' ),
				'options'    => array(
					'100%'   => esc_html__( 'Full Container Width (100%)', 'wp-message-inserter-plugin' ),
					'page'   => esc_html__( 'Site Page Width (not full window)', 'wp-message-inserter-plugin' ),
					'95%'    => esc_html__( '95%', 'wp-message-inserter-plugin' ),
					'90%'    => esc_html__( '90%', 'wp-message-inserter-plugin' ),
					'80%'    => esc_html__( '80%', 'wp-message-inserter-plugin' ),
					'50%'    => esc_html__( '50%', 'wp-message-inserter-plugin' ),
					'custom' => esc_html__( 'Custom Width', 'wp-message-inserter-plugin' ),
				),
				'default'    => 'page',
				'classes'    => 'cmb2-message-type cmb2-message-type-banner cmb2-maximum-banner-width',
				'attributes' => array(
					'required' => true,
				),
			)
		);

		// custom max banner width
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Custom Maximum Banner Width', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_max_width_text',
				'type'       => 'text',
				'desc'       => esc_html__( 'Enter a number for the width you want.', 'wp-message-inserter-plugin' ),
				'classes'    => 'cmb2-custom-maximum-banner-width cmb2-custom-maximum-banner-width-value',
				'attributes' => array(
					'required'               => true,
					'data-conditional-id'    => $prefix . 'banner_max_width',
					'data-conditional-value' => 'custom',
					'type'                   => 'number',
					'pattern'                => '\d*',
				),
			)
		);

		// custom max banner width unit
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Custom Maximum Banner Width Unit', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_max_width_unit',
				'type'       => 'select',
				'desc'       => esc_html__( 'By default, this will use percentage, which refers to the percentage of the container. For example, entering 42% will make a banner that takes up 42% of whatever contains it.', 'wp-message-inserter-plugin' ),
				'classes'    => 'cmb2-custom-maximum-banner-width cmb2-custom-maximum-banner-width-unit',
				'default'    => '%',
				'options'    => array(
					'%'   => esc_html__( 'percent', 'wp-message-inserter-plugin' ),
					'px'  => esc_html__( 'pixels', 'wp-message-inserter-plugin' ),
					'em'  => esc_html__( 'em', 'wp-message-inserter-plugin' ),
					'rem' => esc_html__( 'rem', 'wp-message-inserter-plugin' ),
				),
				'attributes' => array(
					'required'               => true,
					'data-conditional-id'    => $prefix . 'banner_max_width',
					'data-conditional-value' => 'custom',
				),
			)
		);

		// LAYOUT
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => sprintf(
					esc_html( 'Banner Layout %1$s', 'wp-message-inserter-plugin' ),
					'<span class="required">*</span>'
				),
				'id'         => $prefix . 'banner_layout',
				'type'       => 'select',
				'desc'       => esc_html__( 'Dual column banners will position their text, heading, and/or form elements next to any CTA button. Stacked elements will position them vertically instead.', 'wp-message-inserter-plugin' ),
				'options'    => array(
					'dualcol' => esc_html__( 'Dual Column', 'wp-message-inserter-plugin' ),
					'stacked' => esc_html__( 'Stacked', 'wp-message-inserter-plugin' ),
				),
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'attributes' => array(
					'required' => true,
				),
			)
		);

		// flip the columns?
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'    => esc_html__( 'Flip Columns', 'wp-message-inserter-plugin' ),
				'id'      => $prefix . 'banner_flip_columns',
				'type'    => 'checkbox',
				'desc'    => esc_html__( 'Checking this box makes the CTA button appear before the text, heading, and/or form elements.', 'wp-message-inserter-plugin' ),
				'classes' => 'cmb2-message-type cmb2-message-type-banner',
			)
		);

		// Banner BG Color
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'    => esc_html__( 'Banner Background Color', 'wp-message-inserter-plugin' ),
				'id'      => $prefix . 'banner_bgcolor',
				'desc'    => sprintf(
					// translators: 1) contrast checker url, 2) label for link, 3) close link tag, 4) MinnPost color palette url, 5, label for palette link, 6) close link
					esc_html__( 'Use a banner background color that is accessible with the text color. To check contrast values, use the %1$s%2$s%3$s. You can also see the %4$s%5$s%6$s and test new colors there.', 'wp-message-inserter-plugin' ),
					'<a href="https://webaim.org/resources/contrastchecker/" target="_blank">',
					esc_html__( 'Contrast Checker' ),
					'</a>',
					'<a href="https://minnpost-color-matrix.herokuapp.com/?n=red%3Adark&n=red%3Amedium&n=red%3Ahighlight&n=green%3Adark&n=green%3Amedium&n=green%3Ahighlight&n=green%3Abackground&n=blue%3Adark&n=blue%3Amedium&n=blue%3Ahighlight&n=blue%3Abackground&n=purple%3Adark&n=purple%3Amedium&n=purple%3Ahighlight&n=purple%3Abackground&n=yellow%3Abackground&n=neutral%3Ablack&n=neutral%3Adark&n=neutral%3Amedium&n=neutral%3Aborder&n=neutral%3Ahighlight&n=neutral%3Alight&n=neutral%3Awhite&v=4C1016&v=7F121C&v=D7757E&v=24613B&v=1C8745&v=609F78&v=DDF8E7&v=135B7E&v=0C7BB0&v=5E99B5&v=DCF0FA&v=635077&v=8C64B4&v=A880D0&v=EBE7EF&v=FBD341&v=1A1818&v=5E6E76&v=869298&v=D6D6DA&v=EBEBFB&v=EFEFF0&v=FFFFFF" target="_blank">',
					esc_html__( 'MinnPost color palette' ),
					'</a>',
				),
				'type'    => 'colorpicker',
				'default' => '#0080a3',
				'classes' => 'cmb2-message-type cmb2-message-type-banner',
				'options' => array(
					'alpha' => true,
				),
				/*'attributes' => array(
					'data-colorpicker' => json_encode( array(
						// Iris Options set here as values in the 'data-colorpicker' array
						'palettes' => array( '#7f121c', '#1c8745', '#135b7e', '#635077', '#fbd341', '#b94f03' ),
					) ),
				),*/
			)
		);

		// Banner BG Image
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Banner Background Image', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_bgimage',
				'desc'       => esc_html__( 'Image is optional. The Background Color will overlay this image if both are present.', 'wp-message-inserter-plugin' ),
				'type'       => 'file',
				'text'       => array(
					'add_upload_file_text' => esc_html__( 'Add Image', 'wp-message-inserter-plugin' ),
				),
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'query_args' => array(
					// Only allow gif, jpg, or png images
					'type' => array(
						'image/gif',
						'image/jpeg',
						'image/png',
					),
				),
				'attributes' => array( // no backgrounds in emails
					'data-conditional-id'    => $prefix . 'delivery_method',
					'data-conditional-value' => 'front-end',
				),
			)
		);

		// Close btn Color
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'    => esc_html__( 'Close Button Color', 'wp-message-inserter-plugin' ),
				'id'      => $prefix . 'close_button_color',
				'desc'    => sprintf(
					// translators: 1) contrast checker url, 2) label for link, 3) close link tag, 4) MinnPost color palette url, 5, label for palette link, 6) close link
					esc_html__( 'Use a close button color that is accessible with the background color. To check contrast values, use the %1$s%2$s%3$s. You can also see the %4$s%5$s%6$s and test new colors there.', 'wp-message-inserter-plugin' ),
					'<a href="https://webaim.org/resources/contrastchecker/" target="_blank">',
					esc_html__( 'Contrast Checker' ),
					'</a>',
					'<a href="https://minnpost-color-matrix.herokuapp.com/?n=red%3Adark&n=red%3Amedium&n=red%3Ahighlight&n=green%3Adark&n=green%3Amedium&n=green%3Ahighlight&n=green%3Abackground&n=blue%3Adark&n=blue%3Amedium&n=blue%3Ahighlight&n=blue%3Abackground&n=purple%3Adark&n=purple%3Amedium&n=purple%3Ahighlight&n=purple%3Abackground&n=yellow%3Abackground&n=neutral%3Ablack&n=neutral%3Adark&n=neutral%3Amedium&n=neutral%3Aborder&n=neutral%3Ahighlight&n=neutral%3Alight&n=neutral%3Awhite&v=4C1016&v=7F121C&v=D7757E&v=24613B&v=1C8745&v=609F78&v=DDF8E7&v=135B7E&v=0C7BB0&v=5E99B5&v=DCF0FA&v=635077&v=8C64B4&v=A880D0&v=EBE7EF&v=FBD341&v=1A1818&v=5E6E76&v=869298&v=D6D6DA&v=EBEBFB&v=EFEFF0&v=FFFFFF" target="_blank">',
					esc_html__( 'MinnPost color palette' ),
					'</a>',
				),
				'type'    => 'colorpicker',
				'default' => '#ffffff',
				'classes' => 'cmb2-message-type cmb2-message-type-banner',
				'options' => array(
					'alpha' => true,
				),
			)
		);

		// CONTENT
		// Banner Icon
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Banner Icon', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_icon',
				'desc'       => esc_html__( 'Image is optional.', 'wp-message-inserter-plugin' ),
				'type'       => 'file',
				'text'       => array(
					'add_upload_file_text' => __( 'Add Image', 'wp-message-inserter-plugin' ),
				),
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'query_args' => array(
					// Only allow gif, jpg, or png images
					'type' => array(
						'image/gif',
						'image/jpeg',
						'image/png',
					),
				),
				'attributes' => array( // this image should not be on emails
					'data-conditional-id'    => $prefix . 'delivery_method',
					'data-conditional-value' => 'front-end',
				),
			)
		);

		// Banner Text Color
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'    => esc_html__( 'Banner Text Color', 'wp-message-inserter-plugin' ),
				'id'      => $prefix . 'banner_textcolor',
				'desc'    => sprintf(
					// translators: 1) contrast checker url, 2) label for link, 3) close link tag, 4) MinnPost color palette url, 5, label for palette link, 6) close link
					esc_html__( 'Use a text color that is accessible on top of the background color. To check contrast values, use the %1$s%2$s%3$s. You can also see the %4$s%5$s%6$s and test new colors there.', 'wp-message-inserter-plugin' ),
					'<a href="https://webaim.org/resources/contrastchecker/" target="_blank">',
					esc_html__( 'Contrast Checker' ),
					'</a>',
					'<a href="https://minnpost-color-matrix.herokuapp.com/?n=red%3Adark&n=red%3Amedium&n=red%3Ahighlight&n=green%3Adark&n=green%3Amedium&n=green%3Ahighlight&n=green%3Abackground&n=blue%3Adark&n=blue%3Amedium&n=blue%3Ahighlight&n=blue%3Abackground&n=purple%3Adark&n=purple%3Amedium&n=purple%3Ahighlight&n=purple%3Abackground&n=yellow%3Abackground&n=neutral%3Ablack&n=neutral%3Adark&n=neutral%3Amedium&n=neutral%3Aborder&n=neutral%3Ahighlight&n=neutral%3Alight&n=neutral%3Awhite&v=4C1016&v=7F121C&v=D7757E&v=24613B&v=1C8745&v=609F78&v=DDF8E7&v=135B7E&v=0C7BB0&v=5E99B5&v=DCF0FA&v=635077&v=8C64B4&v=A880D0&v=EBE7EF&v=FBD341&v=1A1818&v=5E6E76&v=869298&v=D6D6DA&v=EBEBFB&v=EFEFF0&v=FFFFFF" target="_blank">',
					esc_html__( 'MinnPost color palette' ),
					'</a>',
				),
				'type'    => 'colorpicker',
				'default' => '#ffffff',
				'classes' => 'cmb2-message-type cmb2-message-type-banner',
				'options' => array(
					'alpha' => false,
				),
			)
		);

		// Banner Link Text Color
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'             => esc_html__( 'Banner Link Text Color', 'wp-message-inserter-plugin' ),
				'id'               => $prefix . 'banner_link_textcolor',
				'desc'             => sprintf(
					// translators: 1) contrast checker url, 2) label for link, 3) close link tag, 4) MinnPost color palette url, 5, label for palette link, 6) close link
					esc_html__( 'To optionally override the default link color for text links that are used inside the banner, add a value here. Use a link color that is accessible on top of the background color. To check contrast values, use the %1$s%2$s%3$s. You can also see the %4$s%5$s%6$s and test new colors there.', 'wp-message-inserter-plugin' ),
					'<a href="https://webaim.org/resources/contrastchecker/" target="_blank">',
					esc_html__( 'Contrast Checker' ),
					'</a>',
					'<a href="https://minnpost-color-matrix.herokuapp.com/?n=red%3Adark&n=red%3Amedium&n=red%3Ahighlight&n=green%3Adark&n=green%3Amedium&n=green%3Ahighlight&n=green%3Abackground&n=blue%3Adark&n=blue%3Amedium&n=blue%3Ahighlight&n=blue%3Abackground&n=purple%3Adark&n=purple%3Amedium&n=purple%3Ahighlight&n=purple%3Abackground&n=yellow%3Abackground&n=neutral%3Ablack&n=neutral%3Adark&n=neutral%3Amedium&n=neutral%3Aborder&n=neutral%3Ahighlight&n=neutral%3Alight&n=neutral%3Awhite&v=4C1016&v=7F121C&v=D7757E&v=24613B&v=1C8745&v=609F78&v=DDF8E7&v=135B7E&v=0C7BB0&v=5E99B5&v=DCF0FA&v=635077&v=8C64B4&v=A880D0&v=EBE7EF&v=FBD341&v=1A1818&v=5E6E76&v=869298&v=D6D6DA&v=EBEBFB&v=EFEFF0&v=FFFFFF" target="_blank">',
					esc_html__( 'MinnPost color palette' ),
					'</a>',
				),
				'type'             => 'colorpicker',
				'default'          => 'none',
				'show_option_none' => true,
				'classes'          => 'cmb2-message-type cmb2-message-type-banner',
				'options'          => array(
					'alpha' => false,
				),
			)
		);

		// Banner Main Heading
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Banner Heading', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_heading',
				'type'       => 'text',
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'attributes' => array(
					'required' => false,
				),
			)
		);

		// Banner Short Content
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'    => esc_html__( 'Banner Short Copy', 'wp-message-inserter-plugin' ),
				'id'      => $prefix . 'banner_shortcopy',
				'type'    => 'wysiwyg',
				'options' => array(
					'media_buttons' => false, // show insert/upload button(s)
					'teeny'         => true, // output the minimal editor config used in Press This
					'dfw'           => false, // replace the default fullscreen with DFW (needs specific css)
				),
				'classes' => 'cmb2-message-type cmb2-message-type-banner',
			)
		);

		// BUTTONS OR FORM: not emails
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => sprintf(
					esc_html( 'CTA Type %1$s', 'wp-message-inserter-plugin' ),
					'<span class="required">*</span>'
				),
				'id'         => $prefix . 'cta_type',
				'type'       => 'radio_inline',
				'desc'       => '',
				'options'    => array(
					'button' => esc_html__( 'Button', 'wp-message-inserter-plugin' ),
					'form'   => esc_html__( 'Form', 'wp-message-inserter-plugin' ),
					'none'   => esc_html__( 'None', 'wp-message-inserter-plugin' ),
				),
				'default'    => 'button',
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'attributes' => array(
					'required'               => true,
					'data-conditional-id'    => $prefix . 'delivery_method',
					'data-conditional-value' => 'front-end',
				),
			)
		);

		// BUTTON ONLY on emails
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => sprintf(
					esc_html( 'CTA Type %1$s', 'wp-message-inserter-plugin' ),
					'<span class="required">*</span>'
				),
				'id'         => $prefix . 'cta_type_email',
				'type'       => 'radio_inline',
				'desc'       => '',
				'options'    => array(
					'button' => esc_html__( 'Button', 'wp-message-inserter-plugin' ),
					'none'   => esc_html__( 'None', 'wp-message-inserter-plugin' ),
				),
				'default'    => 'button',
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'attributes' => array(
					'required'               => true,
					'data-conditional-id'    => $prefix . 'delivery_method',
					'data-conditional-value' => 'email',
				),
			)
		);

		// BUTTONS
		// Button Color
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Button Background Color', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_btn_bgcolor',
				'type'       => 'colorpicker',
				'default'    => '#801019',
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'attributes' => array(
					'required'               => false,
					'data-conditional-id'    => $prefix . 'cta_type',
					'data-conditional-value' => 'button',
				),
			)
		);

		// Button Text Color
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Button Text Color', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_btn_textcolor',
				'desc'       => sprintf(
					// translators: 1) contrast checker url, 2) label for link, 3) close link tag, 4) MinnPost color palette url, 5, label for palette link, 6) close link
					esc_html__( 'Use a button text color that is accessible on top of the button background color. To check contrast values, use the %1$s%2$s%3$s. You can also see the %4$s%5$s%6$s and test new colors there.', 'wp-message-inserter-plugin' ),
					'<a href="https://webaim.org/resources/contrastchecker/" target="_blank">',
					esc_html__( 'Contrast Checker' ),
					'</a>',
					'<a href="https://minnpost-color-matrix.herokuapp.com/?n=red%3Adark&n=red%3Amedium&n=red%3Ahighlight&n=green%3Adark&n=green%3Amedium&n=green%3Ahighlight&n=green%3Abackground&n=blue%3Adark&n=blue%3Amedium&n=blue%3Ahighlight&n=blue%3Abackground&n=purple%3Adark&n=purple%3Amedium&n=purple%3Ahighlight&n=purple%3Abackground&n=yellow%3Abackground&n=neutral%3Ablack&n=neutral%3Adark&n=neutral%3Amedium&n=neutral%3Aborder&n=neutral%3Ahighlight&n=neutral%3Alight&n=neutral%3Awhite&v=4C1016&v=7F121C&v=D7757E&v=24613B&v=1C8745&v=609F78&v=DDF8E7&v=135B7E&v=0C7BB0&v=5E99B5&v=DCF0FA&v=635077&v=8C64B4&v=A880D0&v=EBE7EF&v=FBD341&v=1A1818&v=5E6E76&v=869298&v=D6D6DA&v=EBEBFB&v=EFEFF0&v=FFFFFF" target="_blank">',
					esc_html__( 'MinnPost color palette' ),
					'</a>',
				),
				'type'       => 'colorpicker',
				'default'    => '#ffffff',
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'options'    => array(
					'alpha' => false,
				),
				'attributes' => array(
					'required'               => false,
					'data-conditional-id'    => $prefix . 'cta_type',
					'data-conditional-value' => 'button',
				),
			)
		);

		// Button Info
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Button Details', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_buttondetails',
				'type'       => 'link_picker',
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'attributes' => array(
					'required'               => false,
					'data-conditional-id'    => $prefix . 'cta_type',
					'data-conditional-value' => 'button',
				),
			)
		);

		// Button Icon
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Button Icon', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_buttonicon',
				'type'       => 'faiconselect',
				'options_cb' => 'returnRayFapsa',
				'attributes' => array(
					'faver'                  => 5,
					'required'               => false,
					'data-conditional-id'    => $prefix . 'cta_type',
					'data-conditional-value' => 'button',
				),
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
				'desc'       => esc_html__( 'Buttons can have an icon if they are not used in an email.', 'wp-message-inserter-plugin' ),
			)
		);

		// Button Emoji
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'             => esc_html__( 'Button Emoji', 'wp-message-inserter-plugin' ),
				'id'               => $prefix . 'banner_buttonemoji',
				'type'             => 'select',
				'show_option_none' => true,
				'options'          => array(
					'❤' => '❤',
				),
				'attributes'       => array(
					'required'               => false,
					'data-conditional-id'    => $prefix . 'cta_type',
					'data-conditional-value' => 'button',
				),
				'classes'          => 'cmb2-message-type cmb2-message-type-banner cmb2-emoji',
				'desc'             => esc_html__( 'Buttons can have an emoji on the website, if there is not an icon, or in an email.', 'wp-message-inserter-plugin' ),
				'default'          => 'none',
			)
		);

		// FORMS
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Form Shortcode', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_form_shortcode',
				'desc'       => esc_html__( 'Place shortcode for Mailchimp Signup form.', 'wp-message-inserter-plugin' ),
				'type'       => 'textarea_small',
				'attributes' => array(
					'required'               => false,
					'data-conditional-id'    => $prefix . 'cta_type',
					'data-conditional-value' => 'form',
				),
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
			)
		);

		// Disclaimer text - might need better name
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Disclaimer ', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_disclaimer',
				'desc'       => esc_html__( 'This value appears below the form or button as small text.', 'wp-message-inserter-plugin' ),
				'type'       => 'wysiwyg',
				'options'    => array(
					'media_buttons' => false, // show insert/upload button(s)
					'teeny'         => true, // output the minimal editor config used in Press This
					'dfw'           => false, // replace the default fullscreen with DFW (needs specific css)
				),
				'attributes' => array(
					'required' => false,
				),
				'classes'    => 'cmb2-message-type cmb2-message-type-banner',
			)
		);

	}

	/**
	* Return possible types
	*
	* @param array $omit
	* @return array $types
	*
	*/
	private function get_type_options( $omit = array() ) {

		$types = array(
			'image' => array(
				'name'        => 'Image',
				'description' => '(a single image)',
			),
			'editor' => array(
				'editor'        => 'Editor',
				'description' => '(add your own text or HTML)',
			),
			'banner' => array(
				'banner'        => 'Banner',
				'description' => '(configure your settings)',
			),
		);

		$combined_types = array();
		if ( ! empty( $omit ) ) {
			foreach ( $omit as $omit_key ) {
				foreach ( $types as $key => $type ) {
					unset( $types[ $key ][ $omit_key ] );
				}
			}
		}

		foreach ( $types as $key => $type ) {
			$combined_types[ $key ] = implode( ' ', $type );
		}
		$types = $combined_types;

		return $types;
	}

	/**
	* Return regions for <select> options
	*
	* @param array $omit
	* @return array $regions
	*
	*/
	private function get_region_options( $omit = array() ) {
		$regions = $this->regions->get_regions( $omit );
		return $regions;
	}

	/**
	* Get supported conditionals
	*
	* @return array $conditionals
	*
	*/
	public function get_conditionals( $select_type = 'select' ) {

		$general = array(
			array(
				'name'       => 'is_front_page',
				'has_params' => false,
			),
			array(
				'name'       => 'is_home',
				'has_params' => false,
			),
			/*array(
				'name'       => 'is_admin_bar_showing',
				'has_params' => false,
			),*/
			array(
				'name'       => 'is_rtl',
				'has_params' => false,
			),
			array(
				'name'       => 'is_search',
				'has_params' => false,
			),
			array(
				'name'       => 'is_404',
				'has_params' => false,
			),
			array(
				'name'       => 'is_paged',
				'has_params' => false,
			),
		);

		$post = array(
			array(
				'name'       => 'is_single',
				'has_params' => true,
				'params'     => array(
					'post',
				),
			),
			array(
				'name'       => 'is_singular',
				'has_params' => true,
				'params'     => array(
					'post_types',
				),
			),
			array(
				'name'       => 'has_term',
				'has_params' => true,
				'params'     => array(
					'term',
				),
			),
			array(
				'name'       => 'has_category',
				'has_params' => true,
				'params'     => array(
					'category',
					'current_post',
				),
			),
			array(
				'name'       => 'has_tag',
				'has_params' => true,
				'params'     => array(
					'tag',
					'current_post',
				),
			),
			array(
				'name'       => 'post_has_meta_value',
				'method'     => 'post_has_meta_value',
				'has_params' => true,
				'params'     => array(
					'current_post',
					'key',
					'value',
				),
			),
			array(
				'name'       => 'post_posted_before_datetime',
				'method'     => 'posted_before_datetime',
				'has_params' => true,
				'params'     => array(
					'current_post',
					'datetime',
					'format',
				),
			),
			array(
				'name'       => 'post_posted_after_datetime',
				'method'     => 'posted_after_datetime',
				'has_params' => true,
				'params'     => array(
					'current_post',
					'datetime',
					'format',
				),
			),
			/*array(
				'name'       => 'is_sticky',
				'has_params' => false,
			),
			array(
				'name'       => 'is_post_type_hierarchical',
				'has_params' => true,
				'params'     => array(
					'post_type',
				),
			),
			array(
				'name'       => 'comments_open',
				'has_params' => false,
			),
			array(
				'name'       => 'pings_open',
				'has_params' => false,
			),
			array(
				'name'       => 'is_preview',
				'has_params' => false,
			),
			array(
				'name'       => 'has_post_thumbnail',
				'has_params' => true,
				'params'     => array(
					'post_id',
				),
			),*/
		);

		$page = array(
			array(
				'name'       => 'is_page',
				'has_params' => true,
				'params'     => array(
					'page',
				),
			),
			array(
				'name'       => 'is_singular',
				'has_params' => false,
			),
			array(
				'name'       => 'page_has_meta_value',
				'method'     => 'post_has_meta_value',
				'has_params' => true,
				'params'     => array(
					'current_post',
					'key',
					'value',
				),
			),
			array(
				'name'       => 'page_posted_before_datetime',
				'method'     => 'posted_before_datetime',
				'has_params' => true,
				'params'     => array(
					'current_post',
					'datetime',
				),
			),
			array(
				'name'       => 'page_posted_after_datetime',
				'method'     => 'posted_after_datetime',
				'has_params' => true,
				'params'     => array(
					'current_post',
					'datetime',
				),
			),
			/*array(
				'name'       => 'is_page_template',
				'has_params' => false,
			),
			array(
				'name'       => 'comments_open',
				'has_params' => false,
			),
			array(
				'name'       => 'pings_open',
				'has_params' => false,
			),
			array(
				'name'       => 'is_preview',
				'has_params' => false,
			),*/
		);

		$archive = array(
			array(
				'name'       => 'is_post_type_archive',
				'has_params' => true,
				'params'     => array(
					'post_types',
				),
			),
			array(
				'name'       => 'is_category',
				'has_params' => true,
				'params'     => array(
					'category',
				),
			),
			array(
				'name'       => 'is_tag',
				'has_params' => true,
				'params'     => array(
					'tag',
				),
			),
			array(
				'name'       => 'is_tax',
				'has_params' => false,
			),
			array(
				'name'       => 'is_author',
				'has_params' => false,
			),
			/*array(
				'name'       => 'is_date',
				'has_params' => false,
			),
			array(
				'name'       => 'is_year',
				'has_params' => false,
			),
			array(
				'name'       => 'is_month',
				'has_params' => false,
			),
			array(
				'name'       => 'is_day',
				'has_params' => false,
			),
			array(
				'name'       => 'is_time',
				'has_params' => false,
			),
			array(
				'name'       => 'is_new_day',
				'has_params' => false,
			),*/
			array(
				'name'       => 'is_archive',
				'has_params' => false,
			),
		);

		$term = array(
			/*array(
				'name'       => 'term_exists',
				'has_params' => true,
				'params'     => array(
					'term',
					'taxonomy',
					'parent',
				),
			),*/
		);

		$taxonomy = array(
			/*array(
				'name'       => 'is_taxonomy_hierarchical',
				'has_params' => true,
				'params'     => array(
					'taxonomy',
				),
			),*/
			array(
				'name'       => 'taxonomy_exists',
				'has_params' => true,
				'params'     => array(
					'taxonomy',
				),
			),
		);

		$attachment = array(
			/*array(
				'name'       => 'is_attachment',
				'has_params' => false,
			),
			array(
				'name'       => 'wp_attachment_is_image',
				'has_params' => true,
				'params'     => array(
					'post_id',
				),
			),
			array(
				'name'       => 'is_local_attachment',
				'has_params' => true,
				'params'     => array(
					'url',
				),
			),*/
		);

		$sidebar = array(
			array(
				'name'       => 'is_dynamic_sidebar',
				'has_params' => false,
			),
			array(
				'name'       => 'is_active_sidebar',
				'has_params' => true,
				'params'     => array(
					'index',
				),
			),
			array(
				'name'       => 'is_active_widget',
				'has_params' => true,
				'params'     => array(
					'widget_callback',
					'widget_id',
				),
			),
		);

		$user = array(
			array(
				'name'       => 'is_user_logged_in',
				'has_params' => false,
			),
			array(
				'name'       => 'user_has_meta_value',
				'method'     => 'user_has_meta_value',
				'has_params' => true,
				'params'     => array(
					'current_user',
					'key',
					'value',
				),
			),
			/*array(
				'name'       => 'email_exists',
				'has_params' => true,
				'params'     => array(
					'email',
				),
			),
			array(
				'name'       => 'username_exists',
				'has_params' => true,
				'params'     => array(
					'username',
				),
			),*/
		);

		$query = array(
			array(
				'name'       => 'is_main_query',
				'has_params' => false,
			),
			array(
				'name'       => 'is_feed',
				'has_params' => false,
			),
			/*array(
				'name'       => 'is_trackback',
				'has_params' => false,
			),*/
			array(
				'name'       => 'in_the_loop',
				'has_params' => false,
			),
		);

		$multisite = array(
			/*array(
				'name'       => 'is_multisite',
				'has_params' => false,
			),
			array(
				'name'       => 'is_main_site',
				'has_params' => false,
			),
			array(
				'name'       => 'is_super_admin',
				'has_params' => false,
			),*/
		);

		$plugin_and_theme = array(
			/*array(
				'name'       => 'post_type_exists',
				'has_params' => true,
				'params'     => array(
					'post_type',
				),
			),
			array(
				'name'       => 'is_plugin_active',
				'has_params' => true,
				'params'     => array(
					'path',
				),
			),
			array(
				'name'       => 'is_plugin_inactive',
				'has_params' => true,
				'params'     => array(
					'path',
				),
			),
			array(
				'name'       => 'is_plugin_active_for_network',
				'has_params' => true,
				'params'     => array(
					'path',
				),
			),
			array(
				'name'       => 'is_plugin_page',
				'has_params' => false,
			),
			array(
				'name'       => 'is_child_theme',
				'has_params' => false,
			),
			array(
				'name'       => 'current_theme_supports',
				'has_params' => false,
			),*/
		);

		$conditionals = array(
			'general'          => $general,
			'post'             => $post,
			'page'             => $page,
			'archive'          => $archive,
			'term'             => $term,
			'taxonomy'         => $taxonomy,
			'attachment'       => $attachment,
			'sidebar'          => $sidebar,
			'user'             => $user,
			'query'            => $query,
			'multisite'        => $multisite,
			'plugin_and_theme' => $plugin_and_theme,
		);

		$conditionals = apply_filters( $this->option_prefix . 'conditionals', $conditionals, $select_type );

		if ( 'select' === $select_type ) {

			$conditionals_select = array();
			foreach ( $conditionals as $conditional_set ) {
				if ( is_array( $conditional_set ) ) {
					foreach ( $conditional_set as $key => $value ) {
						$conditionals_select[] = $value;
					}
				}
			}
			return $conditionals_select;
		}

		return $conditionals;
	}

	/**
	* Display conditionals as <select> options
	*
	* @return array $options
	*
	*/
	private function get_conditional_options( $select_type = 'select', $must_have_params = false ) {
		$conditionals = $this->get_conditionals( $select_type );
		if ( ! isset( $options ) ) {
			$options = array();
		}
		if ( 'select' === $select_type ) {
			foreach ( $conditionals as $conditional ) {
				if ( false === $must_have_params ) {
					$options[ $conditional['name'] ] = $conditional['name'];
				} elseif ( true === $must_have_params && true === $conditional['has_params'] ) {
					array_push( $options, $conditional['name'] );
				}
			}
		} else {
			foreach ( $conditionals as $group => $conditionals ) {
				if ( empty( $conditionals ) ) {
					continue;
				}
				if ( false === $must_have_params ) {
					$options[ ucfirst( $group ) ] = array();
				}
				foreach ( $conditionals as $conditional ) {
					if ( false === $must_have_params ) {
						$options[ ucfirst( $group ) ][ $conditional['name'] ] = $conditional['name'];
					} elseif ( true === $must_have_params && true === $conditional['has_params'] ) {
						array_push( $options, $conditional['name'] );
					}
				}
			}
		}
		return $options;
	}

}
