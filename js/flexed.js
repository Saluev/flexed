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
    
    var HTML_to_text = function(html) {
        // probably way faster than $('<div/>').html(html).text()
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.innerText;
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
//             $(".flexed-replaceme", body).replaceWith(function(index) {
//                 console.log(this);
//                 var query = this.getAttribute('data-with');
//                 var node  = $(query, body);
//                 node.detach();
//                 return node;
//             });
            var re = /~~~REPLACEWITH=(.*)~~~/.exec(body[0].innerHTML);
            console.log( re );
            if(re) {
                var query = re[1];
                var node = $(query, body).detach();
                var html = body[0].innerHTML;
                re = /~~~REPLACEWITH=(.*)~~~/.exec(html);
                body[0].innerHTML = html.slice(0, re.index) + '<span id="flexed-replaceme"></span>'
                                  + html.slice(re.index + re[0].length);
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
                editor_height = editor.height(),
                editor_top    = editor_offset.top,
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
        
        // binding to all flexed-containers ever created
        body.on('dragstart', '.flexed-container', null, function(ev) {
            ev.originalEvent.dataTransfer.setData('text/html', '~~~REPLACEWITH=#' + this.id + '~~~');
        });
        
        return editor;
    };
    
    var flexed = $.fn.flexed;
    var gettext = window.gettext || function(s) { return s; };
    
    flexed.defaults = {
        trademark: true,
        toolbarOffset: 0,
        footerOffset : 0
    };
    
    flexed.language = "en";
    
    flexed.suites = {};
    
    var image_container_id = 1;
    flexed.api = {
        // Utility functions used in actions
        make_image: function(src) {
            var img = document.createElement('img');
            img.src = src;
            img.className = 'flexed-image flexed-contained';
            img.setAttribute('draggable', false);
            var div = document.createElement('div');
            while(document.getElementById("flexed-image-container-" + image_container_id))
                ++image_container_id;
            div.id = "flexed-image-container-" + image_container_id++;
            div.className = 'flexed-image-container flexed-container';
            div.contentEditable = false;
            div.setAttribute('draggable', true);
            div.appendChild(img);
            var anchor = document.createElement('div');
            anchor.className = 'flexed-image-anchor';
            div.appendChild(anchor);
            return div;
        }
    };
    
    flexed.actions = {
        // Simple actions based on browser capabilities (e.g. bold, italic, etc.)
        exec_command: function(cmd) {
            return function(selection, editor) {
                document.execCommand(cmd);
            }
        },
        query_command: function(cmd) {
            return function(selection, editor) {
                return document.queryCommandState(cmd);
            }
        },
        // More complicated text actions
        insert_symbol: function(symbol) {
            return function(selection, editor) {
                // to replace selection with symbol, first clean it
                selection.deleteFromDocument();
                // update selection object state
                selection.refresh();
                // now it must have only one range representing the caret
                var range = selection.getRangeAt(0);
                // create text node and insert it at the caret position
                symbol = HTML_to_text(symbol);
                var node = document.createTextNode(symbol);
                range.insertNode(node);
                // now set caret AFTER the inserted symbol
                var new_range = rangy.createRangyRange();
                new_range.setStart(range.startContainer, range.startOffset + 1);
                new_range.setEnd  (range.startContainer, range.startOffset + 1);
                selection.setSingleRange(new_range);
            };
        },
        wrap_with: function(oquote, cquote) {
            oquote = HTML_to_text(oquote);
            cquote = HTML_to_text(cquote);
            return function(selection, editor) {
                var range1 = selection.getRangeAt(0);
                var range2 = range1.cloneRange();
                range2.collapse(false); // to the end
                var collapsed = range1.collapsed;
                var newStartContainer = range1.startContainer;
                var newEndContainer   = range1.endContainer;
                var newStartOffset    = range1.startOffset;
                var newEndOffset      = range1.endOffset;
                if(newStartContainer.nodeType == newStartContainer.TEXT_NODE) {
                    // just inserting text
                    newStartContainer.textContent = 
                        newStartContainer.textContent.slice(0, newStartOffset) + oquote +
                        newStartContainer.textContent.slice(newStartOffset);
                    newStartOffset += oquote.length;
                    if(newStartContainer == newEndContainer)
                        newEndOffset += oquote.length;
                } else {
                    // inserting new text node
                    range1.insertNode(document.createTextNode(oquote));
                    if(newStartContainer == newEndContainer)
                        newEndOffset += 1;
                }
                if(newEndContainer.nodeType == newEndContainer.TEXT_NODE) {
                    // just inserting text
                    newEndContainer.textContent = 
                        newEndContainer.textContent.slice(0, newEndOffset) + cquote +
                        newEndContainer.textContent.slice(newEndOffset);
                } else {
                    // inserting new text node
                    range2.insertNode(document.createTextNode(cquote));
                }
                var new_range = rangy.createRangyRange();
                new_range.setStart(newStartContainer, newStartOffset);
                new_range.setEnd  (newEndContainer,   newEndOffset  );
                selection.setSingleRange(new_range);
            };
        },
        wrap_with_quotes: function(options) {
            return function(selection, editor) {
                var oquote = '&quot;', cquote = '&quot;';
                // TODO implement rules for other languages
                if(flexed.language == 'ru') {
                    oquote = '&laquo;';
                    cquote = '&raquo;';
                }
                return flexed.actions.wrap_with(oquote, cquote)(selection, editor);
            };
        },
        // Images and other elements
        insert_image: function(options) {
            return function(selection, editor) {
                var state = selection.saveRanges();
                var fd = $.FileDialog({accept: 'image/*'});
                fd.on('files.bs.filedialog', function(ev) {
                    var files = ev.files;
                    editor.body.focus();
                    for(var file_idx in files) {
                        var file = files[file_idx];
                        selection.refresh();
                        selection.restoreRanges(state);
                        selection.deleteFromDocument();
                        var range = selection.getRangeAt(0);
                        var img = flexed.api.make_image(file.content);
                        range.insertNode(img);
                    }
                });
            };
        }
        
    };
    

})(window.jQuery, window.rangy);
