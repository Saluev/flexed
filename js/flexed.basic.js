(function($) {
    
    if(!$.fn.flexed) {
        console.error('flexed: load core script before extensions');
    }
    
    var flexed = $.fn.flexed;
    
    flexed.suites.basic = [
        
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
    
    flexed.defaults.suite = flexed.defaults.suite || flexed.suites.basic;
    
})(window.jQuery);