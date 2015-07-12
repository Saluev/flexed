/**
 * 
 * @source: https://github.com/Saluev/flexed/blob/master/js/flexed.basic.js
 * 
 * Copyright (C) 2014 Tigran Saluev
 * 
 */
(function($, flexed) {
    'use strict';
    
    if(!flexed) {
        console.error('flexed: load core script before extensions');
    }
    
    var gettext = window.gettext || function(s) { return s; };
    
    var apply_template = function(cmd) {
      var result = function apply(selection) {
        // TODO case when selection != window.getSelection()
        document.execCommand(cmd);
      };
      return result;
    };
    var indicate_template = function(cmd) {
      var result = function indicate(selection) {
        return document.queryCommandState(cmd);
      };
      return result;
    };
    var image_container_id = 1;
    var make_image = function(src) {
        var img = document.createElement('img');
        img.src = src;
        img.className = 'flexed-image';
        var div = document.createElement('div');
        div.id = "flexed-image-container-" + image_container_id++;
        div.className = 'flexed-image-container';
        div.contentEditable = false;
        div.appendChild(img);
        var anchor = document.createElement('div');
        anchor.className = 'flexed-image-anchor';
        div.appendChild(anchor);
        img.setAttribute('data-flexed-container-id', div.id);
        return div;
    }
    // binding to all flexed-images ever created
    $(document).on('dragstart', 'img.flexed-image', null, function(ev) {
        ev.originalEvent.dataTransfer.setData('text/html', '~~~REPLACEWITH=#' + this.getAttribute('data-flexed-container-id') + '~~~');
    });
    
    
    var toolbar = [
      [
        {
            id: 'font',
            caption: '<i class="fa fa-font"></i>',
            tooltip: gettext('Font'),
            menu: [
                // filled in later
            ]
        },
      ],
      [
        {
            id: 'bold',
            caption: '<i class="fa fa-bold"></i>',
            tooltip: gettext('Bold'),
            apply: apply_template('bold'),
            indicate: indicate_template('bold'),
        },
 
        {
            id: 'italic',
            caption: '<i class="fa fa-italic"></i>',
            tooltip: gettext('Italic'),
            apply: apply_template('italic'),
            indicate: indicate_template('italic'),
        },
        
        {
            id: 'underline',
            caption: '<i class="fa fa-underline"></i>',
            tooltip: gettext('Underline'),
            apply: apply_template('underline'),
            indicate: indicate_template('underline'),
        },
        
        {
            id: 'strikethrough',
            caption: '<i class="fa fa-strikethrough"></i">',
            tooltip: gettext('Strikethrough'),
            apply: apply_template('strikeThrough'),
            indicate: indicate_template('strikeThrough'),
        }
      ],
      [
        {
            id: 'justifyleft',
            caption: '<i class="fa fa-align-left"></i>',
            tooltip: gettext('Align left'),
            apply: apply_template('justifyLeft'),
            indicate: indicate_template('justifyLeft'),
        },
        {
            id: 'justifycenter',
            caption: '<i class="fa fa-align-center"></i>',
            tooltip: gettext('Center'),
            apply: apply_template('justifyCenter'),
            indicate: indicate_template('justifyCenter'),
        },
        {
            id: 'justifyright',
            caption: '<i class="fa fa-align-right"></i>',
            tooltip: gettext('Align right'),
            apply: apply_template('justifyRight'),
            indicate: indicate_template('justifyRight'),
        },
        {
            id: 'justifyfull',
            caption: '<i class="fa fa-align-justify"></i>',
            tooltip: gettext('Justify'),
            apply: apply_template('justifyFull'),
            indicate: indicate_template('justifyFull'),
        },
        
      ],
      [
        {
            id: 'image',
            caption: '<i class="fa fa-image"></i>',
            tooltip: gettext('Image'),
            apply: function apply_image(selection, editor) {
                var selection = rangy.getSelection();
                var state = selection.saveRanges();
                var fd = $.FileDialog({accept: 'image/*'});
                fd.on('files.bs.filedialog', function(ev) {
                    var files = ev.files;
                    editor.body.focus();
                    for(var file_idx in files) {
                        var file = files[file_idx];
                        console.log(file.content);
                        selection.refresh();
                        selection.restoreRanges(state);
                        selection.deleteFromDocument();
                        var range = selection.getRangeAt(0);
                        var img = make_image(file.content);
                        range.insertNode(img);
                    }
                });
            }
            
            
            
        }
      ]
    ];
    
    var fonts = [
        'serif', 'sans',
        'Arial', 'Arial Black',
        'Courier', 'Courier New',
        'Helvetica', 'Impact',
        'Lucida', 'Tahoma',
        'Times', 'Times New Roman',
        'Verdana'
    ];
    
    for(var font_idx in fonts) {
        var font = fonts[font_idx];
        (function(font) {
        toolbar[0][0].menu.push({
            id: font,
            caption: '<span style="font-family:' + font + '">' + font + '</span>',
            apply: function(selection) {
                // TODO case when selection != window.getSelection()
                document.execCommand('fontName', null, font);
            },
            indicate: function indicate_bold(selection) {
                return false;
            }
        });
        })(font);
    }
    
    var actions = [
        [
            {
                id: 'save',
                caption: '<span class="fa fa-save"></span>&nbsp;&nbsp;' + gettext('Save changes'),
                tooltip: '',
                class: 'btn-primary'
            }
        ],
        [
            {
                id: 'discard',
                caption: '<span class="glyphicon glyphicon-remove"></span>&nbsp;&nbsp;' + gettext('Discard changes'),
                tooltip: '',
                class: 'btn-danger',
            }
        ]
    ];
    
    flexed.suites.basic = {
        toolbar: toolbar,
        actions: actions,
    }
    
    flexed.defaults.suite = flexed.defaults.suite || flexed.suites.basic;
    
})(window.jQuery, window.jQuery.fn.flexed);
