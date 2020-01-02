<?php
$message      = $attributes['message'];
$prefix       = $attributes['meta_prefix'];
$region       = $message['meta'][ $prefix . 'region' ][0];
$id           = $message['ID'];
$slug         = $message['post_name'];
$type         = $message['meta'][ $prefix . 'message_type' ][0];
$screen_sizes = maybe_unserialize( $message['meta'][ $prefix . 'screen_size' ][0] );
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

				if ( 0 !== filter_var( $screen_size[ $prefix . 'minimum_width' ], FILTER_VALIDATE_INT ) ) {
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

	<?php if ( 'homepage_middle' === $region ) : ?>
		<aside class="o-content-message o-content-message-homepage">
			<article class="o-content-message-body o-content-message-homepage-body">
	<?php endif; ?>

	<div class="wp-message-inserter-message wp-message-inserter-message-<?php echo $slug; ?> wp-message-inserter-message-<?php echo $region; ?> wp-message-inserter-message-<?php echo $id; ?>">
		<?php if ( 'image' === $type ) : ?>
			<aside class="m-wp-insert-message-images">
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

							if ( 0 !== filter_var( $screen_size[ $prefix . 'minimum_width' ], FILTER_VALIDATE_INT ) ) {
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
			</aside>
		<?php endif; ?>

		<?php if ( 'editor' === $type ) : ?>
			<?php if ( 0 < count( $screen_sizes ) ) : ?>
				<?php foreach ( $screen_sizes as $key => $screen_size ) : ?>
					<aside class="m-wp-insert-message-item m-wp-insert-message-item-<?php echo $key; ?>" style="background: red;">
						<?php echo apply_filters( 'the_content', $screen_size[ $prefix . 'message_editor' ], 20 ); ?>
					</aside>
				<?php endforeach; ?>
			<?php endif; ?>
		<?php endif; ?>
	</div>

	<?php if ( 'homepage_middle' === $region ) : ?>
			</article>
		</aside>
	<?php endif; ?>

<?php endif; ?>

<?php if ( 'banner' === $type ) : ?>
	<?php require_once( 'includes/banner.php' ); ?>
<?php endif; ?>
