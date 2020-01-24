;(function($) {
"use strict";

/**
 * Sets cookies
 *
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
function setCookie(name, value, days) {
  var d = new Date();
  d.setTime(d.getTime() + 86400000 * days);
  document.cookie = name + '=' + value + ';path=/;expires=' + d.toGMTString();
}
/**
 * Reads cookies
 *
 * @param {string} name
 */


function getCookie(name) {
  var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}
/**
 * Faux "Session" checking/setting
 *
 * @return {number} currentCount
 */


function setCurrentCount() {
  // Timestamp stored on the cookie
  var currentCount = getCookie('count');
  var timestamp = Math.floor(new Date().getTime() / 1000);

  if (!getCookie('count')) {
    // First Visit - set count to 1
    setCookie('count', 1, 365); // Set a timecheck cookie for an hour from now

    setCookie('timecheck', timestamp + 3600, 365);
  } else if (timestamp > getCookie('timecheck')) {
    // Update Timecheck to new value
    setCookie('timecheck', timestamp + 3600, 365); // Count exists already and it has been an hour. Update count

    setCookie('count', ++currentCount, 365);
  }

  var urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('count') !== null) {
    currentCount = parseInt(urlParams.get('count'));
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


function showPopup(popupSelector, cookieDayTotal, popupShownCookieName, popupVisibleClass) {
  setCookie(popupShownCookieName, 'true', cookieDayTotal);
  $('.' + popupSelector).addClass(popupVisibleClass);
}
/**
 * Show a specific popup. Sets a cookie and adds a visibility class.
 *
 * @param {string} popupSelector
 * @param {string} popupVisibleClass
 * @param {Object} lastFocus
 */


function hidePopup(popupSelector, popupVisibleClass, lastFocus) {
  lastFocus.focus();
  $('.' + popupSelector).removeClass(popupVisibleClass);
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


function popupDisplay(popupSelector, cookieDayTotal, popupShownCookieName, popupVisibleClass, checkSessionClass) {
  var lastFocus = document.activeElement; // put in a close button at the end

  $('.' + popupSelector + ' aside').append('<a href="#" class="sm-close-btn" aria-label="Close"><i class="fas fa-times"></i></a>'); // Check if we should be showing the popup

  if ('true' !== getCookie(popupShownCookieName) && !$('.' + popupSelector).hasClass(checkSessionClass)) {
    showPopup(popupSelector, cookieDayTotal, popupShownCookieName, popupVisibleClass);
  }

  document.addEventListener('click', function (event) {
    if (!$(event.target).closest('.' + popupSelector).is('.' + popupSelector) && $('.' + popupSelector).hasClass(popupVisibleClass)) {
      hidePopup(popupSelector, popupVisibleClass, lastFocus);
    }
  }, true); // popup close button

  $('.' + popupSelector).on('click', '.sm-close-btn', function (e) {
    e.preventDefault();
    hidePopup(popupSelector, popupVisibleClass, lastFocus);
  }); // escape key

  $(document).keyup(function (e) {
    if (27 === e.keyCode) {
      hidePopup(popupSelector, popupVisibleClass, lastFocus);
    }
  });
}
/**
 * When jQuery is loaded, set up session tracking and popup display
 *
 */


$(document).ready(function () {
  var popupSelector = 'wp-message-inserter-message-popup';
  var popupShownCookieName = 'sm-shown';
  var popupVisibleClass = 'wp-message-inserter-message-popup-visible';
  var checkSessionClass = 'check-session-message'; // Get our value for days and hours to set cookie

  var closeTimeDays = parseInt($('.' + popupSelector).data('close-time-days')) || 0;
  var closeTimeHours = (parseInt($('.' + popupSelector).data('close-time-hours')) || 0) / 24; // Our Total for when the cookie should expire and show the banner again

  var cookieDayTotal = closeTimeDays + closeTimeHours; // Session Validating and showing proper banner

  var operators = {
    gt: function gt(a, b) {
      return a >= b;
    },
    lt: function lt(a, b) {
      return a <= b;
    }
  };
  var currentCount = setCurrentCount();
  $('.' + checkSessionClass).each(function () {
    var bannerSessionCount = parseInt($(this).data('session-count-to-check'));
    var bannerSessionOperator = $(this).data('session-count-operator');

    if (operators[bannerSessionOperator](currentCount, bannerSessionCount)) {
      if (!$(this).hasClass(popupSelector)) {
        $(this).addClass('validated');
      } else if (!getCookie(popupShownCookieName)) {
        $(this).addClass('validated');
      }
    }
  });

  if (0 < $('.' + popupSelector).length) {
    popupDisplay(popupSelector, cookieDayTotal, popupShownCookieName, popupVisibleClass);
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAxLW1lc3NhZ2VzLmpzIl0sIm5hbWVzIjpbInNldENvb2tpZSIsIm5hbWUiLCJ2YWx1ZSIsImRheXMiLCJkIiwiRGF0ZSIsInNldFRpbWUiLCJnZXRUaW1lIiwiZG9jdW1lbnQiLCJjb29raWUiLCJ0b0dNVFN0cmluZyIsImdldENvb2tpZSIsInYiLCJtYXRjaCIsInNldEN1cnJlbnRDb3VudCIsImN1cnJlbnRDb3VudCIsInRpbWVzdGFtcCIsIk1hdGgiLCJmbG9vciIsInVybFBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwiZ2V0IiwicGFyc2VJbnQiLCJzaG93UG9wdXAiLCJwb3B1cFNlbGVjdG9yIiwiY29va2llRGF5VG90YWwiLCJwb3B1cFNob3duQ29va2llTmFtZSIsInBvcHVwVmlzaWJsZUNsYXNzIiwiJCIsImFkZENsYXNzIiwiaGlkZVBvcHVwIiwibGFzdEZvY3VzIiwiZm9jdXMiLCJyZW1vdmVDbGFzcyIsInBvcHVwRGlzcGxheSIsImNoZWNrU2Vzc2lvbkNsYXNzIiwiYWN0aXZlRWxlbWVudCIsImFwcGVuZCIsImhhc0NsYXNzIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwidGFyZ2V0IiwiY2xvc2VzdCIsImlzIiwib24iLCJlIiwicHJldmVudERlZmF1bHQiLCJrZXl1cCIsImtleUNvZGUiLCJyZWFkeSIsImNsb3NlVGltZURheXMiLCJkYXRhIiwiY2xvc2VUaW1lSG91cnMiLCJvcGVyYXRvcnMiLCJndCIsImEiLCJiIiwibHQiLCJlYWNoIiwiYmFubmVyU2Vzc2lvbkNvdW50IiwiYmFubmVyU2Vzc2lvbk9wZXJhdG9yIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBT0EsU0FBU0EsU0FBVCxDQUFvQkMsSUFBcEIsRUFBMEJDLEtBQTFCLEVBQWlDQyxJQUFqQyxFQUF3QztBQUN2QyxNQUFNQyxDQUFDLEdBQUcsSUFBSUMsSUFBSixFQUFWO0FBQ0FELEVBQUFB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Qix3QkFBaEIsQ0FBRixDQUFuQztBQUNBLFFBQU1TLHFCQUFxQixHQUFHaEMsQ0FBQyxDQUFFLElBQUYsQ0FBRCxDQUFVdUIsSUFBVixDQUFnQix3QkFBaEIsQ0FBOUI7O0FBQ0EsUUFDQ0UsU0FBUyxDQUFFTyxxQkFBRixDQUFULENBQ0NoRCxZQURELEVBRUMrQyxrQkFGRCxDQURELEVBS0U7QUFDRCxVQUFLLENBQUUvQixDQUFDLENBQUUsSUFBRixDQUFELENBQVVVLFFBQVYsQ0FBb0JkLGFBQXBCLENBQVAsRUFBNkM7QUFDNUNJLFFBQUFBLENBQUMsQ0FBRSxJQUFGLENBQUQsQ0FBVUMsUUFBVixDQUFvQixXQUFwQjtBQUNBLE9BRkQsTUFFTyxJQUFLLENBQUVyQixTQUFTLENBQUVrQixvQkFBRixDQUFoQixFQUEyQztBQUNqREUsUUFBQUEsQ0FBQyxDQUFFLElBQUYsQ0FBRCxDQUFVQyxRQUFWLENBQW9CLFdBQXBCO0FBQ0E7QUFDRDtBQUNELEdBZkQ7O0FBaUJBLE1BQUssSUFBSUQsQ0FBQyxDQUFFLE1BQU1KLGFBQVIsQ0FBRCxDQUF5QnFDLE1BQWxDLEVBQTJDO0FBQzFDM0IsSUFBQUEsWUFBWSxDQUFFVixhQUFGLEVBQWlCQyxjQUFqQixFQUFpQ0Msb0JBQWpDLEVBQXVEQyxpQkFBdkQsQ0FBWjtBQUNBO0FBQ0QsQ0E1Q0QiLCJmaWxlIjoid3AtbWVzc2FnZS1pbnNlcnRlci1wbHVnaW4tZnJvbnQtZW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTZXRzIGNvb2tpZXNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiBAcGFyYW0ge251bWJlcn0gZGF5c1xuICovXG5mdW5jdGlvbiBzZXRDb29raWUoIG5hbWUsIHZhbHVlLCBkYXlzICkge1xuXHRjb25zdCBkID0gbmV3IERhdGUoKTtcblx0ZC5zZXRUaW1lKCBkLmdldFRpbWUoKSArICggODY0MDAwMDAgKiBkYXlzICkgKTtcblx0ZG9jdW1lbnQuY29va2llID0gbmFtZSArICc9JyArIHZhbHVlICsgJztwYXRoPS87ZXhwaXJlcz0nICsgZC50b0dNVFN0cmluZygpO1xufVxuXG4vKipcbiAqIFJlYWRzIGNvb2tpZXNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICovXG5mdW5jdGlvbiBnZXRDb29raWUoIG5hbWUgKSB7XG5cdGNvbnN0IHYgPSBkb2N1bWVudC5jb29raWUubWF0Y2goICcoXnw7KSA/JyArIG5hbWUgKyAnPShbXjtdKikoO3wkKScgKTtcblx0cmV0dXJuIHYgPyB2WyAyIF0gOiBudWxsO1xufVxuXG4vKipcbiAqIEZhdXggXCJTZXNzaW9uXCIgY2hlY2tpbmcvc2V0dGluZ1xuICpcbiAqIEByZXR1cm4ge251bWJlcn0gY3VycmVudENvdW50XG4gKi9cbmZ1bmN0aW9uIHNldEN1cnJlbnRDb3VudCgpIHtcblx0Ly8gVGltZXN0YW1wIHN0b3JlZCBvbiB0aGUgY29va2llXG5cdGxldCBjdXJyZW50Q291bnQgPSBnZXRDb29raWUoICdjb3VudCcgKTtcblx0Y29uc3QgdGltZXN0YW1wID0gTWF0aC5mbG9vciggbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwICk7XG5cdGlmICggISBnZXRDb29raWUoICdjb3VudCcgKSApIHtcblx0XHQvLyBGaXJzdCBWaXNpdCAtIHNldCBjb3VudCB0byAxXG5cdFx0c2V0Q29va2llKCAnY291bnQnLCAxLCAzNjUgKTtcblx0XHQvLyBTZXQgYSB0aW1lY2hlY2sgY29va2llIGZvciBhbiBob3VyIGZyb20gbm93XG5cdFx0c2V0Q29va2llKCAndGltZWNoZWNrJywgdGltZXN0YW1wICsgMzYwMCwgMzY1ICk7XG5cdH0gZWxzZSBpZiAoIHRpbWVzdGFtcCA+IGdldENvb2tpZSggJ3RpbWVjaGVjaycgKSApIHtcblx0XHQvLyBVcGRhdGUgVGltZWNoZWNrIHRvIG5ldyB2YWx1ZVxuXHRcdHNldENvb2tpZSggJ3RpbWVjaGVjaycsIHRpbWVzdGFtcCArIDM2MDAsIDM2NSApO1xuXHRcdC8vIENvdW50IGV4aXN0cyBhbHJlYWR5IGFuZCBpdCBoYXMgYmVlbiBhbiBob3VyLiBVcGRhdGUgY291bnRcblx0XHRzZXRDb29raWUoICdjb3VudCcsICsrY3VycmVudENvdW50LCAzNjUgKTtcblx0fVxuXHRjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCB3aW5kb3cubG9jYXRpb24uc2VhcmNoICk7XG5cdGlmICggdXJsUGFyYW1zLmdldCggJ2NvdW50JyApICE9PSBudWxsICkge1xuXHRcdGN1cnJlbnRDb3VudCA9IHBhcnNlSW50KCB1cmxQYXJhbXMuZ2V0KCAnY291bnQnICkgKTtcblx0fVxuXHRyZXR1cm4gY3VycmVudENvdW50O1xufVxuXG4vKipcbiAqIFNob3cgYSBzcGVjaWZpYyBwb3B1cC4gU2V0cyBhIGNvb2tpZSBhbmQgYWRkcyBhIHZpc2liaWxpdHkgY2xhc3MuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBvcHVwU2VsZWN0b3JcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb29raWVEYXlUb3RhbFxuICogQHBhcmFtIHtzdHJpbmd9IHBvcHVwU2hvd25Db29raWVOYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9wdXBWaXNpYmxlQ2xhc3NcbiAqL1xuZnVuY3Rpb24gc2hvd1BvcHVwKCBwb3B1cFNlbGVjdG9yLCBjb29raWVEYXlUb3RhbCwgcG9wdXBTaG93bkNvb2tpZU5hbWUsIHBvcHVwVmlzaWJsZUNsYXNzICkge1xuXHRzZXRDb29raWUoIHBvcHVwU2hvd25Db29raWVOYW1lLCAndHJ1ZScsIGNvb2tpZURheVRvdGFsICk7XG5cdCQoICcuJyArIHBvcHVwU2VsZWN0b3IgKS5hZGRDbGFzcyggcG9wdXBWaXNpYmxlQ2xhc3MgKTtcbn1cblxuLyoqXG4gKiBTaG93IGEgc3BlY2lmaWMgcG9wdXAuIFNldHMgYSBjb29raWUgYW5kIGFkZHMgYSB2aXNpYmlsaXR5IGNsYXNzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwb3B1cFNlbGVjdG9yXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9wdXBWaXNpYmxlQ2xhc3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBsYXN0Rm9jdXNcbiAqL1xuZnVuY3Rpb24gaGlkZVBvcHVwKCBwb3B1cFNlbGVjdG9yLCBwb3B1cFZpc2libGVDbGFzcywgbGFzdEZvY3VzICkge1xuXHRsYXN0Rm9jdXMuZm9jdXMoKTtcblx0JCggJy4nICsgcG9wdXBTZWxlY3RvciApLnJlbW92ZUNsYXNzKCBwb3B1cFZpc2libGVDbGFzcyApO1xufVxuXG4vKipcbiAqIERpc3BsYXkgYW5kIGNvbnRyb2xzIGZvciBwb3B1cHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9wdXBTZWxlY3RvclxuICogQHBhcmFtIHtudW1iZXJ9IGNvb2tpZURheVRvdGFsXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9wdXBTaG93bkNvb2tpZU5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBwb3B1cFZpc2libGVDbGFzc1xuICogQHBhcmFtIHtzdHJpbmd9IGNoZWNrU2Vzc2lvbkNsYXNzXG4gKi9cbmZ1bmN0aW9uIHBvcHVwRGlzcGxheSggcG9wdXBTZWxlY3RvciwgY29va2llRGF5VG90YWwsIHBvcHVwU2hvd25Db29raWVOYW1lLCBwb3B1cFZpc2libGVDbGFzcywgY2hlY2tTZXNzaW9uQ2xhc3MgKSB7XG5cdGNvbnN0IGxhc3RGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cdC8vIHB1dCBpbiBhIGNsb3NlIGJ1dHRvbiBhdCB0aGUgZW5kXG5cdCQoICcuJyArIHBvcHVwU2VsZWN0b3IgKyAnIGFzaWRlJykuYXBwZW5kKCAnPGEgaHJlZj1cIiNcIiBjbGFzcz1cInNtLWNsb3NlLWJ0blwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPjxpIGNsYXNzPVwiZmFzIGZhLXRpbWVzXCI+PC9pPjwvYT4nICk7XG5cdC8vIENoZWNrIGlmIHdlIHNob3VsZCBiZSBzaG93aW5nIHRoZSBwb3B1cFxuXHRpZiAoXG5cdFx0J3RydWUnICE9PSBnZXRDb29raWUoIHBvcHVwU2hvd25Db29raWVOYW1lICkgJiZcblx0XHQhICQoICcuJyArIHBvcHVwU2VsZWN0b3IgKS5oYXNDbGFzcyggY2hlY2tTZXNzaW9uQ2xhc3MgKVxuXHQpIHtcblx0XHRzaG93UG9wdXAoIHBvcHVwU2VsZWN0b3IsIGNvb2tpZURheVRvdGFsLCBwb3B1cFNob3duQ29va2llTmFtZSwgcG9wdXBWaXNpYmxlQ2xhc3MgKTtcblx0fVxuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoXG5cdFx0XHQhICQoIGV2ZW50LnRhcmdldCApLmNsb3Nlc3QoICcuJyArIHBvcHVwU2VsZWN0b3IgKS5pcyggJy4nICsgcG9wdXBTZWxlY3RvciApICYmXG5cdFx0XHQkKCAnLicgKyBwb3B1cFNlbGVjdG9yICkuaGFzQ2xhc3MoIHBvcHVwVmlzaWJsZUNsYXNzIClcblx0XHQpIHtcblx0XHRcdGhpZGVQb3B1cCggcG9wdXBTZWxlY3RvciwgcG9wdXBWaXNpYmxlQ2xhc3MsIGxhc3RGb2N1cyApO1xuXHRcdH1cblx0fSwgdHJ1ZSApO1xuXG5cdC8vIHBvcHVwIGNsb3NlIGJ1dHRvblxuXHQkKCAnLicgKyBwb3B1cFNlbGVjdG9yICkub24oICdjbGljaycsICcuc20tY2xvc2UtYnRuJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGhpZGVQb3B1cCggcG9wdXBTZWxlY3RvciwgcG9wdXBWaXNpYmxlQ2xhc3MsIGxhc3RGb2N1cyApO1xuXHR9ICk7XG5cblx0Ly8gZXNjYXBlIGtleVxuXHQkKCBkb2N1bWVudCApLmtleXVwKCBmdW5jdGlvbiggZSApIHtcblx0XHRpZiAoIDI3ID09PSBlLmtleUNvZGUgKSB7XG5cdFx0XHRoaWRlUG9wdXAoIHBvcHVwU2VsZWN0b3IsIHBvcHVwVmlzaWJsZUNsYXNzLCBsYXN0Rm9jdXMgKTtcblx0XHR9XG5cdH0gKTtcbn1cblxuLyoqXG4gKiBXaGVuIGpRdWVyeSBpcyBsb2FkZWQsIHNldCB1cCBzZXNzaW9uIHRyYWNraW5nIGFuZCBwb3B1cCBkaXNwbGF5XG4gKlxuICovXG4kKCBkb2N1bWVudCApLnJlYWR5KCBmdW5jdGlvbigpIHtcblx0Y29uc3QgcG9wdXBTZWxlY3RvciA9ICd3cC1tZXNzYWdlLWluc2VydGVyLW1lc3NhZ2UtcG9wdXAnO1xuXHRjb25zdCBwb3B1cFNob3duQ29va2llTmFtZSA9ICdzbS1zaG93bic7XG5cdGNvbnN0IHBvcHVwVmlzaWJsZUNsYXNzID0gJ3dwLW1lc3NhZ2UtaW5zZXJ0ZXItbWVzc2FnZS1wb3B1cC12aXNpYmxlJztcblx0Y29uc3QgY2hlY2tTZXNzaW9uQ2xhc3MgPSAnY2hlY2stc2Vzc2lvbi1tZXNzYWdlJztcblxuXHQvLyBHZXQgb3VyIHZhbHVlIGZvciBkYXlzIGFuZCBob3VycyB0byBzZXQgY29va2llXG5cdGNvbnN0IGNsb3NlVGltZURheXMgPSBwYXJzZUludCggJCggJy4nICsgcG9wdXBTZWxlY3RvciApLmRhdGEoICdjbG9zZS10aW1lLWRheXMnICkgKSB8fCAwO1xuXHRjb25zdCBjbG9zZVRpbWVIb3VycyA9ICggcGFyc2VJbnQoICQoICcuJyArIHBvcHVwU2VsZWN0b3IgKS5kYXRhKCAnY2xvc2UtdGltZS1ob3VycycgKSApIHx8IDAgKSAvIDI0O1xuXHQvLyBPdXIgVG90YWwgZm9yIHdoZW4gdGhlIGNvb2tpZSBzaG91bGQgZXhwaXJlIGFuZCBzaG93IHRoZSBiYW5uZXIgYWdhaW5cblx0Y29uc3QgY29va2llRGF5VG90YWwgPSBjbG9zZVRpbWVEYXlzICsgY2xvc2VUaW1lSG91cnM7XG5cblx0Ly8gU2Vzc2lvbiBWYWxpZGF0aW5nIGFuZCBzaG93aW5nIHByb3BlciBiYW5uZXJcblx0Y29uc3Qgb3BlcmF0b3JzID0ge1xuXHRcdGd0KCBhLCBiICkge1xuXHRcdFx0cmV0dXJuIGEgPj0gYjtcblx0XHR9LFxuXHRcdGx0KCBhLCBiICkge1xuXHRcdFx0cmV0dXJuIGEgPD0gYjtcblx0XHR9LFxuXHR9O1xuXG5cdGNvbnN0IGN1cnJlbnRDb3VudCA9IHNldEN1cnJlbnRDb3VudCgpO1xuXG5cdCQoICcuJyArIGNoZWNrU2Vzc2lvbkNsYXNzICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0Y29uc3QgYmFubmVyU2Vzc2lvbkNvdW50ID0gcGFyc2VJbnQoICQoIHRoaXMgKS5kYXRhKCAnc2Vzc2lvbi1jb3VudC10by1jaGVjaycgKSApO1xuXHRcdGNvbnN0IGJhbm5lclNlc3Npb25PcGVyYXRvciA9ICQoIHRoaXMgKS5kYXRhKCAnc2Vzc2lvbi1jb3VudC1vcGVyYXRvcicgKTtcblx0XHRpZiAoXG5cdFx0XHRvcGVyYXRvcnNbIGJhbm5lclNlc3Npb25PcGVyYXRvciBdKFxuXHRcdFx0XHRjdXJyZW50Q291bnQsXG5cdFx0XHRcdGJhbm5lclNlc3Npb25Db3VudFxuXHRcdFx0KVxuXHRcdCkge1xuXHRcdFx0aWYgKCAhICQoIHRoaXMgKS5oYXNDbGFzcyggcG9wdXBTZWxlY3RvciApICkge1xuXHRcdFx0XHQkKCB0aGlzICkuYWRkQ2xhc3MoICd2YWxpZGF0ZWQnICk7XG5cdFx0XHR9IGVsc2UgaWYgKCAhIGdldENvb2tpZSggcG9wdXBTaG93bkNvb2tpZU5hbWUgKSApIHtcblx0XHRcdFx0JCggdGhpcyApLmFkZENsYXNzKCAndmFsaWRhdGVkJyApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSApO1xuXG5cdGlmICggMCA8ICQoICcuJyArIHBvcHVwU2VsZWN0b3IgKS5sZW5ndGggKSB7XG5cdFx0cG9wdXBEaXNwbGF5KCBwb3B1cFNlbGVjdG9yLCBjb29raWVEYXlUb3RhbCwgcG9wdXBTaG93bkNvb2tpZU5hbWUsIHBvcHVwVmlzaWJsZUNsYXNzICk7XG5cdH1cbn0gKTtcbiJdfQ==
}(jQuery));
