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
            apply:    flexed.actions.exec_command ('bold'),
            indicate: flexed.actions.query_command('bold'),
        },
 
        {
            id: 'italic',
            caption: '<i class="fa fa-italic"></i>',
            tooltip: gettext('Italic'),
            apply:    flexed.actions.exec_command ('italic'),
            indicate: flexed.actions.query_command('italic'),
        },
        
        {
            id: 'underline',
            caption: '<i class="fa fa-underline"></i>',
            tooltip: gettext('Underline'),
            apply:    flexed.actions.exec_command ('underline'),
            indicate: flexed.actions.query_command('underline'),
        },
        
        {
            id: 'strikethrough',
            caption: '<i class="fa fa-strikethrough"></i">',
            tooltip: gettext('Strikethrough'),
            apply:    flexed.actions.exec_command ('strikeThrough'),
            indicate: flexed.actions.query_command('strikeThrough'),
        }
      ],
      [
        {
            id: 'justifyleft',
            caption: '<i class="fa fa-align-left"></i>',
            tooltip: gettext('Align left'),
            apply:    flexed.actions.exec_command ('justifyLeft'),
            indicate: flexed.actions.query_command('justifyLeft'),
        },
        {
            id: 'justifycenter',
            caption: '<i class="fa fa-align-center"></i>',
            tooltip: gettext('Center'),
            apply:    flexed.actions.exec_command ('justifyCenter'),
            indicate: flexed.actions.query_command('justifyCenter'),
        },
        {
            id: 'justifyright',
            caption: '<i class="fa fa-align-right"></i>',
            tooltip: gettext('Align right'),
            apply:    flexed.actions.exec_command ('justifyRight'),
            indicate: flexed.actions.query_command('justifyRight'),
        },
        {
            id: 'justifyfull',
            caption: '<i class="fa fa-align-justify"></i>',
            tooltip: gettext('Justify'),
            apply:    flexed.actions.exec_command ('justifyFull'),
            indicate: flexed.actions.query_command('justifyFull'),
        },
        
      ],
      [
        {
            id: 'image',
            caption: '<i class="fa fa-image"></i>',
            tooltip: gettext('Image'),
            apply: flexed.actions.insert_image(),
        }
      ],
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
    
    for(var font_idx in fonts) { /* TODO: Font detector! */
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
