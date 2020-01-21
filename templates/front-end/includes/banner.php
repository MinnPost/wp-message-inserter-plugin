<?php
	$check_session          = $message['meta'][ $prefix . 'check_session' ][0];
	$session_count_check    = $message['meta'][ $prefix . 'number_of_sessions' ][0];
	$session_count_operator = $message['meta'][ $prefix . 'operator_session' ][0];
?>

<?php if ( 0 < count( $screen_sizes ) ) : ?>
	<?php foreach ( $screen_sizes as $key => $screen_size ) : ?>

		<?php
			// Banner BG Setup
			$bgcolor = ( $screen_size[ $prefix . 'banner_bgcolor' ] ) ? 'linear-gradient(
				' . $screen_size[ $prefix . 'banner_bgcolor' ] . ',
				' . $screen_size[ $prefix . 'banner_bgcolor' ] . '
			),' : '';
			$bgimg   = ( $screen_size[ $prefix . 'banner_bgimage' ] ) ? 'background: ' . $bgcolor . ' url(' . $screen_size[ $prefix . 'banner_bgimage' ] . ') center center no-repeat; background-size: cover;' : 'background: ' . $bgcolor . ';';

			// Close timer setup
			$close_time_days  = $message['meta'][ $prefix . 'close_time_days' ][0];
			$close_time_hours = $message['meta'][ $prefix . 'close_time_hours' ][0];
		?>

		<?php if ( isset( $close_time_days ) || isset( $close_time_hours ) ) : ?>
			<input type="hidden" class="closetimedays" value="<?php echo ( isset( $close_time_days ) ) ? $close_time_days : '0'; ?>">
			<input type="hidden" class="closetimehours" value="<?php echo ( isset( $close_time_hours ) ) ? $close_time_hours : '0'; ?>">
		<?php endif; ?>

		<aside class="m-wp-insert-message-item m-wp-insert-message-item-<?php echo $key; ?> <?php echo ( 'popup' === $region ) ? 'pop-banner' : ''; ?> <?php echo ( 'on' === $check_session ) ? 'check-session-banner' : ''; ?> " style="<?php echo $bgimg; ?>">

				<?php if ( isset( $check_session ) && isset( $session_count_check ) && isset( $session_count_operator ) ) : ?>
					<input type="hidden" class="session_count_to_check" value="<?php echo ( isset( $session_count_check ) ) ? $session_count_check : ''; ?>">
					<input type="hidden" class="session_count_operator" value="<?php echo ( isset( $session_count_operator ) ) ? $session_count_operator : ''; ?>">
				<?php endif; ?>

				<?php if ( 'dualcol' === $screen_size[ $prefix . 'banner_layout' ] ) : ?>
					<!-- Dual Col -->
					<div class="dual-wrap <?php echo ( $screen_size[ $prefix . 'banner_flip_columns' ] ) ? 'flip' : ''; ?>">
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
									<?php if ( $screen_size[ $prefix . 'banner_buttonicon' ] ) : ?>
										<i class="<?php echo $screen_size[ $prefix . 'banner_buttonicon' ]; ?>"></i>
									<?php endif; ?>
									<?php echo $screen_size[ $prefix . 'banner_buttondetails' ]['text']; ?>
								</a>
							<?php endif; ?>

							<?php if ( $screen_size[ $prefix . 'banner_disclaimer' ] ) : ?>
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


				<?php if ( 'popup' === $region ) : ?>
					<!-- Close Btn -->
					<a href="#" class="sm-close-btn"><i class="fas fa-times"></i></a>
				<?php endif; ?>
		</aside>
	<?php endforeach; ?>
<?php endif; ?>
