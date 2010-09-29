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

      function objHasProperty(obj, prop) {
        prop = prop.split('.');

        var hasProperty = true;

        var i = 0;

        while (i < prop.length && hasProperty) {
          if (!obj.hasOwnProperty(prop[i])) {
            hasProperty = false;
          }
          else {
            obj = eval('obj.' + prop[i]);
          }

          i++;
        }

        return hasProperty;
      }

      function appendItem(ui, options) {
        var containerSelector = '';

        if (options.layout == 'table')
          containerSelector = '#' + itemsHolderId.replace('.', '\\.') + ' tbody';
        else if (options.layout == 'fluid') {
          containerSelector = '#' + options.target;
        }

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
            maxLength: 0,
            defaultName: '',
            div: ''
          };

          if (options.defaultField) {
            $.extend(field, options.defaultField);
          }

          $.extend(field, options.fields[i]);

          var name = '';

          if (field.name) {
            name = field.name.replace('#id', ui.item.id);
          }
          else if (field.defaultName != '') {
            name = field.defaultName.replace('#id', ui.item.id).replace('#fieldId', field.fieldId);
          }
          else {
            name = field.fieldId + '[]';
          }

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

          if (options.layout == 'fluid') {
            var label = field.fieldId;

            if (field.label)
              label = field.label;

            newCell += '<label for="' + fieldId + '">' + label + '</label>';
          }

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
            newCell += '<input type="checkbox" name="' + name + '" value="' + ui.item.id + '" id="' + fieldId + '"  ';

            if (field.value != 0) {
              newCell += ' checked="checked" ';
            }

            newCell += ' class="' + field.classes + '" ';
            newCell += '/>';
          }
          else if (field.type == 'select') {
            var selectOptions = eval("(" + field.options + ")");

            var select = '<select name="' + name + '" class="' + field.classes + '">';

            if (selectOptions.hasOwnProperty('empty')) {
              select += '<option value="">' + selectOptions['empty'] + '</option>';
            }

            for (var key in selectOptions) {
              if (key != 'empty' && selectOptions.hasOwnProperty(key)) {
                select += '<option value="' + key + '" ';

                if (field.value == key) {
                  select += ' selected="selected" ';
                }

                select += '>' + selectOptions[key] + '</option>';
              }
            }

            select += '</select>';

            newCell += select;
          }
          else if (field.type == 'label') {
            // the default is to only display the var
            newCell += '<span id="' + fieldId + '" class="jquery-autocompletecombo-label ' + field.classes + '">' + field.value + '</span>';
          }
          else {
            alert('[jquery.autocompletecombo] Error: Field type not defined. Field: ' + field.fieldId);
          }

          if (options.layout == 'table') {
            if(field.inDisplayCell == true) {
              displayCell += newCell;
            }
            else {
              otherCells += '<td>' + newCell + '</td>';
            }
          }
          else  if (options.layout == 'fluid') {
            otherCells += '<div class="jquery-autocompletecombo-fluid-cell ' + field.div + '">' + newCell + '</div>';
          }

          if (field.afterAppendCallback != '') {
            var callback = field.afterAppendCallback.replace(/#id/ig, fieldId).replace(/\./ig, '\\\\.').replace(/#original/ig, '$.autocompleterCombo.lastInsertedItem');
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

        var newItem = null;

        if (options.layout == 'table') {
          newItem = '<tr class="autocompletecombo-item-row" id="' + fieldId + '-row">' + displayCell + otherCells + '</tr>';
        }
        else if (options.layout == 'fluid') {
          newItem = '<div>' + otherCells + '</div>';
        }

        $(containerSelector).append(newItem);

        // callbacks usually can be run only after the field has been appended to the document
        $.autocompleterCombo.lastInsertedItem = ui.item.original;

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
        deleteText: autocompleterCombo.messages.deleteItemLabel,
        layout: 'table' // can also be 'fluid'
      };

      if (settings) $.extend(options, settings);

      var searchField = this;

      if (options.layout == 'table') {
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
        }

        var processedLabel = '';
        // loading data
        if (options.toLoad.length > 0) {
          for (var i = 0; i < options.toLoad.length; i++) {
            var item = options.toLoad[i];
            var ui = {};
            ui.item = {};
            ui.item.id = eval('item.' + options.id);

            if (options.label.search('#') >= 0) {
              var parts = options.label.split('#');
              var firstLabel = 'item.' +  parts[0].trim();

              var secParts = parts[1].split(' ');
              var separator = secParts[0];
              var secondLabel = 'item.' + secParts[1];

              processedLabel = firstLabel + ' + \' ' + separator + ' \' + ' + secondLabel + '';
            }
            else {
              processedLabel = 'item.' + options.label;
            }

            ui.item.label = eval(processedLabel);
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

              var label = '';

              if (options.label.search('#') >= 0) {
                var parts = options.label.split('#');
                var firstLabel = 'val.' +  parts[0].trim();

                var secParts = parts[1].split(' ');
                var separator = secParts[0];
                var secondLabel = 'val.' + secParts[1];

                label = firstLabel + ' + \' ' + separator + ' \' + ' + secondLabel + '';
              }
              else {
                label = 'val.' + options.label;
              }

              autocompleteItem.value = eval(label);
              autocompleteItem.label = eval(label);

              var id = 'val.' + options.id;

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

