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
    
    
    flexed.suites.basic = [
      [
        {
            id: 'font',
            caption: '<i class="fa fa-font"></i>',
            tooltip: 'Font',
            menu: [
                // filled in later
            ]
        },
      ],
      [
        {
            id: 'bold',
            caption: '<i class="fa fa-bold"></i>',
            tooltip: 'Bold',
            apply: apply_template('bold'),
            indicate: indicate_template('bold'),
        },
 
        {
            id: 'italic',
            caption: '<i class="fa fa-italic"></i>',
            tooltip: 'Italic',
            apply: apply_template('italic'),
            indicate: indicate_template('italic'),
        },
        
        {
            id: 'underline',
            caption: '<i class="fa fa-underline"></i>',
            tooltip: 'Underline',
            apply: apply_template('underline'),
            indicate: indicate_template('underline'),
        },
        
        {
            id: 'strikethrough',
            caption: '<i class="fa fa-strikethrough"></i">',
            tooltip: 'Strikethrough',
            apply: apply_template('strikeThrough'),
            indicate: indicate_template('strikeThrough'),
        }
      ],
      [
        {
            id: 'justifyleft',
            caption: '<i class="fa fa-align-left"></i>',
            tooltip: 'Align left',
            apply: apply_template('justifyLeft'),
            indicate: indicate_template('justifyLeft'),
        },
        {
            id: 'justifycenter',
            caption: '<i class="fa fa-align-center"></i>',
            tooltip: 'Center',
            apply: apply_template('justifyCenter'),
            indicate: indicate_template('justifyCenter'),
        },
        {
            id: 'justifyright',
            caption: '<i class="fa fa-align-right"></i>',
            tooltip: 'Align right',
            apply: apply_template('justifyRight'),
            indicate: indicate_template('justifyRight'),
        },
        {
            id: 'justifyfull',
            caption: '<i class="fa fa-align-justify"></i>',
            tooltip: 'Justify',
            apply: apply_template('justifyFull'),
            indicate: indicate_template('justifyFull'),
        },
        
      ],
      [
        {
            id: 'image',
            caption: '<i class="fa fa-image"></i>',
            tooltip: 'Image',
            apply: function apply_image(selection, editor) {
                var fd = $.FileDialog({accept: 'image/*'});
                fd.on('files.bs.filedialog', function(ev) {
                    var files = ev.files;
                    editor.body.focus();
                    for(var file_idx in files) {
                        var file = files[file_idx];
                        console.log(file.content);
                        document.execCommand('insertimage', 0, file.content);
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
        flexed.suites.basic[0][0].menu.push({
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
    
    flexed.defaults.suite = flexed.defaults.suite || flexed.suites.basic;
    
})(window.jQuery, window.jQuery.fn.flexed);