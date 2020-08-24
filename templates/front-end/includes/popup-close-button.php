<?php
/**
 * Template and variables for popup close button
 *
 * @package WP Message Inserter Plugin
 */

// style
$close_button_style = '';
$close_button_color = isset( $screen_size[ $prefix . 'close_button_color' ] ) ? $screen_size[ $prefix . 'close_button_color' ] : '';

if ( '' !== $close_button_color && '#ffffff' !== $close_button_color ) {
	$close_button_style = ' style="color: ' . $close_button_color . ';"';
}
?>
<a href="#" class="sm-close-btn" aria-label="<?php echo __( 'Close', 'wp-message-inserter-plugin' ); ?>"<?php echo $close_button_style; ?>><i class="far fa-times-circle" aria-hidden="true"></i></a>
