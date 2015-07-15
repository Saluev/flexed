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
        flexed.buttons.bold,
        flexed.buttons.italic,
        flexed.buttons.underline,
        flexed.buttons.strikethrough,
        flexed.buttons.link,
      ],
      [
        flexed.buttons.justifyleft,
        flexed.buttons.justifycenter,
        flexed.buttons.justifyright,
        flexed.buttons.justifyfull,    
      ],
      [
        flexed.buttons.image,
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
