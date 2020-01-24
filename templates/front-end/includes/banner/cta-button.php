<?php
/**
 * Template for banner CTA buttons
 *
 * @package WP Message Inserter Plugin
 */
?>

<?php if ( is_array( $screen_size[ $prefix . 'banner_buttondetails' ] ) ) : ?>
	<?php
	$button_bgcolor = isset( $screen_size[ $prefix . 'banner_btn_bgcolor' ] ) ? $screen_size[ $prefix . 'banner_btn_bgcolor' ] : '';
	$button_style = '';
	if ( '' !== $button_bgcolor ) {
		$button_style = ' style="background: ' . $button_bgcolor . ';"';
	}
	$button_url = isset( $screen_size[ $prefix . 'banner_buttondetails' ]['url'] ) ? $screen_size[ $prefix . 'banner_buttondetails' ]['url'] : '';
	if ( '' !== $button_url ) {
		$button_href = ' href="' . $button_url . '"';
	}
	?>
	<a class="a-button"<?php echo $button_style . $button_href; ?><?php ( 'true' === $screen_size[ $prefix . 'banner_buttondetails' ]['blank'] ? 'target="_blank"' : '' ); ?>>
		<?php if ( isset( $screen_size[ $prefix . 'banner_buttonicon' ] ) ) : ?>
			<i class="<?php echo $screen_size[ $prefix . 'banner_buttonicon' ]; ?>"></i>
		<?php endif; ?>
		<?php if ( isset( $screen_size[ $prefix . 'banner_buttondetails' ]['text'] ) ) : ?>
			<?php echo $screen_size[ $prefix . 'banner_buttondetails' ]['text']; ?>
		<?php endif; ?>
	</a>
<?php endif; ?>
