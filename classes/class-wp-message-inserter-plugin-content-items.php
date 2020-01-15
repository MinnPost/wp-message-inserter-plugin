<?php
/**
 * Class file for the WP_Message_Inserter_Plugin_Content_Items class.
 *
 * @file
 */

if ( ! class_exists( 'WP_Message_Inserter' ) ) {
	die();
}

/**
 * Create default structure for content items
 */
class WP_Message_Inserter_Plugin_Content_Items {

	protected $option_prefix;
	protected $post_meta_prefix;
	protected $version;
	protected $slug;
	protected $regions;

	/**
	* Constructor which sets up content items
	*
	* @param string $option_prefix
	* @param string $post_meta_prefix
	* @param string $version
	* @param string $slug
	* @param object $regions
	* @throws \Exception
	*/
	public function __construct( $option_prefix, $post_meta_prefix, $version, $slug, $regions ) {

		$this->option_prefix    = $option_prefix;
		$this->post_meta_prefix = $post_meta_prefix;
		$this->version          = $version;
		$this->slug             = $slug;
		$this->regions          = $regions;

		$this->add_actions();

	}

	/**
	* Create the action hooks to create content items
	*
	*/
	public function add_actions() {
		add_action( 'init', array( $this, 'create_message' ), 0 );
		add_action( 'cmb2_init', array( $this, 'create_message_fields' ) );
	}

	/**
	* Create the partner offer content type
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
			'hierarchical'        => true,
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
				'name'       => esc_html__( 'Message Type', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'message_type',
				'type'       => 'radio_inline',
				'desc'       => '',
				'options'    => array(
					'image'  => esc_html__( 'Image', 'wp-message-inserter-plugin' ),
					'editor' => esc_html__( 'Editor', 'wp-message-inserter-plugin' ),
					'banner' => esc_html__( 'Banner', 'wp-message-inserter-plugin' ),
				),
				'default'    => 'image',
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
				'desc'       => '',
				'attributes' => array(
					'required'               => false,
					'data-conditional-id'    => $prefix . 'message_type',
					'data-conditional-value' => 'image',
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'             => esc_html__( 'Region', 'wp-message-inserter-plugin' ),
				'id'               => $prefix . 'region',
				'type'             => $select_type,
				'show_option_none' => true,
				'desc'             => esc_html__( 'Where on the site this message will appear. If popup is selected it will load the banner but need to be triggered with Google Optimize.', 'wp-message-inserter-plugin' ),
				'options'          => $this->get_region_options( $select_type ),
				'default'          => 'none',
				'attributes'       => array(
					'required' => true,
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'             => esc_html__( 'Popup Close Time - Days', 'wp-message-inserter-plugin' ),
				'id'               => $prefix . "close_time_days",
				'type'             => 'text',
				'desc'             => esc_html__( 'How many days should this be hidden on close?', 'wp-message-inserter-plugin' ),
					'attributes' => array(
					'type' => 'number',
					'pattern' => '\d*',
					'data-conditional-id' => $prefix . 'region',
					'data-conditional-value' => 'popup',
				),
			)
		);

		$screen_size_box->add_field(
			array(
				'name'             => esc_html__( 'Popup Close Time - Hours', 'wp-message-inserter-plugin' ),
				'id'               => $prefix . "close_time_hours",
				'type'             => 'text',
				'desc'             => esc_html__( 'How many hours should this be hidden on close?', 'wp-message-inserter-plugin' ),
					'attributes' => array(
					'type' => 'number',
					'pattern' => '\d*',
					'data-conditional-id' => $prefix . 'region',
					'data-conditional-value' => 'popup',
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
				'desc'             => esc_html__( 'Pick a conditional', 'wp-message-inserter-plugin' ),
				'id'               => $prefix . 'conditional',
				'type'             => $select_type,
				'show_option_none' => true,
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
				'desc'       => esc_html__( 'Enter the value expected for this conditional', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'conditional_value',
				'type'       => 'text',
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
				'name'       => esc_html__( 'Condition Result', 'wp-message-inserter-plugin' ),
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

		/*$screen_size_box->add_field( array(
			'name'             => 'Condition',
			'id'               => $prefix . 'conditional',
			'type'             => $select_type,
			'desc'             => 'If present, this will combine with the region to determine whether a message should appear. If the value of this field is None, the region alone will determine display. To use more conditions, click Add more.',
			'show_option_none' => true,
			'options'          => $this->get_conditional_options( $select_type ),
			'default'          => 'none',
			'attributes'       => array(
				'required' => false,
			),
		) );*/

		/*$screen_size_box->add_field( array(
			'name'       => 'Condition Value',
			'id'         => $prefix . 'conditional_value',
			'type'       => 'text',
			'desc'       => '',
			'attributes' => array(
				'required'               => true,
				'data-conditional-id'    => $prefix . 'conditional',
				'data-conditional-value' => wp_json_encode( $this->get_conditional_options( $select_type, true ) ),
			),
		) );*/

