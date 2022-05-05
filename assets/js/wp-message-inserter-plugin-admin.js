;(function($) {
"use strict";

/**
 * Show fields associated with the selected message type
 *
 * @param {string} selector the div that holds the radio fields
 */
function showTypeField(selector) {
  var value = $('input[type="radio"]:checked', selector).val();
  $('.cmb2-message-type').hide();
  $('.cmb2-message-type-' + value).show();
}
/**
 * Whether we need the maximum screen width text field or not
 *
 * @param {string} selector the div that holds the checkboxes
 * @param {string} current  the currently checked item
 */


function showHideMaximumScreen(selector, current) {
  if ('undefined' === typeof current) {
    current = $('input[type="checkbox"]:checked', selector);
  }

  if ($('input[type="checkbox"]', selector).is(':checked')) {
    $('input[type="checkbox"]:checked', selector).closest('.cmb-field-list').find('.cmb2-maximum-screen-width').hide();
  } else {
    $('input[type="checkbox"]', selector).closest('.cmb-field-list').find('.cmb2-maximum-screen-width').show();
  }
}
/**
 * Whether we need the custom maximum banner width fields
 *
 * @param {string} value the value of the maximum width <select> field
 */


function showHideMaximumBanner(value) {
  if ('custom' === value) {
    $('.cmb2-custom-maximum-banner-width').show();
  } else {
    $('.cmb2-custom-maximum-banner-width').hide();
  }
}
/**
 * Set up the message admin fields. This runs when a "screen size" gets added to the form
 */


function setupMessage() {
  var typeSelector = $('.cmb2-message-type-selector');
  var noMaxScreenSelector = $('.cmb2-no-maximum-screen-width');
  var maxBannerWidthSelector = '.cmb2-maximum-banner-width select';

  if (typeSelector.length > 0) {
    showTypeField(typeSelector);
    $('input[type="radio"]', typeSelector).on('change', function () {
      showTypeField(typeSelector);
    });
  }

  if (noMaxScreenSelector.length > 0) {
    showHideMaximumScreen(noMaxScreenSelector);
    $('input[type="checkbox"]', noMaxScreenSelector).on('change', function (el) {
      showHideMaximumScreen(noMaxScreenSelector, el);
    });
  }

  if ($(maxBannerWidthSelector).length > 0) {
    showHideMaximumBanner($(maxBannerWidthSelector).val());
    $(document).on('change', maxBannerWidthSelector, function () {
      showHideMaximumBanner($(this).val());
    });
  }

  $('.cmb-type-checkbox:hidden input:checkbox').prop('checked', false);
  $('.cmb-type-select:hidden option:selected').removeAttr('selected');
  $('.cmb-type-text:hidden input[type="text"]').val();
}
/**
 * When "add another screen size" runs, it adds a CMB2 row to the form. Set up the message form.
 */


$(document).on('cmb2_add_row', function () {
  setupMessage();
});
/**
 * When jQuery loads, remove some default WP fields and set up the message form
 */

$(document).ready(function () {
  $('#pageparentdiv label[for=parent_id]').parents('p').eq(0).remove();
  $('#pageparentdiv select#parent_id').remove();
  setupMessage();
});
/**
 * Make the various <select> fields into select2 fields
 */

if (jQuery.fn.select2) {
  $('.cmb2-insertable-message select').select2(); // Before a new group row is added, destroy Select2. We'll reinitialise after the row is added

  $('.cmb-repeatable-group').on('cmb2_add_group_row_start', function (event, instance) {
    var $table = $(document.getElementById($(instance).data('selector')));
    var $oldRow = $table.find('.cmb-repeatable-grouping').last();
    $oldRow.find('.cmb2_select').each(function () {
      $(this).select2('destroy');
    });
  }); // When a new group row is added, clear selection and initialise Select2

  $('.cmb-repeatable-group').on('cmb2_add_row', function (event, newRow) {
    $(newRow).find('.cmb2_select').each(function () {
      $('option:selected', this).removeAttr('selected');
      $(this).select2();
    }); // if it's a custom multiselect cmb2 field, make sure to clear the value because that appears to work differently

    $(newRow).find('.cmb2_multi_select').each(function () {
      $(this).val([]).change();
      $(this).select2('val', '');
    }); // Reinitialise the field we previously destroyed

    $(newRow).prev().find('.cmb2_select').each(function () {
      $(this).select2();
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lc3NhZ2VzLmpzIl0sIm5hbWVzIjpbInNob3dUeXBlRmllbGQiLCJzZWxlY3RvciIsInZhbHVlIiwiJCIsInZhbCIsImhpZGUiLCJzaG93Iiwic2hvd0hpZGVNYXhpbXVtU2NyZWVuIiwiY3VycmVudCIsImlzIiwiY2xvc2VzdCIsImZpbmQiLCJzaG93SGlkZU1heGltdW1CYW5uZXIiLCJzZXR1cE1lc3NhZ2UiLCJ0eXBlU2VsZWN0b3IiLCJub01heFNjcmVlblNlbGVjdG9yIiwibWF4QmFubmVyV2lkdGhTZWxlY3RvciIsImxlbmd0aCIsIm9uIiwiZWwiLCJkb2N1bWVudCIsInByb3AiLCJyZW1vdmVBdHRyIiwicmVhZHkiLCJwYXJlbnRzIiwiZXEiLCJyZW1vdmUiLCJqUXVlcnkiLCJmbiIsInNlbGVjdDIiLCJldmVudCIsImluc3RhbmNlIiwiJHRhYmxlIiwiZ2V0RWxlbWVudEJ5SWQiLCJkYXRhIiwiJG9sZFJvdyIsImxhc3QiLCJlYWNoIiwibmV3Um93IiwiY2hhbmdlIiwicHJldiJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0EsYUFBVCxDQUF1QkMsUUFBdkIsRUFBaUM7RUFDaEMsSUFBTUMsS0FBSyxHQUFHQyxDQUFDLENBQUMsNkJBQUQsRUFBZ0NGLFFBQWhDLENBQUQsQ0FBMkNHLEdBQTNDLEVBQWQ7RUFDQUQsQ0FBQyxDQUFDLG9CQUFELENBQUQsQ0FBd0JFLElBQXhCO0VBQ0FGLENBQUMsQ0FBQyx3QkFBd0JELEtBQXpCLENBQUQsQ0FBaUNJLElBQWpDO0FBQ0E7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFNBQVNDLHFCQUFULENBQStCTixRQUEvQixFQUF5Q08sT0FBekMsRUFBa0Q7RUFDakQsSUFBSSxnQkFBZ0IsT0FBT0EsT0FBM0IsRUFBb0M7SUFDbkNBLE9BQU8sR0FBR0wsQ0FBQyxDQUFDLGdDQUFELEVBQW1DRixRQUFuQyxDQUFYO0VBQ0E7O0VBQ0QsSUFBSUUs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LElBREYsQ0FDTyxvQkFEUCxFQUVFMEIsSUFGRixDQUVPLFlBQVk7TUFDakJsQyxDQUFDLENBQUMsSUFBRCxDQUFELENBQVFDLEdBQVIsQ0FBWSxFQUFaLEVBQWdCbUMsTUFBaEI7TUFDQXBDLENBQUMsQ0FBQyxJQUFELENBQUQsQ0FBUTBCLE9BQVIsQ0FBZ0IsS0FBaEIsRUFBdUIsRUFBdkI7SUFDQSxDQUxGLEVBVHNFLENBZ0J0RTs7SUFDQTFCLENBQUMsQ0FBQ21DLE1BQUQsQ0FBRCxDQUNFRSxJQURGLEdBRUU3QixJQUZGLENBRU8sY0FGUCxFQUdFMEIsSUFIRixDQUdPLFlBQVk7TUFDakJsQyxDQUFDLENBQUMsSUFBRCxDQUFELENBQVEwQixPQUFSO0lBQ0EsQ0FMRjtFQU1BLENBdkJEO0FBd0JBIiwiZmlsZSI6IndwLW1lc3NhZ2UtaW5zZXJ0ZXItcGx1Z2luLWFkbWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTaG93IGZpZWxkcyBhc3NvY2lhdGVkIHdpdGggdGhlIHNlbGVjdGVkIG1lc3NhZ2UgdHlwZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciB0aGUgZGl2IHRoYXQgaG9sZHMgdGhlIHJhZGlvIGZpZWxkc1xuICovXG5mdW5jdGlvbiBzaG93VHlwZUZpZWxkKHNlbGVjdG9yKSB7XG5cdGNvbnN0IHZhbHVlID0gJCgnaW5wdXRbdHlwZT1cInJhZGlvXCJdOmNoZWNrZWQnLCBzZWxlY3RvcikudmFsKCk7XG5cdCQoJy5jbWIyLW1lc3NhZ2UtdHlwZScpLmhpZGUoKTtcblx0JCgnLmNtYjItbWVzc2FnZS10eXBlLScgKyB2YWx1ZSkuc2hvdygpO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgd2UgbmVlZCB0aGUgbWF4aW11bSBzY3JlZW4gd2lkdGggdGV4dCBmaWVsZCBvciBub3RcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgdGhlIGRpdiB0aGF0IGhvbGRzIHRoZSBjaGVja2JveGVzXG4gKiBAcGFyYW0ge3N0cmluZ30gY3VycmVudCAgdGhlIGN1cnJlbnRseSBjaGVja2VkIGl0ZW1cbiAqL1xuZnVuY3Rpb24gc2hvd0hpZGVNYXhpbXVtU2NyZWVuKHNlbGVjdG9yLCBjdXJyZW50KSB7XG5cdGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIGN1cnJlbnQpIHtcblx0XHRjdXJyZW50ID0gJCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdOmNoZWNrZWQnLCBzZWxlY3Rvcik7XG5cdH1cblx0aWYgKCQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScsIHNlbGVjdG9yKS5pcygnOmNoZWNrZWQnKSkge1xuXHRcdCQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXTpjaGVja2VkJywgc2VsZWN0b3IpXG5cdFx0XHQuY2xvc2VzdCgnLmNtYi1maWVsZC1saXN0Jylcblx0XHRcdC5maW5kKCcuY21iMi1tYXhpbXVtLXNjcmVlbi13aWR0aCcpXG5cdFx0XHQuaGlkZSgpO1xuXHR9IGVsc2Uge1xuXHRcdCQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScsIHNlbGVjdG9yKVxuXHRcdFx0LmNsb3Nlc3QoJy5jbWItZmllbGQtbGlzdCcpXG5cdFx0XHQuZmluZCgnLmNtYjItbWF4aW11bS1zY3JlZW4td2lkdGgnKVxuXHRcdFx0LnNob3coKTtcblx0fVxufVxuXG4vKipcbiAqIFdoZXRoZXIgd2UgbmVlZCB0aGUgY3VzdG9tIG1heGltdW0gYmFubmVyIHdpZHRoIGZpZWxkc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0aGUgdmFsdWUgb2YgdGhlIG1heGltdW0gd2lkdGggPHNlbGVjdD4gZmllbGRcbiAqL1xuZnVuY3Rpb24gc2hvd0hpZGVNYXhpbXVtQmFubmVyKHZhbHVlKSB7XG5cdGlmICgnY3VzdG9tJyA9PT0gdmFsdWUpIHtcblx0XHQkKCcuY21iMi1jdXN0b20tbWF4aW11bS1iYW5uZXItd2lkdGgnKS5zaG93KCk7XG5cdH0gZWxzZSB7XG5cdFx0JCgnLmNtYjItY3VzdG9tLW1heGltdW0tYmFubmVyLXdpZHRoJykuaGlkZSgpO1xuXHR9XG59XG5cbi8qKlxuICogU2V0IHVwIHRoZSBtZXNzYWdlIGFkbWluIGZpZWxkcy4gVGhpcyBydW5zIHdoZW4gYSBcInNjcmVlbiBzaXplXCIgZ2V0cyBhZGRlZCB0byB0aGUgZm9ybVxuICovXG5mdW5jdGlvbiBzZXR1cE1lc3NhZ2UoKSB7XG5cdGNvbnN0IHR5cGVTZWxlY3RvciA9ICQoJy5jbWIyLW1lc3NhZ2UtdHlwZS1zZWxlY3RvcicpO1xuXHRjb25zdCBub01heFNjcmVlblNlbGVjdG9yID0gJCgnLmNtYjItbm8tbWF4aW11bS1zY3JlZW4td2lkdGgnKTtcblx0Y29uc3QgbWF4QmFubmVyV2lkdGhTZWxlY3RvciA9ICcuY21iMi1tYXhpbXVtLWJhbm5lci13aWR0aCBzZWxlY3QnO1xuXHRpZiAodHlwZVNlbGVjdG9yLmxlbmd0aCA+IDApIHtcblx0XHRzaG93VHlwZUZpZWxkKHR5cGVTZWxlY3Rvcik7XG5cdFx0JCgnaW5wdXRbdHlwZT1cInJhZGlvXCJdJywgdHlwZVNlbGVjdG9yKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2hvd1R5cGVGaWVsZCh0eXBlU2VsZWN0b3IpO1xuXHRcdH0pO1xuXHR9XG5cdGlmIChub01heFNjcmVlblNlbGVjdG9yLmxlbmd0aCA+IDApIHtcblx0XHRzaG93SGlkZU1heGltdW1TY3JlZW4obm9NYXhTY3JlZW5TZWxlY3Rvcik7XG5cdFx0JCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJywgbm9NYXhTY3JlZW5TZWxlY3Rvcikub24oXG5cdFx0XHQnY2hhbmdlJyxcblx0XHRcdGZ1bmN0aW9uIChlbCkge1xuXHRcdFx0XHRzaG93SGlkZU1heGltdW1TY3JlZW4obm9NYXhTY3JlZW5TZWxlY3RvciwgZWwpO1xuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblx0aWYgKCQobWF4QmFubmVyV2lkdGhTZWxlY3RvcikubGVuZ3RoID4gMCkge1xuXHRcdHNob3dIaWRlTWF4aW11bUJhbm5lcigkKG1heEJhbm5lcldpZHRoU2VsZWN0b3IpLnZhbCgpKTtcblx0XHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgbWF4QmFubmVyV2lkdGhTZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2hvd0hpZGVNYXhpbXVtQmFubmVyKCQodGhpcykudmFsKCkpO1xuXHRcdH0pO1xuXHR9XG5cdCQoJy5jbWItdHlwZS1jaGVja2JveDpoaWRkZW4gaW5wdXQ6Y2hlY2tib3gnKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuXHQkKCcuY21iLXR5cGUtc2VsZWN0OmhpZGRlbiBvcHRpb246c2VsZWN0ZWQnKS5yZW1vdmVBdHRyKCdzZWxlY3RlZCcpO1xuXHQkKCcuY21iLXR5cGUtdGV4dDpoaWRkZW4gaW5wdXRbdHlwZT1cInRleHRcIl0nKS52YWwoKTtcbn1cblxuLyoqXG4gKiBXaGVuIFwiYWRkIGFub3RoZXIgc2NyZWVuIHNpemVcIiBydW5zLCBpdCBhZGRzIGEgQ01CMiByb3cgdG8gdGhlIGZvcm0uIFNldCB1cCB0aGUgbWVzc2FnZSBmb3JtLlxuICovXG4kKGRvY3VtZW50KS5vbignY21iMl9hZGRfcm93JywgZnVuY3Rpb24gKCkge1xuXHRzZXR1cE1lc3NhZ2UoKTtcbn0pO1xuXG4vKipcbiAqIFdoZW4galF1ZXJ5IGxvYWRzLCByZW1vdmUgc29tZSBkZWZhdWx0IFdQIGZpZWxkcyBhbmQgc2V0IHVwIHRoZSBtZXNzYWdlIGZvcm1cbiAqL1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXHQkKCcjcGFnZXBhcmVudGRpdiBsYWJlbFtmb3I9cGFyZW50X2lkXScpLnBhcmVudHMoJ3AnKS5lcSgwKS5yZW1vdmUoKTtcblx0JCgnI3BhZ2VwYXJlbnRkaXYgc2VsZWN0I3BhcmVudF9pZCcpLnJlbW92ZSgpO1xuXHRzZXR1cE1lc3NhZ2UoKTtcbn0pO1xuXG4vKipcbiAqIE1ha2UgdGhlIHZhcmlvdXMgPHNlbGVjdD4gZmllbGRzIGludG8gc2VsZWN0MiBmaWVsZHNcbiAqL1xuaWYgKGpRdWVyeS5mbi5zZWxlY3QyKSB7XG5cdCQoJy5jbWIyLWluc2VydGFibGUtbWVzc2FnZSBzZWxlY3QnKS5zZWxlY3QyKCk7XG5cblx0Ly8gQmVmb3JlIGEgbmV3IGdyb3VwIHJvdyBpcyBhZGRlZCwgZGVzdHJveSBTZWxlY3QyLiBXZSdsbCByZWluaXRpYWxpc2UgYWZ0ZXIgdGhlIHJvdyBpcyBhZGRlZFxuXHQkKCcuY21iLXJlcGVhdGFibGUtZ3JvdXAnKS5vbihcblx0XHQnY21iMl9hZGRfZ3JvdXBfcm93X3N0YXJ0Jyxcblx0XHRmdW5jdGlvbiAoZXZlbnQsIGluc3RhbmNlKSB7XG5cdFx0XHRjb25zdCAkdGFibGUgPSAkKFxuXHRcdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgkKGluc3RhbmNlKS5kYXRhKCdzZWxlY3RvcicpKVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0ICRvbGRSb3cgPSAkdGFibGUuZmluZCgnLmNtYi1yZXBlYXRhYmxlLWdyb3VwaW5nJykubGFzdCgpO1xuXG5cdFx0XHQkb2xkUm93LmZpbmQoJy5jbWIyX3NlbGVjdCcpLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQkKHRoaXMpLnNlbGVjdDIoJ2Rlc3Ryb3knKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0KTtcblxuXHQvLyBXaGVuIGEgbmV3IGdyb3VwIHJvdyBpcyBhZGRlZCwgY2xlYXIgc2VsZWN0aW9uIGFuZCBpbml0aWFsaXNlIFNlbGVjdDJcblx0JCgnLmNtYi1yZXBlYXRhYmxlLWdyb3VwJykub24oJ2NtYjJfYWRkX3JvdycsIGZ1bmN0aW9uIChldmVudCwgbmV3Um93KSB7XG5cdFx0JChuZXdSb3cpXG5cdFx0XHQuZmluZCgnLmNtYjJfc2VsZWN0Jylcblx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JCgnb3B0aW9uOnNlbGVjdGVkJywgdGhpcykucmVtb3ZlQXR0cignc2VsZWN0ZWQnKTtcblx0XHRcdFx0JCh0aGlzKS5zZWxlY3QyKCk7XG5cdFx0XHR9KTtcblxuXHRcdC8vIGlmIGl0J3MgYSBjdXN0b20gbXVsdGlzZWxlY3QgY21iMiBmaWVsZCwgbWFrZSBzdXJlIHRvIGNsZWFyIHRoZSB2YWx1ZSBiZWNhdXNlIHRoYXQgYXBwZWFycyB0byB3b3JrIGRpZmZlcmVudGx5XG5cdFx0JChuZXdSb3cpXG5cdFx0XHQuZmluZCgnLmNtYjJfbXVsdGlfc2VsZWN0Jylcblx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JCh0aGlzKS52YWwoW10pLmNoYW5nZSgpO1xuXHRcdFx0XHQkKHRoaXMpLnNlbGVjdDIoJ3ZhbCcsICcnKTtcblx0XHRcdH0pO1xuXG5cdFx0Ly8gUmVpbml0aWFsaXNlIHRoZSBmaWVsZCB3ZSBwcmV2aW91c2x5IGRlc3Ryb3llZFxuXHRcdCQobmV3Um93KVxuXHRcdFx0LnByZXYoKVxuXHRcdFx0LmZpbmQoJy5jbWIyX3NlbGVjdCcpXG5cdFx0XHQuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdCQodGhpcykuc2VsZWN0MigpO1xuXHRcdFx0fSk7XG5cdH0pO1xufVxuIl19
}(jQuery));
