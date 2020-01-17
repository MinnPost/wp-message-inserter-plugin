"use strict";

(function($) {
	// Sets Cookies
	function setCookie(name, value, days) {
		var d = new Date();
		d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
		document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
	}

	// Reads Cookies
	function getCookie(name) {
		var v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
		return v ? v[2] : null;
	}

	// Faux "Session" checking/setting
	// Timestamp
	var currentcount = getCookie("count");
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
			setCookie("count", ++currentcount, 365);
		}
	}

	$(document).ready(function() {
		// Get our value for days to set cookie
		var closetimedays = parseInt($(".closetimedays").val());

		// Get our value for hours and divide by 24 to get proper percent of a day
		var closetimehours = $(".closetimehours").val() / 24;

		// Our Total for when the cookie should expire and show the banner again
		var cookiedaytotal = closetimedays + closetimehours;

		// Check if we should be showing the banner
		if (
			$(".pop-banner").length &&
			"true" !== getCookie("sm-closed") &&
			!$(".pop-banner").hasClass("check-session-banner")
		) {
			$(".pop-banner").addClass("d-block");
		}

		// Popup Banner Close Button
		$(".sm-close-btn").on("click", function(e) {
			e.preventDefault();
			setCookie("sm-closed", true, cookiedaytotal);
			$(".pop-banner").hide();
		});

		// Session Validating and showing proper banner
		var operators = {
			gt: function(a, b) {
				return a >= b;
			},
			lt: function(a, b) {
				return a <= b;
			}
		};

		$(".check-session-banner").each(function() {
			var banner_session_count = $(this)
				.find(".session_count_to_check")
				.val();

			var banner_session_operator = $(this)
				.find(".session_count_operator")
				.val();

			if (
				operators[banner_session_operator](
					currentcount,
					parseInt(banner_session_count)
				)
			) {
				if (
					($(this).hasClass("pop-banner") &&
						"true" !== getCookie("sm-closed")) ||
					!$(this).hasClass("pop-banner")
				) {
					$(this).addClass("validated");
				}
			}
		});
	});
})(jQuery);
