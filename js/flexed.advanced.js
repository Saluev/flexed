/**
 * 
 * @source: https://github.com/Saluev/flexed/blob/master/js/flexed.advanced.js
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
            tooltip: 'Font',
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
    
    flexed.suites.advanced = {
        toolbar: toolbar
    };
    
    flexed.defaults.suite = flexed.defaults.suite || flexed.suites.advanced;
    
})(window.jQuery, window.jQuery.fn.flexed);