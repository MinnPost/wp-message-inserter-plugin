<?php
/**
 * Template and variables for site messages
 * This template controls editor and image messages, as well as loading the banner message template.
 *
 * @package WP Message Inserter Plugin
 */

$message         = $attributes['message'];
$prefix          = $attributes['meta_prefix'];
$message_counter = $attributes['message_counter'];
$region          = $message['meta'][ $prefix . 'region' ][0];
$id              = $message['ID'];
$slug            = $message['post_name'];
$type            = $message['meta'][ $prefix . 'message_type' ][0];
$screen_sizes    = isset( $message['meta'][ $prefix . 'screen_size' ][0] ) && '' !== $message['meta'][ $prefix . 'screen_size' ][0] ? maybe_unserialize( $message['meta'][ $prefix . 'screen_size' ][0] ) : array();
$body_classes    = get_body_class();
$wp_classes      = '';
foreach ( $body_classes as $class ) {
	$wp_classes .= 'wp-message-inserter-message-' . $class . ' ';
}

// setup for checking sessions
$check_session          = isset( $message['meta'][ $prefix . 'check_session' ] ) ? $message['meta'][ $prefix . 'check_session' ][0] : '';
$session_count_check    = isset( $message['meta'][ $prefix . 'number_of_sessions' ] ) ? $message['meta'][ $prefix . 'number_of_sessions' ][0] : '';
$session_count_operator = isset( $message['meta'][ $prefix . 'operator_session' ] ) ? $message['meta'][ $prefix . 'operator_session' ][0] : '';

// close timer setup
$close_time_days  = 0;
$close_time_hours = 0;
if ( 'popup' === $region ) {
	$close_time_days  = isset( $message['meta'][ $prefix . 'close_time_days' ] ) ? $message['meta'][ $prefix . 'close_time_days' ][0] : 0;
	$close_time_hours = isset( $message['meta'][ $prefix . 'close_time_hours' ] ) ? $message['meta'][ $prefix . 'close_time_hours' ][0] : 0;
}

// session data attributes
$session_data_attributes = '';
if ( '' !== $check_session && '' !== $session_count_check && '' !== $session_count_operator ) {
	$session_data_attributes = ' data-session-count-to-check="' . $session_count_check . '" data-session-count-operator="' . $session_count_operator . '"';
}

// sort screen sizes
usort(
	$screen_sizes,
	function ( array $a, array $b ) use ( $prefix ) {
		return $a[ $prefix . 'minimum_width' ] <=> $b[ $prefix . 'minimum_width' ];
	}
);

?>

<?php if ( 'editor' === $type ) : ?>
	<?php if ( 1 < count( $screen_sizes ) ) : ?>
		<style>
			.m-wp-insert-message-item {
				display: none;
			}

			<?php foreach ( $screen_sizes as $key => $screen_size ) : ?>
				<?php
				if ( ( ! isset( $screen_size[ $prefix . 'no_maximum_width' ] ) || ( isset( $screen_size[ $prefix . 'no_maximum_width' ] ) && 'on' !== $screen_size[ $prefix . 'no_maximum_width' ] ) ) && isset( $screen_size[ $prefix . 'maximum_width' ] ) ) {
					$max_width = '(max-width: ' . $screen_size[ $prefix . 'maximum_width' ] . 'px)';
				} else {
					$max_width = '';
				}

				if ( isset( $screen_size[ $prefix . 'minimum_width' ] ) && 0 !== filter_var( $screen_size[ $prefix . 'minimum_width' ], FILTER_VALIDATE_INT ) ) {
					$min_width = '(min-width: ' . $screen_size[ $prefix . 'minimum_width' ] . 'px)';
				} else {
					$min_width = '';
				}
				if ( '' !== $min_width && '' !== $max_width ) {
					$join = ' and ';
				} else {
					$join = '';
				}
				?>

			@media <?php echo $min_width; ?><?php echo $join; ?><?php echo $max_width; ?> {
				.m-wp-insert-message-item-<?php echo $key; ?> {
					display: block;
				}
			}

			<?php endforeach; ?>
		</style>
	<?php endif; ?>
