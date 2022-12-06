/**
 * Sets cookies
 *
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
function setCookie(name, value, days) {
	const d = new Date();
	d.setTime(d.getTime() + 86400000 * days);
	document.cookie = name + '=' + value + ';path=/;expires=' + d.toGMTString();
}

/**
 * Reads cookies
 *
 * @param {string} name
 */
function getCookie(name) {
	const value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return value ? value[2] : null;
}

/**
 * Allow our theme or other plugins to create analytics tracking events
 *
 * @param {string}  type
 * @param {string}  category
 * @param {string}  action
 * @param {string}  label
 * @param {Array}   value
 * @param {boolean} nonInteraction
 */
function analyticsTrackingEvent(
	type,
	category,
	action,
	label,
	value,
	nonInteraction
) {
	if (typeof wp !== 'undefined') {
		category =
			'Site Message: ' +
			category.charAt(0).toUpperCase() +
			category.slice(1);
		wp.hooks.doAction(
			'wpMessageInserterAnalyticsEvent',
			type,
			category,
			action,
			label,
			value,
			nonInteraction
		);
	}
}

/**
 * Allow our theme or other plugins to send data to the dataLayer object for Google Tag Manager
 *
 * @param {string} messageRegion
 * @param {string} messageId
 */
function dataLayerEvent(messageRegion, messageId) {
	if (typeof wp !== 'undefined') {
		let dataLayerContent = {
			'parentMessageRegion': messageRegion,
			'parentMessageId': messageId
		};
		wp.hooks.doAction('wpMessageInserterDataLayerEvent', dataLayerContent);
	}
}

/**
 * Faux "Session" checking/setting.
 *
 * @return {number} currentCount
 */
function setCurrentCount() {
	// Timestamp stored on the cookie
	let currentCount = getCookie('count');
	const timestamp = Math.floor(new Date().getTime() / 1000);
	const cookieExpiration = 30; // expire the cooke in 30 days
	if (!getCookie('count')) {
		// First Visit - set count to 1
		setCookie('count', 1, cookieExpiration);
		// Set a timecheck cookie for an hour from now
		setCookie('timecheck', timestamp + 3600, cookieExpiration);
	} else if (timestamp > getCookie('timecheck')) {
		// Update Timecheck to new value
		setCookie('timecheck', timestamp + 3600, cookieExpiration);
		// Count exists already and it has been an hour. Update count
		setCookie('count', ++currentCount, cookieExpiration);
	}
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get('count') !== null) {
		currentCount = parseInt(urlParams.get('count'));
	}
	return currentCount;
}

/**
 * Get the WordPress post ID for a given popup.
 *
 * @param {Object} message
 * @return {number} postId
 */
function getPostId(message) {
	let postId = 0;
	message.classList.forEach(function (value) {
		if (0 < value.indexOf('message-id')) {
			postId = value.substring(value.lastIndexOf('-') + 1);
			return postId;
		}
	});
	return postId;
}

/**
 * Get the region for a given message.
 *
 * @param {Object} message
 * @return {string} region
 */
function getMessageRegion(message) {
	let region = '';
	message.classList.forEach(function (value) {
		if (0 < value.indexOf('message-region')) {
			region = value.substring(value.lastIndexOf('-') + 1);
			return region;
		}
	});
	return region;
}

/**
 * Show a specific popup. Sets a cookie and adds a visibility class.
 *
 * @param {Object} popupMessage
 * @param {number} cookieDayTotal
 * @param {string} popupShownCookieName
 * @param {string} popupVisibleClass
 * @param {string} validatedSessionClass
 */
function showPopup(
	popupMessage,
	cookieDayTotal,
	popupShownCookieName,
	popupVisibleClass,
	validatedSessionClass
) {
	setCookie(popupShownCookieName, 'true', cookieDayTotal);
	const validatedItems = document.querySelectorAll(
		'.' + validatedSessionClass
	);
	if (0 < validatedItems.length) {
		validatedItems.forEach(function (validatedMessage) {
			validatedMessage.classList.add(popupVisibleClass);
		});
	} else {
		popupMessage.classList.add(popupVisibleClass);
	}
}

/**
 * Show a specific popup. Sets a cookie and adds a visibility class.
 *
 * @param {Object} popupMessage
 * @param {string} popupVisibleClass
 * @param {Object} lastFocus
 * @param {string} closeTrigger
 */
function hidePopup(popupMessage, popupVisibleClass, lastFocus, closeTrigger) {
	lastFocus.focus();
	popupMessage.classList.remove(popupVisibleClass);
	const popupId = getPostId(popupMessage);
	const messageRegion = 'Popup';
	if (0 !== popupId) {
		analyticsTrackingEvent(
			'event',
			messageRegion,
			closeTrigger,
			popupId,
			undefined,
			1
		);
		dataLayerEvent(messageRegion, popupId);
	}
}

/**
 * Display and controls for popups
 *
 * @param {Object} popupMessage
 * @param {number} cookieDayTotal
 * @param {string} popupShownCookieName
 * @param {string} popupVisibleClass
 * @param {string} checkSessionClass
 * @param {string} validatedSessionClass
 */
