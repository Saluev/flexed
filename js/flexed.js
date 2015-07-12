/**
 * 
 * @source: https://github.com/Saluev/flexed/blob/master/js/flexed.js
 * 
 * Copyright (C) 2014 Tigran Saluev
 * 
 */
(function( $, rangy ) {
    'use strict';
    
    if( !rangy ) {
      console.error('flexed: rangy (http://code.google.com/p/rangy) is required to work');
    }
    
    var create_button = function( button, mode, btn_class ) {
          var bel;
          if(mode == 'toolbar') {
            bel = $(document.createElement('button'))
                .addClass( 'btn btn-default' )
                .attr    ( 'data-placement', 'bottom' )
                .html    ( button.caption );
          } else if(mode == 'dropdown') {
            bel = $(document.createElement('li'))
                .html('<a href="#">' + button.caption + '</a>');
          }
          
          bel
              .addClass( btn_class + " " + (button.class || "") )
              .attr    ( 'title', button.tooltip  )
              .attr    ( 'data-toggle', 'tooltip' )
              .tooltip ({ html: true, container: 'body' });
          
          bel[0].button = button;
          button.element = bel;
          
          if(button.menu) {
            bel
                .attr    ( 'data-toggle', 'dropdown' )
                .addClass( 'dropdown-toggle' )
                .append  ( '&nbsp;<span class="caret"></span>' );
            var new_bel = $(document.createElement('div'))
                .addClass( 'btn-group' )
                .append([ bel, create_toolbar( button.menu, 'dropdown', btn_class ) ]);
            bel = new_bel;
          }
          
          return bel;
    };
        
    var create_toolbar = function( source, mode, btn_class ) {
          mode = mode || 'toolbar';
          var container;
          if( mode == 'toolbar' ) {
            container = $(document.createElement('div'))
                .addClass( 'btn-group' )
                .attr    ( 'role', 'toolbar' );
          } else if(mode == 'dropdown') {
            container = $(document.createElement('ul'))
                .addClass( 'dropdown-menu' )
                .attr    ( 'role',  'menu' );
          }
          source.forEach(function(button) {
            container.append( create_button( button, mode, btn_class ) );
          });
          return container
    };
    
    
    $.fn.flexed = function(userOptions) {
        var options = $.extend({}, $.fn.flexed.defaults, userOptions);
        
        var editor  = this;
        var toolbar = $(document.createElement('div'));
        var toolbar_placeholder
                    = $(document.createElement('div'));
        var footer  = $(document.createElement('div'));
        var footer_placeholder
                    = $(document.createElement('div'));
        var body    = $(document.createElement('div'));
        
        toolbar.addClass( 'flexed-toolbar panel-heading' );
        footer .addClass( 'flexed-footer panel-footer'   );
        
        if( options.trademark )
            toolbar.html( '<b>flexed</b>&#8482;&nbsp;' );
        
        body
            .html    ( editor.html() )
            .addClass( 'flexed-body panel-body' )
            .attr    ( 'contentEditable', 'True' )
            .css     ( 'min-height', editor.css( 'min-height' )) ;
        
        toolbar_placeholder.addClass( 'flexed-toolbar-placeholder' );
        footer_placeholder .addClass( 'flexed-footer-placeholder'  );
        
        editor
            .html    ( '' )
            .addClass( 'flexed-editor panel panel-default' )
            .css     ( 'min-height', null )
            .append  ([
                toolbar,
                toolbar_placeholder,
                body,
                footer_placeholder,
                footer
            ]);
        editor.body = body;
        
        var bw =  Number( editor.css( 'border-left-width'  ).slice( 0, -2 ) );
        bw = bw + Number( editor.css( 'border-right-width' ).slice( 0, -2 ) );
        toolbar.css( 'width', editor.outerWidth() - bw );
        footer .css( 'width', editor.outerWidth() - bw );
        
        
        /* Creating buttons & panels */
        var suite   = options.suite || {};
        var panels  = suite.toolbar || [];
        var actions = suite.actions || [];
        
        panels.forEach(function(panel) {
            toolbar.append([ '&nbsp;', create_toolbar( panel, false, 'flexed-tool-button'   ) ]);
        });
        
        actions.forEach(function(panel) {
            footer .append([ '&nbsp;', create_toolbar( panel, false, 'flexed-action-button' ) ]);
        });
        
        toolbar_placeholder.css( 'height', toolbar.outerHeight() );
        footer_placeholder .css( 'height', footer .outerHeight() );
        
        
        /* Main event handlers executing editor actions */
        $(".flexed-tool-button", editor).on( 'click.flexed', function() {
            var button = this.button;
            this.blur();
            if(!button.apply) return;
            button.apply( rangy.getSelection(), editor );
            editor.trigger( 'selectionchange.flexed' );
        });
        
        $(".flexed-action-button", editor).on( 'click.flexed', function() {
            var action = this.button;
            editor.trigger( 'flexed.' + action.id );
            this.blur();
        }).addClass(function() {
            return 'flexed-action-' + this.button.id;
        });
        
        editor.on( 'selectionchange.flexed', function(selection) {
            $(".flexed-tool-button", editor).each(function(idx, el) {
                var button = el.button;
                if( !button.indicate ) return;
                     var indication = button.indicate(selection);
                if( indication )
                  button.element.addClass   ( 'active' );
                else
                  button.element.removeClass( 'active' );                             
            });
        });
        
        var handle_drop = function(ev) {
            var re = /~~~REPLACEWITH=(.*)~~~/.exec(body[0].innerHTML);
            console.log( re );
            if(re) {
                var query = re[1];
                var html = body[0].innerHTML;
                body[0].innerHTML = html.slice(0, re.index) + '<span id="flexed-replaceme"></span>'
                                  + html.slice(re.index + re[0].length);
                var node = $(query, body).detach();
                $("#flexed-replaceme", body).replaceWith(node);
            }
        }
        
        var update_panels = function(ev) {
            var selection = rangy.getSelection();
            editor.trigger( 'selectionchange.flexed', selection );
        }
        
        
        /* Smart toolbar & footer */
        var update_toolbars = function() {
            var scrollTop = $(window).scrollTop(),
                scrollBottom = scrollTop + $(window).height();
            
            var editor_offset = editor.offset(),
                editor_height = editor.height();
            
            var editor_top    = editor_offset.top,
                editor_bottom = editor_top + editor_height;
            
            if( options.toolbarOffset >= editor_top - scrollTop ) {
                toolbar.css( 'top', options.toolbarOffset  ).addClass   ( 'flexed-fixed' );
            } else {
                toolbar.css( 'top', editor_top - scrollTop ).removeClass( 'flexed-fixed' );
            }
            
            footer.css( 'bottom', Math.max( options.footerOffset, scrollBottom - editor_bottom ) );
        }
       
        $(window).on( 'scroll.flexed resize.flexed', update_toolbars );
        body
            .on( 'input.flexed', update_toolbars ) /* TODO keyup, mouseup for old browsers */
            .on( 'input.flexed', handle_drop )
            .on( 'mouseup.flexed keyup.flexed mouseout.flexed', update_panels );
        update_toolbars();
        
        return editor;
    };
    
    $.fn.flexed.defaults = {
        trademark: true,
        toolbarOffset: 0,
        footerOffset : 0
    };
    
    $.fn.flexed.language = "en";
    
    $.fn.flexed.suites = {};

})(window.jQuery, window.rangy);