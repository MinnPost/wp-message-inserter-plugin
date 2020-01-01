"use strict";

(function($) {
	function setCookie(name, value, days) {
		var d = new Date();
		d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
		document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
	}

	function getCookie(name) {
		var v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
		return v ? v[2] : null;
	}

	$(document).ready(function() {
		// Timestamp
		var timestamp = Math.floor(new Date().getTime() / 1000);

		if (!getCookie("count")) {
			// First Visit - set count to 1
			setCookie("count", 1, 365);

			// Set a timecheck cookie for an hour from now
			setCookie("timecheck", timestamp + 3600, 365);
		} else {
			if (timestamp > getCookie("timecheck")) {
				// Update Timecheck to new value
				setCookie("timecheck", timestamp + 3600, 365);

				// Count exists already and it has been an hour. Update count
				setCookie("count", getCookie("count") + 1, 365);
			}
		}
	});
})(jQuery);
