/**
 * Sets cookies
 *
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
function setCookie( name, value, days ) {
	const d = new Date();
	d.setTime( d.getTime() + ( 86400000 * days ) );
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

/**
 * Faux "Session" checking/setting
 *
 * @return {number} currentCount
 */
function setCurrentCount() {
	// Timestamp stored on the cookie
	let currentCount = getCookie( 'count' );
	const timestamp = Math.floor( new Date().getTime() / 1000 );
	const cookieExpiration = 30; // expire the cooke in 30 days
	if ( ! getCookie( 'count' ) ) {
		// First Visit - set count to 1
		setCookie( 'count', 1, cookieExpiration );
		// Set a timecheck cookie for an hour from now
		setCookie( 'timecheck', timestamp + 3600, cookieExpiration );
	} else if ( timestamp > getCookie( 'timecheck' ) ) {
		// Update Timecheck to new value
		setCookie( 'timecheck', timestamp + 3600, cookieExpiration );
		// Count exists already and it has been an hour. Update count
		setCookie( 'count', ++currentCount, cookieExpiration );
	}
	const urlParams = new URLSearchParams( window.location.search );
	if ( urlParams.get( 'count' ) !== null ) {
		currentCount = parseInt( urlParams.get( 'count' ) );
	}
	return currentCount;
}

/**
 * Show a specific popup. Sets a cookie and adds a visibility class.
 *
 * @param {string} popupSelector
 * @param {number} cookieDayTotal
 * @param {string} popupShownCookieName
 * @param {string} popupVisibleClass
 */
function showPopup( popupSelector, cookieDayTotal, popupShownCookieName, popupVisibleClass ) {
	setCookie( popupShownCookieName, 'true', cookieDayTotal );
	if ( 0 < $( '.validated' ).length ) {
		$( '.' + popupSelector + '.validated' ).addClass( popupVisibleClass );
	} else {
		$( '.' + popupSelector + ':first' ).addClass( popupVisibleClass );
	}
}

/**
 * Show a specific popup. Sets a cookie and adds a visibility class.
 *
 * @param {string} popupSelector
 * @param {string} popupVisibleClass
 * @param {Object} lastFocus
 */
function hidePopup( popupSelector, popupVisibleClass, lastFocus ) {
	lastFocus.focus();
	$( '.' + popupSelector ).removeClass( popupVisibleClass );
}

/**
 * Display and controls for popups
 *
 * @param {string} popupSelector
 * @param {number} cookieDayTotal
 * @param {string} popupShownCookieName
 * @param {string} popupVisibleClass
 * @param {string} checkSessionClass
 */
function popupDisplay( popupSelector, cookieDayTotal, popupShownCookieName, popupVisibleClass, checkSessionClass ) {
	const lastFocus = document.activeElement;
	// put in a close button at the end
	$( '.' + popupSelector + ' .m-wp-insert-message-item' ).append( '<a href="#" class="sm-close-btn" aria-label="Close"><i class="fas fa-times" aria-hidden="true"></i></a>' );
	// Check if we should be showing the popup
	if (
		'true' !== getCookie( popupShownCookieName ) &&
		! $( '.' + popupSelector ).hasClass( checkSessionClass )
	) {
		showPopup( popupSelector, cookieDayTotal, popupShownCookieName, popupVisibleClass );
	}

	document.addEventListener( 'click', function( event ) {
		if (
			! $( event.target ).closest( '.' + popupSelector ).is( '.' + popupSelector ) &&
			$( '.' + popupSelector ).hasClass( popupVisibleClass )
		) {
			hidePopup( popupSelector, popupVisibleClass, lastFocus );
		}
	}, true );

	// popup close button
	$( '.' + popupSelector ).on( 'click', '.sm-close-btn', function( e ) {
		e.preventDefault();
		hidePopup( popupSelector, popupVisibleClass, lastFocus );
	} );

	// escape key
	$( document ).keyup( function( e ) {
		if ( 27 === e.keyCode ) {
			hidePopup( popupSelector, popupVisibleClass, lastFocus );
		}
	} );
}

/**
 * When jQuery is loaded, set up session tracking and popup display
 *
 */
$( document ).ready( function() {
	const popupSelector = 'wp-message-inserter-message-popup';
	const popupShownCookieName = 'sm-shown';
	const popupVisibleClass = 'wp-message-inserter-message-popup-visible';
	const checkSessionClass = 'check-session-message';

	// Get our value for days and hours to set cookie
	const closeTimeDays = parseInt( $( '.' + popupSelector ).data( 'close-time-days' ) ) || 0;
	const closeTimeHours = ( parseInt( $( '.' + popupSelector ).data( 'close-time-hours' ) ) || 0 ) / 24;
	// Our Total for when the cookie should expire and show the banner again
	const cookieDayTotal = closeTimeDays + closeTimeHours;

	// Session Validating and showing proper banner
	const operators = {
		gt( a, b ) {
			return a >= b;
		},
		lt( a, b ) {
			return a <= b;
		},
	};

	const currentCount = setCurrentCount();

	if ( 0 < $( '.' + checkSessionClass ).length ) {
		$( '.' + checkSessionClass ).each( function() {
			const bannerSessionCount = parseInt( $( this ).data( 'session-count-to-check' ) );
			const bannerSessionOperator = $( this ).data( 'session-count-operator' );
			if (
				operators[ bannerSessionOperator ](
					currentCount,
					bannerSessionCount
				)
			) {
				if ( ! $( this ).hasClass( popupSelector ) ) {
					$( this ).addClass( 'validated' );
				} else if ( ! getCookie( popupShownCookieName ) ) {
					$( this ).addClass( 'validated' );
				}
			}
		} );
	}

	if ( 0 < $( '.' + popupSelector ).length ) {
		popupDisplay( popupSelector, cookieDayTotal, popupShownCookieName, popupVisibleClass );
	}
} );
