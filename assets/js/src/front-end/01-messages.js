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
	document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}

/**
 * Reads cookies
 *
 * @param {string} name
 */
function getCookie(name) {
	const v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
	return v ? v[2] : null;
}

/**
 * Creating Analytics events
 *
 * @param {string} type
 * @param {string} category
 * @param {string} action
 * @param {string} label
 * @param {Array} value
 */
function analyticsTrackingEvent(type, category, action, label, value) {
	category =
		"Site Message: " + category.charAt(0).toUpperCase() + category.slice(1);
	if ("undefined" !== typeof ga) {
		if ("undefined" === typeof value) {
			ga("send", type, category, action, label);
		} else {
			ga("send", type, category, action, label, value);
		}
	} else {
	}
}

/**
 * Faux "Session" checking/setting
 *
 * @return {number} currentCount
 */
function setCurrentCount() {
	// Timestamp stored on the cookie
	let currentCount = getCookie("count");
	const timestamp = Math.floor(new Date().getTime() / 1000);
	const cookieExpiration = 30; // expire the cooke in 30 days
	if (!getCookie("count")) {
		// First Visit - set count to 1
		setCookie("count", 1, cookieExpiration);
		// Set a timecheck cookie for an hour from now
		setCookie("timecheck", timestamp + 3600, cookieExpiration);
	} else if (timestamp > getCookie("timecheck")) {
		// Update Timecheck to new value
		setCookie("timecheck", timestamp + 3600, cookieExpiration);
		// Count exists already and it has been an hour. Update count
		setCookie("count", ++currentCount, cookieExpiration);
	}
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("count") !== null) {
		currentCount = parseInt(urlParams.get("count"));
	}
	return currentCount;
}

/**
 * Get the WordPress post ID for a given popup.
 *
 * @param {string} popupSelector
 * @return {number} postId
 */