		/*$screen_size_box->add_field( array(
			'name'       => 'Condition Result',
			'id'         => $prefix . 'conditional_result',
			'type'       => 'radio_inline',
			'desc'       => '',
			'options'    => array(
				'true'  => __( 'True', 'wp-message-inserter-plugin' ),
				'false' => __( 'False', 'wp-message-inserter-plugin' ),
			),
			'default'    => 'true',
			'attributes' => array(
				'required'            => true,
				'data-conditional-id' => $prefix . 'conditional',
			),
		) );*/

		$screen_size_box->add_field(
			array(
				'id'          => $prefix . 'screen_size',
				'type'        => 'group',
				'description' => '',
				'options'     => array(
					'group_title'   => esc_html__( 'Screen size {#}', 'wp-message-inserter-plugin' ), // {#} gets replaced by row number
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
				'name'       => esc_html__( 'Minimum Width', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'minimum_width',
				'type'       => 'text_small',
				'desc'       => 'px',
				'attributes' => array(
					'required' => true,
				),
			)
		);

		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Maximum Width', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'maximum_width',
				'type'       => 'text_small',
				'desc'       => 'px',
				'classes'    => 'cmb2-maximum-width',
				'attributes' => array(
					'required' => false,
				),
			)
		);

		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'No Maximum Width', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'no_maximum_width',
				'type'       => 'checkbox',
				'desc'       => '',
				'classes'    => 'cmb2-no-maximum-width',
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

		// LAYOUT
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Banner Layout', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_layout',
				'type'       => 'select',
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

		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'    => esc_html__( 'Flip Columns', 'wp-message-inserter-plugin' ),
				'id'      => $prefix . 'banner_flip_columns',
				'type'    => 'checkbox',
				'desc'    => esc_html__( 'Flip order of dual column', 'wp-message-inserter-plugin' ),
				'classes' => 'cmb2-message-type cmb2-message-type-banner',
			)
		);

		// Banner BG Color
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'    => esc_html__( 'Banner BG Color', 'wp-message-inserter-plugin' ),
				'id'      => $prefix . 'banner_bgcolor',
				'type'    => 'colorpicker',
				'default' => '#0080a3',
				'classes' => 'cmb2-message-type cmb2-message-type-banner',
				'options' => array(
					'alpha' => true,
				),
			)
		);

		// Banner BG Image
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Banner BG Image', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_bgimage',
				'desc'       => esc_html__( 'Image is optional. The BG Color will overlay this image', 'wp-message-inserter-plugin' ),
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
			)
		);

		// CONTENT
		// Banner Icon
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Banner Icon', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_icon',
				'desc'       => 'Image is optional.',
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

		// BUTTONS OR FORM
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'CTA Type', 'wp-message-inserter-plugin' ),
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
					'required' => true,
				),
			)
		);

		// BUTTONS
		// Button Color
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Button BG Color', 'wp-message-inserter-plugin' ),
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
			)
		);

		// FORMS
		$screen_size_box->add_group_field(
			$prefix . 'screen_size',
			array(
				'name'       => esc_html__( 'Form Shortcode', 'wp-message-inserter-plugin' ),
				'id'         => $prefix . 'banner_form_shortcode',
				'desc'       => esc_html__( 'Place shortcode for Mailchimp Signup form', 'wp-message-inserter-plugin' ),
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
				'desc'       => esc_html__( 'Appears below the form or button. Small text', 'wp-message-inserter-plugin' ),
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
	* Display regions as <select> options
	*
	* @return array $regions
	*
	*/
	private function get_region_options( $select_type = 'select' ) {
		$regions = $this->regions->get_regions( $select_type );
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
			),
			array(
				'name'       => 'is_rtl',
				'has_params' => false,
			),*/
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
				'has_params' => false,
			),
			array(
				'name'       => 'has_term',
				'has_params' => true,
				'params'     => array(
					'term',
				),
			),
			array(
				'name'       => 'is_singular',
				'has_params' => false,
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
				'has_params' => false,
			),
			array(
				'name'       => 'is_singular',
				'has_params' => false,
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
			/*array(
				'name'       => 'is_post_type_archive',
				'has_params' => false,
			),*/
			array(
				'name'       => 'is_category',
				'has_params' => true,
				'params'     => array(
					'category',
				),
			),
			array(
				'name'       => 'is_tag',
				'has_params' => false,
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
			),
			array(
				'name'       => 'is_archive',
				'has_params' => false,
			),*/
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
			),
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
			array(
				'name'       => 'is_trackback',
				'has_params' => false,
			),
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
			$conditionals = array_merge( $conditionals['general'], $conditionals['post'], $conditionals['page'], $conditionals['archive'], $conditionals['term'], $conditionals['taxonomy'], $conditionals['attachment'], $conditionals['sidebar'], $conditionals['user'], $conditionals['query'], $conditionals['multisite'], $conditionals['plugin_and_theme'] );
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
