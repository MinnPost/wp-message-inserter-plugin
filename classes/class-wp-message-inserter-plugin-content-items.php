<?php
/**
 * Class file for the WP_Message_Inserter_Content_Items class.
 *
 * @file
 */

if ( ! class_exists( 'WP_Message_Inserter' ) ) {
	die();
}

/**
 * Create default structure for content items
 */
class WP_Message_Inserter_Content_Items {

	protected $option_prefix;
	protected $version;
	protected $slug;

	/**
	* Constructor which sets up content items
	*
	* @param string $option_prefix
	* @param string $version
	* @param string $slug
	* @throws \Exception
	*/
	public function __construct( $option_prefix, $version, $slug ) {

		$this->option_prefix = $option_prefix;
		$this->version       = $version;
		$this->slug          = $slug;

		$this->add_actions();

	}

	/**
	* Create the action hooks to create content items
	*
	*/
	public function add_actions() {
		add_action( 'init', array( $this, 'create_message' ), 0 );
		add_action( 'admin_menu', array( $this, 'create_sub_menus' ), 20 );
		add_action( 'admin_menu', array( $this, 'remove_message_fields' ) );
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
			'menu_name'             => __( 'Messages', 'wp-message-inserter-plugin' ),
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
			'supports'            => array( 'title', 'revisions' ),
			'hierarchical'        => true,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_admin_bar'   => true,
			'show_in_nav_menus'   => true,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => true,
			'capability_type'     => 'page',
		);
		register_post_type( 'message', $args );
	}

	/**
	* Create submenus for content
	*
	*/
	public function create_sub_menus() {
		$message    = 'edit.php?post_type=message';
		$capability = 'manage_options';
		add_submenu_page( $this->slug, 'Messages', 'Messages', $capability, $message );
	}

	/**
	* Remove unneeded default message fields
	*
	*/
	public function remove_message_fields() {
		$object_type = 'message';
		remove_meta_box( 'pageparentdiv', $object_type, 'normal' );
	}

	/**
	* Create the message fields with CMB2
	*
	*/
	public function create_message_fields() {
		$object_type = 'message';
		$prefix      = '_wp_inserted_message_';

		$screen_size_box = new_cmb2_box( array(
			'id'           => $prefix . 'all_screen_sizes',
			'title'        => 'Message content',
			'object_types' => $object_type,
			'context'      => 'normal',
			//'priority'     => 'high',
		) );

		$screen_size_box->add_field( array(
			'name'    => 'Message type',
			'id'      => $prefix . 'message_type',
			'type'    => 'radio_inline',
			'desc'    => '',
			'options' => array(
				'image'  => __( 'Image', 'wp-message-inserter-plugin' ),
				'editor' => __( 'Editor', 'wp-message-inserter-plugin' ),
			),
			'default' => 'image',
			'classes' => 'cmb2-message-type-selector',
		) );

		$screen_size_box->add_field( array(
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
		) );

		$screen_size_box->add_group_field( $prefix . 'screen_size', array(
			'name' => 'Minimum width',
			'id'   => $prefix . 'minimum_width',
			'type' => 'text_small',
			'desc' => '',
		) );

		$screen_size_box->add_group_field( $prefix . 'screen_size', array(
			'name'    => 'Maximum width',
			'id'      => $prefix . 'maximum_width',
			'type'    => 'text_small',
			'desc'    => '',
			'classes' => 'cmb2-maximum-width',
		) );

		$screen_size_box->add_group_field( $prefix . 'screen_size', array(
			'name'    => 'No maximum width',
			'id'      => $prefix . 'no_maximum_width',
			'type'    => 'checkbox',
			'desc'    => '',
			'classes' => 'cmb2-no-maximum-width',
		) );

		$screen_size_box->add_group_field( $prefix . 'screen_size', array(
			'name'         => 'Image',
			'desc'         => 'Upload an image or enter an URL.',
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
		) );

		$screen_size_box->add_group_field( $prefix . 'screen_size', array(
			'name'    => 'Editor',
			'desc'    => 'Add content for this message',
			'id'      => $prefix . 'message_editor',
			'type'    => 'wysiwyg',
			'options' => array(
				'media_buttons' => false, // show insert/upload button(s)
				'textarea_rows' => 5,
				'teeny'         => true, // output the minimal editor config used in Press This
			),
			'classes' => 'cmb2-message-type cmb2-message-type-editor',
		) );

	}

	/**
	* Display the partner <figure>
	* @param int $partner_id
	* @param string $size
	* @param bool $include_link
	* @param bool $include_name
	*
	*/
	public function partner_figure( $partner_id = '', $size = 'partner-logo', $include_link = true, $include_name = false ) {
		$output = $this->get_partner_figure( $partner_id, $size, $include_link, $include_name );
		echo $output;
	}

	/**
	* Get the partner <figure> html
	* @param int $partner_id
	* @param string $size
	* @param bool $include_link
	* @param bool $include_name
	*
	*/
	public function get_partner_figure( $partner_id = '', $size = 'partner-logo', $include_link = true, $include_name = false ) {

		if ( '' === $partner_id ) {
			$partner_id = get_the_ID();
		}

		$image_data = $this->get_partner_image( $partner_id, $size );
		if ( '' !== $image_data ) {
			$image_id  = $image_data['image_id'];
			$image_url = $image_data['image_url'];
			$image     = $image_data['markup'];
		}

		$link = get_post_meta( $partner_id, '_mp_partner_link_url', true );

		if ( post_password_required() || is_attachment() || ( ! isset( $image_id ) && ! isset( $image_url ) ) ) {
			return;
		}

		$name = '';
		$name = get_the_title( $partner_id );

		$output  = '';
		$output .= '<figure class="a-partner-figure a-partner-figure-' . $size . '">';
		if ( true === $include_link && '' !== $link ) {
			$output .= '<a href="' . $link . '">';
		}
		$output .= $image;
		if ( true === $include_link && '' !== $link ) {
			$output .= '</a>';
		}
		if ( true === $include_name && '' !== $name ) {
			$output .= '<figcaption>';
			if ( true === $include_name && '' !== $name ) {
				$output .= '<h3 class="a-author-title"><a href="' . get_author_posts_url( $author_id, sanitize_title( $name ) ) . '">' . $name . '</a></h3>';
			}
			$output .= $text;
			$output .= '</figcaption>';
		}
		$output .= '</figure><!-- .author-figure -->';
		return $output;
	}

	/**
	* Get the image for the partner
	* @param int $partner_id
	* @param string $size
	*
	*/
	public function get_partner_image( $partner_id, $size = 'partner-logo' ) {
		$image_url = get_post_meta( $partner_id, '_mp_partner_logo_image', true );
		if ( 'partner-logo' !== $size ) {
			$image_url = get_post_meta( $partner_id, '_mp_partner_logo_image' . $size, true );
		}
		$image_id = get_post_meta( $partner_id, '_mp_partner_logo_image_id', true );

		if ( post_password_required() || is_attachment() || ( ! $image_id && ! $image_url ) ) {
			return '';
		}

		if ( '' !== wp_get_attachment_image( $image_id, $size ) ) {
			$image = wp_get_attachment_image( $image_id, $size );
		} else {
			$alt   = get_post_meta( $image_id, '_wp_attachment_image_alt', true );
			$image = '<img src="' . $image_url . '" alt="' . $alt . '">';
		}

		$image = apply_filters( 'easy_lazy_loader_html', $image );

		$image_data = array(
			'image_id'  => $image_id,
			'image_url' => $image_url,
			'markup'    => $image,
		);
		return $image_data;
	}

	/**
	* Get all partner offers
	* @param int $partner_offer_id
	* @return object $partner_offers
	*
	*/
	public function get_partner_offers( $partner_offer_id = '' ) {

		global $wpdb;

		$now = current_time( 'mysql' );
		//$now = date( 'Y-m-d', strtotime( '-1 month' ) );
		//$now = date( 'Y-m-d', strtotime( '+1 month' ) );

		$query = $wpdb->prepare(
			"SELECT
			offer.ID, offer.post_title,
			partner.meta_value as post_parent,
			offer.post_type as post_type,
			partner_image_id.meta_value as partner_logo_image_id, partner_image.meta_value as partner_logo_image,
			partner_link.meta_value as partner_link_url,
			quantity.meta_value as quantity,
			offer_type.meta_value as offer_type,
			restriction.meta_value as restriction,
			more_info_text.meta_value as more_info_text,
			more_info_url.meta_value as more_info_url,
			claimable_start_date.meta_value as claimable_start_date, claimable_end_date.meta_value as claimable_end_date,

			instance.meta_value as instances,

			IF(%s BETWEEN FROM_UNIXTIME(claimable_start_date.meta_value) AND FROM_UNIXTIME(claimable_end_date.meta_value), true, false) as claimable

			FROM {$wpdb->prefix}posts offer

			LEFT JOIN {$wpdb->prefix}postmeta AS partner ON offer.ID = partner.post_id AND 'partner_id' = partner.meta_key
			LEFT JOIN {$wpdb->prefix}postmeta AS partner_image_id ON partner.meta_value = partner_image_id.post_id AND '_mp_partner_logo_image_id' = partner_image_id.meta_key
			LEFT JOIN {$wpdb->prefix}postmeta AS partner_image ON partner.meta_value = partner_image.post_id AND '_mp_partner_logo_image' = partner_image.meta_key
			LEFT JOIN {$wpdb->prefix}postmeta AS partner_link ON partner.meta_value = partner_link.post_id AND '_mp_partner_link_url' = partner_link.meta_key

			LEFT JOIN {$wpdb->prefix}postmeta AS quantity ON offer.ID = quantity.post_id AND '_mp_partner_offer_quantity' = quantity.meta_key
			LEFT JOIN {$wpdb->prefix}postmeta AS offer_type ON offer.ID = offer_type.post_id AND '_mp_partner_offer_type' = offer_type.meta_key
			LEFT JOIN {$wpdb->prefix}postmeta AS restriction ON offer.ID = restriction.post_id AND '_mp_partner_offer_restriction' = restriction.meta_key
			LEFT JOIN {$wpdb->prefix}postmeta AS more_info_text ON offer.ID = more_info_text.post_id AND '_mp_partner_offer_more_info_text' = more_info_text.meta_key
			LEFT JOIN {$wpdb->prefix}postmeta AS more_info_url ON offer.ID = more_info_url.post_id AND '_mp_partner_offer_more_info_url' = more_info_url.meta_key
			LEFT JOIN {$wpdb->prefix}postmeta AS claimable_start_date ON offer.ID = claimable_start_date.post_id AND '_mp_partner_offer_claimable_start_date' = claimable_start_date.meta_key
			LEFT JOIN {$wpdb->prefix}postmeta AS claimable_end_date ON offer.ID = claimable_end_date.post_id AND '_mp_partner_offer_claimable_end_date' = claimable_end_date.meta_key

			LEFT JOIN {$wpdb->prefix}postmeta AS instance ON offer.ID = instance.post_id AND '_mp_partner_offer_instance' = instance.meta_key

			WHERE offer.post_status = 'publish' AND offer.post_type = 'partner_offer'

		", $now );

		if ( '' !== $partner_offer_id ) {
			$cond   = $wpdb->prepare( ' AND offer.ID = %s', $partner_offer_id );
			$query .= $cond;
		}

		//$query .= 'ORDER BY available_instance_count DESC, claimable_start_date DESC, claimable_end_date DESC';
		$query .= ' ORDER BY claimable_start_date DESC, claimable_end_date DESC';

		$partner_offers = $wpdb->get_results( $query, OBJECT ); // WPCS: unprepared SQL ok.
		foreach ( $partner_offers as $partner_offer ) {
			$partner_offer = $this->store_partner_offer_instances( $partner_offer );
		}

		usort( $partner_offers, array( $this, 'sort_partner_offer_instances' ) );

		if ( '' !== $partner_offer_id ) {
			return $partner_offers[0];
		} else {
			return $partner_offers;
		}

	}

	/**
	* Save partner offer instances to the partner offer object
	*
	* @param object $partner_offer
	* @return object $partner_offer
	*
	*/
	private function store_partner_offer_instances( $partner_offer ) {
		$unclaimed_instance_count = 0;
		$dated_instance_count     = 0;

		if ( null !== $partner_offer->instances ) {
			$instances = maybe_unserialize( $partner_offer->instances );
			if ( is_array( $instances ) ) {
				foreach ( $instances as $key => $instance ) {
					if ( ! isset( $instance['_mp_partner_offer_instance_enabled'] ) || 'on' !== $instance['_mp_partner_offer_instance_enabled'] ) {
						continue;
					}
					if ( isset( $instance['_mp_partner_offer_claimed_date'] ) && '' !== $instance['_mp_partner_offer_claimed_date'] ) {
						continue;
					}
					$unclaimed_instance_count++;
				}
				foreach ( $instances as $key => $instance ) {
					if ( ! isset( $instance['_mp_partner_offer_instance_date'] ) || '' === $instance['_mp_partner_offer_instance_date'] ) {
						continue;
					}
					$dated_instance_count++;
				}
			}
		}
		$partner_offer->unclaimed_instance_count = $unclaimed_instance_count;
		$partner_offer->dated_instance_count     = $dated_instance_count;
		$partner_offer->instances                = $instances;
		return $partner_offer;
	}

	/**
	* Sort partner offer instances by instance count
	*
	* @param object $a
	* @param object $b
	* @param array
	*
	*/
	private function sort_partner_offer_instances( $a, $b ) {
		return strcmp( $b->unclaimed_instance_count, $a->unclaimed_instance_count );
	}

	/**
	* Get user's claims in descending order. Returns timestamp as key, partner offer post object as value
	* @return array $user_claims
	*
	*/
	public function get_user_offer_claims() {
		$user_claims    = array();
		$partner_offers = $this->get_partner_offers();
		foreach ( $partner_offers as $partner_offer ) {
			foreach ( $partner_offer->instances as $instance ) {
				$how_often            = get_option( $this->option_prefix . 'account-benefits-partner-offers_claim_frequency', '' );
				$oldest_eligible_date = strtotime( '-' . $how_often, current_time( 'timestamp' ) );
				if ( isset( $instance['_mp_partner_offer_claimed_date'] ) && $instance['_mp_partner_offer_claimed_date'] < $oldest_eligible_date ) {
					continue;
				} elseif ( ! isset( $instance['_mp_partner_offer_claimed_date'] ) || '' === $instance['_mp_partner_offer_claimed_date'] || get_current_user_id() !== (int) $instance['_mp_partner_offer_claim_user']['id'] ) {
					continue;
				} else {
					$partner_offer->user_claimed = $instance['_mp_partner_offer_claimed_date'];

					$user_claims[ $instance['_mp_partner_offer_claimed_date'] ] = $partner_offer;
				}
			}
		}
		rsort( $user_claims );
		return $user_claims;
	}

	/**
	* Output partner offer image
	*
	* @param int $id
	* @param array $attributes
	* @param bool $lazy_load
	*
	*/
	public function partner_offer_image( $id, $attributes = array(), $lazy_load = true ) {
		$image_data = $this->get_partner_offer_image( $id, $attributes, $lazy_load );
		if ( '' !== $image_data ) {
			$image_id  = $image_data['image_id'];
			$image_url = $image_data['image_url'];
			$image     = $image_data['markup'];
		}

		if ( post_password_required() || is_attachment() || ( ! isset( $image_id ) && ! isset( $image_url ) ) ) {
			return;
		}

		if ( true === $lazy_load ) {
			$image = apply_filters( 'easy_lazy_loader_html', $image );
		}

		$caption = wp_get_attachment_caption( $image_id );
		$credit  = get_media_credit_html( $image_id, false ); // don't show the uploader by default
		?>
		<figure class="m-partner-offer-image">
			<?php echo $image; ?>
			<?php if ( '' !== $caption || '' !== $credit ) { ?>
			<figcaption>
				<?php if ( '' !== $credit ) { ?>
					<div class="a-media-meta a-media-credit"><?php echo $credit; ?></div>
				<?php } ?>
				<?php if ( '' !== $caption ) { ?>
					<div class="a-media-meta a-media-caption"><?php echo $caption; ?></div>
				<?php } ?>
			</figcaption>
			<?php } ?>
		</figure><!-- .post-image -->
		<?php
	}


	/**
	* Get the partner offer image based on where it should go
	*
	* @param int $id
	* @param array $attributes
	* @param bool $lazy_load
	*
	* @return array $image_data
	*
	*/
	public function get_partner_offer_image( $id, $attributes = array(), $lazy_load = true ) {

		$image_url = get_post_meta( $id, '_mp_partner_logo_image', true );
		$image_id  = get_post_meta( $id, '_mp_partner_logo_image_id', true );

		if ( '' !== wp_get_attachment_image( $image_id, 'full' ) ) {
			// this requires that the custom image sizes in custom-fields.php work correctly
			$image = wp_get_attachment_image( $image_id, 'full' );
		} else {
			if ( '' !== $image_id ) {
				$alt = get_post_meta( $image_id, '_wp_attachment_image_alt', true );
			} else {
				$alt = '';
			}
			$image = '<img src="' . $image_url . '" alt="' . $alt . '">';
		}

		if ( post_password_required() || is_attachment() || ( '' === $image_id && '' === $image_url ) ) {
			return;
		}

		if ( true === $lazy_load ) {
			$image = apply_filters( 'easy_lazy_loader_html', $image );
		}

		$image_data = array(
			'image_id'  => $image_id,
			'image_url' => $image_url,
			'markup'    => $image,
		);
		return $image_data;
	}

}