function popupDisplay(
	popupMessage,
	cookieDayTotal,
	popupShownCookieName,
	popupVisibleClass,
	checkSessionClass,
	validatedSessionClass
) {
	const lastFocus = document.activeElement; // eslint-disable-line
	// Check if we should be showing the popup
	if (
		'true' !== getCookie(popupShownCookieName) &&
		(!popupMessage.classList.contains(checkSessionClass) ||
			popupMessage.classList.contains(validatedSessionClass))
	) {
		// actually show the popup
		showPopup(
			popupMessage,
			cookieDayTotal,
			popupShownCookieName,
			popupVisibleClass,
			validatedSessionClass
		);

		// run messageAnalytics on the popup
		messageAnalytics(popupMessage);

		// 1. detect clicks inside the popup that should close it.
		popupMessage.addEventListener(
			'click',
			function (event) {
				const isCloseButton =
					event.target.classList.contains('sm-close-btn');
				if (true === isCloseButton) {
					event.preventDefault();
					hidePopup(
						popupMessage,
						popupVisibleClass,
						lastFocus,
						'Close Button'
					);
				}
			},
			true
		);

		// 2. detect clicks outside the popup.
		document.addEventListener('click', (evt) => {
			let targetElement = evt.target;
			do {
				if (targetElement === popupMessage) {
					return;
				}
				// Go up the DOM
				targetElement = targetElement.parentNode;
			} while (targetElement);
			// This is a click outside.
			hidePopup(
				popupMessage,
				popupVisibleClass,
				lastFocus,
				'Click Outside to Close'
			);
		});

		// 3. detect escape key press
		document.onkeydown = function (evt) {
			evt = evt || window.event;
			let isEscape = false;
			if ('key' in evt) {
				isEscape = evt.key === 'Escape' || evt.key === 'Esc';
			} else {
				isEscape = evt.keyCode === 27;
			}
			if (isEscape) {
				hidePopup(
					popupMessage,
					popupVisibleClass,
					lastFocus,
					'Escape Key'
				);
			}
		};
	} // end of if statement for the conditional to show this popup.
}

/**
 * Set up google analytics events.
 *
 * @param {Object} message
 */
function messageAnalytics(message) {
	const messageRegion = getMessageRegion(message);
	const messageId = getPostId(message);
	const messageDisplay = window.getComputedStyle(message, null).display;
	// tell analytics if a message is being displayed
	if ('none' !== messageDisplay) {
		analyticsTrackingEvent(
			'event',
			messageRegion,
			'Show',
			messageId,
			undefined,
			1
		);
		// click tracker for analytics events
		message.addEventListener(
			'click',
			function (event) {
				// 1. is it a login link or close button?
				// the close event will have already been tracked by the hidePopup method.
				const isLoginClick =
					event.target.classList.contains('message-login');
				const isCloseButton =
					event.target.classList.contains('sm-close-btn');
				if (true === isLoginClick) {
					const url = $(this).attr('href');
					analyticsTrackingEvent(
						'event',
						messageRegion,
						'Login Link',
						url
					);
					dataLayerEvent(messageRegion, messageId);
				} else if (false === isCloseButton) {
					// 2. other links
					analyticsTrackingEvent(
						'event',
						messageRegion,
						'Click',
						messageId
					);
					dataLayerEvent(messageRegion, messageId);
				}
			},
			true
		);
	}
}

/**
 * When the document is loaded, set up session tracking and popup display
 *
 */
document.addEventListener('DOMContentLoaded', function () {
	const popupSelector = 'wp-message-inserter-message-region-popup';
	const popupShownCookieName = 'sm-shown';
	const popupVisibleClass = 'wp-message-inserter-message-popup-visible';
	const checkSessionClass = 'check-session-message';
	const messageSelector = 'wp-message-inserter-message';
	const validatedSessionClass = 'validated';
	const checkSessionItems = document.querySelectorAll(
		'.' + checkSessionClass
	);
	if (0 < checkSessionItems.length) {
		// get the current count of sessions and set the operators for comparison
		const currentCount = setCurrentCount();
		const operators = {
			gt(a, b) {
				return a >= b;
			},
			lt(a, b) {
				return a <= b;
			},
		};

		// handle messages that are session-dependent
		checkSessionItems.forEach(function (currentSessionMessage) {
			const bannerSessionCount = parseInt(
				currentSessionMessage.dataset.sessionCountToCheck
			);
			const bannerSessionOperator =
				currentSessionMessage.dataset.sessionCountOperator;
			if (
				operators[bannerSessionOperator](
					currentCount,
					bannerSessionCount
				)
			) {
				if (currentSessionMessage.classList.contains(popupSelector)) {
					currentSessionMessage.classList.add(validatedSessionClass);
				} else if (!getCookie(popupShownCookieName)) {
					currentSessionMessage.classList.add(validatedSessionClass);
				}
			}
		});
	}

	const popupMessage = document.querySelector('.' + popupSelector);
	if (null !== popupMessage) {
		// get our value for days and hours to set cookie
		const closeTimeDays = parseInt(popupMessage.dataset.closeTimeDays) || 0;
		const closeTimeHours =
			(parseInt(popupMessage.dataset.closeTimeHours) || 0) / 24;
		// Our Total for when the cookie should expire and show the banner again
		const cookieDayTotal = closeTimeDays + closeTimeHours;
		// determines whether to display a popup
		popupDisplay(
			popupMessage,
			cookieDayTotal,
			popupShownCookieName,
			popupVisibleClass,
			checkSessionClass,
			validatedSessionClass
		);
	}

	// analytics events for any kind of message that is displayed
	const messageItems = document.querySelectorAll(
		'.' + messageSelector + ':not( .' + popupSelector + ' )'
	);
	if (0 < messageItems.length) {
		messageItems.forEach(function (currentMessage) {
			messageAnalytics(currentMessage);
		});
	}
});
