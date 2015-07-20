/*
    Copyright 2015 Jaycliff Arcilla of Eversun Software Philippines Corporation (Davao Branch)
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
/*jslint browser: true, devel: true */
/*global jQuery*/
(function (window, $) {
    "use strict";
    var extend_options;
    function getDOMX(elem) {
        var doc,
            body,
            doc_elem,
            win,
            scroll_left,
            client_left;
        if (!elem || !elem.ownerDocument) {
            return 0;
        }
        doc = elem.ownerDocument;
        body = doc.body;
        doc_elem = doc.documentElement;
        win = doc.defaultView || doc.parentWindow;
        scroll_left = win.pageXOffset || doc_elem.scrollLeft || body.scrollLeft;
        client_left = doc_elem.clientLeft || body.clientLeft || 0;
        // Support: BlackBerry 5, iOS 3 (original iPhone)
        // If we don't have gBCR, just use 0 rather than throw an error
        return (((typeof elem.getBoundingClientRect === "function") ? elem.getBoundingClientRect().left : 0) + scroll_left) - client_left;
    }
    function getDOMY(elem) {
        var doc,
            body,
            doc_elem,
            win,
            scroll_top,
            client_top;
        if (!elem || !elem.ownerDocument) {
            return 0;
        }
        doc = elem.ownerDocument;
        body = doc.body;
        doc_elem = doc.documentElement;
        win = doc.defaultView || doc.parentWindow;
        scroll_top = win.pageYOffset || doc_elem.scrollTop || body.scrollTop;
        client_top = doc_elem.clientTop || body.clientTop || 0;
        // Support: BlackBerry 5, iOS 3 (original iPhone)
        // If we don't have gBCR, just use 0 rather than throw an error
        return (((typeof elem.getBoundingClientRect === "function") ? elem.getBoundingClientRect().top : 0) + scroll_top) - client_top;
    }
    extend_options = {
        getX: function getX() {
            if (this.length > 0) {
                return getDOMX(this[0]);
            }
            return 0;
        },
        getY: function getY() {
            if (this.length > 0) {
                return getDOMY(this[0]);
            }
            return 0;
        }
    };
    // $.fn === $.prototype
    $.fn.extend(extend_options);
    $.getDOMX = getDOMX;
    $.getDOMY = getDOMY;
    window.getDOMX = getDOMX;
    window.getDOMY = getDOMY;
}(window, window.jQuery || (window.module && window.module.exports)));