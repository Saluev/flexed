(function($) {
    'use strict';
    
    if(!$.fn.flexed) {
        console.error('flexed: load core script before extensions');
    }
    
    var flexed = $.fn.flexed;
    
    flexed.suites.basic = [
    
        {
            id: 'font',
            caption: '<span class="glyphicon glyphicon-font"></span>',
            tooltip: 'Font',
            group: 'basic_formatting',
            menu: [
                // filled in later
            ]
        },
        
        {
            id: 'bold',
            caption: '<span class="glyphicon aglyphicon-bold"></span>',
            tooltip: 'Bold',
            group: 'basic_formatting',
            apply: function apply_bold(selection) {
                // TODO case when selection != window.getSelection()
                document.execCommand('bold');
            },
            indicate: function indicate_bold(selection) {
                return document.queryCommandState('bold');
            }
        },
 
        {
            id: 'italic',
            caption: '<span class="glyphicon aglyphicon-italic"></span>',
            tooltip: 'Italic',
            group: 'basic_formatting',
            apply: function apply_bold(selection) {
                // TODO case when selection != window.getSelection()
                document.execCommand('italic');
            },
            indicate: function indicate_bold(selection) {
                return document.queryCommandState('italic');
            }
        },
        
        {
            id: 'underline',
            caption: '<span class="glyphicon aglyphicon-underline"></span>',
            tooltip: 'Underline',
            group: 'basic_formatting',
            apply: function apply_bold(selection) {
                // TODO case when selection != window.getSelection()
                document.execCommand('underline');
            },
            indicate: function indicate_bold(selection) {
                return document.queryCommandState('underline');
            }
        }
        
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
        flexed.suites.basic[0].menu.push({
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
    
})(window.jQuery);