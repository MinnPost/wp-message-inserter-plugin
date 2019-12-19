<?php if (0 < count($screen_sizes)) : ?>
	<?php foreach ($screen_sizes as $key => $screen_size) : ?>

		<?php
			// Banner BG Setup
			$bgcolor = ($screen_size[$prefix . 'banner_bgcolor']) ? 'linear-gradient(
				'. $screen_size[$prefix . 'banner_bgcolor'] .',
				'. $screen_size[$prefix . 'banner_bgcolor'] .'
			),' : '' ;
			$bgimg = ($screen_size[$prefix . 'banner_bgimage']) ? 'background: '. $bgcolor .' url('. $screen_size[$prefix . 'banner_bgimage'] .') center center no-repeat; background-size: cover;' : 'background: '. $bgcolor .';';
		?>

		<aside class="m-wp-insert-message-item m-wp-insert-message-item-<?php echo $key;?> <?php echo ($region === 'popup') ? 'pop-banner' : ''; ?> " style="<?php echo $bgimg; ?>">
				<?php if ($screen_size[$prefix . 'banner_layout'] === 'dualcol') : ?>
					<!-- Dual Col -->
					<div class="dual-wrap <?php echo ($screen_size[$prefix . 'banner_flip_columns']) ? 'flip' : '' ?>">

						<?php if ($screen_size[$prefix . 'banner_icon']) : ?>
							<div class="col banner-icon">
								<img src="<?php echo $screen_size[$prefix . 'banner_icon']; ?>" alt="">
							</div>
						<?php endif; ?>

						<div class="col">
							<h3><?php echo $screen_size[$prefix . 'banner_heading']; ?></h3>
							<?php echo wpautop($screen_size[$prefix . 'banner_shortcopy']); ?>
						</div>
						<div class="col">
								<?php if ($screen_size[$prefix . 'cta_type'] === 'button') : ?>
								<!-- BUTTON -->
								<a class="a-button" style="background-color: <?php echo $screen_size[$prefix . 'banner_btn_bgcolor'] ?>;" href="<?php echo $screen_size[$prefix . 'banner_buttondetails']['url'] ?>" <?php ($screen_size[$prefix . 'banner_buttondetails']['blank'] == true ? 'target="_blank"' : '') ?>>
									<?php if ($screen_size[$prefix . 'banner_buttonicon']) : ?>
										<i class="<?php echo $screen_size[$prefix . 'banner_buttonicon']; ?>"></i>
									<?php endif; ?>
									<?php echo $screen_size[$prefix . 'banner_buttondetails']['text']; ?>
								</a>
							<?php endif; ?>

							<?php if ($screen_size[$prefix . 'cta_type'] === 'form') : ?>
								<!-- FORM -->
							<?php endif; ?>

							<?php if($screen_size[$prefix . 'banner_disclaimer']): ?>
								<div class="disclaimer"><?php echo wpautop($screen_size[$prefix . 'banner_disclaimer']); ?></div>
							<?php endif; ?>

						</div>
					</div>
				<?php endif; ?>

				<?php if ($screen_size[$prefix . 'banner_layout'] === 'stacked') : ?>
					<!-- Stacked Banner -->
					<div class="stack-wrap">
						<h3><?php echo $screen_size[$prefix . 'banner_heading']; ?></h3>
						<p><?php echo $screen_size[$prefix . 'banner_shortcopy']; ?></p>

						<?php if ($screen_size[$prefix . 'cta_type'] === 'button') : ?>
							<!-- BUTTON -->
							<a class="a-button" style="background-color: <?php echo $screen_size[$prefix . 'banner_btn_bgcolor'] ?>;" href="<?php echo $screen_size[$prefix . 'banner_buttondetails']['url'] ?>" <?php ($screen_size[$prefix . 'banner_buttondetails']['blank'] == true ? 'target="_blank"' : '') ?>>
								<?php if ($screen_size[$prefix . 'banner_buttonicon']) : ?>
									<i class="<?php echo $screen_size[$prefix . 'banner_buttonicon']; ?>"></i>
								<?php endif; ?>
								<?php echo $screen_size[$prefix . 'banner_buttondetails']['text']; ?>
							</a>
						<?php endif; ?>

						<div class="disclaimer"><?php echo wpautop($screen_size[$prefix . 'banner_disclaimer']); ?></div>

						<?php if ($screen_size[$prefix . 'cta_type'] === 'form') : ?>
							<!-- FORM -->
						<?php endif; ?>
					</div>
				<?php endif; ?>


				<?php if($region === 'popup'): ?>
					<!-- Close Btn -->
					<a href="#" class="close-btn"><i class="fas fa-times"></i></a>
				<?php endif; ?>
		</aside>
	<?php endforeach; ?>
<?php endif; ?>
