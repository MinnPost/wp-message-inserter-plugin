<?php
	$check_session          = isset( $message['meta'][ $prefix . 'check_session' ] ) ? $message['meta'][ $prefix . 'check_session' ][0] : '';
	$session_count_check    = isset( $message['meta'][ $prefix . 'number_of_sessions' ] ) ? $message['meta'][ $prefix . 'number_of_sessions' ][0] : '';
	$session_count_operator = isset( $message['meta'][ $prefix . 'operator_session' ] ) ? $message['meta'][ $prefix . 'operator_session' ][0] : '';
?>

<?php if ( 0 < count( $screen_sizes ) ) : ?>
	<?php foreach ( $screen_sizes as $key => $screen_size ) : ?>

		<?php
		// Banner BG Setup
		$bgcolor     = ( $screen_size[ $prefix . 'banner_bgcolor' ] ) ? 'linear-gradient(
			' . $screen_size[ $prefix . 'banner_bgcolor' ] . ',
			' . $screen_size[ $prefix . 'banner_bgcolor' ] . '
		),' : '';
		$banner_bg   = ( $screen_size[ $prefix . 'banner_bgimage' ] ) ? 'background: ' . $bgcolor . ' url(' . $screen_size[ $prefix . 'banner_bgimage' ] . ') center center no-repeat; background-size: cover;' : 'background: ' . $bgcolor . ';';
		$banner_text = ( $screen_size[ $prefix . 'banner_textcolor' ] ) ? 'color: ' . $screen_size[ $prefix . 'banner_textcolor' ] . ';' : '';

		$banner_size           = '';
		$banner_max_width      = isset( $screen_size[ $prefix . 'banner_max_width' ] ) ? $screen_size[ $prefix . 'banner_max_width' ] : 'page';
		$banner_max_width_text = isset( $screen_size[ $prefix . 'banner_max_width_text' ] ) ? $screen_size[ $prefix . 'banner_max_width_text' ] : '';
		$banner_max_width_unit = isset( $screen_size[ $prefix . 'banner_max_width_unit' ] ) ? $screen_size[ $prefix . 'banner_max_width_unit' ] : '';
		if ( 'page' !== $banner_max_width && 'custom' !== $banner_max_width ) {
			$banner_size = 'max-width:' . $banner_max_width;
		} elseif ( '' !== $banner_max_width_text && '' !== $banner_max_width_unit ) {
			$banner_size = 'max-width:' . $banner_max_width_text . $banner_max_width_unit;
		}

		$banner_style = $banner_bg . $banner_text . $banner_size . ';';

		// session data attributes
		$session_data_attributes = '';
		if ( '' !== $check_session && '' !== $session_count_check && '' !== $session_count_operator ) {
			$session_data_attributes = ' data-session-count-to-check="' . $session_count_check . '" data-session-count-operator="' . $session_count_operator . '"';
		}

		?>

		<aside class="m-wp-insert-message-item m-wp-insert-message-item-<?php echo $key; ?> m-wp-insert-message-item-<?php echo $type; ?><?php echo ( 'popup' === $region ) ? ' wp-message-inserter-message-popup' : ''; ?><?php echo ( 'on' === $check_session ) ? ' check-session-message' : ''; ?><?php echo ( 'page' === $banner_max_width ) ? ' banner-width-page' : ''; ?>" style="<?php echo $banner_style; ?>"<?php echo isset( $close_time_days ) ? ' data-close-time-days="' . $close_time_days . '"' : ''; ?><?php echo isset( $close_time_hours ) ? ' data-close-time-hours="' . $close_time_hours . '"' : ''; ?><?php echo $session_data_attributes; ?>>

			<?php if ( 'dualcol' === $screen_size[ $prefix . 'banner_layout' ] ) : ?>
				<!-- Dual Col -->
				<div class="dual-wrap <?php echo ( isset( $screen_size[ $prefix . 'banner_flip_columns' ] ) && 'on' === $screen_size[ $prefix . 'banner_flip_columns' ] ) ? 'flip' : ''; ?>">
						<?php if ( $screen_size[ $prefix . 'banner_icon' ] ) : ?>
						<div class="col banner-icon">
							<img src="<?php echo $screen_size[ $prefix . 'banner_icon' ]; ?>" alt="">
						</div>
					<?php endif; ?>

					<div class="col">
							<h3><?php echo $screen_size[ $prefix . 'banner_heading' ]; ?></h3>
							<?php echo wpautop( $screen_size[ $prefix . 'banner_shortcopy' ] ); ?>

						<?php if ( 'form' === $screen_size[ $prefix . 'cta_type' ] && isset( $screen_size[ $prefix . 'banner_form_shortcode' ] ) ) : ?>
							<!-- FORM -->
							<?php echo do_shortcode( $screen_size[ $prefix . 'banner_form_shortcode' ] ); ?>
						<?php endif; ?>
					</div>
					<div class="col">
							<?php if ( 'button' === $screen_size[ $prefix . 'cta_type' ] ) : ?>
							<!-- BUTTON -->
							<a class="a-button" style="background-color: <?php echo $screen_size[ $prefix . 'banner_btn_bgcolor' ]; ?>;" href="<?php echo $screen_size[ $prefix . 'banner_buttondetails' ]['url']; ?>" <?php ( 'true' === $screen_size[ $prefix . 'banner_buttondetails' ]['blank'] ? 'target="_blank"' : '' ); ?>>
								<?php if ( isset( $screen_size[ $prefix . 'banner_buttonicon' ] ) ) : ?>
									<i class="<?php echo $screen_size[ $prefix . 'banner_buttonicon' ]; ?>"></i>
								<?php endif; ?>
									<?php echo $screen_size[ $prefix . 'banner_buttondetails' ]['text']; ?>
							</a>
						<?php endif; ?>

						<?php if ( isset( $screen_size[ $prefix . 'banner_disclaimer' ] ) ) : ?>
							<div class="disclaimer"><?php echo wpautop( $screen_size[ $prefix . 'banner_disclaimer' ] ); ?></div>
						<?php endif; ?>

					</div>
				</div>
			<?php endif; ?>

			<?php if ( 'stacked' === $screen_size[ $prefix . 'banner_layout' ] ) : ?>
				<!-- Stacked Banner -->
				<div class="stack-wrap">
						<h3><?php echo $screen_size[ $prefix . 'banner_heading' ]; ?></h3>
						<p><?php echo $screen_size[ $prefix . 'banner_shortcopy' ]; ?></p>

					<?php if ( 'button' === $screen_size[ $prefix . 'cta_type' ] ) : ?>
						<!-- BUTTON -->
						<a class="a-button" style="background-color: <?php echo $screen_size[ $prefix . 'banner_btn_bgcolor' ]; ?>;" href="<?php echo $screen_size[ $prefix . 'banner_buttondetails' ]['url']; ?>" <?php ( true === $screen_size[ $prefix . 'banner_buttondetails' ]['blank'] ? 'target="_blank"' : '' ); ?>>
								<?php if ( $screen_size[ $prefix . 'banner_buttonicon' ] ) : ?>
								<i class="<?php echo $screen_size[ $prefix . 'banner_buttonicon' ]; ?>"></i>
							<?php endif; ?>
								<?php echo $screen_size[ $prefix . 'banner_buttondetails' ]['text']; ?>
						</a>
					<?php endif; ?>

						<div class="disclaimer"><?php echo wpautop( $screen_size[ $prefix . 'banner_disclaimer' ] ); ?></div>

					<?php if ( 'form' === $screen_size[ $prefix . 'cta_type' ] && isset( $screen_size[ $prefix . 'banner_form_shortcode' ] ) ) : ?>
						<!-- FORM -->
						<?php echo do_shortcode( $screen_size[ $prefix . 'banner_form_shortcode' ] ); ?>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</aside>
	<?php endforeach; ?>
<?php endif; ?>
