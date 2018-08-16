( function( $ ) {

	function showTypeField( selector ) {
		var value  = $( 'input[type="radio"]:checked', selector ).val();
		var parent = selector.parent();
		$( '.cmb2-message-type' ).hide();
		$( '.cmb2-message-type-' + value ).show();
	}

	function showHideMaximum( selector, current ) {
		if ( 'undefined' === typeof current ) {
			var current = $( 'input[type="checkbox"]:checked', selector );
		}
		if ( $( 'input[type="checkbox"]', selector ).is( ':checked' ) ) {
			$( 'input[type="checkbox"]:checked', selector ).closest( '.cmb-field-list' ).find( '.cmb2-maximum-width' ).hide();
		} else {
			$( 'input[type="checkbox"]', selector ).closest( '.cmb-field-list' ).find( '.cmb2-maximum-width' ).show();
		}
	}

	function setupMessage() {
		var type_selector   = $( '.cmb2-message-type-selector' );
		var no_max_selector = $( '.cmb2-no-maximum-width' );
		if ( type_selector.length > 0 ) {
			showTypeField( type_selector );
			$( 'input[type="radio"]', type_selector ).on( 'change', function( el ) {
				showTypeField( type_selector );
			});
		}
		if ( no_max_selector.length > 0 ) {
			showHideMaximum( no_max_selector );
			$( 'input[type="checkbox"]', no_max_selector ).on( 'change', function( el ) {
				showHideMaximum( no_max_selector, el );
			});
		}
	}

	$( document ).ready( function() {
  		$( '#pageparentdiv label[for=parent_id]' ).parents( 'p' ).eq(0).remove();
  		$( '#pageparentdiv select#parent_id' ).remove();
		setupMessage();
	});

	$( document ).on( 'cmb2_add_row', function( e ) {
		$( this ).find( 'input[type="checkbox"]' ).prop( 'checked', false );
		setupMessage();
	});

	if ( jQuery.fn.select2 ) {
		$( '.cmb2-insertable-message select' ).select2();
	}

})(jQuery);
