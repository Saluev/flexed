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
    
    var Range = function Range(range) {
        var self = this;
        self.container = range.commonAncestorContainer;
        var start_node = range.startContainer, end_node = range.endContainer;
        var start = 0, end = 0;
        /* computing start */
        if(start_node.nodeType == start_node.TEXT_NODE) {
            start += range.startOffset;
        } else {
            var siblings = start_node.childNodes;
            for(var i = 0; i < range.startOffset; ++i)
              start += siblings[i].textLength();
        }
        while(start_node != self.container) {
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
        while(end_node != self.container) {
            var parent = end_node.parentNode;
            var siblings = parent.childNodes;
            var node_idx = siblings.indexOf(end_node);
            for(var i = node_idx + 1; i < siblings.length; ++i)
                end += siblings[i].textLength();
            end_node = parent;
        }
        self.end = end;
    }
    
    var Selection = function Selection(selection_or_ranges) {
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
        self.nodes = [];
        ranges.forEach(function(range) {
            var nodes = range.commonAncestorContainer.getAllNodes().filter(function(node) {
                /* TODO intersection test */
                return range.intersectsNode(node) && self.nodes.indexOf(node) < 0;
            });
            self.nodes = self.nodes.concat(nodes);
        });
        self.ranges = ranges.map(flexed.createRange);
    }
    
    Selection.prototype.stripTag = function stripTag(tag) {
        var self = this;
        tag = tag.toUpperCase();
        self.nodes.forEach(function(node) {
            if(node.nodeType == node.ELEMENT_NODE && node.tagName.toUpperCase() == tag) {
                self.nodes.remove(node);
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
    
    flexed.createRange = function createRange(range) { return new Range(range); };
    flexed.Range = Range;
    flexed.Selection = Selection;
    
})(window.jQuery, window.jQuery.fn.flexed);