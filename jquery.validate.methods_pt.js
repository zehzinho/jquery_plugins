/*
 * Localized default methods for the jQuery validation plugin.
 * Locale: PT_BR
 */
jQuery.extend(jQuery.validator.methods, {
	date: function(value, element) {
		if (this.optional(element)) {
      return true;
    }
    
    if (/^\d\d?\/\d\d?\/\d\d\d?\d?$/.test(value)) {
      value = value.split('/');
      value[0] = parseInt(value[0]);
      value[1] = parseInt(value[1]);
      value[2] = parseInt(value[2]);
      
      return value[0] > 0 && value[0] <= 31 && value[1] > 0 && value[1] <= 12;
    }

    return false;
	}
});