<?php endif; ?>

<?php if ( 'image' === $type || 'editor' === $type ) : ?>

	<aside class="o-site-message-container wp-message-inserter-message <?php echo $wp_classes; ?> wp-message-inserter-message-<?php echo $slug; ?> wp-message-inserter-message-region-<?php echo $region; ?> wp-message-inserter-message-id-<?php echo $id; ?> wp-message-inserter-message-<?php echo $type; ?> wp-message-inserter-message-<?php echo $message_counter; ?><?php echo ( 'on' === $check_session ) ? ' check-session-message' : ''; ?>"<?php echo ( 0 !== $close_time_days ) ? ' data-close-time-days="' . $close_time_days . '"' : ''; ?><?php echo ( 0 !== $close_time_hours ) ? ' data-close-time-hours="' . $close_time_hours . '"' : ''; ?><?php echo $session_data_attributes; ?>>
		<?php if ( 'image' === $type ) : ?>
			<div class="m-wp-insert-message-item m-wp-insert-message-images">
				<?php if ( isset( $message['meta'][ $prefix . 'link_url' ] ) ) : ?>
					<a href="<?php echo $message['meta'][ $prefix . 'link_url' ][0]; ?>">
					<?php endif; ?>
					<picture>
						<?php foreach ( $screen_sizes as $key => $screen_size ) : ?>
							<?php
							if ( ( ! isset( $screen_size[ $prefix . 'no_maximum_width' ] ) || ( isset( $screen_size[ $prefix . 'no_maximum_width' ] ) && 'on' !== $screen_size[ $prefix . 'no_maximum_width' ] ) ) && isset( $screen_size[ $prefix . 'maximum_width' ] ) ) {
								$max_width = '(max-width: ' . $screen_size[ $prefix . 'maximum_width' ] . 'px)';
							} else {
								$max_width = '';
							}

							if ( isset( $screen_size[ $prefix . 'minimum_width' ] ) && 0 !== filter_var( $screen_size[ $prefix . 'minimum_width' ], FILTER_VALIDATE_INT ) ) {
								$min_width = '(min-width: ' . $screen_size[ $prefix . 'minimum_width' ] . 'px)';
							} else {
								$min_width = '';
							}
							if ( '' !== $min_width && '' !== $max_width ) {
								$join = ' and ';
							} else {
								$join = '';
							}
							?>
							<source media="<?php echo $min_width; ?><?php echo $join; ?><?php echo $max_width; ?>" srcset="<?php echo $screen_size[ $prefix . 'message_image' ]; ?>">
						<?php endforeach; ?>
						<img src="<?php echo $screen_sizes[0][ $prefix . 'message_image' ]; ?>" alt="<?php echo get_post_meta( $screen_sizes[0][ $prefix . 'message_image_id' ], '_wp_attachment_image_alt', true ); ?>">
					</picture>
					<?php if ( isset( $message['meta'][ $prefix . 'link_url' ] ) ) : ?>
					</a>
				<?php endif; ?>
			</div>
		<?php endif; ?>

		<?php if ( 'editor' === $type ) : ?>
			<?php if ( 0 < count( $screen_sizes ) ) : ?>
				<?php foreach ( $screen_sizes as $key => $screen_size ) : ?>
					<div class="m-wp-insert-message-item m-wp-insert-message-editor m-wp-insert-message-item-<?php echo $key; ?>">
						<?php echo apply_filters( 'the_content', $screen_size[ $prefix . 'message_editor' ], 20 ); ?>
					</div>
				<?php endforeach; ?>
			<?php endif; ?>
		<?php endif; ?>
	</aside>
<?php endif; ?>

<?php
// For Banners we Loop over them because with session checking we might need to load more than one
foreach ( $attributes as $message ) {
	if ( isset( $message['meta'] ) && is_array( $message['meta'] ) ) {
		$type = $message['meta'][ $prefix . 'message_type' ][0];
		if ( 'banner' === $type ) {
			require( 'includes/banner.php' );
		}
	}
}
?>
