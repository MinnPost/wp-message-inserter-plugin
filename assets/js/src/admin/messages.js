( function( $ ) {

	function showTypeField( selector ) {
		var value  = $( 'input[type="radio"]:checked', selector ).val();
		var parent = selector.parent();
		$( '.cmb2-message-type' ).hide();
		$( '.cmb2-message-type-' + value ).show();
	}

	function showHideMaximumScreen( selector, current ) {
		if ( 'undefined' === typeof current ) {
			var current = $( 'input[type="checkbox"]:checked', selector );
		}
		if ( $( 'input[type="checkbox"]', selector ).is( ':checked' ) ) {
			$( 'input[type="checkbox"]:checked', selector ).closest( '.cmb-field-list' ).find( '.cmb2-maximum-screen-width' ).hide();
		} else {
			$( 'input[type="checkbox"]', selector ).closest( '.cmb-field-list' ).find( '.cmb2-maximum-screen-width' ).show();
		}
	}

	function showHideMaximumBanner( value ) {
		if ( 'custom' === value ) {
			$( '.cmb2-custom-maximum-banner-width' ).show();
		} else {
			$( '.cmb2-custom-maximum-banner-width' ).hide();
		}
	}

	function setupMessage() {
		var type_selector             = $( '.cmb2-message-type-selector' );
		var no_max_screen_selector    = $( '.cmb2-no-maximum-screen-width' );
		var max_banner_width_selector = '.cmb2-maximum-banner-width select';
		if ( type_selector.length > 0 ) {
			showTypeField( type_selector );
			$( 'input[type="radio"]', type_selector ).on( 'change', function( el ) {
				showTypeField( type_selector );
			});
		}
		if ( no_max_screen_selector.length > 0 ) {
			showHideMaximumScreen( no_max_screen_selector );
			$( 'input[type="checkbox"]', no_max_screen_selector ).on( 'change', function( el ) {
				showHideMaximumScreen( no_max_screen_selector, el );
			});
		}
		if ( $( max_banner_width_selector ).length > 0 ) {
			showHideMaximumBanner( $( max_banner_width_selector ).val() );
			$( document ).on( 'change', max_banner_width_selector, function() {
				showHideMaximumBanner( $( this ).val() );
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

		// Before a new group row is added, destroy Select2. We'll reinitialise after the row is added
		$( '.cmb-repeatable-group' ).on( 'cmb2_add_group_row_start', function ( event, instance ) {
			var $table = $( document.getElementById( $( instance ).data( 'selector' ) ) );
			var $oldRow = $table.find( '.cmb-repeatable-grouping' ).last();

			$oldRow.find( '.cmb2_select' ).each( function () {
				$( this ).select2( 'destroy' );
			});
		});

		// When a new group row is added, clear selection and initialise Select2
		$( '.cmb-repeatable-group' ).on('cmb2_add_row', function ( event, newRow ) {
			$( newRow ).find( '.cmb2_select' ).each( function () {
				$( 'option:selected', this ).removeAttr( 'selected' );
				$( this ).select2();
			});

			// Reinitialise the field we previously destroyed
			$( newRow ).prev().find( '.cmb2_select' ).each( function () {
				$( this ).select2();
			});
		});

	}

})(jQuery);
