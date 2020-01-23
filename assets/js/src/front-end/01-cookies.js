/**
 * Sets cookies
 *
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
function setCookie( name, value, days ) {
	const d = new Date();
	d.setTime( d.getTime() + 24 * 60 * 60 * 1000 * days );
	document.cookie = name + '=' + value + ';path=/;expires=' + d.toGMTString();
}

/**
 * Reads cookies
 *
 * @param {string} name
 */
function getCookie( name ) {
	const v = document.cookie.match( '(^|;) ?' + name + '=([^;]*)(;|$)' );
	return v ? v[ 2 ] : null;
}

// Faux "Session" checking/setting
// Timestamp
let currentCount = getCookie( 'count' );
const timestamp = Math.floor( new Date().getTime() / 1000 );
if ( ! getCookie( 'count' ) ) {
	// First Visit - set count to 1
	setCookie( 'count', 1, 365 );

	// Set a timecheck cookie for an hour from now
	setCookie( 'timecheck', timestamp + 3600, 365 );
} else if ( timestamp > getCookie( 'timecheck' ) ) {
	// Update Timecheck to new value
	setCookie( 'timecheck', timestamp + 3600, 365 );

	// Count exists already and it has been an hour. Update count
	setCookie( 'count', ++currentCount, 365 );
}

/**
 * When jQuery is loaded, set up cookies and popups
 *
 */
$( document ).ready( function() {
	// Get our value for days to set cookie
	const closeTimeDays = parseInt( $( '.closetimedays' ).val() );

	// Get our value for hours and divide by 24 to get proper percent of a day
	const closeTimeHours = $( '.closetimehours' ).val() / 24;

	// Our Total for when the cookie should expire and show the banner again
	const cookieDayTotal = closeTimeDays + closeTimeHours;

	// Check if we should be showing the banner
	if (
		$( '.pop-banner' ).length &&
		'true' !== getCookie( 'sm-closed' ) &&
		! $( '.pop-banner' ).hasClass( 'check-session-banner' )
	) {
		$( '.pop-banner' ).addClass( 'd-block' );
	}

	// Popup Banner Close Button
	$( '.sm-close-btn' ).on( 'click', function( e ) {
		e.preventDefault();
		setCookie( 'sm-closed', true, cookieDayTotal );
		$( '.pop-banner' ).hide();
	} );

	// Session Validating and showing proper banner
	const operators = {
		gt( a, b ) {
			return a >= b;
		},
		lt( a, b ) {
			return a <= b;
		},
	};

	const urlParams = new URLSearchParams( window.location.search );
	if ( urlParams.get( 'count' ) !== null ) {
		currentCount = parseInt( urlParams.get( 'count' ) );
	}

	$( '.check-session-banner' ).each( function() {
		const bannerSessionCount = $( this ).find( '.session_count_to_check' ).val();
		const bannerSessionOperator = $( this ).find( '.session_count_operator' ).val();

		if (
			operators[ bannerSessionOperator ](
				currentCount,
				parseInt( bannerSessionCount )
			)
		) {
			if ( ! $( this ).hasClass( 'pop-banner' ) ) {
				$( this ).addClass( 'validated' );
			} else {
				! getCookie( 'sm-closed' ) ? $( this ).addClass( 'validated' ) : '';
			}
		}
	} );
} );
