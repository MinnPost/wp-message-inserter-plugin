"use strict";

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
function analyticsTrackingEvent(type, category, action, label, value, nonInteraction) {
  if (typeof wp !== 'undefined') {
    category = 'Site Message: ' + category.charAt(0).toUpperCase() + category.slice(1);
    wp.hooks.doAction('wpMessageInserterAnalyticsEvent', type, category, action, label, value, nonInteraction);
  }
}

/**
 * Allow our theme or other plugins to send data to the dataLayer object for Google Tag Manager
 *
 * @param {string} messageRegion
 */
function dataLayerEvent(messageRegion) {
  if (typeof wp !== 'undefined') {
    const dataLayerContent = {
      messageRegion
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
function showPopup(popupMessage, cookieDayTotal, popupShownCookieName, popupVisibleClass, validatedSessionClass) {
  setCookie(popupShownCookieName, 'true', cookieDayTotal);
  const validatedItems = document.querySelectorAll('.' + validatedSessionClass);
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
    analyticsTrackingEvent('event', messageRegion, closeTrigger, popupId, undefined, 1);
    dataLayerEvent(messageRegion);
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
function popupDisplay(popupMessage, cookieDayTotal, popupShownCookieName, popupVisibleClass, checkSessionClass, validatedSessionClass) {
  const lastFocus = document.activeElement; // eslint-disable-line
  // Check if we should be showing the popup
  if ('true' !== getCookie(popupShownCookieName) && (!popupMessage.classList.contains(checkSessionClass) || popupMessage.classList.contains(validatedSessionClass))) {
    // actually show the popup
    showPopup(popupMessage, cookieDayTotal, popupShownCookieName, popupVisibleClass, validatedSessionClass);

    // run messageAnalytics on the popup
    messageAnalytics(popupMessage);

    // 1. detect clicks inside the popup that should close it.
    popupMessage.addEventListener('click', function (event) {
      const isCloseButton = event.target.classList.contains('sm-close-btn');
      if (true === isCloseButton) {
        event.preventDefault();
        hidePopup(popupMessage, popupVisibleClass, lastFocus, 'Close Button');
      }
    }, true);

    // 2. detect clicks outside the popup.
    document.addEventListener('click', evt => {
      let targetElement = evt.target;
      do {
        if (targetElement === popupMessage) {
          return;
        }
        // Go up the DOM
        targetElement = targetElement.parentNode;
      } while (targetElement);
      // This is a click outside.
      hidePopup(popupMessage, popupVisibleClass, lastFocus, 'Click Outside to Close');
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
        hidePopup(popupMessage, popupVisibleClass, lastFocus, 'Escape Key');
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
    analyticsTrackingEvent('event', messageRegion, 'Show', messageId, undefined, 1);
    dataLayerEvent(messageRegion);
    // click tracker for analytics events
    message.addEventListener('click', function (event) {
      // 1. is it a login link or close button?
      // the close event will have already been tracked by the hidePopup method.
      const isLoginClick = event.target.classList.contains('message-login');
      const isCloseButton = event.target.classList.contains('sm-close-btn');
      if (true === isLoginClick) {
        const url = $(this).attr('href');
        analyticsTrackingEvent('event', messageRegion, 'Login Link', url);
        dataLayerEvent(messageRegion);
      } else if (false === isCloseButton) {
        // 2. other links
        analyticsTrackingEvent('event', messageRegion, 'Click', messageId);
        dataLayerEvent(messageRegion);
      }
    }, true);
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
  const checkSessionItems = document.querySelectorAll('.' + checkSessionClass);
  if (0 < checkSessionItems.length) {
    // get the current count of sessions and set the operators for comparison
    const currentCount = setCurrentCount();
    const operators = {
      gt(a, b) {
        return a >= b;
      },
      lt(a, b) {
        return a <= b;
      }
    };

    // handle messages that are session-dependent
    checkSessionItems.forEach(function (currentSessionMessage) {
      const bannerSessionCount = parseInt(currentSessionMessage.dataset.sessionCountToCheck);
      const bannerSessionOperator = currentSessionMessage.dataset.sessionCountOperator;
      if (operators[bannerSessionOperator](currentCount, bannerSessionCount)) {
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
    const closeTimeHours = (parseInt(popupMessage.dataset.closeTimeHours) || 0) / 24;
    // Our Total for when the cookie should expire and show the banner again
    const cookieDayTotal = closeTimeDays + closeTimeHours;
    // determines whether to display a popup
    popupDisplay(popupMessage, cookieDayTotal, popupShownCookieName, popupVisibleClass, checkSessionClass, validatedSessionClass);
  }

  // analytics events for any kind of message that is displayed
  const messageItems = document.querySelectorAll('.' + messageSelector + ':not( .' + popupSelector + ' )');
  if (0 < messageItems.length) {
    messageItems.forEach(function (currentMessage) {
      messageAnalytics(currentMessage);
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAxLW1lc3NhZ2VzLmpzIl0sIm5hbWVzIjpbInNldENvb2tpZSIsIm5hbWUiLCJ2YWx1ZSIsImRheXMiLCJkIiwiRGF0ZSIsInNldFRpbWUiLCJnZXRUaW1lIiwiZG9jdW1lbnQiLCJjb29raWUiLCJ0b0dNVFN0cmluZyIsImdldENvb2tpZSIsIm1hdGNoIiwiYW5hbHl0aWNzVHJhY2tpbmdFdmVudCIsInR5cGUiLCJjYXRlZ29yeSIsImFjdGlvbiIsImxhYmVsIiwibm9uSW50ZXJhY3Rpb24iLCJ3cCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJob29rcyIsImRvQWN0aW9uIiwiZGF0YUxheWVyRXZlbnQiLCJtZXNzYWdlUmVnaW9uIiwiZGF0YUxheWVyQ29udGVudCIsInNldEN1cnJlbnRDb3VudCIsImN1cnJlbnRDb3VudCIsInRpbWVzdGFtcCIsIk1hdGgiLCJmbG9vciIsImNvb2tpZUV4cGlyYXRpb24iLCJ1cmxQYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsImdldCIsInBhcnNlSW50IiwiZ2V0UG9zdElkIiwibWVzc2FnZSIsInBvc3RJZCIsImNsYXNzTGlzdCIsImZvckVhY2giLCJpbmRleE9mIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJnZXRNZXNzYWdlUmVnaW9uIiwicmVnaW9uIiwic2hvd1BvcHVwIiwicG9wdXBNZXNzYWdlIiwiY29va2llRGF5VG90YWwiLCJwb3B1cFNob3duQ29va2llTmFtZSIsInBvcHVwVmlzaWJsZUNsYXNzIiwidmFsaWRhdGVkU2Vzc2lvbkNsYXNzIiwidmFsaWRhdGVkSXRlbXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGVuZ3RoIiwidmFsaWRhdGVkTWVzc2FnZSIsImFkZCIsImhpZGVQb3B1cCIsImxhc3RGb2N1cyIsImNsb3NlVHJpZ2dlciIsImZvY3VzIiwicmVtb3ZlIiwicG9wdXBJZCIsInVuZGVmaW5lZCIsInBvcHVwRGlzcGxheSIsImNoZWNrU2Vzc2lvbkNsYXNzIiwiYWN0aXZlRWxlbWVudCIsImNvbnRhaW5zIiwibWVzc2FnZUFuYWx5dGljcyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImlzQ2xvc2VCdXR0b24iLCJ0YXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsImV2dCIsInRhcmdldEVsZW1lbnQiLCJwYXJlbnROb2RlIiwib25rZXlkb3duIiwiaXNFc2NhcGUiLCJrZXkiLCJrZXlDb2RlIiwibWVzc2FnZUlkIiwibWVzc2FnZURpc3BsYXkiLCJnZXRDb21wdXRlZFN0eWxlIiwiZGlzcGxheSIsImlzTG9naW5DbGljayIsInVybCIsIiQiLCJhdHRyIiwicG9wdXBTZWxlY3RvciIsIm1lc3NhZ2VTZWxlY3RvciIsImNoZWNrU2Vzc2lvbkl0ZW1zIiwib3BlcmF0b3JzIiwiZ3QiLCJhIiwiYiIsImx0IiwiY3VycmVudFNlc3Npb25NZXNzYWdlIiwiYmFubmVyU2Vzc2lvbkNvdW50IiwiZGF0YXNldCIsInNlc3Npb25Db3VudFRvQ2hlY2siLCJiYW5uZXJTZXNzaW9uT3BlcmF0b3IiLCJzZXNzaW9uQ291bnRPcGVyYXRvciIsInF1ZXJ5U2VsZWN0b3IiLCJjbG9zZVRpbWVEYXlzIiwiY2xvc2VUaW1lSG91cnMiLCJtZXNzYWdlSXRlbXMiLCJjdXJyZW50TWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNBLFNBQVMsQ0FBQ0MsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRTtFQUNyQyxNQUFNQyxDQUFDLEdBQUcsSUFBSUMsSUFBSSxFQUFFO0VBQ3BCRCxDQUFDLENBQUNFLE9BQU8sQ0FBQ0YsQ0FBQyxDQUFDRyxPQUFPLEVBQUUsR0FBRyxRQUFRLEdBQUdKLElBQUksQ0FBQztFQUN4Q0ssUUFBUSxDQUFDQyxNQUFNLEdBQUdSLElBQUksR0FBRyxHQUFHLEdBQUdDLEtBQUssR0FBRyxrQkFBa0IsR0FBR0UsQ0FBQyxDQUFDTSxXQUFXLEVBQUU7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Y0FBYyxHQUFHd0QsYUFBYSxHQUFHQyxjQUFjO0lBQ3JEO0lBQ0F6QyxZQUFZLENBQ1hqQixZQUFZLEVBQ1pDLGNBQWMsRUFDZEMsb0JBQW9CLEVBQ3BCQyxpQkFBaUIsRUFDakJlLGlCQUFpQixFQUNqQmQscUJBQXFCLENBQ3JCO0VBQ0Y7O0VBRUE7RUFDQSxNQUFNdUQsWUFBWSxHQUFHdkcsUUFBUSxDQUFDa0QsZ0JBQWdCLENBQzdDLEdBQUcsR0FBR3FDLGVBQWUsR0FBRyxTQUFTLEdBQUdELGFBQWEsR0FBRyxJQUFJLENBQ3hEO0VBQ0QsSUFBSSxDQUFDLEdBQUdpQixZQUFZLENBQUNwRCxNQUFNLEVBQUU7SUFDNUJvRCxZQUFZLENBQUNsRSxPQUFPLENBQUMsVUFBVW1FLGNBQWMsRUFBRTtNQUM5Q3ZDLGdCQUFnQixDQUFDdUMsY0FBYyxDQUFDO0lBQ2pDLENBQUMsQ0FBQztFQUNIO0FBQ0QsQ0FBQyxDQUFDIiwiZmlsZSI6IndwLW1lc3NhZ2UtaW5zZXJ0ZXItcGx1Z2luLWZyb250LWVuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU2V0cyBjb29raWVzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtudW1iZXJ9IGRheXNcbiAqL1xuZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsIHZhbHVlLCBkYXlzKSB7XG5cdGNvbnN0IGQgPSBuZXcgRGF0ZSgpO1xuXHRkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyA4NjQwMDAwMCAqIGRheXMpO1xuXHRkb2N1bWVudC5jb29raWUgPSBuYW1lICsgJz0nICsgdmFsdWUgKyAnO3BhdGg9LztleHBpcmVzPScgKyBkLnRvR01UU3RyaW5nKCk7XG59XG5cbi8qKlxuICogUmVhZHMgY29va2llc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKi9cbmZ1bmN0aW9uIGdldENvb2tpZShuYW1lKSB7XG5cdGNvbnN0IHZhbHVlID0gZG9jdW1lbnQuY29va2llLm1hdGNoKCcoXnw7KSA/JyArIG5hbWUgKyAnPShbXjtdKikoO3wkKScpO1xuXHRyZXR1cm4gdmFsdWUgPyB2YWx1ZVsyXSA6IG51bGw7XG59XG5cbi8qKlxuICogQWxsb3cgb3VyIHRoZW1lIG9yIG90aGVyIHBsdWdpbnMgdG8gY3JlYXRlIGFuYWx5dGljcyB0cmFja2luZyBldmVudHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gIHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSAgY2F0ZWdvcnlcbiAqIEBwYXJhbSB7c3RyaW5nfSAgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gIGxhYmVsXG4gKiBAcGFyYW0ge0FycmF5fSAgIHZhbHVlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG5vbkludGVyYWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGFuYWx5dGljc1RyYWNraW5nRXZlbnQoXG5cdHR5cGUsXG5cdGNhdGVnb3J5LFxuXHRhY3Rpb24sXG5cdGxhYmVsLFxuXHR2YWx1ZSxcblx0bm9uSW50ZXJhY3Rpb25cbikge1xuXHRpZiAodHlwZW9mIHdwICE9PSAndW5kZWZpbmVkJykge1xuXHRcdGNhdGVnb3J5ID1cblx0XHRcdCdTaXRlIE1lc3NhZ2U6ICcgK1xuXHRcdFx0Y2F0ZWdvcnkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgK1xuXHRcdFx0Y2F0ZWdvcnkuc2xpY2UoMSk7XG5cdFx0d3AuaG9va3MuZG9BY3Rpb24oXG5cdFx0XHQnd3BNZXNzYWdlSW5zZXJ0ZXJBbmFseXRpY3NFdmVudCcsXG5cdFx0XHR0eXBlLFxuXHRcdFx0Y2F0ZWdvcnksXG5cdFx0XHRhY3Rpb24sXG5cdFx0XHRsYWJlbCxcblx0XHRcdHZhbHVlLFxuXHRcdFx0bm9uSW50ZXJhY3Rpb25cblx0XHQpO1xuXHR9XG59XG5cbi8qKlxuICogQWxsb3cgb3VyIHRoZW1lIG9yIG90aGVyIHBsdWdpbnMgdG8gc2VuZCBkYXRhIHRvIHRoZSBkYXRhTGF5ZXIgb2JqZWN0IGZvciBHb29nbGUgVGFnIE1hbmFnZXJcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVJlZ2lvblxuICovXG5mdW5jdGlvbiBkYXRhTGF5ZXJFdmVudChtZXNzYWdlUmVnaW9uKSB7XG5cdGlmICh0eXBlb2Ygd3AgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0Y29uc3QgZGF0YUxheWVyQ29udGVudCA9IHtcblx0XHRcdG1lc3NhZ2VSZWdpb24sXG5cdFx0fTtcblx0XHR3cC5ob29rcy5kb0FjdGlvbignd3BNZXNzYWdlSW5zZXJ0ZXJEYXRhTGF5ZXJFdmVudCcsIGRhdGFMYXllckNvbnRlbnQpO1xuXHR9XG59XG5cbi8qKlxuICogRmF1eCBcIlNlc3Npb25cIiBjaGVja2luZy9zZXR0aW5nLlxuICpcbiAqIEByZXR1cm4ge251bWJlcn0gY3VycmVudENvdW50XG4gKi9cbmZ1bmN0aW9uIHNldEN1cnJlbnRDb3VudCgpIHtcblx0Ly8gVGltZXN0YW1wIHN0b3JlZCBvbiB0aGUgY29va2llXG5cdGxldCBjdXJyZW50Q291bnQgPSBnZXRDb29raWUoJ2NvdW50Jyk7XG5cdGNvbnN0IHRpbWVzdGFtcCA9IE1hdGguZmxvb3IobmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwKTtcblx0Y29uc3QgY29va2llRXhwaXJhdGlvbiA9IDMwOyAvLyBleHBpcmUgdGhlIGNvb2tlIGluIDMwIGRheXNcblx0aWYgKCFnZXRDb29raWUoJ2NvdW50JykpIHtcblx0XHQvLyBGaXJzdCBWaXNpdCAtIHNldCBjb3VudCB0byAxXG5cdFx0c2V0Q29va2llKCdjb3VudCcsIDEsIGNvb2tpZUV4cGlyYXRpb24pO1xuXHRcdC8vIFNldCBhIHRpbWVjaGVjayBjb29raWUgZm9yIGFuIGhvdXIgZnJvbSBub3dcblx0XHRzZXRDb29raWUoJ3RpbWVjaGVjaycsIHRpbWVzdGFtcCArIDM2MDAsIGNvb2tpZUV4cGlyYXRpb24pO1xuXHR9IGVsc2UgaWYgKHRpbWVzdGFtcCA+IGdldENvb2tpZSgndGltZWNoZWNrJykpIHtcblx0XHQvLyBVcGRhdGUgVGltZWNoZWNrIHRvIG5ldyB2YWx1ZVxuXHRcdHNldENvb2tpZSgndGltZWNoZWNrJywgdGltZXN0YW1wICsgMzYwMCwgY29va2llRXhwaXJhdGlvbik7XG5cdFx0Ly8gQ291bnQgZXhpc3RzIGFscmVhZHkgYW5kIGl0IGhhcyBiZWVuIGFuIGhvdXIuIFVwZGF0ZSBjb3VudFxuXHRcdHNldENvb2tpZSgnY291bnQnLCArK2N1cnJlbnRDb3VudCwgY29va2llRXhwaXJhdGlvbik7XG5cdH1cblx0Y29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblx0aWYgKHVybFBhcmFtcy5nZXQoJ2NvdW50JykgIT09IG51bGwpIHtcblx0XHRjdXJyZW50Q291bnQgPSBwYXJzZUludCh1cmxQYXJhbXMuZ2V0KCdjb3VudCcpKTtcblx0fVxuXHRyZXR1cm4gY3VycmVudENvdW50O1xufVxuXG4vKipcbiAqIEdldCB0aGUgV29yZFByZXNzIHBvc3QgSUQgZm9yIGEgZ2l2ZW4gcG9wdXAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG1lc3NhZ2VcbiAqIEByZXR1cm4ge251bWJlcn0gcG9zdElkXG4gKi9cbmZ1bmN0aW9uIGdldFBvc3RJZChtZXNzYWdlKSB7XG5cdGxldCBwb3N0SWQgPSAwO1xuXHRtZXNzYWdlLmNsYXNzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdGlmICgwIDwgdmFsdWUuaW5kZXhPZignbWVzc2FnZS1pZCcpKSB7XG5cdFx0XHRwb3N0SWQgPSB2YWx1ZS5zdWJzdHJpbmcodmFsdWUubGFzdEluZGV4T2YoJy0nKSArIDEpO1xuXHRcdFx0cmV0dXJuIHBvc3RJZDtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gcG9zdElkO1xufVxuXG4vKipcbiAqIEdldCB0aGUgcmVnaW9uIGZvciBhIGdpdmVuIG1lc3NhZ2UuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG1lc3NhZ2VcbiAqIEByZXR1cm4ge3N0cmluZ30gcmVnaW9uXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VSZWdpb24obWVzc2FnZSkge1xuXHRsZXQgcmVnaW9uID0gJyc7XG5cdG1lc3NhZ2UuY2xhc3NMaXN0LmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0aWYgKDAgPCB2YWx1ZS5pbmRleE9mKCdtZXNzYWdlLXJlZ2lvbicpKSB7XG5cdFx0XHRyZWdpb24gPSB2YWx1ZS5zdWJzdHJpbmcodmFsdWUubGFzdEluZGV4T2YoJy0nKSArIDEpO1xuXHRcdFx0cmV0dXJuIHJlZ2lvbjtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gcmVnaW9uO1xufVxuXG4vKipcbiAqIFNob3cgYSBzcGVjaWZpYyBwb3B1cC4gU2V0cyBhIGNvb2tpZSBhbmQgYWRkcyBhIHZpc2liaWxpdHkgY2xhc3MuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBvcHVwTWVzc2FnZVxuICogQHBhcmFtIHtudW1iZXJ9IGNvb2tpZURheVRvdGFsXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9wdXBTaG93bkNvb2tpZU5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBwb3B1cFZpc2libGVDbGFzc1xuICogQHBhcmFtIHtzdHJpbmd9IHZhbGlkYXRlZFNlc3Npb25DbGFzc1xuICovXG5mdW5jdGlvbiBzaG93UG9wdXAoXG5cdHBvcHVwTWVzc2FnZSxcblx0Y29va2llRGF5VG90YWwsXG5cdHBvcHVwU2hvd25Db29raWVOYW1lLFxuXHRwb3B1cFZpc2libGVDbGFzcyxcblx0dmFsaWRhdGVkU2Vzc2lvbkNsYXNzXG4pIHtcblx0c2V0Q29va2llKHBvcHVwU2hvd25Db29raWVOYW1lLCAndHJ1ZScsIGNvb2tpZURheVRvdGFsKTtcblx0Y29uc3QgdmFsaWRhdGVkSXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuXHRcdCcuJyArIHZhbGlkYXRlZFNlc3Npb25DbGFzc1xuXHQpO1xuXHRpZiAoMCA8IHZhbGlkYXRlZEl0ZW1zLmxlbmd0aCkge1xuXHRcdHZhbGlkYXRlZEl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKHZhbGlkYXRlZE1lc3NhZ2UpIHtcblx0XHRcdHZhbGlkYXRlZE1lc3NhZ2UuY2xhc3NMaXN0LmFkZChwb3B1cFZpc2libGVDbGFzcyk7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cG9wdXBNZXNzYWdlLmNsYXNzTGlzdC5hZGQocG9wdXBWaXNpYmxlQ2xhc3MpO1xuXHR9XG59XG5cbi8qKlxuICogU2hvdyBhIHNwZWNpZmljIHBvcHVwLiBTZXRzIGEgY29va2llIGFuZCBhZGRzIGEgdmlzaWJpbGl0eSBjbGFzcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcG9wdXBNZXNzYWdlXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9wdXBWaXNpYmxlQ2xhc3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBsYXN0Rm9jdXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBjbG9zZVRyaWdnZXJcbiAqL1xuZnVuY3Rpb24gaGlkZVBvcHVwKHBvcHVwTWVzc2FnZSwgcG9wdXBWaXNpYmxlQ2xhc3MsIGxhc3RGb2N1cywgY2xvc2VUcmlnZ2VyKSB7XG5cdGxhc3RGb2N1cy5mb2N1cygpO1xuXHRwb3B1cE1lc3NhZ2UuY2xhc3NMaXN0LnJlbW92ZShwb3B1cFZpc2libGVDbGFzcyk7XG5cdGNvbnN0IHBvcHVwSWQgPSBnZXRQb3N0SWQocG9wdXBNZXNzYWdlKTtcblx0Y29uc3QgbWVzc2FnZVJlZ2lvbiA9ICdQb3B1cCc7XG5cdGlmICgwICE9PSBwb3B1cElkKSB7XG5cdFx0YW5hbHl0aWNzVHJhY2tpbmdFdmVudChcblx0XHRcdCdldmVudCcsXG5cdFx0XHRtZXNzYWdlUmVnaW9uLFxuXHRcdFx0Y2xvc2VUcmlnZ2VyLFxuXHRcdFx0cG9wdXBJZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdDFcblx0XHQpO1xuXHRcdGRhdGFMYXllckV2ZW50KG1lc3NhZ2VSZWdpb24pO1xuXHR9XG59XG5cbi8qKlxuICogRGlzcGxheSBhbmQgY29udHJvbHMgZm9yIHBvcHVwc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwb3B1cE1lc3NhZ2VcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb29raWVEYXlUb3RhbFxuICogQHBhcmFtIHtzdHJpbmd9IHBvcHVwU2hvd25Db29raWVOYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9wdXBWaXNpYmxlQ2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaGVja1Nlc3Npb25DbGFzc1xuICogQHBhcmFtIHtzdHJpbmd9IHZhbGlkYXRlZFNlc3Npb25DbGFzc1xuICovXG5mdW5jdGlvbiBwb3B1cERpc3BsYXkoXG5cdHBvcHVwTWVzc2FnZSxcblx0Y29va2llRGF5VG90YWwsXG5cdHBvcHVwU2hvd25Db29raWVOYW1lLFxuXHRwb3B1cFZpc2libGVDbGFzcyxcblx0Y2hlY2tTZXNzaW9uQ2xhc3MsXG5cdHZhbGlkYXRlZFNlc3Npb25DbGFzc1xuKSB7XG5cdGNvbnN0IGxhc3RGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblx0Ly8gQ2hlY2sgaWYgd2Ugc2hvdWxkIGJlIHNob3dpbmcgdGhlIHBvcHVwXG5cdGlmIChcblx0XHQndHJ1ZScgIT09IGdldENvb2tpZShwb3B1cFNob3duQ29va2llTmFtZSkgJiZcblx0XHQoIXBvcHVwTWVzc2FnZS5jbGFzc0xpc3QuY29udGFpbnMoY2hlY2tTZXNzaW9uQ2xhc3MpIHx8XG5cdFx0XHRwb3B1cE1lc3NhZ2UuY2xhc3NMaXN0LmNvbnRhaW5zKHZhbGlkYXRlZFNlc3Npb25DbGFzcykpXG5cdCkge1xuXHRcdC8vIGFjdHVhbGx5IHNob3cgdGhlIHBvcHVwXG5cdFx0c2hvd1BvcHVwKFxuXHRcdFx0cG9wdXBNZXNzYWdlLFxuXHRcdFx0Y29va2llRGF5VG90YWwsXG5cdFx0XHRwb3B1cFNob3duQ29va2llTmFtZSxcblx0XHRcdHBvcHVwVmlzaWJsZUNsYXNzLFxuXHRcdFx0dmFsaWRhdGVkU2Vzc2lvbkNsYXNzXG5cdFx0KTtcblxuXHRcdC8vIHJ1biBtZXNzYWdlQW5hbHl0aWNzIG9uIHRoZSBwb3B1cFxuXHRcdG1lc3NhZ2VBbmFseXRpY3MocG9wdXBNZXNzYWdlKTtcblxuXHRcdC8vIDEuIGRldGVjdCBjbGlja3MgaW5zaWRlIHRoZSBwb3B1cCB0aGF0IHNob3VsZCBjbG9zZSBpdC5cblx0XHRwb3B1cE1lc3NhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcblx0XHRcdCdjbGljaycsXG5cdFx0XHRmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdFx0Y29uc3QgaXNDbG9zZUJ1dHRvbiA9XG5cdFx0XHRcdFx0ZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc20tY2xvc2UtYnRuJyk7XG5cdFx0XHRcdGlmICh0cnVlID09PSBpc0Nsb3NlQnV0dG9uKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRoaWRlUG9wdXAoXG5cdFx0XHRcdFx0XHRwb3B1cE1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRwb3B1cFZpc2libGVDbGFzcyxcblx0XHRcdFx0XHRcdGxhc3RGb2N1cyxcblx0XHRcdFx0XHRcdCdDbG9zZSBCdXR0b24nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHRydWVcblx0XHQpO1xuXG5cdFx0Ly8gMi4gZGV0ZWN0IGNsaWNrcyBvdXRzaWRlIHRoZSBwb3B1cC5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldnQpID0+IHtcblx0XHRcdGxldCB0YXJnZXRFbGVtZW50ID0gZXZ0LnRhcmdldDtcblx0XHRcdGRvIHtcblx0XHRcdFx0aWYgKHRhcmdldEVsZW1lbnQgPT09IHBvcHVwTWVzc2FnZSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBHbyB1cCB0aGUgRE9NXG5cdFx0XHRcdHRhcmdldEVsZW1lbnQgPSB0YXJnZXRFbGVtZW50LnBhcmVudE5vZGU7XG5cdFx0XHR9IHdoaWxlICh0YXJnZXRFbGVtZW50KTtcblx0XHRcdC8vIFRoaXMgaXMgYSBjbGljayBvdXRzaWRlLlxuXHRcdFx0aGlkZVBvcHVwKFxuXHRcdFx0XHRwb3B1cE1lc3NhZ2UsXG5cdFx0XHRcdHBvcHVwVmlzaWJsZUNsYXNzLFxuXHRcdFx0XHRsYXN0Rm9jdXMsXG5cdFx0XHRcdCdDbGljayBPdXRzaWRlIHRvIENsb3NlJ1xuXHRcdFx0KTtcblx0XHR9KTtcblxuXHRcdC8vIDMuIGRldGVjdCBlc2NhcGUga2V5IHByZXNzXG5cdFx0ZG9jdW1lbnQub25rZXlkb3duID0gZnVuY3Rpb24gKGV2dCkge1xuXHRcdFx0ZXZ0ID0gZXZ0IHx8IHdpbmRvdy5ldmVudDtcblx0XHRcdGxldCBpc0VzY2FwZSA9IGZhbHNlO1xuXHRcdFx0aWYgKCdrZXknIGluIGV2dCkge1xuXHRcdFx0XHRpc0VzY2FwZSA9IGV2dC5rZXkgPT09ICdFc2NhcGUnIHx8IGV2dC5rZXkgPT09ICdFc2MnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXNFc2NhcGUgPSBldnQua2V5Q29kZSA9PT0gMjc7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNFc2NhcGUpIHtcblx0XHRcdFx0aGlkZVBvcHVwKFxuXHRcdFx0XHRcdHBvcHVwTWVzc2FnZSxcblx0XHRcdFx0XHRwb3B1cFZpc2libGVDbGFzcyxcblx0XHRcdFx0XHRsYXN0Rm9jdXMsXG5cdFx0XHRcdFx0J0VzY2FwZSBLZXknXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSAvLyBlbmQgb2YgaWYgc3RhdGVtZW50IGZvciB0aGUgY29uZGl0aW9uYWwgdG8gc2hvdyB0aGlzIHBvcHVwLlxufVxuXG4vKipcbiAqIFNldCB1cCBnb29nbGUgYW5hbHl0aWNzIGV2ZW50cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbWVzc2FnZVxuICovXG5mdW5jdGlvbiBtZXNzYWdlQW5hbHl0aWNzKG1lc3NhZ2UpIHtcblx0Y29uc3QgbWVzc2FnZVJlZ2lvbiA9IGdldE1lc3NhZ2VSZWdpb24obWVzc2FnZSk7XG5cdGNvbnN0IG1lc3NhZ2VJZCA9IGdldFBvc3RJZChtZXNzYWdlKTtcblx0Y29uc3QgbWVzc2FnZURpc3BsYXkgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShtZXNzYWdlLCBudWxsKS5kaXNwbGF5O1xuXHQvLyB0ZWxsIGFuYWx5dGljcyBpZiBhIG1lc3NhZ2UgaXMgYmVpbmcgZGlzcGxheWVkXG5cdGlmICgnbm9uZScgIT09IG1lc3NhZ2VEaXNwbGF5KSB7XG5cdFx0YW5hbHl0aWNzVHJhY2tpbmdFdmVudChcblx0XHRcdCdldmVudCcsXG5cdFx0XHRtZXNzYWdlUmVnaW9uLFxuXHRcdFx0J1Nob3cnLFxuXHRcdFx0bWVzc2FnZUlkLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0MVxuXHRcdCk7XG5cdFx0ZGF0YUxheWVyRXZlbnQobWVzc2FnZVJlZ2lvbik7XG5cdFx0Ly8gY2xpY2sgdHJhY2tlciBmb3IgYW5hbHl0aWNzIGV2ZW50c1xuXHRcdG1lc3NhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcblx0XHRcdCdjbGljaycsXG5cdFx0XHRmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdFx0Ly8gMS4gaXMgaXQgYSBsb2dpbiBsaW5rIG9yIGNsb3NlIGJ1dHRvbj9cblx0XHRcdFx0Ly8gdGhlIGNsb3NlIGV2ZW50IHdpbGwgaGF2ZSBhbHJlYWR5IGJlZW4gdHJhY2tlZCBieSB0aGUgaGlkZVBvcHVwIG1ldGhvZC5cblx0XHRcdFx0Y29uc3QgaXNMb2dpbkNsaWNrID1cblx0XHRcdFx0XHRldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtZXNzYWdlLWxvZ2luJyk7XG5cdFx0XHRcdGNvbnN0IGlzQ2xvc2VCdXR0b24gPVxuXHRcdFx0XHRcdGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NtLWNsb3NlLWJ0bicpO1xuXHRcdFx0XHRpZiAodHJ1ZSA9PT0gaXNMb2dpbkNsaWNrKSB7XG5cdFx0XHRcdFx0Y29uc3QgdXJsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XG5cdFx0XHRcdFx0YW5hbHl0aWNzVHJhY2tpbmdFdmVudChcblx0XHRcdFx0XHRcdCdldmVudCcsXG5cdFx0XHRcdFx0XHRtZXNzYWdlUmVnaW9uLFxuXHRcdFx0XHRcdFx0J0xvZ2luIExpbmsnLFxuXHRcdFx0XHRcdFx0dXJsXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRkYXRhTGF5ZXJFdmVudChtZXNzYWdlUmVnaW9uKTtcblx0XHRcdFx0fSBlbHNlIGlmIChmYWxzZSA9PT0gaXNDbG9zZUJ1dHRvbikge1xuXHRcdFx0XHRcdC8vIDIuIG90aGVyIGxpbmtzXG5cdFx0XHRcdFx0YW5hbHl0aWNzVHJhY2tpbmdFdmVudChcblx0XHRcdFx0XHRcdCdldmVudCcsXG5cdFx0XHRcdFx0XHRtZXNzYWdlUmVnaW9uLFxuXHRcdFx0XHRcdFx0J0NsaWNrJyxcblx0XHRcdFx0XHRcdG1lc3NhZ2VJZFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0ZGF0YUxheWVyRXZlbnQobWVzc2FnZVJlZ2lvbik7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHR0cnVlXG5cdFx0KTtcblx0fVxufVxuXG4vKipcbiAqIFdoZW4gdGhlIGRvY3VtZW50IGlzIGxvYWRlZCwgc2V0IHVwIHNlc3Npb24gdHJhY2tpbmcgYW5kIHBvcHVwIGRpc3BsYXlcbiAqXG4gKi9cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG5cdGNvbnN0IHBvcHVwU2VsZWN0b3IgPSAnd3AtbWVzc2FnZS1pbnNlcnRlci1tZXNzYWdlLXJlZ2lvbi1wb3B1cCc7XG5cdGNvbnN0IHBvcHVwU2hvd25Db29raWVOYW1lID0gJ3NtLXNob3duJztcblx0Y29uc3QgcG9wdXBWaXNpYmxlQ2xhc3MgPSAnd3AtbWVzc2FnZS1pbnNlcnRlci1tZXNzYWdlLXBvcHVwLXZpc2libGUnO1xuXHRjb25zdCBjaGVja1Nlc3Npb25DbGFzcyA9ICdjaGVjay1zZXNzaW9uLW1lc3NhZ2UnO1xuXHRjb25zdCBtZXNzYWdlU2VsZWN0b3IgPSAnd3AtbWVzc2FnZS1pbnNlcnRlci1tZXNzYWdlJztcblx0Y29uc3QgdmFsaWRhdGVkU2Vzc2lvbkNsYXNzID0gJ3ZhbGlkYXRlZCc7XG5cdGNvbnN0IGNoZWNrU2Vzc2lvbkl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcblx0XHQnLicgKyBjaGVja1Nlc3Npb25DbGFzc1xuXHQpO1xuXHRpZiAoMCA8IGNoZWNrU2Vzc2lvbkl0ZW1zLmxlbmd0aCkge1xuXHRcdC8vIGdldCB0aGUgY3VycmVudCBjb3VudCBvZiBzZXNzaW9ucyBhbmQgc2V0IHRoZSBvcGVyYXRvcnMgZm9yIGNvbXBhcmlzb25cblx0XHRjb25zdCBjdXJyZW50Q291bnQgPSBzZXRDdXJyZW50Q291bnQoKTtcblx0XHRjb25zdCBvcGVyYXRvcnMgPSB7XG5cdFx0XHRndChhLCBiKSB7XG5cdFx0XHRcdHJldHVybiBhID49IGI7XG5cdFx0XHR9LFxuXHRcdFx0bHQoYSwgYikge1xuXHRcdFx0XHRyZXR1cm4gYSA8PSBiO1xuXHRcdFx0fSxcblx0XHR9O1xuXG5cdFx0Ly8gaGFuZGxlIG1lc3NhZ2VzIHRoYXQgYXJlIHNlc3Npb24tZGVwZW5kZW50XG5cdFx0Y2hlY2tTZXNzaW9uSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudFNlc3Npb25NZXNzYWdlKSB7XG5cdFx0XHRjb25zdCBiYW5uZXJTZXNzaW9uQ291bnQgPSBwYXJzZUludChcblx0XHRcdFx0Y3VycmVudFNlc3Npb25NZXNzYWdlLmRhdGFzZXQuc2Vzc2lvbkNvdW50VG9DaGVja1xuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGJhbm5lclNlc3Npb25PcGVyYXRvciA9XG5cdFx0XHRcdGN1cnJlbnRTZXNzaW9uTWVzc2FnZS5kYXRhc2V0LnNlc3Npb25Db3VudE9wZXJhdG9yO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRvcGVyYXRvcnNbYmFubmVyU2Vzc2lvbk9wZXJhdG9yXShcblx0XHRcdFx0XHRjdXJyZW50Q291bnQsXG5cdFx0XHRcdFx0YmFubmVyU2Vzc2lvbkNvdW50XG5cdFx0XHRcdClcblx0XHRcdCkge1xuXHRcdFx0XHRpZiAoY3VycmVudFNlc3Npb25NZXNzYWdlLmNsYXNzTGlzdC5jb250YWlucyhwb3B1cFNlbGVjdG9yKSkge1xuXHRcdFx0XHRcdGN1cnJlbnRTZXNzaW9uTWVzc2FnZS5jbGFzc0xpc3QuYWRkKHZhbGlkYXRlZFNlc3Npb25DbGFzcyk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIWdldENvb2tpZShwb3B1cFNob3duQ29va2llTmFtZSkpIHtcblx0XHRcdFx0XHRjdXJyZW50U2Vzc2lvbk1lc3NhZ2UuY2xhc3NMaXN0LmFkZCh2YWxpZGF0ZWRTZXNzaW9uQ2xhc3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRjb25zdCBwb3B1cE1lc3NhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIHBvcHVwU2VsZWN0b3IpO1xuXHRpZiAobnVsbCAhPT0gcG9wdXBNZXNzYWdlKSB7XG5cdFx0Ly8gZ2V0IG91ciB2YWx1ZSBmb3IgZGF5cyBhbmQgaG91cnMgdG8gc2V0IGNvb2tpZVxuXHRcdGNvbnN0IGNsb3NlVGltZURheXMgPSBwYXJzZUludChwb3B1cE1lc3NhZ2UuZGF0YXNldC5jbG9zZVRpbWVEYXlzKSB8fCAwO1xuXHRcdGNvbnN0IGNsb3NlVGltZUhvdXJzID1cblx0XHRcdChwYXJzZUludChwb3B1cE1lc3NhZ2UuZGF0YXNldC5jbG9zZVRpbWVIb3VycykgfHwgMCkgLyAyNDtcblx0XHQvLyBPdXIgVG90YWwgZm9yIHdoZW4gdGhlIGNvb2tpZSBzaG91bGQgZXhwaXJlIGFuZCBzaG93IHRoZSBiYW5uZXIgYWdhaW5cblx0XHRjb25zdCBjb29raWVEYXlUb3RhbCA9IGNsb3NlVGltZURheXMgKyBjbG9zZVRpbWVIb3Vycztcblx0XHQvLyBkZXRlcm1pbmVzIHdoZXRoZXIgdG8gZGlzcGxheSBhIHBvcHVwXG5cdFx0cG9wdXBEaXNwbGF5KFxuXHRcdFx0cG9wdXBNZXNzYWdlLFxuXHRcdFx0Y29va2llRGF5VG90YWwsXG5cdFx0XHRwb3B1cFNob3duQ29va2llTmFtZSxcblx0XHRcdHBvcHVwVmlzaWJsZUNsYXNzLFxuXHRcdFx0Y2hlY2tTZXNzaW9uQ2xhc3MsXG5cdFx0XHR2YWxpZGF0ZWRTZXNzaW9uQ2xhc3Ncblx0XHQpO1xuXHR9XG5cblx0Ly8gYW5hbHl0aWNzIGV2ZW50cyBmb3IgYW55IGtpbmQgb2YgbWVzc2FnZSB0aGF0IGlzIGRpc3BsYXllZFxuXHRjb25zdCBtZXNzYWdlSXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuXHRcdCcuJyArIG1lc3NhZ2VTZWxlY3RvciArICc6bm90KCAuJyArIHBvcHVwU2VsZWN0b3IgKyAnICknXG5cdCk7XG5cdGlmICgwIDwgbWVzc2FnZUl0ZW1zLmxlbmd0aCkge1xuXHRcdG1lc3NhZ2VJdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChjdXJyZW50TWVzc2FnZSkge1xuXHRcdFx0bWVzc2FnZUFuYWx5dGljcyhjdXJyZW50TWVzc2FnZSk7XG5cdFx0fSk7XG5cdH1cbn0pO1xuIl19
