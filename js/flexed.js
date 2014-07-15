(function($) {
    'use strict';
    
    if(!window.rangy) {
      console.error('flexed: rangy (http://code.google.com/p/rangy) is required to work');
    }
    
    $.fn.flexed = function(userOptions) {
        var options = $.extend({}, $.fn.flexed.defaults, userOptions);
        
        var editor = this;
        var toolbar = $(document.createElement('div'));
        var body = $(document.createElement('div'));
        
        if(options.trademark)
            toolbar.html("<b>flexed</b>&#8482;&nbsp;");
        body.html(editor.html());
        
        editor.addClass("flexed-editor panel panel-default");
         
        body.addClass("flexed-body panel-body");
        body.attr('contentEditable', 'True');
        body.css('min-height', editor.css('min-height'));
        editor.css('min-height', null);
        
        editor.html('');
        editor.append(toolbar);
        editor.append(body);
        
        toolbar.addClass("flexed-toolbar panel-heading");
        toolbar.css('width', editor.css('width'));
        
        // smart toolbar
        $(window).on('scroll.flexed', function() {
          var scrollTop = $(window).scrollTop()
          var offset = toolbar.offset();
          if(offset.top < scrollTop) {
            toolbar.css({position: 'fixed', top: options.toolbarOffset});
          }
          if(options.toolbarOffset + scrollTop < editor.offset().top) {
            toolbar.css({position: 'inherit'});
          }
        });
        
        var suite = options.suite;
        
        var panels = {};
        var panels_list = [];
        var buttons_list = [];
        for(var btn_idx in suite) {
          var button = suite[btn_idx];
          var group = button.group;
          if(!panels[group]) {
            panels[group] = [];
            panels_list.push(panels[group]);
          }
          panels[group].push(button);
          buttons_list.push(button);
        }
        
        for(var panel_idx in panels_list) {
          toolbar.append('&nbsp;');
          var panel = panels_list[panel_idx];
          var pel = $(document.createElement('div'));
          if(panel.length > 1)
            pel.addClass('btn-group flexed-tool-group');
          for(var btn_idx in panel) {
            (function(btn_idx) {
            var button = panel[btn_idx];
            var bel = $(document.createElement('button'));
            bel.attr({title: button.tooltip});
            bel.addClass('btn btn-default flexed-tool-button');
            bel.html(button.caption);
            
            bel.on('click.flexed', function() {
              button.apply(rangy.getSelection());
            });
            
            button['element'] = bel;
            pel.append(bel);
            })(btn_idx);
          }
          toolbar.append(pel);
        }
        
        //$(".flexed-tool-button", toolbar).tooltip({placement: 'bottom', html: true});
        
        editor.on('selectionchange.flexed', function(selection) {
          for(var btn_idx in buttons_list) {
            var button = buttons_list[btn_idx];
            var indication = button.indicate(selection);
            if(indication)
              button.element.addClass('active');
            else
              button.element.removeClass('active');
          }
        });
        
        var trigger_change = function(ev) {
          var selection = rangy.getSelection();
          editor.trigger('selectionchange.flexed', selection);
          
        }
        
        body.on('mouseup.flexed keyup.flexed mouseout.flexed', trigger_change);
        
        
    };
    
    $.fn.flexed.defaults = {
      trademark: true,
      toolbarOffset: 0,
    };
    
    $.fn.flexed.suites = {};

})(window.jQuery);