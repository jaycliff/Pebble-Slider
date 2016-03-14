/*
    Copyright 2015 Jaycliff Arcilla of Eversun Software Philippines Corporation

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
/*
    DEPENDENCIES:
        jQuery library
        domxy
*/
/*jshint bitwise: false*/
if (typeof Number.toInteger !== "function") {
    Number.toInteger = function (arg) {
        "use strict";
        // ToInteger conversion
        arg = Number(arg);
        return (arg !== arg) ? 0 : (arg === 0 || arg === Infinity || arg === -Infinity) ? arg : (arg > 0) ? Math.floor(arg) : Math.ceil(arg);
    };
}
if (typeof String.prototype.trim !== "function") {
    String.prototype.trim = function () {
        "use strict";
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}
(function (window, $, undef) {
    "use strict";
    var $document = $(document),
        $window = $(window),
        applier = (function () {
            var list = [];
            return function (func, obj, args) {
                var i, length = args.length, result;
                list.length = 0;
                for (i = 0; i < length; i += 1) {
                    list.push(args[i]);
                }
                result = func.apply(obj, list);
                list.length = 0;
                return result;
            };
        }());
    if (typeof $.fn.getX !== "function") {
        $.fn.getX = function () {
            return this.offset().left;
        };
    }
    if (typeof $.fn.getY !== "function") {
        $.fn.getY = function () {
            return this.offset().top;
        };
    }
    $.createPebbleSlider = function (options) {
        var is_options_valid = $.type(options) === 'object',
            $ps_wrap = $(document.createElement('span')),
            $ps_subwrap = $(document.createElement('span')),
            $ps_range_base = $(document.createElement('span')),
            $ps_range_aligner = $(document.createElement('span')),
            $ps_range_sizer = $(document.createElement('span')),
            $ps_range_rail = $(document.createElement('span')),
            $ps_range_limiter = $(document.createElement('span')),
            $ps_range_bar = $(document.createElement('span')),
            $ps_toggle_overlay_and_limiter = $(document.createElement('span')),
            $ps_toggle_base = $(document.createElement('span')),
            $ps_toggle_rail = $(document.createElement('span')),
            $ps_toggle_neck = $(document.createElement('span')),
            $ps_toggle_handle = $(document.createElement('span')),
            trigger_param_list = [],
            $_proto = $.fn,
            default_tab_index = (is_options_valid && Number.toInteger(options.tabIndex)) || 0,
            tab_index = default_tab_index,
            type = (is_options_valid && String(options.type).trim().toLowerCase() === 'vertical') ? 'vertical' : 'horizontal',
            type_class = (type === 'vertical') ? 'ps-vertical-type' : 'ps-horizontal-type',
            //css_dimension_prop = (type === 'vertical') ? 'height' : 'width',
            active = false,
            disabled = true,
            //step = 0,
            transition_class_added = false,
            default_min_val = (is_options_valid && Number(options.min)) || 0,
            default_max_val = 100,
            default_val,
            min_value = default_min_val,
            max_value = default_max_val,
            max_sub,
            value,
            user_set_value = false,
            prev_input_value,
            prev_change_value,
            pebble_slider_object,
            $pebble_slider_object;
        //console.log(options);
        if (is_options_valid && Object.prototype.hasOwnProperty.call(options, 'max')) {
            default_max_val = Number(options.max) || 0;
            max_value = default_max_val;
        }
        function getComputedMax() {
            var max = max_value;
            if ((max < min_value) && (min_value < 100)) {
                max = 100;
            }
            return max;
        }
        if (is_options_valid && Object.prototype.hasOwnProperty.call(options, 'value')) {
            max_sub = getComputedMax();
            default_val = Number(options.value) || 0;
            if (default_val > max_sub) {
                default_val = max_sub;
            }
            if (default_val < min_value) {
                default_val = min_value;
            }
        }
        default_val = (min_value >= max_value) ? min_value : (min_value + ((max_value - min_value) / 2));
        value = default_val;
        prev_input_value = value;
        prev_change_value = value;
        function initializeParts() {
            $ps_wrap
                .addClass('pebble-slider')
                .addClass(type_class)
                .addClass('ps-wrap')
                .attr('tabindex', tab_index);
            $ps_subwrap.addClass('ps-subwrap');
            $ps_range_base.addClass('ps-range-base');
            $ps_range_aligner.addClass('ps-range-aligner');
            $ps_range_sizer.addClass('ps-range-sizer');
            $ps_range_rail.addClass('ps-range-rail');
            $ps_range_limiter.addClass('ps-range-limiter');
            $ps_range_bar.addClass('ps-range-bar');
            $ps_toggle_overlay_and_limiter.addClass('ps-toggle-overlay-and-limiter');
            $ps_toggle_base.addClass('ps-toggle-base');
            $ps_toggle_rail.addClass('ps-toggle-rail');
            $ps_toggle_neck.addClass('ps-toggle-neck');
            $ps_toggle_handle.addClass('ps-toggle-handle');
            // Connect the parts
            $ps_wrap.append($ps_subwrap);
            $ps_subwrap.append($ps_range_base);
            $ps_range_base.append($ps_range_aligner);
            $ps_range_aligner.append($ps_range_sizer);
            $ps_range_sizer.append($ps_range_rail);
            $ps_range_rail.append($ps_range_limiter);
            $ps_range_limiter.append($ps_range_bar);
            $ps_subwrap.append($ps_toggle_overlay_and_limiter);
            $ps_toggle_overlay_and_limiter.append($ps_toggle_base);
            $ps_toggle_base.append($ps_toggle_rail);
            $ps_toggle_rail.append($ps_toggle_neck);
            $ps_toggle_neck.append($ps_toggle_handle);
        }
        initializeParts();
        // Some utilities
        function removeTransitionClass() {
            //console.log('removeTransitionClass');
            $ps_subwrap
                .removeClass('ps-transition')
                .off('transitionend', removeTransitionClass);
            transition_class_added = false;
        }
        function addTransitionClass() {
            //console.log('addTransitionClass');
            $ps_subwrap
                .addClass('ps-transition')
                .on('transitionend', removeTransitionClass);
            transition_class_added = true;
        }
        // getComputedValue is used to get the cured value if the user didn't enter any specific value ->
        // -> either via direct ui input or the value method (both of which sets user_set_value to true) ->
        // this is part of the default chrome range input behaviour simulation
        function getComputedValue(computed_max) {
            var val = value;
            if (computed_max === undef) {
                computed_max = getComputedMax();
            }
            if (val > computed_max) {
                val = computed_max;
            }
            if (val < min_value) {
                val = min_value;
            }
            return val;
        }
        // updateStructure refreshes the slider's UI
        function updateStructure() {
            var offset_hor, offset_ver, tr_offset_ver;
            if ($ps_wrap[0].parentNode === null) {
                return; // Bail out since it's not attached to the DOM
            }
            offset_hor = ($ps_toggle_neck.outerWidth() / 2);
            offset_ver = ($ps_toggle_neck.outerHeight() / 2);
            tr_offset_ver = $ps_toggle_rail.outerHeight() / 2;
            switch (type) {
            case 'horizontal':
                $ps_toggle_neck
                    .css('margin-left', ((offset_hor > 0) ? '-' + offset_hor : 0) + 'px')
                    .css('margin-top', (tr_offset_ver - (offset_ver + tr_offset_ver)) + 'px');
                    //.css('top', (((($ps_toggle_rail.outerHeight() / 2) - offset_ver) / $ps_toggle_rail.outerHeight()) * 100) + '%');
                $ps_range_sizer.css('max-height', $ps_wrap.css('height'));
                $ps_range_limiter.attr('style', 'left: ' + (offset_hor - parseInt($ps_range_rail.css('border-left'), 10)) + 'px !important; right: ' + (offset_hor - parseInt($ps_range_rail.css('border-right'), 10)) + 'px !important;');
                $ps_toggle_overlay_and_limiter.attr('style', 'left: ' + offset_hor + 'px !important; right: ' + offset_hor + 'px !important;');
                break;
            case 'vertical':
                $ps_toggle_neck
                    .css('margin-left', ((offset_hor > 0) ? '-' + offset_hor : 0) + 'px')
                    .css('margin-bottom', (tr_offset_ver - (offset_ver + tr_offset_ver)) + 'px');
                    //.css('top', (((($ps_toggle_rail.outerHeight() / 2) - offset_ver) / $ps_toggle_rail.outerHeight()) * 100) + '%');
                $ps_range_sizer.css('max-width', $ps_wrap.css('width'));
                $ps_range_limiter.attr('style', 'top: ' + (offset_ver - parseInt($ps_range_rail.css('border-top'), 10)) + 'px !important; bottom: ' + (offset_ver - parseInt($ps_range_rail.css('border-bottom'), 10)) + 'px !important;');
                $ps_toggle_overlay_and_limiter.attr('style', 'top: ' + offset_ver + 'px !important; bottom: ' + offset_ver + 'px !important;');
                break;
            }
            return pebble_slider_object;
        }
        // Updates the slider UI
        function refreshControls(animate) {
            var rate;
            if ($ps_wrap[0].parentNode === null) {
                return; // Bail out since it's not attached to the DOM
            }
            max_sub = getComputedMax();
            if (max_sub <= min_value) {
                rate = 0;
            } else {
                rate = ((value - min_value) / (max_sub - min_value));
            }
            if (!!animate && (disabled === false) && (transition_class_added === false)) {
                addTransitionClass();
            }
            switch (type) {
            case 'horizontal':
                $ps_range_bar.css('right', (100 - (rate * 100)) + '%');
                $ps_toggle_neck.css('left', (rate * 100) + '%');
                break;
            case 'vertical':
                $ps_range_bar.css('top', (100 - (rate * 100)) + '%');
                $ps_toggle_neck.css('bottom', (rate * 100) + '%');
                break;
            }
            return pebble_slider_object;
        }
        // Create the jQueryfied pebble slider object (http://api.jquery.com/jQuery/#working-with-plain-objects)
        $pebble_slider_object = $({
            tabIndex: function (index) {
                if (arguments.length > 0) {
                    $bs_wrap.attr('tabindex', Number.toInteger(index));
                    return pebble_slider_object;
                }
                return tab_index;
            },
            min: function (val) {
                if (arguments.length > 0) {
                    min_value = Number(val) || 0;
                    if (user_set_value) {
                        max_sub = getComputedMax();
                        if (value > max_sub) {
                            value = max_sub;
                        }
                        if (value < min_value) {
                            value = min_value;
                        }
                    }
                    refreshControls(true);
                    return pebble_slider_object;
                }
                return min_value;
            },
            max: function (val) {
                if (arguments.length > 0) {
                    max_value = Number(val) || 0;
                    if (user_set_value) {
                        max_sub = getComputedMax();
                        if (value > max_sub) {
                            value = max_sub;
                        }
                        if (value < min_value) {
                            value = min_value;
                        }
                    }
                    refreshControls(true);
                    return pebble_slider_object;
                }
                return max_value;
            },
            val: function (val) {
                max_sub = getComputedMax();
                if (arguments.length > 0) {
                    val = Number(val) || 0;
                    if (val > max_sub) {
                        val = max_sub;
                    }
                    if (val < min_value) {
                        val = min_value;
                    }
                    value = val;
                    prev_input_value = val;
                    prev_change_value = val;
                    user_set_value = true;
                    refreshControls(true);
                    return pebble_slider_object;
                }
                return (user_set_value) ? value : getComputedValue(max_sub);
            },
            attachTo: function (arg) {
                $ps_wrap.appendTo(arg);
                removeTransitionClass();
                updateStructure();
                refreshControls();
                return pebble_slider_object;
            },
            switchTo: function (arg) {
                var $target;
                if (arg instanceof $) {
                    $target = arg;
                } else {
                    $target = $(arg);
                }
                $target = $target.replaceWith($ps_wrap);
                removeTransitionClass();
                updateStructure();
                refreshControls();
                return $target;
            },
            refresh: refreshControls,
            //updateStructure: updateStructure,
            getElement: function () {
                return $ps_wrap;
            }
        });
        pebble_slider_object = $pebble_slider_object[0];
        // Event-handling setup
        (function () {
            var allowance = 0, mouseDownMouseMoveHandler, docWinEventHandler, prevX = 0, prevY = 0;
            /*
                The nowX-nowY-prevX-prevY tandem is a hack for browsers with stupid mousemove event implementation (Chrome, I'm looking at you!).
                What is this stupidity you're talking about?
                    Some browsers fire a single mousemove event of an element everytime a mousedown event of that same element fires.
                LINK(S):
                    http://stackoverflow.com/questions/24670598/why-does-chrome-raise-a-mousemove-on-mousedown
            */
            mouseDownMouseMoveHandler = function (event) {
                var nowX, nowY, base, dimension, rate, calculated_value;
                event.preventDefault(); // This somehow disables text-selection
                switch (event.type) {
                case 'touchstart':
                    //console.log('touchstart');
                    // http://stackoverflow.com/questions/4780837/is-there-an-equivalent-to-e-pagex-position-for-touchstart-event-as-there-is-fo
                    event.pageX = event.originalEvent.touches[0].pageX;
                    event.pageY = event.originalEvent.touches[0].pageY;
                    /* falls through */
                case 'mousedown':
                    // Disable right-click
                    if (event.which === 3) {
                        return;
                    }
                    active = true;
                    nowX = event.pageX;
                    nowY = event.pageY;
                    if (transition_class_added === false) {
                        addTransitionClass();
                        //console.log('Hey');
                    }
                    $ps_toggle_neck.addClass('active');
                    prevX = nowX;
                    prevY = nowY;
                    $document
                        .on('mousemove touchmove', mouseDownMouseMoveHandler)
                        .on('mouseup touchend', docWinEventHandler);
                    $window.on('blur', docWinEventHandler);
                    if (event.target === $ps_toggle_handle[0] || event.target === $ps_toggle_neck[0]) {
                        switch (type) {
                        case 'horizontal':
                            allowance = nowX - ($ps_toggle_neck.getX() - parseInt($ps_toggle_neck.css('margin-left'), 10));
                            break;
                        case 'vertical':
                            allowance = nowY - ($ps_toggle_neck.getY() - parseInt($ps_toggle_neck.css('margin-bottom'), 10));
                            break;
                        }
                        return;
                    }
                    allowance = 0;
                    break;
                case 'touchmove':
                    //console.log('touchmove');
                    event.pageX = event.originalEvent.touches[0].pageX;
                    event.pageY = event.originalEvent.touches[0].pageY;
                    /* falls through */
                case 'mousemove':
                    nowX = event.pageX;
                    nowY = event.pageY;
                    if (nowX === prevX && nowY === prevY) {
                        return; // Bail out, since it's a faux mousemove event
                    }
                    if (transition_class_added === true) {
                        removeTransitionClass();
                    }
                    break;
                }
                switch (type) {
                case 'horizontal':
                    dimension = $ps_range_limiter.width();
                    base = Math.floor((nowX - allowance) - $ps_range_limiter.getX());
                    break;
                case 'vertical':
                    dimension = $ps_range_limiter.height();
                    base = dimension - Math.floor((nowY - allowance) - $ps_range_limiter.getY());
                    //base = Math.floor((nowY - allowance) - $ps_range_limiter.getY());
                    break;
                }
                if (base > dimension) {
                    base = dimension;
                } else if (base < 0) {
                    base = 0;
                }
                rate = base / dimension;
                max_sub = getComputedMax();
                if (max_sub >= min_value) {
                    prev_input_value = (user_set_value) ? value : getComputedValue(max_sub);
                    calculated_value = min_value + (rate * (max_sub - min_value));
                    if (disabled === false) {
                        if (calculated_value !== prev_input_value) {
                            user_set_value = true;
                            value = calculated_value;
                            trigger_param_list.push(value);
                            $pebble_slider_object.triggerHandler('input', trigger_param_list);
                            trigger_param_list.length = 0;
                        }
                    }
                }
                refreshControls(true);
            };
            docWinEventHandler = function () {
                //console.log('docWinEventHandler');
                var value_sub = (user_set_value) ? value : getComputedValue();
                active = false;
                if (disabled === false) {
                    trigger_param_list.push(value_sub);
                    // 'seek' event is like a forced-change event
                    $pebble_slider_object.triggerHandler('seek', trigger_param_list);
                    if (prev_change_value !== value_sub) {
                        $pebble_slider_object.triggerHandler('change', trigger_param_list);
                        prev_change_value = value_sub;
                    }
                    trigger_param_list.length = 0;
                }
                $ps_toggle_neck.removeClass('active');
                $window.off('blur', docWinEventHandler);
                $document
                    .off('mousemove touchmove', mouseDownMouseMoveHandler)
                    .off('mouseup touchend', docWinEventHandler);
            };
            function enableDisableAid(event) {
                switch (event.type) {
                case 'touchstart':
                    /* falls through */
                case 'mousedown':
                    event.preventDefault();
                    break;
                }
            }
            pebble_slider_object.enable = function () {
                if (disabled === true) {
                    disabled = false;
                    $ps_wrap
                        .removeClass('disabled')
                        .attr('tabindex', tab_index);
                    $ps_subwrap
                        .off('mousedown', enableDisableAid)
                        .on('mousedown touchstart', mouseDownMouseMoveHandler);
                }
                return pebble_slider_object;
            };
            pebble_slider_object.disable = function () {
                if (disabled === false) {
                    disabled = true;
                    if (active) {
                        docWinEventHandler(); // Manually trigger the 'mouseup / window blur' event handler
                    }
                    $ps_wrap
                        .addClass('disabled')
                        .removeAttr('tabindex');
                    $ps_subwrap
                        .off('mousedown touchstart', mouseDownMouseMoveHandler)
                        .on('mousedown', enableDisableAid);
                    removeTransitionClass();
                }
                return pebble_slider_object;
            };
            pebble_slider_object.on = function () {
                applier($_proto.on, $pebble_slider_object, arguments);
                return pebble_slider_object;
            };
            pebble_slider_object.one = function () {
                applier($_proto.one, $pebble_slider_object, arguments);
                return pebble_slider_object;
            };
            pebble_slider_object.off = function () {
                applier($_proto.off, $pebble_slider_object, arguments);
                return pebble_slider_object;
            };
            function resetStructure() {
                var parentNode = $ps_wrap[0].parentNode;
                if (parentNode !== null) {
                    $ps_wrap.detach();
                }
                $ps_wrap
                    .removeAttr('class')
                    .removeAttr('style')
                    .removeAttr('tabindex');
                $ps_subwrap
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_range_base
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_range_aligner
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_range_sizer
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_range_rail
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_range_limiter
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_range_bar
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_toggle_overlay_and_limiter
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_toggle_base
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_toggle_rail
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_toggle_neck
                    .removeAttr('class')
                    .removeAttr('style');
                $ps_toggle_handle
                    .removeAttr('class')
                    .removeAttr('style');
                initializeParts();
                if (parentNode !== null) {
                    $ps_wrap.appendTo(parentNode);
                }
            }
            pebble_slider_object.reset = function (hard) {
                pebble_slider_object.disable();
                $pebble_slider_object.off();
                if (Boolean(hard) === true) {
                    resetStructure();
                    $ps_wrap.off();
                    $ps_subwrap.off();
                    $ps_range_base.off();
                    $ps_range_aligner.off();
                    $ps_range_sizer.off();
                    $ps_range_rail.off();
                    $ps_range_limiter.off();
                    $ps_range_bar.off();
                    $ps_toggle_overlay_and_limiter.off();
                    $ps_toggle_base.off();
                    $ps_toggle_rail.off();
                    $ps_toggle_neck.off();
                    $ps_toggle_handle.off();
                }
                min_value = default_min_val;
                max_value = default_max_val;
                value = default_val;
                prev_input_value = value;
                prev_change_value = value;
                $ps_wrap.attr('tabindex', tab_index);
                refreshControls(true);
                pebble_slider_object.enable();
                return pebble_slider_object;
            };
        }());
        //$ps_toggle_neck.on('transitionend', function () { alert('END'); });
        $ps_wrap.data('ps:host-object', pebble_slider_object).data('pebble-slider-object', pebble_slider_object);
        pebble_slider_object.enable();
        return pebble_slider_object;
    };
}(window, (typeof jQuery === "function" && jQuery) || (typeof module === "object" && typeof module.exports === "function" && module.exports)));
