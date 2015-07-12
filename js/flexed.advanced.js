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
    
    var wrap_element = function wrap_element(el, tag) {
        var range = rangy.createRange();
        range.selectNodeContents(el);
        wrap_range(range, tag);
    }
    
    var wrap_range = function wrap_range(range, tag) {
        var container = range.commonAncestorContainer;
        var start = range.startContainer, end = range.endContainer;
        
        if(start.nodeType == start.TEXT_NODE) {
            var parent = start.parentNode;
            var new_el = document.createElement(tag);
            var text = start.wholeText;
            var start_text = new Text(text.slice(0, range.startOffset));
            parent.replaceChild(start_text, start);
            var new_text = text.slice(range.startOffset, start === end ? range.endOffset : undefined);
            new_el.innerHTML = new_text;
            parent.insertAfter(new_el, start_text);
            if(start === end) {
                var final_text = new Text(text.slice(range.endOffset));
                parent.insertAfter(final_text, new_el);
                return; // TODO return new range
            }
            var new_range = range.cloneRange();
            new_range.setStartAfter(new_el);
            return wrap_range(new_range, tag); // TODO return new range
        }
        
        if(end.nodeType == end.TEXT_NODE) {
            var parent = end.parentNode;
            var new_el = document.createElement(tag);
            var text = end.wholeText;
            new_el.innerHTML = text.slice(0, range.endOffset);
            parent.insertBefore(new_el, end);
            var end_text = new Text(text.slice(range.endOffset));
            parent.replaceChild(end_text, end);
            
            var new_range = range.cloneRange();
            new_range.setEndBefore(new_el);
            return wrap_range(new_range, tag); // TODO return new range
        }
        
        var leafs = container.getLeafs().filter(function(node) {
            return range.containsNode(node);
        }).forEach(function(node) {
            wrap_element(node, tag);
        });
    }
    
    var apply_template = function(tag) {
      var result = function apply(selection, editor) {
        var ranges = selection.getAllRanges();
        for(var range_idx in ranges) {
          var range = ranges[range_idx];
          wrap_range(range, tag);
        }
      };
      return result;
    };
    var indicate_template = function(tag) {
      var result = function indicate(selection, editor) {
        
      };
      return result;
    };
    var image_container_id = 1;
    var make_image = function(src) {
        var img = document.createElement('img');
        img.src = src;
        img.className = 'flexed-image flexed-contained';
        img.setAttribute('draggable', false);
        var div = document.createElement('div');
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
    // binding to all flexed-containers ever created
    $(document).on('dragstart', '.flexed-container', null, function(ev) {
          ev.originalEvent.dataTransfer.setData('text/html', '~~~REPLACEWITH=#' + this.id + '~~~');
    });
    
    
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
        {
            id: 'bold',
            caption: '<i class="fa fa-bold"></i>',
            tooltip: 'Bold',
            apply: apply_template('b'),
            indicate: indicate_template('b'),
        },
 
        {
            id: 'italic',
            caption: '<i class="fa fa-italic"></i>',
            tooltip: 'Italic',
            apply: apply_template('i'),
            indicate: indicate_template('i'),
        },
        
        {
            id: 'underline',
            caption: '<i class="fa fa-underline"></i>',
            tooltip: 'Underline',
            apply: apply_template('u'),
            indicate: indicate_template('u'),
        },
        
        {
            id: 'strikethrough',
            caption: '<i class="fa fa-strikethrough"></i">',
            tooltip: 'Strikethrough',
            apply: apply_template('s'),
            indicate: indicate_template('s'),
        }
      ],
      [
        {
            id: 'justifyleft',
            caption: '<i class="fa fa-align-left"></i>',
            tooltip: 'Align left',
            //apply: apply_template('justifyLeft'),
            //indicate: indicate_template('justifyLeft'),
        },
        {
            id: 'justifycenter',
            caption: '<i class="fa fa-align-center"></i>',
            tooltip: 'Center',
            //apply: apply_template('justifyCenter'),
            //indicate: indicate_template('justifyCenter'),
        },
        {
            id: 'justifyright',
            caption: '<i class="fa fa-align-right"></i>',
            tooltip: 'Align right',
            //apply: apply_template('justifyRight'),
            //indicate: indicate_template('justifyRight'),
        },
        {
            id: 'justifyfull',
            caption: '<i class="fa fa-align-justify"></i>',
            tooltip: 'Justify',
            //apply: apply_template('justifyFull'),
            //indicate: indicate_template('justifyFull'),
        },
        
      ],
      [
        {
            id: 'image',
            caption: '<i class="fa fa-image"></i>',
            tooltip: 'Image',
            apply: function apply_image(selection, editor) {
                var fd = $.FileDialog({accept: 'image/*'});
                fd.on('files.bs.filedialog', function(ev) {
                    var files = ev.files;
                    editor.body.focus();
                    for(var file_idx in files) {
                        var file = files[file_idx];
                        console.log(file.content);
                        selection.refresh();
                        selection.restoreRanges(state);
                        selection.deleteFromDocument();
                        var range = selection.getRangeAt(0);
                        var img = make_image(file.content);
                        range.insertNode(img);
                    }
                });
            }
            
            
            
        }
      ]
    ];
    
    flexed.suites.advanced = {
        toolbar: toolbar
    };
    
    flexed.defaults.suite = flexed.defaults.suite || flexed.suites.advanced;
    
})(window.jQuery, window.jQuery.fn.flexed);