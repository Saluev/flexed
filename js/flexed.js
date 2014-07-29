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
    
    var create_button = function(button, mode, btn_class) {
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
          bel.addClass(btn_class);
          if(button.class)
            bel.addClass(button.class);
          
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
            new_bel.append(create_toolbar(button.menu, 'dropdown', btn_class));
            bel = new_bel;
          }
          
          return bel;
    };
        
    var create_toolbar = function(source, mode, btn_class) {
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
            container.append(create_button(button, mode, btn_class));
          });
          return container
    };
    
    
    $.fn.flexed = function(userOptions) {
        var options = $.extend({}, $.fn.flexed.defaults, userOptions);
        
        var editor = this;
        var toolbar = $(document.createElement('div'));
        var toolbar_placeholder = $(document.createElement('div'));
        var footer = $(document.createElement('div'));
        var footer_placeholder = $(document.createElement('div'));
        var body = $(document.createElement('div'));
        
        toolbar.addClass("flexed-toolbar panel-heading");
        if(options.trademark)
            toolbar.html("<b>flexed</b>&#8482;&nbsp;");
        
        footer.addClass("flexed-footer panel-footer");
        
        body.html(editor.html());
        body.addClass("flexed-body panel-body");
        body.attr('contentEditable', 'True');
        body.css('min-height', editor.css('min-height'));
        
        toolbar_placeholder.addClass('flexed-toolbar-placeholder');
        footer_placeholder .addClass('flexed-footer-placeholder');
        
        editor.addClass("flexed-editor panel panel-default");
        editor.css('min-height', null);
        editor.html('');
        editor.append(toolbar);
        editor.append(toolbar_placeholder);
        editor.append(body);
        editor.append(footer_placeholder);
        editor.append(footer);
        editor.body = body;
        
        var bw =  Number(editor.css('border-left-width' ).slice(0, -2));
        bw = bw + Number(editor.css('border-right-width').slice(0, -2));
        toolbar.css('width', editor.outerWidth() - bw);
        footer .css('width', editor.outerWidth() - bw);
        
        // smart toolbar & footer
        var update_toolbars = function() {
          var scrollTop = $(window).scrollTop()
          var scrollBottom = scrollTop + $(window).height();
          
          var editor_offset = editor.offset();
          var editor_height = editor.height();
          
          var editor_top = editor_offset.top;
          var editor_bottom = editor_offset.top + editor_height;
          
          if(options.toolbarOffset >= editor_top - scrollTop) {
              toolbar.css('top', options.toolbarOffset).addClass('flexed-fixed');
          } else {
              toolbar.css('top', editor_top - scrollTop).removeClass('flexed-fixed');
          }
          
          footer.css('bottom', Math.max(options.footerOffset, scrollBottom - editor_bottom));
        }

        var suite   = options.suite || {};
        var panels  = suite.toolbar || [];
        var actions = suite.actions || [];
        
        panels.forEach(function(panel) {
            toolbar.append('&nbsp;');
            toolbar.append(create_toolbar(panel, false, 'flexed-tool-button'));
        });
        
        actions.forEach(function(panel) {
            footer.append('&nbsp;');
            footer.append(create_toolbar(panel, false, 'flexed-action-button'));
        });
        
        $(".flexed-tool-button", editor).on('click.flexed', function() {
            var button = this.button;
            this.blur();
            if(!button.apply) return;
            button.apply(rangy.getSelection(), editor);
            editor.trigger('selectionchange.flexed');
        });
        
        $(".flexed-action-button", editor).on('click.flexed', function() {
            var action = this.button;
            editor.trigger('flexed.' + action.id);
            this.blur();
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
        
        toolbar_placeholder.css('height', toolbar.outerHeight());
        footer_placeholder .css('height', footer .outerHeight());
       
        $(window).on('scroll.flexed resize.flexed', update_toolbars);
        body.on('input.flexed', update_toolbars); /* TODO keyup, mouseup for old browsers */
        body.on('mouseup.flexed keyup.flexed mouseout.flexed', trigger_change);
        update_toolbars();
        
        return editor;
    };
    
    $.fn.flexed.defaults = {
      trademark: true,
      toolbarOffset: 0,
      footerOffset: 0,
    };
    
    $.fn.flexed.suites = {};

})(window.jQuery);