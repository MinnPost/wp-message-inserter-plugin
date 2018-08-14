( function( $ ) {

	function showMessageField( selector ) {
		var value  = $( 'input[type="radio"]:checked', selector ).val();
		var parent = selector.parent();
		$( '.cmb2-message-type' ).hide();
		$( '.cmb2-message-type-' + value ).show();
	}

	$( document ).ready( function() {
		var selector = $( '.cmb2-message-type-selector' );
		if ( selector.length > 0 ) {
			showMessageField( selector );
			$( 'input[type="radio"]', selector ).on( 'change', function( el ) {
				showMessageField( selector );
			});
		}
	});

})(jQuery);
