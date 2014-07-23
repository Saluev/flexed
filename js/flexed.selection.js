/**
 * 
 * @source: https://github.com/Saluev/flexed/blob/master/js/flexed.selection.js
 * 
 * Copyright (C) 2014 Tigran Saluev
 * 
 */
(function($, flexed) {
    'use strict';
    
    if(!flexed) {
        console.error('flexed: load core script before extensions');
    }
    
    /* DOM utils */
    /* TODO: indexOf support? */
    Array.prototype.append = Array.prototype.push;
    Array.prototype.remove = function remove(what) {
        var idx = this.indexOf(what);
        if(idx >= 0) this.splice(idx, 1);
    }
    NodeList.prototype.indexOf = Array.prototype.indexOf;
    NodeList.prototype.forEach = Array.prototype.forEach;
    Node.prototype.insertAfter = function insertAfter(newElement, refElement) {
        if(refElement.nextSibling)
            this.insertBefore(newElement, refElement.nextSibling);
        else
            this.appendChild(newElement);
    }
    Node.prototype.getLeafs = function getLeafs() {
        var self = this;
        var result = [];
        if(self.childNodes.length == 0)
            return [self];
        for(var child_idx = 0; child_idx < self.childNodes.length; ++child_idx) {
            var child = self.childNodes[child_idx];
            result = result.concat(child.getLeafs());
        }
        return result;
    }
    Node.prototype.getAllNodes = function getAllNodes() {
        var self = this;
        var result = [self];
        for(var child_idx = 0; child_idx < self.childNodes.length; ++child_idx) {
            var child = self.childNodes[child_idx];
            result = result.concat(child.getAllNodes());
        }
        return result;
    }
    Node.prototype.textLength = function textLength() {
        var self = this;
        if(self.nodeType == self.TEXT_NODE)
            return self.wholeText.length;
        var result = 0;
        self.childNodes.forEach(function(node) {
            result += node.textLength();
        });
        return result;
    }
    
    var Range = function Range(range, container) {
        var self = this;
        var start, end, start_node, end_node;
        if(range instanceof Range) {
            if(!container || container === range.container) {
                /* just copying */
                self.start = range.start;
                self.end   = range.end;
                self.container = range.container;
                return;
            }
            /* copy with container change */
            if(container.contains(range.container)) {
                /* new container includes old container */
                start = range.start;
                end = range.end;
                start_node = end_node = range.container;
                /* now running standard algorithm below */
            } else if(range.container.contains(container)) {
                /* old container includes new container */
                throw new Error("not implemented"); /* TODO: implement/NotImplementedError */
                return;
            } else {
                /* the two containers don't intersect */
                throw new Error("flexed.Range: new container and old container don't intersect");
            }
        } else {
            /* casting rangy.WrappedRange or (?) built-in Range */
            start = end = 0;
            start_node = range.startContainer;
            end_node = range.endContainer;
            container = container || range.commonAncestorContainer;
        }
        self.container = container;
        /* computing start */
        if(start_node.nodeType == start_node.TEXT_NODE) {
            start += range.startOffset;
        } else {
            var siblings = start_node.childNodes;
            for(var i = 0; i < range.startOffset; ++i)
              start += siblings[i].textLength();
        }
        while(start_node != container) {
            var parent = start_node.parentNode;
            var siblings = parent.childNodes;
            var node_idx = siblings.indexOf(start_node);
            for(var i = 0; i < node_idx; ++i)
                start += siblings[i].textLength();
            start_node = parent;
        }
        self.start = start;
        /* computing end */
        if(end_node.nodeType == end_node.TEXT_NODE) {
            end += end_node.textLength() - range.endOffset;
        } else {
            var siblings = end_node.childNodes;
            for(var i = range.endOffset; i < siblings.length; ++i)
                end += siblings[i].textLength();
        }
        while(end_node != container) {
            var parent = end_node.parentNode;
            var siblings = parent.childNodes;
            var node_idx = siblings.indexOf(end_node);
            for(var i = node_idx + 1; i < siblings.length; ++i)
                end += siblings[i].textLength();
            end_node = parent;
        }
        self.end = end;
    }
    
    Range.prototype.toRange = function toRange() {
        var self = this;
        var result = rangy.createRange();
        
        var find_start_or_end = function(result, curr, curr_node, start_or_end) {
            /* Universal code for finding either start or end    */
            /* (This function can be moved outside of `toRange`) */
            while(curr_node.textLength() >= curr) {
                /* Searching for a child containing selection start or end */
                var children = curr_node.childNodes, N = children.length;
                for(var i = 0; i < N; ++i) {
                    /* Search is reversed when looking for end: */
                    var child = children[start_or_end ? i : (N - 1 - i)];
                    var tl = child.textLength();
                    if(curr >= tl) {
                        /* Node is shorter than not selected part - skip it */
                        curr -= tl;
                    } else {
                        /* Selection starts or ends inside or on an edge of this node */
                        curr_node = child;
                        break;
                    }
                }
                if(curr == 0) {
                    /* Selection starts or ends on an edge of this node */
                    start_or_end
                      ? result.setStartBefore(curr_node)
                      : result.setEndAfter   (curr_node);
                    break;
                } else if(curr_node.nodeType == curr_node.TEXT_NODE) {
                    /* Selection starts or ends inside this node, *
                     * and it is a text node: we are done         */
                    console.assert(curr_node.childNodes.length == 0);
                    start_or_end
                      ? result.setStart(curr_node, curr)
                      : result.setEnd  (curr_node, curr_node.textLength() - curr);
                    break;
                } else {
                    /* Selection starts or ends inside this node;
                     * recurse deeper */
                    continue;
                }
            }
        }
        
        find_start_or_end(result, self.start, self.container, true );
        find_start_or_end(result, self.end,   self.container, false);
        
        return result;
    }
    
    var Selection = function Selection(selection_or_ranges, container) {
        var self = this;
        var ranges;
        if(selection_or_ranges instanceof rangy.WrappedRange) {
            ranges = [selection_or_ranges];
        } else if(selection_or_ranges instanceof rangy.Selection) {
            ranges = selection_or_ranges.getAllRanges();
        } else if(selection_or_ranges instanceof Array) {
            ranges = selection_or_ranges;
        } else {
            throw new TypeError(
              'flexed.Selection: expected rangy.Selection, ' +
              'rangy.Range or array of ranges'
            );
        }
        self.ranges = ranges.map(function(range){ return flexed.createRange(range, container); });
    }
    
    /* static function */
    Selection.selectTag = function selectTag(tag, container) {
        var jcontainer = container || document;
        var elements = $(tag, jcontainer); /* jQuery here */
        /* selecting elements not lying in another elements of the same type: */
        elements = elements.not($(tag + " " + tag, jcontainer));
        var ranges = elements.map(function() {
            var result = rangy.createRange();
            result.selectNode(this);
            return result;
        }).get();
        return new Selection(ranges, container);
    }
    
    Selection.prototype.getNodes = function getNodes() {
        var result = [];
        self.ranges.forEach(function(range) {
            range = range.toRange();
            var nodes = range.commonAncestorContainer.getAllNodes().filter(function(node) {
                return range.intersectsNode(node) && result.indexOf(node) < 0;
            });
            result = result.concat(nodes);
        });
        return result;
    }
    
    Selection.prototype.stripTag = function stripTag(tag) {
        /* WARNING: this function also strips tags INTERSECTING selection */
        var self = this;
        var nodes = self.getNodes();
        tag = tag.toUpperCase();
        nodes.forEach(function(node) {
            if(node.nodeType == node.ELEMENT_NODE && node.tagName.toUpperCase() == tag) {
                var parent = node.parentNode;
                var children = node.childNodes;
                Array.prototype.forEach.apply(children, [function(child) {
                    node.removeChild(child);
                    parent.insertBefore(child, node);
                }]);
                parent.removeChild(node);
            }
        });
    }
    
    flexed.createRange = function createRange(r, c) { return new Range(r, c); };
    flexed.Range = Range;
    flexed.Selection = Selection;
    
})(window.jQuery, window.jQuery.fn.flexed);