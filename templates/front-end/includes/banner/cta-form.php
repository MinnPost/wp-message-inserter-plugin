<?php
/**
 * Template for banner form CTAs
 *
 * @package WP Message Inserter Plugin
 */
?>

<?php if ( is_array( $screen_size[ $prefix . 'banner_buttondetails' ] ) ) : ?>
	<?php
	$button_bgcolor   = isset( $screen_size[ $prefix . 'banner_btn_bgcolor' ] ) ? $screen_size[ $prefix . 'banner_btn_bgcolor' ] : '';
	$button_textcolor = isset( $screen_size[ $prefix . 'banner_btn_textcolor' ] ) ? $screen_size[ $prefix . 'banner_btn_textcolor' ] : '';
	$button_style     = '';
	if ( '' !== $button_bgcolor || '' !== $button_textcolor ) {
		$button_style = ' button_styles="';
		if ( '' !== $button_bgcolor ) {
			$button_style .= 'background: ' . $button_bgcolor . ';';
		}
		if ( '' !== $button_textcolor ) {
			$button_style .= 'color: ' . $button_textcolor . ';';
		}
		$button_style .= '"';
	}
	$button_icon = isset( $screen_size[ $prefix . 'banner_buttonicon' ] ) ? $screen_size[ $prefix . 'banner_buttonicon' ] : '';
	$button_text = isset( $screen_size[ $prefix . 'banner_buttondetails' ]['text'] ) ? $screen_size[ $prefix . 'banner_buttondetails' ]['text'] : '';
	if ( '' !== $button_icon || '' !== $button_text ) {
		if ( '' !== $button_icon ) {
			$button_icon = str_replace( '"', "'", '<i class="' . $button_icon . '" aria-hidden="true"></i>' );
			$button_text = $button_icon . $button_text;
		}
		$button_text = ' button_text="' . $button_text . '"';
	}
	?>
	<?php if ( '' !== $button_style || '' !== $button_text ) : ?>
		<?php
		if ( isset( $screen_size[ $prefix . 'banner_form_shortcode' ] ) ) {
			$screen_size[ $prefix . 'banner_form_shortcode' ] = str_replace( ']', $button_text . $button_style . ']', $screen_size[ $prefix . 'banner_form_shortcode' ] );
		}
		?>
	<?php endif; ?>
<?php endif; ?>

<?php if ( isset( $screen_size[ $prefix . 'banner_form_shortcode' ] ) ) : ?>
	<?php echo do_shortcode( $screen_size[ $prefix . 'banner_form_shortcode' ] ); ?>
<?php endif; ?>
