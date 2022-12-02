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
 * @param {string} messageId
 */
function dataLayerEvent(messageRegion, messageId) {
  if (typeof wp !== 'undefined') {
    let dataLayerContent = {
      'messageRegion': messageRegion,
      'messageId': messageId,
      'formId': formId
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
    dataLayerEvent(messageRegion, messageId);
    // click tracker for analytics events
    message.addEventListener('click', function (event) {
      // 1. is it a login link or close button?
      // the close event will have already been tracked by the hidePopup method.
      const isLoginClick = event.target.classList.contains('message-login');
      const isCloseButton = event.target.classList.contains('sm-close-btn');
      if (true === isLoginClick) {
        const url = $(this).attr('href');
        analyticsTrackingEvent('event', messageRegion, 'Login Link', url);
        dataLayerEvent(messageRegion, messageId);
      } else if (false === isCloseButton) {
        // 2. other links
        analyticsTrackingEvent('event', messageRegion, 'Click', messageId);
        dataLayerEvent(messageRegion, messageId);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAxLW1lc3NhZ2VzLmpzIl0sIm5hbWVzIjpbInNldENvb2tpZSIsIm5hbWUiLCJ2YWx1ZSIsImRheXMiLCJkIiwiRGF0ZSIsInNldFRpbWUiLCJnZXRUaW1lIiwiZG9jdW1lbnQiLCJjb29raWUiLCJ0b0dNVFN0cmluZyIsImdldENvb2tpZSIsIm1hdGNoIiwiYW5hbHl0aWNzVHJhY2tpbmdFdmVudCIsInR5cGUiLCJjYXRlZ29yeSIsImFjdGlvbiIsImxhYmVsIiwibm9uSW50ZXJhY3Rpb24iLCJ3cCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJob29rcyIsImRvQWN0aW9uIiwiZGF0YUxheWVyRXZlbnQiLCJtZXNzYWdlUmVnaW9uIiwibWVzc2FnZUlkIiwiZGF0YUxheWVyQ29udGVudCIsImZvcm1JZCIsInNldEN1cnJlbnRDb3VudCIsImN1cnJlbnRDb3VudCIsInRpbWVzdGFtcCIsIk1hdGgiLCJmbG9vciIsImNvb2tpZUV4cGlyYXRpb24iLCJ1cmxQYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsImdldCIsInBhcnNlSW50IiwiZ2V0UG9zdElkIiwibWVzc2FnZSIsInBvc3RJZCIsImNsYXNzTGlzdCIsImZvckVhY2giLCJpbmRleE9mIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJnZXRNZXNzYWdlUmVnaW9uIiwicmVnaW9uIiwic2hvd1BvcHVwIiwicG9wdXBNZXNzYWdlIiwiY29va2llRGF5VG90YWwiLCJwb3B1cFNob3duQ29va2llTmFtZSIsInBvcHVwVmlzaWJsZUNsYXNzIiwidmFsaWRhdGVkU2Vzc2lvbkNsYXNzIiwidmFsaWRhdGVkSXRlbXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGVuZ3RoIiwidmFsaWRhdGVkTWVzc2FnZSIsImFkZCIsImhpZGVQb3B1cCIsImxhc3RGb2N1cyIsImNsb3NlVHJpZ2dlciIsImZvY3VzIiwicmVtb3ZlIiwicG9wdXBJZCIsInVuZGVmaW5lZCIsInBvcHVwRGlzcGxheSIsImNoZWNrU2Vzc2lvbkNsYXNzIiwiYWN0aXZlRWxlbWVudCIsImNvbnRhaW5zIiwibWVzc2FnZUFuYWx5dGljcyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImlzQ2xvc2VCdXR0b24iLCJ0YXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsImV2dCIsInRhcmdldEVsZW1lbnQiLCJwYXJlbnROb2RlIiwib25rZXlkb3duIiwiaXNFc2NhcGUiLCJrZXkiLCJrZXlDb2RlIiwibWVzc2FnZURpc3BsYXkiLCJnZXRDb21wdXRlZFN0eWxlIiwiZGlzcGxheSIsImlzTG9naW5DbGljayIsInVybCIsIiQiLCJhdHRyIiwicG9wdXBTZWxlY3RvciIsIm1lc3NhZ2VTZWxlY3RvciIsImNoZWNrU2Vzc2lvbkl0ZW1zIiwib3BlcmF0b3JzIiwiZ3QiLCJhIiwiYiIsImx0IiwiY3VycmVudFNlc3Npb25NZXNzYWdlIiwiYmFubmVyU2Vzc2lvbkNvdW50IiwiZGF0YXNldCIsInNlc3Npb25Db3VudFRvQ2hlY2siLCJiYW5uZXJTZXNzaW9uT3BlcmF0b3IiLCJzZXNzaW9uQ291bnRPcGVyYXRvciIsInF1ZXJ5U2VsZWN0b3IiLCJjbG9zZVRpbWVEYXlzIiwiY2xvc2VUaW1lSG91cnMiLCJtZXNzYWdlSXRlbXMiLCJjdXJyZW50TWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNBLFNBQVMsQ0FBQ0MsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRTtFQUNyQyxNQUFNQyxDQUFDLEdBQUcsSUFBSUMsSUFBSSxFQUFFO0VBQ3BCRCxDQUFDLENBQUNFLE9BQU8sQ0FBQ0YsQ0FBQyxDQUFDRyxPQUFPLEVBQUUsR0FBRyxRQUFRLEdBQUdKLElBQUksQ0FBQztFQUN4Q0ssUUFBUSxDQUFDQyxNQUFNLEdBQUdSLElBQUksR0FBRyxHQUFHLEdBQUdDLEtBQUssR0FBRyxrQkFBa0IsR0FBR0UsQ0FBQyxDQUFDTSxXQUFXLEVBQUU7QUFDNUU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLFNBQVMsQ0FBQ1YsSUFBSSxFQUFFO0VBQ3hCLE1BQU1DLEtBQUssR0FBR00sUUFBUSxDQUFDQyxNQUFNLENBQUNHLEtBQUssQ0FBQyxTQUFTLEdBQUdYLElBQUksR0FBRyxlQUFlLENBQUM7RUFDdkUsT0FBT0MsS0FBSyxHQUFHQSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSTtBQUMvQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNXLHNCQUFzQixDQUM5QkMsSUFBSSxFQUNKQyxRQUFRLEVBQ1JDLE1BQU0sRUFDTkMsS0FBSyxFQUNMZixLQUFLLEVBQ0xnQixjQUFjLEVBQ2I7RUFDRCxJQUFJLE9BQU9DLEVBQUUsS0FBSyxXQUFXLEVBQUU7SUFDOUJKLFFBQVEsR0FDUCxnQkFBZ0IsR0FDaEJBLFFBQVEsQ0FBQ0ssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxXQUFXLEVBQUUsR0FDaENOLFFBQVEsQ0FBQ08sS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNsQkgsRUFBRSxDQUFDSSxLQUFLLENBQUNDLFFBQVEsQ0FDaEIsaUNBQWlDLEVBQ2pDVixJQUFJLEVBQ0pDLFFBQVEsRUFDUkMsTUFBTSxFQUNOQyxLQUFLLEVBQ0xmLEtBQUssRUFDTGdCLGNBQWMsQ0FDZDtFQUNGO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU08sY0FBYyxDQUFDQyxhQUFhLEVBQUVDLFNBQVMsRUFBRTtFQUNqRCxJQUFJLE9BQU9SLEVBQUUsS0FBSyxXQUFXLEVBQUU7SUFDOUIsSUFBSVMsZ0JBQWdCLEdBQUc7TUFDdEIsZUFBZSxFQUFFRixhQUFhO01BQzlCLFdBQVcsRUFBRUMsU0FBUztNQUN0QixRQUFRLEVBQUVFO0lBQ1gsQ0FBQztJQUNEVixFQUFFLENBQUNJLEtBQUssQ0FBQ0MsUUFBUSxDQUFDLGlDQUFpQyxFQUFFSSxnQkFBZ0IsQ0FBQztFQUN2RTtBQUNEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTRSxlQUFlLEdBQUc7RUFDMUI7RUFDQSxJQUFJQyxZQUFZLEdBQUdwQixTQUFTLENBQUMsT0FBTyxDQUFDO0VBQ3JDLE1BQU1xQixTQUFTLEdBQUdDLElBQUksQ0FBQ0MsS0FBSyxDQUFDLElBQUk3QixJQUFJLEVBQUUsQ0FBQ0UsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO0VBQ3pELE1BQU00QixnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBQztFQUM3QixJQUFJLENBQUN4QixTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUU7SUFDeEI7SUFDQVgsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUVtQyxnQkFBZ0IsQ0FBQztJQUN2QztJQUNBbkMsU0FBUyxDQUFDLFdBQVcsRUFBRWdDLFNBQVMsR0FBRyxJQUFJLEVBQUVHLGdCQUFnQixDQUFDO0VBQzNELENBQUMsTUFBTSxJQUFJSCxTQUFTLEdBQUdyQixTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUU7SUFDOUM7SUFDQVgsU0FBUyxDQUFDLFdBQVcsRUFBRWdDLFNBQVMsR0FBRyxJQUFJLEVBQUVHLGdCQUFnQixDQUFDO0lBQzFEO0lBQ0FuQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUrQixZQUFZLEVBQUVJLGdCQUFnQixDQUFDO0VBQ3JEO0VBQ0EsTUFBTUMsU0FBUyxHQUFHLElBQUlDLGVBQWUsQ0FBQ0MsTUFBTSxDQUFDQyxRQUFRLENBQUNDLE1BQU0sQ0FBQztFQUM3RCxJQUFJSixTQUFTLENBQUNLLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDcENWLFlBQVksR0FBR1csUUFBUSxDQUFDTixTQUFTLENBQUNLLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUNoRDtFQUNBLE9BQU9WLFlBQVk7QUFDcEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU1ksU0FBUyxDQUFDQyxPQUFPLEVBQUU7RUFDM0IsSUFBSUMsTUFBTSxHQUFHLENBQUM7RUFDZEQsT0FBTyxDQUFDRSxTQUFTLENBQUNDLE9BQU8sQ0FBQyxVQUFVN0MsS0FBSyxFQUFFO0lBQzFDLElBQUksQ0FBQyxHQUFHQSxLQUFLLENBQUM4QyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7TUFDcENILE1BQU0sR0FBRzNDLEtBQUssQ0FBQytDLFNBQVMsQ0FBQy9DLEtBQUssQ0FBQ2dELFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDcEQsT0FBT0wsTUFBTTtJQUNkO0VBQ0QsQ0FBQyxDQUFDO0VBQ0YsT0FBT0EsTUFBTTtBQUNkOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNNLGdCQUFnQixDQUFDUCxPQUFPLEVBQUU7RUFDbEMsSUFBSVEsTUFBTSxHQUFHLEVBQUU7RUFDZlIsT0FBTyxDQUFDRSxTQUFTLENBQUNDLE9BQU8sQ0FBQyxVQUFVN0MsS0FBSyxFQUFFO0lBQzFDLElBQUksQ0FBQyxHQUFHQSxLQUFLLENBQUM4QyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtNQUN4Q0ksTUFBTSxHQUFHbEQsS0FBSyxDQUFDK0MsU0FBUyxDQUFDL0MsS0FBSyxDQUFDZ0QsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUNwRCxPQUFPRSxNQUFNO0lBQ2Q7RUFDRCxDQUFDLENBQUM7RUFDRixPQUFPQSxNQUFNO0FBQ2Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsU0FBUyxDQUNqQkMsWUFBWSxFQUNaQyxjQUFjLEVBQ2RDLG9CQUFvQixFQUNwQkMsaUJBQWlCLEVBQ2pCQyxxQkFBcUIsRUFDcEI7RUFDRDFELFNBQVMsQ0FBQ3dELG9CQUFvQixFQUFFLE1BQU0sRUFBRUQsY0FBYyxDQUFDO0VBQ3ZELE1BQU1JLGNBQWMsR0FBR25ELFFBQVEsQ0FBQ29ELGdCQUFnQixDQUMvQyxHQUFHLEdBQUdGLHFCQUFxQixDQUMzQjtFQUNELElBQUksQ0FBQyxHQUFHQyxjQUFjLENBQUNFLE1BQU0sRUFBRTtJQUM5QkYsY0FBYyxDQUFDWixPQUFPLENBQUMsVUFBVWUsZ0JBQWdCLEVBQUU7TUFDbERBLGdCQUFnQixDQUFDaEIsU0FBUyxDQUFDaUIsR0FBRyxDQUFDTixpQkFBaUIsQ0FBQztJQUNsRCxDQUFDLENBQUM7RUFDSCxDQUFDLE1BQU07SUFDTkgsWUFBWSxDQUFDUixTQUFTLENBQUNpQixHQUFHLENBQUNOLGlCQUFpQixDQUFDO0VBQzlDO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNPLFNBQVMsQ0FBQ1YsWUFBWSxFQUFFRyxpQkFBaUIsRUFBRVEsU0FBUyxFQUFFQyxZQUFZLEVBQUU7RUFDNUVELFNBQVMsQ0FBQ0UsS0FBSyxFQUFFO0VBQ2pCYixZQUFZLENBQUNSLFNBQVMsQ0FBQ3NCLE1BQU0sQ0FBQ1gsaUJBQWlCLENBQUM7RUFDaEQsTUFBTVksT0FBTyxHQUFHMUIsU0FBUyxDQUFDVyxZQUFZLENBQUM7RUFDdkMsTUFBTTVCLGFBQWEsR0FBRyxPQUFPO0VBQzdCLElBQUksQ0FBQyxLQUFLMkMsT0FBTyxFQUFFO0lBQ2xCeEQsc0JBQXNCLENBQ3JCLE9BQU8sRUFDUGEsYUFBYSxFQUNid0MsWUFBWSxFQUNaRyxPQUFPLEVBQ1BDLFNBQVMsRUFDVCxDQUFDLENBQ0Q7SUFDRDdDLGNBQWMsQ0FBQ0MsYUFBYSxDQUFDO0VBQzlCO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTNkMsWUFBWSxDQUNwQmpCLFlBQVksRUFDWkMsY0FBYyxFQUNkQyxvQkFBb0IsRUFDcEJDLGlCQUFpQixFQUNqQmUsaUJBQWlCLEVBQ2pCZCxxQkFBcUIsRUFDcEI7RUFDRCxNQUFNTyxTQUFTLEdBQUd6RCxRQUFRLENBQUNpRSxhQUFhLENBQUMsQ0FBQztFQUMxQztFQUNBLElBQ0MsTUFBTSxLQUFLOUQsU0FBUyxDQUFDNkMsb0JBQW9CLENBQUMsS0FDekMsQ0FBQ0YsWUFBWSxDQUFDUixTQUFTLENBQUM0QixRQUFRLENBQUNGLGlCQUFpQixDQUFDLElBQ25EbEIsWUFBWSxDQUFDUixTQUFTLENBQUM0QixRQUFRLENBQUNoQixxQkFBcUIsQ0FBQyxDQUFDLEVBQ3ZEO0lBQ0Q7SUFDQUwsU0FBUyxDQUNSQyxZQUFZLEVBQ1pDLGNBQWMsRUFDZEMsb0JBQW9CLEVBQ3BCQyxpQkFBaUIsRUFDakJDLHFCQUFxQixDQUNyQjs7SUFFRDtJQUNBaUIsZ0JBQWdCLENBQUNyQixZQUFZLENBQUM7O0lBRTlCO0lBQ0FBLFlBQVksQ0FBQ3NCLGdCQUFnQixDQUM1QixPQUFPLEVBQ1AsVUFBVUMsS0FBSyxFQUFFO01BQ2hCLE1BQU1DLGFBQWEsR0FDbEJELEtBQUssQ0FBQ0UsTUFBTSxDQUFDakMsU0FBUyxDQUFDNEIsUUFBUSxDQUFDLGNBQWMsQ0FBQztNQUNoRCxJQUFJLElBQUksS0FBS0ksYUFBYSxFQUFFO1FBQzNCRCxLQUFLLENBQUNHLGNBQWMsRUFBRTtRQUN0QmhCLFNBQVMsQ0FDUlYsWUFBWSxFQUNaRyxpQkFBaUIsRUFDakJRLFNBQVMsRUFDVCxjQUFjLENBQ2Q7TUFDRjtJQUNELENBQUMsRUFDRCxJQUFJLENBQ0o7O0lBRUQ7SUFDQXpELFFBQVEsQ0FBQ29FLGdCQUFnQixDQUFDLE9BQU8sRUFBR0ssR0FBRyxJQUFLO01BQzNDLElBQUlDLGFBQWEsR0FBR0QsR0FBRyxDQUFDRixNQUFNO01BQzlCLEdBQUc7UUFDRixJQUFJRyxhQUFhLEtBQUs1QixZQUFZLEVBQUU7VUFDbkM7UUFDRDtRQUNBO1FBQ0E0QixhQUFhLEdBQUdBLGFBQWEsQ0FBQ0MsVUFBVTtNQUN6QyxDQUFDLFFBQVFELGFBQWE7TUFDdEI7TUFDQWxCLFNBQVMsQ0FDUlYsWUFBWSxFQUNaRyxpQkFBaUIsRUFDakJRLFNBQVMsRUFDVCx3QkFBd0IsQ0FDeEI7SUFDRixDQUFDLENBQUM7O0lBRUY7SUFDQXpELFFBQVEsQ0FBQzRFLFNBQVMsR0FBRyxVQUFVSCxHQUFHLEVBQUU7TUFDbkNBLEdBQUcsR0FBR0EsR0FBRyxJQUFJM0MsTUFBTSxDQUFDdUMsS0FBSztNQUN6QixJQUFJUSxRQUFRLEdBQUcsS0FBSztNQUNwQixJQUFJLEtBQUssSUFBSUosR0FBRyxFQUFFO1FBQ2pCSSxRQUFRLEdBQUdKLEdBQUcsQ0FBQ0ssR0FBRyxLQUFLLFFBQVEsSUFBSUwsR0FBRyxDQUFDSyxHQUFHLEtBQUssS0FBSztNQUNyRCxDQUFDLE1BQU07UUFDTkQsUUFBUSxHQUFHSixHQUFHLENBQUNNLE9BQU8sS0FBSyxFQUFFO01BQzlCO01BQ0EsSUFBSUYsUUFBUSxFQUFFO1FBQ2JyQixTQUFTLENBQ1JWLFlBQVksRUFDWkcsaUJBQWlCLEVBQ2pCUSxTQUFTLEVBQ1QsWUFBWSxDQUNaO01BQ0Y7SUFDRCxDQUFDO0VBQ0YsQ0FBQyxDQUFDO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNVLGdCQUFnQixDQUFDL0IsT0FBTyxFQUFFO0VBQ2xDLE1BQU1sQixhQUFhLEdBQUd5QixnQkFBZ0IsQ0FBQ1AsT0FBTyxDQUFDO0VBQy9DLE1BQU1qQixTQUFTLEdBQUdnQixTQUFTLENBQUNDLE9BQU8sQ0FBQztFQUNwQyxNQUFNNEMsY0FBYyxHQUFHbEQsTUFBTSxDQUFDbUQsZ0JBQWdCLENBQUM3QyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM4QyxPQUFPO0VBQ3JFO0VBQ0EsSUFBSSxNQUFNLEtBQUtGLGNBQWMsRUFBRTtJQUM5QjNFLHNCQUFzQixDQUNyQixPQUFPLEVBQ1BhLGFBQWEsRUFDYixNQUFNLEVBQ05DLFNBQVMsRUFDVDJDLFNBQVMsRUFDVCxDQUFDLENBQ0Q7SUFDRDdDLGNBQWMsQ0FBQ0MsYUFBYSxFQUFFQyxTQUFTLENBQUM7SUFDeEM7SUFDQWlCLE9BQU8sQ0FBQ2dDLGdCQUFnQixDQUN2QixPQUFPLEVBQ1AsVUFBVUMsS0FBSyxFQUFFO01BQ2hCO01BQ0E7TUFDQSxNQUFNYyxZQUFZLEdBQ2pCZCxLQUFLLENBQUNFLE1BQU0sQ0FBQ2pDLFNBQVMsQ0FBQzRCLFFBQVEsQ0FBQyxlQUFlLENBQUM7TUFDakQsTUFBTUksYUFBYSxHQUNsQkQsS0FBSyxDQUFDRSxNQUFNLENBQUNqQyxTQUFTLENBQUM0QixRQUFRLENBQUMsY0FBYyxDQUFDO01BQ2hELElBQUksSUFBSSxLQUFLaUIsWUFBWSxFQUFFO1FBQzFCLE1BQU1DLEdBQUcsR0FBR0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ2hDakYsc0JBQXNCLENBQ3JCLE9BQU8sRUFDUGEsYUFBYSxFQUNiLFlBQVksRUFDWmtFLEdBQUcsQ0FDSDtRQUNEbkUsY0FBYyxDQUFDQyxhQUFhLEVBQUVDLFNBQVMsQ0FBQztNQUN6QyxDQUFDLE1BQU0sSUFBSSxLQUFLLEtBQUttRCxhQUFhLEVBQUU7UUFDbkM7UUFDQWpFLHNCQUFzQixDQUNyQixPQUFPLEVBQ1BhLGFBQWEsRUFDYixPQUFPLEVBQ1BDLFNBQVMsQ0FDVDtRQUNERixjQUFjLENBQUNDLGFBQWEsRUFBRUMsU0FBUyxDQUFDO01BQ3pDO0lBQ0QsQ0FBQyxFQUNELElBQUksQ0FDSjtFQUNGO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQW5CLFFBQVEsQ0FBQ29FLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFlBQVk7RUFDekQsTUFBTW1CLGFBQWEsR0FBRywwQ0FBMEM7RUFDaEUsTUFBTXZDLG9CQUFvQixHQUFHLFVBQVU7RUFDdkMsTUFBTUMsaUJBQWlCLEdBQUcsMkNBQTJDO0VBQ3JFLE1BQU1lLGlCQUFpQixHQUFHLHVCQUF1QjtFQUNqRCxNQUFNd0IsZUFBZSxHQUFHLDZCQUE2QjtFQUNyRCxNQUFNdEMscUJBQXFCLEdBQUcsV0FBVztFQUN6QyxNQUFNdUMsaUJBQWlCLEdBQUd6RixRQUFRLENBQUNvRCxnQkFBZ0IsQ0FDbEQsR0FBRyxHQUFHWSxpQkFBaUIsQ0FDdkI7RUFDRCxJQUFJLENBQUMsR0FBR3lCLGlCQUFpQixDQUFDcEMsTUFBTSxFQUFFO0lBQ2pDO0lBQ0EsTUFBTTlCLFlBQVksR0FBR0QsZUFBZSxFQUFFO0lBQ3RDLE1BQU1vRSxTQUFTLEdBQUc7TUFDakJDLEVBQUUsQ0FBQ0MsQ0FBQyxFQUFFQyxDQUFDLEVBQUU7UUFDUixPQUFPRCxDQUFDLElBQUlDLENBQUM7TUFDZCxDQUFDO01BQ0RDLEVBQUUsQ0FBQ0YsQ0FBQyxFQUFFQyxDQUFDLEVBQUU7UUFDUixPQUFPRCxDQUFDLElBQUlDLENBQUM7TUFDZDtJQUNELENBQUM7O0lBRUQ7SUFDQUosaUJBQWlCLENBQUNsRCxPQUFPLENBQUMsVUFBVXdELHFCQUFxQixFQUFFO01BQzFELE1BQU1DLGtCQUFrQixHQUFHOUQsUUFBUSxDQUNsQzZELHFCQUFxQixDQUFDRSxPQUFPLENBQUNDLG1CQUFtQixDQUNqRDtNQUNELE1BQU1DLHFCQUFxQixHQUMxQkoscUJBQXFCLENBQUNFLE9BQU8sQ0FBQ0csb0JBQW9CO01BQ25ELElBQ0NWLFNBQVMsQ0FBQ1MscUJBQXFCLENBQUMsQ0FDL0I1RSxZQUFZLEVBQ1p5RSxrQkFBa0IsQ0FDbEIsRUFDQTtRQUNELElBQUlELHFCQUFxQixDQUFDekQsU0FBUyxDQUFDNEIsUUFBUSxDQUFDcUIsYUFBYSxDQUFDLEVBQUU7VUFDNURRLHFCQUFxQixDQUFDekQsU0FBUyxDQUFDaUIsR0FBRyxDQUFDTCxxQkFBcUIsQ0FBQztRQUMzRCxDQUFDLE1BQU0sSUFBSSxDQUFDL0MsU0FBUyxDQUFDNkMsb0JBQW9CLENBQUMsRUFBRTtVQUM1QytDLHFCQUFxQixDQUFDekQsU0FBUyxDQUFDaUIsR0FBRyxDQUFDTCxxQkFBcUIsQ0FBQztRQUMzRDtNQUNEO0lBQ0QsQ0FBQyxDQUFDO0VBQ0g7RUFFQSxNQUFNSixZQUFZLEdBQUc5QyxRQUFRLENBQUNxRyxhQUFhLENBQUMsR0FBRyxHQUFHZCxhQUFhLENBQUM7RUFDaEUsSUFBSSxJQUFJLEtBQUt6QyxZQUFZLEVBQUU7SUFDMUI7SUFDQSxNQUFNd0QsYUFBYSxHQUFHcEUsUUFBUSxDQUFDWSxZQUFZLENBQUNtRCxPQUFPLENBQUNLLGFBQWEsQ0FBQyxJQUFJLENBQUM7SUFDdkUsTUFBTUMsY0FBYyxHQUNuQixDQUFDckUsUUFBUSxDQUFDWSxZQUFZLENBQUNtRCxPQUFPLENBQUNNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO0lBQzFEO0lBQ0EsTUFBTXhELGNBQWMsR0FBR3VELGFBQWEsR0FBR0MsY0FBYztJQUNyRDtJQUNBeEMsWUFBWSxDQUNYakIsWUFBWSxFQUNaQyxjQUFjLEVBQ2RDLG9CQUFvQixFQUNwQkMsaUJBQWlCLEVBQ2pCZSxpQkFBaUIsRUFDakJkLHFCQUFxQixDQUNyQjtFQUNGOztFQUVBO0VBQ0EsTUFBTXNELFlBQVksR0FBR3hHLFFBQVEsQ0FBQ29ELGdCQUFnQixDQUM3QyxHQUFHLEdBQUdvQyxlQUFlLEdBQUcsU0FBUyxHQUFHRCxhQUFhLEdBQUcsSUFBSSxDQUN4RDtFQUNELElBQUksQ0FBQyxHQUFHaUIsWUFBWSxDQUFDbkQsTUFBTSxFQUFFO0lBQzVCbUQsWUFBWSxDQUFDakUsT0FBTyxDQUFDLFVBQVVrRSxjQUFjLEVBQUU7TUFDOUN0QyxnQkFBZ0IsQ0FBQ3NDLGNBQWMsQ0FBQztJQUNqQyxDQUFDLENBQUM7RUFDSDtBQUNELENBQUMsQ0FBQyIsImZpbGUiOiJ3cC1tZXNzYWdlLWluc2VydGVyLXBsdWdpbi1mcm9udC1lbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFNldHMgY29va2llc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBkYXlzXG4gKi9cbmZ1bmN0aW9uIHNldENvb2tpZShuYW1lLCB2YWx1ZSwgZGF5cykge1xuXHRjb25zdCBkID0gbmV3IERhdGUoKTtcblx0ZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgODY0MDAwMDAgKiBkYXlzKTtcblx0ZG9jdW1lbnQuY29va2llID0gbmFtZSArICc9JyArIHZhbHVlICsgJztwYXRoPS87ZXhwaXJlcz0nICsgZC50b0dNVFN0cmluZygpO1xufVxuXG4vKipcbiAqIFJlYWRzIGNvb2tpZXNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICovXG5mdW5jdGlvbiBnZXRDb29raWUobmFtZSkge1xuXHRjb25zdCB2YWx1ZSA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaCgnKF58OykgPycgKyBuYW1lICsgJz0oW147XSopKDt8JCknKTtcblx0cmV0dXJuIHZhbHVlID8gdmFsdWVbMl0gOiBudWxsO1xufVxuXG4vKipcbiAqIEFsbG93IG91ciB0aGVtZSBvciBvdGhlciBwbHVnaW5zIHRvIGNyZWF0ZSBhbmFseXRpY3MgdHJhY2tpbmcgZXZlbnRzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9ICB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gIGNhdGVnb3J5XG4gKiBAcGFyYW0ge3N0cmluZ30gIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9ICBsYWJlbFxuICogQHBhcmFtIHtBcnJheX0gICB2YWx1ZVxuICogQHBhcmFtIHtib29sZWFufSBub25JbnRlcmFjdGlvblxuICovXG5mdW5jdGlvbiBhbmFseXRpY3NUcmFja2luZ0V2ZW50KFxuXHR0eXBlLFxuXHRjYXRlZ29yeSxcblx0YWN0aW9uLFxuXHRsYWJlbCxcblx0dmFsdWUsXG5cdG5vbkludGVyYWN0aW9uXG4pIHtcblx0aWYgKHR5cGVvZiB3cCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRjYXRlZ29yeSA9XG5cdFx0XHQnU2l0ZSBNZXNzYWdlOiAnICtcblx0XHRcdGNhdGVnb3J5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICtcblx0XHRcdGNhdGVnb3J5LnNsaWNlKDEpO1xuXHRcdHdwLmhvb2tzLmRvQWN0aW9uKFxuXHRcdFx0J3dwTWVzc2FnZUluc2VydGVyQW5hbHl0aWNzRXZlbnQnLFxuXHRcdFx0dHlwZSxcblx0XHRcdGNhdGVnb3J5LFxuXHRcdFx0YWN0aW9uLFxuXHRcdFx0bGFiZWwsXG5cdFx0XHR2YWx1ZSxcblx0XHRcdG5vbkludGVyYWN0aW9uXG5cdFx0KTtcblx0fVxufVxuXG4vKipcbiAqIEFsbG93IG91ciB0aGVtZSBvciBvdGhlciBwbHVnaW5zIHRvIHNlbmQgZGF0YSB0byB0aGUgZGF0YUxheWVyIG9iamVjdCBmb3IgR29vZ2xlIFRhZyBNYW5hZ2VyXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VSZWdpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlSWRcbiAqL1xuZnVuY3Rpb24gZGF0YUxheWVyRXZlbnQobWVzc2FnZVJlZ2lvbiwgbWVzc2FnZUlkKSB7XG5cdGlmICh0eXBlb2Ygd3AgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0bGV0IGRhdGFMYXllckNvbnRlbnQgPSB7XG5cdFx0XHQnbWVzc2FnZVJlZ2lvbic6IG1lc3NhZ2VSZWdpb24sXG5cdFx0XHQnbWVzc2FnZUlkJzogbWVzc2FnZUlkLFxuXHRcdFx0J2Zvcm1JZCc6IGZvcm1JZFxuXHRcdH07XG5cdFx0d3AuaG9va3MuZG9BY3Rpb24oJ3dwTWVzc2FnZUluc2VydGVyRGF0YUxheWVyRXZlbnQnLCBkYXRhTGF5ZXJDb250ZW50KTtcblx0fVxufVxuXG4vKipcbiAqIEZhdXggXCJTZXNzaW9uXCIgY2hlY2tpbmcvc2V0dGluZy5cbiAqXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGN1cnJlbnRDb3VudFxuICovXG5mdW5jdGlvbiBzZXRDdXJyZW50Q291bnQoKSB7XG5cdC8vIFRpbWVzdGFtcCBzdG9yZWQgb24gdGhlIGNvb2tpZVxuXHRsZXQgY3VycmVudENvdW50ID0gZ2V0Q29va2llKCdjb3VudCcpO1xuXHRjb25zdCB0aW1lc3RhbXAgPSBNYXRoLmZsb29yKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMCk7XG5cdGNvbnN0IGNvb2tpZUV4cGlyYXRpb24gPSAzMDsgLy8gZXhwaXJlIHRoZSBjb29rZSBpbiAzMCBkYXlzXG5cdGlmICghZ2V0Q29va2llKCdjb3VudCcpKSB7XG5cdFx0Ly8gRmlyc3QgVmlzaXQgLSBzZXQgY291bnQgdG8gMVxuXHRcdHNldENvb2tpZSgnY291bnQnLCAxLCBjb29raWVFeHBpcmF0aW9uKTtcblx0XHQvLyBTZXQgYSB0aW1lY2hlY2sgY29va2llIGZvciBhbiBob3VyIGZyb20gbm93XG5cdFx0c2V0Q29va2llKCd0aW1lY2hlY2snLCB0aW1lc3RhbXAgKyAzNjAwLCBjb29raWVFeHBpcmF0aW9uKTtcblx0fSBlbHNlIGlmICh0aW1lc3RhbXAgPiBnZXRDb29raWUoJ3RpbWVjaGVjaycpKSB7XG5cdFx0Ly8gVXBkYXRlIFRpbWVjaGVjayB0byBuZXcgdmFsdWVcblx0XHRzZXRDb29raWUoJ3RpbWVjaGVjaycsIHRpbWVzdGFtcCArIDM2MDAsIGNvb2tpZUV4cGlyYXRpb24pO1xuXHRcdC8vIENvdW50IGV4aXN0cyBhbHJlYWR5IGFuZCBpdCBoYXMgYmVlbiBhbiBob3VyLiBVcGRhdGUgY291bnRcblx0XHRzZXRDb29raWUoJ2NvdW50JywgKytjdXJyZW50Q291bnQsIGNvb2tpZUV4cGlyYXRpb24pO1xuXHR9XG5cdGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cdGlmICh1cmxQYXJhbXMuZ2V0KCdjb3VudCcpICE9PSBudWxsKSB7XG5cdFx0Y3VycmVudENvdW50ID0gcGFyc2VJbnQodXJsUGFyYW1zLmdldCgnY291bnQnKSk7XG5cdH1cblx0cmV0dXJuIGN1cnJlbnRDb3VudDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIFdvcmRQcmVzcyBwb3N0IElEIGZvciBhIGdpdmVuIHBvcHVwLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBtZXNzYWdlXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHBvc3RJZFxuICovXG5mdW5jdGlvbiBnZXRQb3N0SWQobWVzc2FnZSkge1xuXHRsZXQgcG9zdElkID0gMDtcblx0bWVzc2FnZS5jbGFzc0xpc3QuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRpZiAoMCA8IHZhbHVlLmluZGV4T2YoJ21lc3NhZ2UtaWQnKSkge1xuXHRcdFx0cG9zdElkID0gdmFsdWUuc3Vic3RyaW5nKHZhbHVlLmxhc3RJbmRleE9mKCctJykgKyAxKTtcblx0XHRcdHJldHVybiBwb3N0SWQ7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHBvc3RJZDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHJlZ2lvbiBmb3IgYSBnaXZlbiBtZXNzYWdlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBtZXNzYWdlXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHJlZ2lvblxuICovXG5mdW5jdGlvbiBnZXRNZXNzYWdlUmVnaW9uKG1lc3NhZ2UpIHtcblx0bGV0IHJlZ2lvbiA9ICcnO1xuXHRtZXNzYWdlLmNsYXNzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdGlmICgwIDwgdmFsdWUuaW5kZXhPZignbWVzc2FnZS1yZWdpb24nKSkge1xuXHRcdFx0cmVnaW9uID0gdmFsdWUuc3Vic3RyaW5nKHZhbHVlLmxhc3RJbmRleE9mKCctJykgKyAxKTtcblx0XHRcdHJldHVybiByZWdpb247XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHJlZ2lvbjtcbn1cblxuLyoqXG4gKiBTaG93IGEgc3BlY2lmaWMgcG9wdXAuIFNldHMgYSBjb29raWUgYW5kIGFkZHMgYSB2aXNpYmlsaXR5IGNsYXNzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwb3B1cE1lc3NhZ2VcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb29raWVEYXlUb3RhbFxuICogQHBhcmFtIHtzdHJpbmd9IHBvcHVwU2hvd25Db29raWVOYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9wdXBWaXNpYmxlQ2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWxpZGF0ZWRTZXNzaW9uQ2xhc3NcbiAqL1xuZnVuY3Rpb24gc2hvd1BvcHVwKFxuXHRwb3B1cE1lc3NhZ2UsXG5cdGNvb2tpZURheVRvdGFsLFxuXHRwb3B1cFNob3duQ29va2llTmFtZSxcblx0cG9wdXBWaXNpYmxlQ2xhc3MsXG5cdHZhbGlkYXRlZFNlc3Npb25DbGFzc1xuKSB7XG5cdHNldENvb2tpZShwb3B1cFNob3duQ29va2llTmFtZSwgJ3RydWUnLCBjb29raWVEYXlUb3RhbCk7XG5cdGNvbnN0IHZhbGlkYXRlZEl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcblx0XHQnLicgKyB2YWxpZGF0ZWRTZXNzaW9uQ2xhc3Ncblx0KTtcblx0aWYgKDAgPCB2YWxpZGF0ZWRJdGVtcy5sZW5ndGgpIHtcblx0XHR2YWxpZGF0ZWRJdGVtcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWxpZGF0ZWRNZXNzYWdlKSB7XG5cdFx0XHR2YWxpZGF0ZWRNZXNzYWdlLmNsYXNzTGlzdC5hZGQocG9wdXBWaXNpYmxlQ2xhc3MpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHBvcHVwTWVzc2FnZS5jbGFzc0xpc3QuYWRkKHBvcHVwVmlzaWJsZUNsYXNzKTtcblx0fVxufVxuXG4vKipcbiAqIFNob3cgYSBzcGVjaWZpYyBwb3B1cC4gU2V0cyBhIGNvb2tpZSBhbmQgYWRkcyBhIHZpc2liaWxpdHkgY2xhc3MuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBvcHVwTWVzc2FnZVxuICogQHBhcmFtIHtzdHJpbmd9IHBvcHVwVmlzaWJsZUNsYXNzXG4gKiBAcGFyYW0ge09iamVjdH0gbGFzdEZvY3VzXG4gKiBAcGFyYW0ge3N0cmluZ30gY2xvc2VUcmlnZ2VyXG4gKi9cbmZ1bmN0aW9uIGhpZGVQb3B1cChwb3B1cE1lc3NhZ2UsIHBvcHVwVmlzaWJsZUNsYXNzLCBsYXN0Rm9jdXMsIGNsb3NlVHJpZ2dlcikge1xuXHRsYXN0Rm9jdXMuZm9jdXMoKTtcblx0cG9wdXBNZXNzYWdlLmNsYXNzTGlzdC5yZW1vdmUocG9wdXBWaXNpYmxlQ2xhc3MpO1xuXHRjb25zdCBwb3B1cElkID0gZ2V0UG9zdElkKHBvcHVwTWVzc2FnZSk7XG5cdGNvbnN0IG1lc3NhZ2VSZWdpb24gPSAnUG9wdXAnO1xuXHRpZiAoMCAhPT0gcG9wdXBJZCkge1xuXHRcdGFuYWx5dGljc1RyYWNraW5nRXZlbnQoXG5cdFx0XHQnZXZlbnQnLFxuXHRcdFx0bWVzc2FnZVJlZ2lvbixcblx0XHRcdGNsb3NlVHJpZ2dlcixcblx0XHRcdHBvcHVwSWQsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHQxXG5cdFx0KTtcblx0XHRkYXRhTGF5ZXJFdmVudChtZXNzYWdlUmVnaW9uKTtcblx0fVxufVxuXG4vKipcbiAqIERpc3BsYXkgYW5kIGNvbnRyb2xzIGZvciBwb3B1cHNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcG9wdXBNZXNzYWdlXG4gKiBAcGFyYW0ge251bWJlcn0gY29va2llRGF5VG90YWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBwb3B1cFNob3duQ29va2llTmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHBvcHVwVmlzaWJsZUNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hlY2tTZXNzaW9uQ2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWxpZGF0ZWRTZXNzaW9uQ2xhc3NcbiAqL1xuZnVuY3Rpb24gcG9wdXBEaXNwbGF5KFxuXHRwb3B1cE1lc3NhZ2UsXG5cdGNvb2tpZURheVRvdGFsLFxuXHRwb3B1cFNob3duQ29va2llTmFtZSxcblx0cG9wdXBWaXNpYmxlQ2xhc3MsXG5cdGNoZWNrU2Vzc2lvbkNsYXNzLFxuXHR2YWxpZGF0ZWRTZXNzaW9uQ2xhc3Ncbikge1xuXHRjb25zdCBsYXN0Rm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50OyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cdC8vIENoZWNrIGlmIHdlIHNob3VsZCBiZSBzaG93aW5nIHRoZSBwb3B1cFxuXHRpZiAoXG5cdFx0J3RydWUnICE9PSBnZXRDb29raWUocG9wdXBTaG93bkNvb2tpZU5hbWUpICYmXG5cdFx0KCFwb3B1cE1lc3NhZ2UuY2xhc3NMaXN0LmNvbnRhaW5zKGNoZWNrU2Vzc2lvbkNsYXNzKSB8fFxuXHRcdFx0cG9wdXBNZXNzYWdlLmNsYXNzTGlzdC5jb250YWlucyh2YWxpZGF0ZWRTZXNzaW9uQ2xhc3MpKVxuXHQpIHtcblx0XHQvLyBhY3R1YWxseSBzaG93IHRoZSBwb3B1cFxuXHRcdHNob3dQb3B1cChcblx0XHRcdHBvcHVwTWVzc2FnZSxcblx0XHRcdGNvb2tpZURheVRvdGFsLFxuXHRcdFx0cG9wdXBTaG93bkNvb2tpZU5hbWUsXG5cdFx0XHRwb3B1cFZpc2libGVDbGFzcyxcblx0XHRcdHZhbGlkYXRlZFNlc3Npb25DbGFzc1xuXHRcdCk7XG5cblx0XHQvLyBydW4gbWVzc2FnZUFuYWx5dGljcyBvbiB0aGUgcG9wdXBcblx0XHRtZXNzYWdlQW5hbHl0aWNzKHBvcHVwTWVzc2FnZSk7XG5cblx0XHQvLyAxLiBkZXRlY3QgY2xpY2tzIGluc2lkZSB0aGUgcG9wdXAgdGhhdCBzaG91bGQgY2xvc2UgaXQuXG5cdFx0cG9wdXBNZXNzYWdlLmFkZEV2ZW50TGlzdGVuZXIoXG5cdFx0XHQnY2xpY2snLFxuXHRcdFx0ZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRcdGNvbnN0IGlzQ2xvc2VCdXR0b24gPVxuXHRcdFx0XHRcdGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NtLWNsb3NlLWJ0bicpO1xuXHRcdFx0XHRpZiAodHJ1ZSA9PT0gaXNDbG9zZUJ1dHRvbikge1xuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0aGlkZVBvcHVwKFxuXHRcdFx0XHRcdFx0cG9wdXBNZXNzYWdlLFxuXHRcdFx0XHRcdFx0cG9wdXBWaXNpYmxlQ2xhc3MsXG5cdFx0XHRcdFx0XHRsYXN0Rm9jdXMsXG5cdFx0XHRcdFx0XHQnQ2xvc2UgQnV0dG9uJ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHR0cnVlXG5cdFx0KTtcblxuXHRcdC8vIDIuIGRldGVjdCBjbGlja3Mgb3V0c2lkZSB0aGUgcG9wdXAuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZ0KSA9PiB7XG5cdFx0XHRsZXQgdGFyZ2V0RWxlbWVudCA9IGV2dC50YXJnZXQ7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdGlmICh0YXJnZXRFbGVtZW50ID09PSBwb3B1cE1lc3NhZ2UpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gR28gdXAgdGhlIERPTVxuXHRcdFx0XHR0YXJnZXRFbGVtZW50ID0gdGFyZ2V0RWxlbWVudC5wYXJlbnROb2RlO1xuXHRcdFx0fSB3aGlsZSAodGFyZ2V0RWxlbWVudCk7XG5cdFx0XHQvLyBUaGlzIGlzIGEgY2xpY2sgb3V0c2lkZS5cblx0XHRcdGhpZGVQb3B1cChcblx0XHRcdFx0cG9wdXBNZXNzYWdlLFxuXHRcdFx0XHRwb3B1cFZpc2libGVDbGFzcyxcblx0XHRcdFx0bGFzdEZvY3VzLFxuXHRcdFx0XHQnQ2xpY2sgT3V0c2lkZSB0byBDbG9zZSdcblx0XHRcdCk7XG5cdFx0fSk7XG5cblx0XHQvLyAzLiBkZXRlY3QgZXNjYXBlIGtleSBwcmVzc1xuXHRcdGRvY3VtZW50Lm9ua2V5ZG93biA9IGZ1bmN0aW9uIChldnQpIHtcblx0XHRcdGV2dCA9IGV2dCB8fCB3aW5kb3cuZXZlbnQ7XG5cdFx0XHRsZXQgaXNFc2NhcGUgPSBmYWxzZTtcblx0XHRcdGlmICgna2V5JyBpbiBldnQpIHtcblx0XHRcdFx0aXNFc2NhcGUgPSBldnQua2V5ID09PSAnRXNjYXBlJyB8fCBldnQua2V5ID09PSAnRXNjJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlzRXNjYXBlID0gZXZ0LmtleUNvZGUgPT09IDI3O1xuXHRcdFx0fVxuXHRcdFx0aWYgKGlzRXNjYXBlKSB7XG5cdFx0XHRcdGhpZGVQb3B1cChcblx0XHRcdFx0XHRwb3B1cE1lc3NhZ2UsXG5cdFx0XHRcdFx0cG9wdXBWaXNpYmxlQ2xhc3MsXG5cdFx0XHRcdFx0bGFzdEZvY3VzLFxuXHRcdFx0XHRcdCdFc2NhcGUgS2V5J1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0gLy8gZW5kIG9mIGlmIHN0YXRlbWVudCBmb3IgdGhlIGNvbmRpdGlvbmFsIHRvIHNob3cgdGhpcyBwb3B1cC5cbn1cblxuLyoqXG4gKiBTZXQgdXAgZ29vZ2xlIGFuYWx5dGljcyBldmVudHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG1lc3NhZ2VcbiAqL1xuZnVuY3Rpb24gbWVzc2FnZUFuYWx5dGljcyhtZXNzYWdlKSB7XG5cdGNvbnN0IG1lc3NhZ2VSZWdpb24gPSBnZXRNZXNzYWdlUmVnaW9uKG1lc3NhZ2UpO1xuXHRjb25zdCBtZXNzYWdlSWQgPSBnZXRQb3N0SWQobWVzc2FnZSk7XG5cdGNvbnN0IG1lc3NhZ2VEaXNwbGF5ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobWVzc2FnZSwgbnVsbCkuZGlzcGxheTtcblx0Ly8gdGVsbCBhbmFseXRpY3MgaWYgYSBtZXNzYWdlIGlzIGJlaW5nIGRpc3BsYXllZFxuXHRpZiAoJ25vbmUnICE9PSBtZXNzYWdlRGlzcGxheSkge1xuXHRcdGFuYWx5dGljc1RyYWNraW5nRXZlbnQoXG5cdFx0XHQnZXZlbnQnLFxuXHRcdFx0bWVzc2FnZVJlZ2lvbixcblx0XHRcdCdTaG93Jyxcblx0XHRcdG1lc3NhZ2VJZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdDFcblx0XHQpO1xuXHRcdGRhdGFMYXllckV2ZW50KG1lc3NhZ2VSZWdpb24sIG1lc3NhZ2VJZCk7XG5cdFx0Ly8gY2xpY2sgdHJhY2tlciBmb3IgYW5hbHl0aWNzIGV2ZW50c1xuXHRcdG1lc3NhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcblx0XHRcdCdjbGljaycsXG5cdFx0XHRmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdFx0Ly8gMS4gaXMgaXQgYSBsb2dpbiBsaW5rIG9yIGNsb3NlIGJ1dHRvbj9cblx0XHRcdFx0Ly8gdGhlIGNsb3NlIGV2ZW50IHdpbGwgaGF2ZSBhbHJlYWR5IGJlZW4gdHJhY2tlZCBieSB0aGUgaGlkZVBvcHVwIG1ldGhvZC5cblx0XHRcdFx0Y29uc3QgaXNMb2dpbkNsaWNrID1cblx0XHRcdFx0XHRldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtZXNzYWdlLWxvZ2luJyk7XG5cdFx0XHRcdGNvbnN0IGlzQ2xvc2VCdXR0b24gPVxuXHRcdFx0XHRcdGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NtLWNsb3NlLWJ0bicpO1xuXHRcdFx0XHRpZiAodHJ1ZSA9PT0gaXNMb2dpbkNsaWNrKSB7XG5cdFx0XHRcdFx0Y29uc3QgdXJsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XG5cdFx0XHRcdFx0YW5hbHl0aWNzVHJhY2tpbmdFdmVudChcblx0XHRcdFx0XHRcdCdldmVudCcsXG5cdFx0XHRcdFx0XHRtZXNzYWdlUmVnaW9uLFxuXHRcdFx0XHRcdFx0J0xvZ2luIExpbmsnLFxuXHRcdFx0XHRcdFx0dXJsXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRkYXRhTGF5ZXJFdmVudChtZXNzYWdlUmVnaW9uLCBtZXNzYWdlSWQpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGZhbHNlID09PSBpc0Nsb3NlQnV0dG9uKSB7XG5cdFx0XHRcdFx0Ly8gMi4gb3RoZXIgbGlua3Ncblx0XHRcdFx0XHRhbmFseXRpY3NUcmFja2luZ0V2ZW50KFxuXHRcdFx0XHRcdFx0J2V2ZW50Jyxcblx0XHRcdFx0XHRcdG1lc3NhZ2VSZWdpb24sXG5cdFx0XHRcdFx0XHQnQ2xpY2snLFxuXHRcdFx0XHRcdFx0bWVzc2FnZUlkXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRkYXRhTGF5ZXJFdmVudChtZXNzYWdlUmVnaW9uLCBtZXNzYWdlSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0dHJ1ZVxuXHRcdCk7XG5cdH1cbn1cblxuLyoqXG4gKiBXaGVuIHRoZSBkb2N1bWVudCBpcyBsb2FkZWQsIHNldCB1cCBzZXNzaW9uIHRyYWNraW5nIGFuZCBwb3B1cCBkaXNwbGF5XG4gKlxuICovXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuXHRjb25zdCBwb3B1cFNlbGVjdG9yID0gJ3dwLW1lc3NhZ2UtaW5zZXJ0ZXItbWVzc2FnZS1yZWdpb24tcG9wdXAnO1xuXHRjb25zdCBwb3B1cFNob3duQ29va2llTmFtZSA9ICdzbS1zaG93bic7XG5cdGNvbnN0IHBvcHVwVmlzaWJsZUNsYXNzID0gJ3dwLW1lc3NhZ2UtaW5zZXJ0ZXItbWVzc2FnZS1wb3B1cC12aXNpYmxlJztcblx0Y29uc3QgY2hlY2tTZXNzaW9uQ2xhc3MgPSAnY2hlY2stc2Vzc2lvbi1tZXNzYWdlJztcblx0Y29uc3QgbWVzc2FnZVNlbGVjdG9yID0gJ3dwLW1lc3NhZ2UtaW5zZXJ0ZXItbWVzc2FnZSc7XG5cdGNvbnN0IHZhbGlkYXRlZFNlc3Npb25DbGFzcyA9ICd2YWxpZGF0ZWQnO1xuXHRjb25zdCBjaGVja1Nlc3Npb25JdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG5cdFx0Jy4nICsgY2hlY2tTZXNzaW9uQ2xhc3Ncblx0KTtcblx0aWYgKDAgPCBjaGVja1Nlc3Npb25JdGVtcy5sZW5ndGgpIHtcblx0XHQvLyBnZXQgdGhlIGN1cnJlbnQgY291bnQgb2Ygc2Vzc2lvbnMgYW5kIHNldCB0aGUgb3BlcmF0b3JzIGZvciBjb21wYXJpc29uXG5cdFx0Y29uc3QgY3VycmVudENvdW50ID0gc2V0Q3VycmVudENvdW50KCk7XG5cdFx0Y29uc3Qgb3BlcmF0b3JzID0ge1xuXHRcdFx0Z3QoYSwgYikge1xuXHRcdFx0XHRyZXR1cm4gYSA+PSBiO1xuXHRcdFx0fSxcblx0XHRcdGx0KGEsIGIpIHtcblx0XHRcdFx0cmV0dXJuIGEgPD0gYjtcblx0XHRcdH0sXG5cdFx0fTtcblxuXHRcdC8vIGhhbmRsZSBtZXNzYWdlcyB0aGF0IGFyZSBzZXNzaW9uLWRlcGVuZGVudFxuXHRcdGNoZWNrU2Vzc2lvbkl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGN1cnJlbnRTZXNzaW9uTWVzc2FnZSkge1xuXHRcdFx0Y29uc3QgYmFubmVyU2Vzc2lvbkNvdW50ID0gcGFyc2VJbnQoXG5cdFx0XHRcdGN1cnJlbnRTZXNzaW9uTWVzc2FnZS5kYXRhc2V0LnNlc3Npb25Db3VudFRvQ2hlY2tcblx0XHRcdCk7XG5cdFx0XHRjb25zdCBiYW5uZXJTZXNzaW9uT3BlcmF0b3IgPVxuXHRcdFx0XHRjdXJyZW50U2Vzc2lvbk1lc3NhZ2UuZGF0YXNldC5zZXNzaW9uQ291bnRPcGVyYXRvcjtcblx0XHRcdGlmIChcblx0XHRcdFx0b3BlcmF0b3JzW2Jhbm5lclNlc3Npb25PcGVyYXRvcl0oXG5cdFx0XHRcdFx0Y3VycmVudENvdW50LFxuXHRcdFx0XHRcdGJhbm5lclNlc3Npb25Db3VudFxuXHRcdFx0XHQpXG5cdFx0XHQpIHtcblx0XHRcdFx0aWYgKGN1cnJlbnRTZXNzaW9uTWVzc2FnZS5jbGFzc0xpc3QuY29udGFpbnMocG9wdXBTZWxlY3RvcikpIHtcblx0XHRcdFx0XHRjdXJyZW50U2Vzc2lvbk1lc3NhZ2UuY2xhc3NMaXN0LmFkZCh2YWxpZGF0ZWRTZXNzaW9uQ2xhc3MpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCFnZXRDb29raWUocG9wdXBTaG93bkNvb2tpZU5hbWUpKSB7XG5cdFx0XHRcdFx0Y3VycmVudFNlc3Npb25NZXNzYWdlLmNsYXNzTGlzdC5hZGQodmFsaWRhdGVkU2Vzc2lvbkNsYXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Y29uc3QgcG9wdXBNZXNzYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBwb3B1cFNlbGVjdG9yKTtcblx0aWYgKG51bGwgIT09IHBvcHVwTWVzc2FnZSkge1xuXHRcdC8vIGdldCBvdXIgdmFsdWUgZm9yIGRheXMgYW5kIGhvdXJzIHRvIHNldCBjb29raWVcblx0XHRjb25zdCBjbG9zZVRpbWVEYXlzID0gcGFyc2VJbnQocG9wdXBNZXNzYWdlLmRhdGFzZXQuY2xvc2VUaW1lRGF5cykgfHwgMDtcblx0XHRjb25zdCBjbG9zZVRpbWVIb3VycyA9XG5cdFx0XHQocGFyc2VJbnQocG9wdXBNZXNzYWdlLmRhdGFzZXQuY2xvc2VUaW1lSG91cnMpIHx8IDApIC8gMjQ7XG5cdFx0Ly8gT3VyIFRvdGFsIGZvciB3aGVuIHRoZSBjb29raWUgc2hvdWxkIGV4cGlyZSBhbmQgc2hvdyB0aGUgYmFubmVyIGFnYWluXG5cdFx0Y29uc3QgY29va2llRGF5VG90YWwgPSBjbG9zZVRpbWVEYXlzICsgY2xvc2VUaW1lSG91cnM7XG5cdFx0Ly8gZGV0ZXJtaW5lcyB3aGV0aGVyIHRvIGRpc3BsYXkgYSBwb3B1cFxuXHRcdHBvcHVwRGlzcGxheShcblx0XHRcdHBvcHVwTWVzc2FnZSxcblx0XHRcdGNvb2tpZURheVRvdGFsLFxuXHRcdFx0cG9wdXBTaG93bkNvb2tpZU5hbWUsXG5cdFx0XHRwb3B1cFZpc2libGVDbGFzcyxcblx0XHRcdGNoZWNrU2Vzc2lvbkNsYXNzLFxuXHRcdFx0dmFsaWRhdGVkU2Vzc2lvbkNsYXNzXG5cdFx0KTtcblx0fVxuXG5cdC8vIGFuYWx5dGljcyBldmVudHMgZm9yIGFueSBraW5kIG9mIG1lc3NhZ2UgdGhhdCBpcyBkaXNwbGF5ZWRcblx0Y29uc3QgbWVzc2FnZUl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcblx0XHQnLicgKyBtZXNzYWdlU2VsZWN0b3IgKyAnOm5vdCggLicgKyBwb3B1cFNlbGVjdG9yICsgJyApJ1xuXHQpO1xuXHRpZiAoMCA8IG1lc3NhZ2VJdGVtcy5sZW5ndGgpIHtcblx0XHRtZXNzYWdlSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudE1lc3NhZ2UpIHtcblx0XHRcdG1lc3NhZ2VBbmFseXRpY3MoY3VycmVudE1lc3NhZ2UpO1xuXHRcdH0pO1xuXHR9XG59KTtcbiJdfQ==
