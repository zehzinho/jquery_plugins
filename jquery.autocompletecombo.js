/*
 * jQuery Autocompletecombo plug-in (beta)
 *
 * http://github.com/zehzinho/JQuery-Plugins/tree/
 *
 * Copyright (c) 2010 José Ricardo da Silva
 *
 * Licensed under the GPL license:
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($) {
  $.autocompleterCombo = {
    messages : {
      deleteItemLabel: 'delete',
      noItemsSelectedMsg: 'No items selected.'
    }
  };
  
  $.extend($.fn, {
    autocompletecombo: function (settings) {

      // if nothing is selected, return nothing
      if (!this.length) {
        return;
      }

      autocompleterCombo = $.autocompleterCombo;

      function appendItem(ui, options) {
        var containerSelector = '#' + itemsHolderId.replace('.', '\\.') + ' tbody';

        var displayCell = '<td>';
        var otherCells = '';

        var afterAppendCallbacks = [];

        for(var i=0; i < options.fields.length; i++) {
          var field =  {
            fieldId: '',
            type: 'label',
            name: '',
            classes: '',
            afterAppendCallback: '',
            value: '',
            valueWhenLoading: '',
            defaultValue: '',
            header: '',
            inDisplayCell: false,
            maxLength: 0
          };

          $.extend(field, options.fields[i]);

          var name = field.name.replace('#id',ui.item.id);
          var fieldId = 'jquery-autocompletecombo-' + options.id + '-' + field.fieldId + '-' + ui.item.id;

          if (field.valueWhenLoading != '' && objHasProperty(ui.item.original, field.valueWhenLoading) != false) {
            var evalValue = 'ui.item.original.' + field.valueWhenLoading;
            field.value = eval(evalValue);
          }
          else if (field.value != '' && objHasProperty(ui.item.original, field.value) != false) {
            evalValue = 'ui.item.original.' + field.value;
            field.value = eval(evalValue);
          }
          else {
            field.value = field.defaultValue;
          }

          var newCell = '';

          if (field.type == 'text') {
            var maxLength = '';

            if (field.maxLength > 0) {
              maxLength = 'maxlength="' + field.maxLength + '"';
            }

            newCell += '<input id="' + fieldId + '" type="text" name="' + name + '" value="' + field.value + '" class="' + field.classes +  '" ' + maxLength + ' />';

          }
          else if (field.type == 'hidden') {
            field.inDisplayCell = true; // all hidden fields go into the displayCell
            newCell += '<input type="hidden" name="' + name + '" value="' + ui.item.id + '" id="' + fieldId + '" />';
          }
          else if (field.type == 'checkbox') {
            newCell += '<input type="checkbox" name="' + name + '" value="' + ui.item.id + '" id="' + fieldId + '" ';

            if (field.value != 0) {
              newCell += ' checked="checked" ';
            }
          
            newCell += '/>';
          }
          else if (field.type == 'label') {
            // the default is to only display the var
            newCell += '<span class="jquery-autocompletecombo-label">' + field.value + '</span>';
          }

          if(field.inDisplayCell == true) {
            displayCell += newCell;
          }
          else {
            otherCells += '<td>' + newCell + '</td>';
          }

          if (field.afterAppendCallback != '') {
            var callback = field.afterAppendCallback.replace('#id', fieldId).replace('.', '\\\\.');
            afterAppendCallbacks.push(callback);
          }
        }

        if (displayFieldVar == 'label') {
          displayCell += '<span class="jquery-autocompletecombo-label">' + ui.item.label + '</span>';
        }

        $(containerSelector + ' .jquery-autocompletecombo-container-no-items-selected-msg').parent().remove();

        if(options.deleteEnabled) {
          var deleteTrigger = '';
         
          if (options.deleteIcon != '') {
          
          }
          else {
            deleteTrigger = '<span class="jquery-autocompletecombo-delete-trigger">' + options.deleteText + '</span>';
          }

          otherCells += '<td>' + deleteTrigger + '</td>';
        }

        $(containerSelector).append('<tr id="' + fieldId + '-row">' + displayCell + otherCells + '</tr>');

        // callbacks usually can be run only after the field has been appended to the document
        for(var i = 0; i < afterAppendCallbacks.length; i++) {
          var callbackCall = afterAppendCallbacks[i];
          eval(callbackCall);
        }

        searchField.val('');
      }

      $('.jquery-autocompletecombo-delete-trigger').live('click', function (){
        $(this).parent().parent().remove();
      });

      var options = {
        containerClasses: '',
        toLoad: [],
        deleteEnabled: true,
        deleteIcon: '',
        deleteText: autocompleterCombo.messages.deleteItemLabel
      };
    
      if (settings) $.extend(options, settings);

      var searchField = this;
      var itemsHolderId = 'jquery-autocompletecombo-' + options.target + '-container';
      var displayFieldVar = 'label';
    
      var containerSelector = '#' + itemsHolderId.replace('.', '\\.') + ' tbody';

      if ($(containerSelector).length == 0) {

        var containerDefinition = '<table id="' + itemsHolderId + '" class="jquery-autocompletecombo-container ' + options.containerClasses + '"><thead><tr>';

        var numOfColumns = 0;
       
        for(var i=0; i < options.fields.length; i++) {
          if (options.fields[i].header != null) {
            containerDefinition += '<th>' + options.fields[i].header + '</th>';
            numOfColumns++;
          }

          if (options.fields[i].isDisplayField == true) {
            displayFieldVar = options.fields[i].value;
          }
        }

        if(options.deleteEnabled) {
          containerDefinition += '<th></th>';
        }

        containerDefinition += '</tr></thead>';

        containerDefinition += '<tbody>';

        options.toLoad = eval(options.toLoad);

        if (options.toLoad == null) {
          // guaranteeing we can use toLoad.length in the future
          options.toLoad = [];
        }
       
        if (options.toLoad.length == 0) {
          containerDefinition  += '<tr><td colspan="' + numOfColumns + '" class="jquery-autocompletecombo-container-no-items-selected-msg">' + autocompleterCombo.messages.noItemsSelectedMsg + '</td></tr>';
        }

        containerDefinition += '</tbody></table>';

        $('#' + options.target).append(containerDefinition);

        // loading data
        if (options.toLoad.length > 0) {
          for (var i = 0; i < options.toLoad.length; i++) {
            var item = options.toLoad[i];
            var ui = {};
            ui.item = {};
            ui.item.id = eval('item.' + options.id);
            ui.item.label = eval('item.' + options.label);
            ui.item.original = item;
            appendItem(ui, options);
          }
        }
      }
    
      this.autocomplete({
        minLength: 3,
        change: function() {
          searchField.val('');
        },
        source:
        function(req, add){
          //pass request to server
          $.getJSON(options.url, req, function(data) {
            //create array for response objects
            var suggestions = [];

            //process response
            $.each(data, function(i, val){
              var autocompleteItem = new Object();
              var label = 'val.' + options.label;
              var id = 'val.' + options.id;

              autocompleteItem.label = eval(label);
              autocompleteItem.value = eval(label);
              autocompleteItem.id = eval(id);
              autocompleteItem.original = val;
              suggestions.push(autocompleteItem);
            });

            //pass array to callback
            add(suggestions);
          });
        },
        select: function(e, ui) {
          appendItem(ui, options);
        }
      },
      {
        mustMatch: true,
        scrollHeight: 10
      });
    }
  });
})(jQuery);

