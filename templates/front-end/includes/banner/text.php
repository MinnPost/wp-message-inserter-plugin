<?php
/**
 * Template for main banner text
 *
 * @package WP Message Inserter Plugin
 */

// if there is a color setting for links, we should use it
$colors['links'] = isset( $screen_size[ $prefix . 'banner_link_textcolor' ] ) ? $screen_size[ $prefix . 'banner_link_textcolor' ] : '';
?>

<?php if ( isset( $screen_size[ $prefix . 'banner_heading' ] ) ) : ?>
	<h3><?php echo $screen_size[ $prefix . 'banner_heading' ]; ?></h3>
<?php endif; ?>
<?php if ( isset( $screen_size[ $prefix . 'banner_shortcopy' ] ) ) : ?>
	<?php
	// links, if they are being overridden
	if ( isset( $colors['links'] ) ) {
		$content = str_replace( '<a href="', '<a style="color: ' . $colors['links'] . ' !important; text-decoration: underline;" href="', $screen_size[ $prefix . 'banner_shortcopy' ] );
	}
	$content = wpautop( $content );
	?>
	<?php echo $content; ?>
<?php endif; ?>