function getPostId(popupSelector) {
	let postId = 0;
	const classList = $("." + popupSelector)
		.attr("class")
		.split(/\s+/);
	$.each(classList, function(index, item) {
		if (0 < item.indexOf("message-id")) {
			postId = item.substring(item.lastIndexOf("-") + 1);
			return false; // break each and postId will be returned
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
	let region = "";
	const classList = $(message)
		.attr("class")
		.split(/\s+/);
	$.each(classList, function(index, item) {
		if (0 < item.indexOf("message-region")) {
			region = item.substring(item.lastIndexOf("-") + 1);
			return false; // break each and region will be returned
		}
	});
	return region;
}

/**
 * Show a specific popup. Sets a cookie and adds a visibility class.
 *
 * @param {string} popupSelector
 * @param {number} cookieDayTotal
 * @param {string} popupShownCookieName
 * @param {string} popupVisibleClass
 */
function showPopup(
	popupSelector,
	cookieDayTotal,
	popupShownCookieName,
	popupVisibleClass
) {
	let popupId = 0;
	setCookie(popupShownCookieName, "true", cookieDayTotal);
	if (0 < $(".validated").length) {
		$("." + popupSelector + ".validated").addClass(popupVisibleClass);
		popupId = getPostId(popupSelector + ".validated");
	} else {
		$("." + popupSelector + ":first").addClass(popupVisibleClass);
		popupId = getPostId(popupSelector + ":first");
	}
	if (0 !== popupId) {
		analyticsTrackingEvent("event", "Popup", "Show", popupId, {
			nonInteraction: 1
		});
	}
}

/**
 * Show a specific popup. Sets a cookie and adds a visibility class.
 *
 * @param {string} popupSelector
 * @param {string} popupVisibleClass
 * @param {Object} lastFocus
 * @param {string} closeTrigger
 */
function hidePopup(popupSelector, popupVisibleClass, lastFocus, closeTrigger) {
	lastFocus.focus();
	$("." + popupSelector).removeClass(popupVisibleClass);
	const popupId = getPostId(popupSelector);
	if (0 !== popupId) {
		analyticsTrackingEvent("event", "Popup", closeTrigger, popupId, {
			nonInteraction: 1
		});
	}
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
function popupDisplay(
	popupSelector,
	cookieDayTotal,
	popupShownCookieName,
	popupVisibleClass,
	checkSessionClass
) {
	const lastFocus = document.activeElement;
	// put in a close button at the end
	$("." + popupSelector + " .m-wp-insert-message-item").append(
		'<a href="#" class="sm-close-btn" aria-label="Close"><i class="far fa-window-close" aria-hidden="true"></i></a>'
	);
	// Check if we should be showing the popup
	if (
		"true" !== getCookie(popupShownCookieName) &&
		!$("." + popupSelector).hasClass(checkSessionClass)
	) {
		showPopup(
			popupSelector,
			cookieDayTotal,
			popupShownCookieName,
			popupVisibleClass
		);
	}

	// click on login link inside popup
	$("." + popupSelector).on("click", ".message-login", function() {
		const url = $(this).attr("href");
		analyticsTrackingEvent("event", "Popup", "Login Link", url);
	});

	document.addEventListener(
		"click",
		function(event) {
			if (
				!$(event.target)
					.closest("." + popupSelector)
					.is("." + popupSelector) &&
				$("." + popupSelector).hasClass(popupVisibleClass)
			) {
				hidePopup(
					popupSelector,
					popupVisibleClass,
					lastFocus,
					"Click Outside to Close"
				);
			}
		},
		true
	);

	// popup close button
	$("." + popupSelector).on("click", ".sm-close-btn", function(e) {
		e.preventDefault();
		hidePopup(popupSelector, popupVisibleClass, lastFocus, "Close Button");
	});

	// escape key press
	$(document).keyup(function(e) {
		if (27 === e.keyCode) {
			hidePopup(popupSelector, popupVisibleClass, lastFocus, "Escape Key");
		}
	});

	// click on a non-login or close link inside popup
	$("." + popupSelector).on(
		"click",
		"a:not( .sm-close-btn, .message-login )",
		function() {
			const popupId = getPostId(popupSelector);
			analyticsTrackingEvent("event", "Popup", "Click", popupId);
		}
	);
}

function messageAnalytics(message) {
	const messageRegion = getMessageRegion("." + message);
	const messageId = getPostId(message);
	if ($("." + message).is(":visible")) {
		analyticsTrackingEvent("event", messageRegion, "Show", messageId, {
			nonInteraction: 1
		});
	}
	// click on login link inside a message
	$("." + message).on("click", ".message-login", function() {
		const url = $(this).attr("href");
		analyticsTrackingEvent("event", messageRegion, "Login Link", url);
	});

	// click on a non-login or close link inside a message
	$("." + message).on(
		"click",
		"a:not( .sm-close-btn, .message-login )",
		function() {
			analyticsTrackingEvent("event", messageRegion, "Click", messageId);
		}
	);
}

/**
 * When jQuery is loaded, set up session tracking and popup display
 *
 */
$(document).ready(function() {
	const popupSelector = "wp-message-inserter-message-region-popup";
	const popupShownCookieName = "sm-shown";
	const popupVisibleClass = "wp-message-inserter-message-popup-visible";
	const checkSessionClass = "check-session-message";
	const messageSelector = "wp-message-inserter-message";

	// Get our value for days and hours to set cookie
	const closeTimeDays =
		parseInt($("." + popupSelector).data("close-time-days")) || 0;
	const closeTimeHours =
		(parseInt($("." + popupSelector).data("close-time-hours")) || 0) / 24;
	// Our Total for when the cookie should expire and show the banner again
	const cookieDayTotal = closeTimeDays + closeTimeHours;

	// Session Validating and showing proper banner
	const operators = {
		gt(a, b) {
			return a >= b;
		},
		lt(a, b) {
			return a <= b;
		}
	};

	const currentCount = setCurrentCount();

	if (0 < $("." + checkSessionClass).length) {
		$("." + checkSessionClass).each(function() {
			const bannerSessionCount = parseInt(
				$(this).data("session-count-to-check")
			);
			const bannerSessionOperator = $(this).data("session-count-operator");
			if (operators[bannerSessionOperator](currentCount, bannerSessionCount)) {
				if (!$(this).hasClass(popupSelector)) {
					$(this).addClass("validated");
				} else if (!getCookie(popupShownCookieName)) {
					$(this).addClass("validated");
				}
			}
		});
	}

	if (0 < $("." + popupSelector).length) {
		popupDisplay(
			popupSelector,
			cookieDayTotal,
			popupShownCookieName,
			popupVisibleClass
		);
	}

	if (0 < $("." + messageSelector + ":not( ." + popupSelector + " )").length) {
		messageAnalytics(messageSelector + ":not( ." + popupSelector + " )");
	}
});
