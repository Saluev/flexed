/**
 * 
 * @source: https://github.com/Saluev/flexed/blob/master/js/flexed.js
 * 
 * Copyright (C) 2014 Tigran Saluev
 * 
 */
(function($) {
    'use strict';
    
    if(!window.rangy) {
      console.error('flexed: rangy (http://code.google.com/p/rangy) is required to work');
    }
    
    $.fn.flexed = function(userOptions) {
        var options = $.extend({}, $.fn.flexed.defaults, userOptions);
        
        var create_button = function(button, mode) {
          var bel;
          if(mode == 'toolbar') {
            bel = $(document.createElement('button'));
            bel.addClass('btn btn-default');
            bel.attr('data-placement', 'bottom');
            bel.html(button.caption);
          } else if(mode == 'dropdown') {
            bel = $(document.createElement('li'));
            bel.html('<a href="#">' + button.caption + '</a>');
          }
          bel.addClass('flexed-tool-button');
          
          bel.attr('title', button.tooltip);
          bel.attr('data-toggle', 'tooltip');
          bel.tooltip({html: true, container: 'body'});
          
          bel[0].button = button;
          button.element = bel;
          
          if(button.menu) {
            bel.attr('data-toggle', 'dropdown');
            bel.addClass('dropdown-toggle');
            bel.append('&nbsp;<span class="caret"></span>');
            var new_bel = $(document.createElement('div'));
            new_bel.addClass('btn-group');
            new_bel.append(bel);
            new_bel.append(create_toolbar(button.menu, 'dropdown'));
            bel = new_bel;
          }
          
          return bel;
        };
        
        var create_toolbar = function(source, mode) {
          mode = mode || 'toolbar';
          var container;
          if(mode == 'toolbar') {
            container = $(document.createElement('div'));
            container.addClass('btn-group');
            container.attr('role', 'toolbar');
          } else if(mode == 'dropdown') {
            container = $(document.createElement('ul'));
            container.addClass('dropdown-menu');
            container.attr('role', 'menu');
          }
          source.forEach(function(button) {
            container.append(create_button(button, mode));
          });
          return container
        };
        
        var editor = this;
        var toolbar = $(document.createElement('div'));
        var toolbar_placeholder = $(document.createElement('div'));
        var body = $(document.createElement('div'));
        
        toolbar.addClass("flexed-toolbar panel-heading");
        //toolbar.css('width', editor.css('width'));
        if(options.trademark)
            toolbar.html("<b>flexed</b>&#8482;&nbsp;");
        
        body.html(editor.html());
        body.addClass("flexed-body panel-body");
        body.attr('contentEditable', 'True');
        body.css('min-height', editor.css('min-height'));
        
        toolbar_placeholder.css('display', 'none');
        
        editor.addClass("flexed-editor panel panel-default");
        editor.css('min-height', null);
        editor.html('');
        editor.append(toolbar);
        editor.append(toolbar_placeholder);
        editor.append(body);
        editor.body = body;
        
        // smart toolbar
        $(window).on('scroll.flexed', function() {
          var scrollTop = $(window).scrollTop()
          var offset = toolbar.offset();
          if(options.toolbarOffset + offset.top < scrollTop) {
            var bw =  Number(editor.css('border-left-width' ).slice(0, -2));
            bw = bw + Number(editor.css('border-right-width').slice(0, -2));
            toolbar.css({
                position: 'fixed',
                top: options.toolbarOffset,
                width: editor.outerWidth() - bw,
            });
            toolbar_placeholder.css({
                display: 'inherit',
                height: toolbar.outerHeight(),
            });
          }
          if(options.toolbarOffset + scrollTop < editor.offset().top) {
            toolbar.css({position: 'inherit', width: 'auto'});
            toolbar_placeholder.css('display', 'none');
          }
        });
        
        var suite = options.suite;
        
        suite.forEach(function(panel) {
          toolbar.append('&nbsp;');
          toolbar.append(create_toolbar(panel));
        });
        
        $(".flexed-tool-button", editor).on('click.flexed', function() {
            var button = this.button;
            if(!button.apply) return;
            button.apply(rangy.getSelection(), editor);
        });
        
        editor.on('selectionchange.flexed', function(selection) {
            $(".flexed-tool-button", editor).each(function(idx, el) {
                var button = el.button;
                if(!button.indicate) return;
                     var indication = button.indicate(selection);
                if(indication)
                  button.element.addClass('active');
                else
                  button.element.removeClass('active');                             
            });
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