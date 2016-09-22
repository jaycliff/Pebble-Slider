/*
    Copyright 2016 Jaycliff Arcilla of Eversun Software Philippines Corporation

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
/*global Boolean, Math, Number, document, window, jQuery, module*/
/*jslint bitwise: false, unparam: true*/
/*jshint bitwise: false, unused: false*/
if (typeof Number.toInteger !== "function") {
    Number.toInteger = function toInteger(arg) {
        "use strict";
        // ToInteger conversion
        arg = Number(arg);
        return (arg !== arg) ? 0 : (arg === 0 || arg === Infinity || arg === -Infinity) ? arg : (arg > 0) ? Math.floor(arg) : Math.ceil(arg);
    };
}
if (typeof Number.isFinite !== "function") {
    Number.isFinite = function isFinite(value) {
        "use strict";
        return typeof value === "number" && isFinite(value);
    };
}
if (typeof String.prototype.trim !== "function") {
    String.prototype.trim = function trim() {
        "use strict";
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}
(function createPebbleSliderSetup(window, $, undef) {
    "use strict";
    var $document = $(document),
        $window = $(window),
        floor = Math.floor,
        round = Math.round,
        applier = (function () {
            var list = [];
            return function applier(func, obj, args) {
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
        $.fn.getX = function getX() {
            return this.offset().left;
        };
    }
    if (typeof $.fn.getY !== "function") {
        $.fn.getY = function getY() {
            return this.offset().top;
        };
    }
    function decimalDigitsLength(num) {
        var string, dot_index;
        if (typeof num !== "number") {
            throw new TypeError('parameter must be a number');
        }
        string = String(num);
        dot_index = string.indexOf('.');
        if (dot_index < 0) {
            return 0;
        }
        return string.length - (dot_index + 1);
    }
    function valueByStep(value, step, round_type) {
        var multiplier = Math.pow(10, decimalDigitsLength(step));
        if (!round_type) {
            round_type = 'round';
        }
        //console.log('VALUE: ' + value + ', STEP: ' + step + ', MULTIPLIER: ' + multiplier);
        value = round(value * multiplier);
        step = round(step * multiplier);
        return (Math[round_type](value / step) * step) / multiplier;
    }
    $.createPebbleSlider = function createPebbleSlider(options) {
        var is_options_valid = $.type(options) === 'object',
            $ps_wrap = $(document.createElement('span')),
            $ps_subwrap = $(document.createElement('span')),
            $ps_range_base = $(document.createElement('span')),
            $ps_range_aligner = $(document.createElement('span')),
            $ps_range_sizer = $(document.createElement('span')),
            $ps_range_rail = $(document.createElement('span')),
            $ps_range_limiter = $(document.createElement('span')),
            $ps_range_negative_spectrum_bar = $(document.createElement('span')),
            $ps_range_positive_spectrum_bar = $(document.createElement('span')),
            $ps_range_bar = $(document.createElement('span')),
            $ps_toggle_overlay_and_limiter = $(document.createElement('span')),
            $ps_toggle_base = $(document.createElement('span')),
            $ps_toggle_rail = $(document.createElement('span')),
            $ps_toggle_neck = $(document.createElement('span')),
            $ps_toggle_handle = $(document.createElement('span')),
            $hot_swap_dummy = $(document.createElement('span')),
            hasOwnProperty = Object.prototype.hasOwnProperty,
            parts_list = [$ps_wrap, $ps_subwrap, $ps_range_base, $ps_range_aligner, $ps_range_sizer, $ps_range_rail, $ps_range_limiter, $ps_range_negative_spectrum_bar, $ps_range_positive_spectrum_bar, $ps_range_bar, $ps_toggle_overlay_and_limiter, $ps_toggle_base, $ps_toggle_rail, $ps_toggle_neck, $ps_toggle_handle],
            trigger_param_list = [],
            $_proto = $.fn,
            default_tab_index = (is_options_valid && Number.toInteger(options.tabIndex)) || 0,
            tab_index = default_tab_index,
            type = (is_options_valid && String(options.type).trim().toLowerCase() === 'vertical') ? 'vertical' : 'horizontal',
            type_class = (type === 'vertical') ? 'ps-vertical-type' : 'ps-horizontal-type',
            active = false,
            disabled = true,
            transition_class_added = false,
            properties,
            prev_input_value,
            prev_change_value,
            pebble_slider_object,
            $pebble_slider_object;
        properties = (function () {
            var obj = {},
                temp,
                user_set = false,
                def_step = 1,
                def_min = 0,
                def_max = 100,
                def_value,
                do_median_value = true,
                step = def_step,
                min = def_min,
                max = def_max,
                value;
            if (is_options_valid) {
                if (hasOwnProperty.call(options, 'step')) {
                    temp = Number(options.step) || 1;
                    if (temp < 0) {
                        temp = 1;
                    }
                    if (Number.isFinite(temp)) {
                        def_step = temp;
                        step = def_step;
                    }
                }
                if (hasOwnProperty.call(options, 'max')) {
                    temp = Number(options.max) || 0;
                    if (Number.isFinite(temp)) {
                        def_max = temp;
                        max = def_max;
                    }
                }
                if (hasOwnProperty.call(options, 'min')) {
                    temp = Number(options.min) || 0;
                    if (Number.isFinite(temp)) {
                        def_min = temp;
                        min = def_min;
                    }
                }
                if (hasOwnProperty.call(options, 'value')) {
                    temp = Number(options.value) || 0;
                    if (Number.isFinite(temp)) {
                        def_value = temp;
                        value = def_value;
                        do_median_value = false;
                    }
                }
            }
            if (do_median_value) {
                def_value = (min >= max) ? min : (min + ((max - min) / 2));
                value = def_value;
            }
            Object.defineProperties(obj, {
                "max": {
                    get: function () {
                        var c_max = max;
                        if ((c_max < min) && (min < 100)) {
                            c_max = 100;
                        }
                        return c_max;
                    },
                    set: function (val) {
                        max = val;
                    }
                },
                "maxRaw": {
                    get: function () {
                        return max;
                    }
                },
                "min": {
                    get: function () {
                        return min;
                    },
                    set: function (val) {
                        min = val;
                    }
                },
                "value": {
                    get: function () {
                        var c_max = this.max, val = value;
                        if (val > c_max) {
                            val = c_max;
                        }
                        if (val < min) {
                            val = min;
                        }
                        return (user_set) ? val : valueByStep(val, step);
                    },
                    set: function (val) {
                        value = val;
                        user_set = true;
                    }
                },
                "step": {
                    get: function () {
                        return step;
                    },
                    set: function (val) {
                        step = val;
                    }
                }
            });
            obj.reset = function reset() {
                max = def_max;
                min = def_min;
                value = def_value;
            };
            return obj;
        }());
        prev_input_value = properties.value;
        prev_change_value = prev_input_value;
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
            $ps_range_negative_spectrum_bar.addClass('ps-range-negative-spectrum-bar').addClass('hidden');
            $ps_range_positive_spectrum_bar.addClass('ps-range-positive-spectrum-bar').addClass('hidden');
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
            $ps_range_limiter
                .append($ps_range_bar)
                .append($ps_range_negative_spectrum_bar)
                .append($ps_range_positive_spectrum_bar);
            $ps_subwrap.append($ps_toggle_overlay_and_limiter);
            $ps_toggle_overlay_and_limiter.append($ps_toggle_base);
            $ps_toggle_base.append($ps_toggle_rail);
            $ps_toggle_rail.append($ps_toggle_neck);
            $ps_toggle_neck.append($ps_toggle_handle);
            if (is_options_valid) {
                if (hasOwnProperty.call(options, 'width')) {
                    $ps_wrap.css('width', options.width);
                }
                if (hasOwnProperty.call(options, 'height')) {
                    $ps_wrap.css('height', options.height);
                }
                if (hasOwnProperty.call(options, 'spectrum')) {
                    if (typeof options.spectrum === "boolean") {
                        if (options.spectrum) {
                            $ps_range_bar.addClass('hidden');
                            $ps_range_negative_spectrum_bar.removeClass('hidden');
                            $ps_range_positive_spectrum_bar.removeClass('hidden');
                        } else {
                            $ps_range_bar.removeClass('hidden');
                            $ps_range_negative_spectrum_bar.addClass('hidden');
                            $ps_range_positive_spectrum_bar.addClass('hidden');
                        }
                    }
                }
            }
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
        function updateSpectrumBars() {
            var side_allowance, sb_style;
            switch (type) {
            case 'horizontal':
                sb_style = $ps_range_positive_spectrum_bar[0].style;
                if (properties.min >= 0) {
                    side_allowance = $ps_toggle_neck.outerWidth() / 2;
                    sb_style.setProperty('margin-left', -side_allowance + 'px', 'important');
                    sb_style.setProperty('border-left-width', side_allowance + 'px', 'important');
                } else {
                    sb_style.marginLeft = '';
                    sb_style.borderLeftWidth = '';
                }
                sb_style = $ps_range_negative_spectrum_bar[0].style;
                if (properties.max <= 0) {
                    side_allowance = $ps_toggle_neck.outerWidth() / 2;
                    sb_style.setProperty('margin-right', -side_allowance + 'px', 'important');
                    sb_style.setProperty('border-right-width', side_allowance + 'px', 'important');
                } else {
                    sb_style.marginRight = '';
                    sb_style.borderRightWidth = '';
                }
                break;
            case 'vertical':
                sb_style = $ps_range_positive_spectrum_bar[0].style;
                if (properties.min >= 0) {
                    side_allowance = $ps_toggle_neck.outerHeight() / 2;
                    sb_style.setProperty('margin-bottom', -side_allowance + 'px', 'important');
                    sb_style.setProperty('border-bottom-width', side_allowance + 'px', 'important');
                } else {
                    sb_style.marginBottom = '';
                    sb_style.borderBottomWidth = '';
                }
                sb_style = $ps_range_negative_spectrum_bar[0].style;
                if (properties.max <= 0) {
                    side_allowance = $ps_toggle_neck.outerHeight() / 2;
                    sb_style.setProperty('margin-top', -side_allowance + 'px', 'important');
                    sb_style.setProperty('border-top-width', side_allowance + 'px', 'important');
                } else {
                    sb_style.marginTop = '';
                    sb_style.borderTopWidth = '';
                }
                break;
            }
        }
        // refresh, uh, refreshes the slider's UI
        function refresh(update_controls, animate) {
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
            updateSpectrumBars();
            if (update_controls) {
                updateControls(animate);
            }
            return pebble_slider_object;
        }
        // updateControls, uh, updates the slider controls
        function updateControls(animate) {
            var rate, value_sub, max_sub, min_sub, min_reverse_sign, min_max_length, nsb_offset, psb_offset, length_offset = 0;
            if ($ps_wrap[0].parentNode === null) {
                return; // Bail out since it's not attached to the DOM
            }
            value_sub = properties.value;
            max_sub = properties.max;
            min_sub = properties.min;
            if (max_sub <= min_sub) {
                rate = 0;
            } else {
                rate = ((value_sub - min_sub) / (max_sub - min_sub));
            }
            if (!!animate && (disabled === false) && (transition_class_added === false)) {
                addTransitionClass();
            }
            min_reverse_sign = min_sub * -1;
            min_max_length = (min_reverse_sign + max_sub);
            psb_offset = (min_reverse_sign / min_max_length) * 100;
            nsb_offset = 100 - psb_offset;
            switch (type) {
            case 'horizontal':
                if (min_sub >= 0) {
                    length_offset = psb_offset;
                    psb_offset = 0;
                }
                $ps_range_positive_spectrum_bar.css('left', psb_offset + '%');
                if (max_sub <= 0) {
                    length_offset = nsb_offset;
                    nsb_offset = 0;
                }
                $ps_range_negative_spectrum_bar.css('right', nsb_offset + '%');
                if (value_sub < 0) {
                    $ps_range_negative_spectrum_bar.css('width', (((Math.abs(value_sub) / min_max_length) * 100) + length_offset) + '%');
                    $ps_range_positive_spectrum_bar.css('width', 0);
                } else {
                    $ps_range_negative_spectrum_bar.css('width', 0);
                    $ps_range_positive_spectrum_bar.css('width', (((value_sub / min_max_length) * 100) + length_offset) + '%');
                }
                $ps_range_bar.css('right', (100 - (rate * 100)) + '%');
                $ps_toggle_neck.css('left', (rate * 100) + '%');
                break;
            case 'vertical':
                if (min_sub >= 0) {
                    length_offset = psb_offset;
                    psb_offset = 0;
                }
                $ps_range_positive_spectrum_bar.css('bottom', psb_offset + '%');
                if (max_sub <= 0) {
                    length_offset = nsb_offset;
                    nsb_offset = 0;
                }
                $ps_range_negative_spectrum_bar.css('top', nsb_offset + '%');
                if (value_sub < 0) {
                    $ps_range_negative_spectrum_bar.css('height', (((Math.abs(value_sub) / min_max_length) * 100) + length_offset) + '%');
                    $ps_range_positive_spectrum_bar.css('height', 0);
                } else {
                    $ps_range_negative_spectrum_bar.css('height', 0);
                    $ps_range_positive_spectrum_bar.css('height', (((value_sub / min_max_length) * 100) + length_offset) + '%');
                }
                $ps_range_negative_spectrum_bar.css('top', nsb_offset + '%');
                $ps_range_positive_spectrum_bar.css('bottom', psb_offset + '%');
                $ps_range_bar.css('top', (100 - (rate * 100)) + '%');
                $ps_toggle_neck.css('bottom', (rate * 100) + '%');
                break;
            }
            return pebble_slider_object;
        }
        // Create the jQuery-fied pebble slider object (http://api.jquery.com/jQuery/#working-with-plain-objects)
        $pebble_slider_object = $({
            tabIndex: function tabIndex(index) {
                if (arguments.length > 0) {
                    $ps_wrap.attr('tabindex', Number.toInteger(index));
                    return pebble_slider_object;
                }
                return tab_index;
            },
            step: function step(val) {
                if (arguments.length > 0) {
                    val = Number(val) || 1;
                    if (val < 0) {
                        val = 1;
                    }
                    if (Number.isFinite(val)) {
                        properties.step = val;
                    }
                    return pebble_slider_object;
                }
                return properties.step;
            },
            min: function min(val, animate) {
                if (arguments.length > 0) {
                    val = Number(val) || 0;
                    if (Number.isFinite(val)) {
                        properties.min = val;
                        updateSpectrumBars();
                        updateControls(animate);
                    }
                    return pebble_slider_object;
                }
                return properties.min;
            },
            max: function max(val, animate) {
                if (arguments.length > 0) {
                    val = Number(val) || 0;
                    if (Number.isFinite(val)) {
                        properties.max = val;
                        updateSpectrumBars();
                        updateControls(animate);
                    }
                    return pebble_slider_object;
                }
                return properties.maxRaw;
            },
            val: function value(val, animate) {
                var max_sub, min_sub, step_sub;
                if (arguments.length > 0) {
                    max_sub = properties.max;
                    min_sub = properties.min;
                    step_sub = properties.step;
                    val = valueByStep(Number(val) || 0, step_sub);
                    if (val > max_sub) {
                        val = valueByStep(max_sub, step_sub, 'floor');
                    }
                    if (val < min_sub) {
                        val = min_sub;
                    }
                    properties.value = val;
                    prev_input_value = val;
                    prev_change_value = val;
                    updateControls(animate);
                    return pebble_slider_object;
                }
                return properties.value;
            },
            toggleSpectrum: function toggleSpectrum(set) {
                if (arguments.length > 0 && typeof set === "boolean") {
                    if (!set) {
                        $ps_range_bar.removeClass('hidden');
                        $ps_range_negative_spectrum_bar.addClass('hidden');
                        $ps_range_positive_spectrum_bar.addClass('hidden');
                    } else {
                        $ps_range_bar.addClass('hidden');
                        $ps_range_negative_spectrum_bar.removeClass('hidden');
                        $ps_range_positive_spectrum_bar.removeClass('hidden');
                    }
                } else {
                    if ($ps_range_bar.hasClass('hidden')) {
                        $ps_range_bar.removeClass('hidden');
                        $ps_range_negative_spectrum_bar.addClass('hidden');
                        $ps_range_positive_spectrum_bar.addClass('hidden');
                    } else {
                        $ps_range_bar.addClass('hidden');
                        $ps_range_negative_spectrum_bar.removeClass('hidden');
                        $ps_range_positive_spectrum_bar.removeClass('hidden');
                    }
                }
                return pebble_slider_object;
            },
            attachTo: function attachTo(arg) {
                $ps_wrap.appendTo(arg);
                removeTransitionClass();
                refresh(true);
                return pebble_slider_object;
            },
            switchTo: function switchTo(arg) {
                var $target;
                if (arg instanceof $) {
                    $target = arg;
                } else {
                    $target = $(arg);
                }
                $ps_wrap.data('ps:swapped-element', $target.replaceWith($ps_wrap));
                removeTransitionClass();
                refresh(true);
                return pebble_slider_object;
            },
            refresh: refresh,
            getElement: function getElement() {
                return $ps_wrap;
            }
        });
        pebble_slider_object = $pebble_slider_object[0];
        Object.defineProperty(pebble_slider_object, 'value', {
            get: function () {
                return properties.value;
            },
            set: function (val) {
                var step_sub = properties.step, max_sub = properties.max, min_sub = properties.min;
                val = valueByStep(Number(val) || 0, step_sub);
                if (val > max_sub) {
                    val = valueByStep(max_sub, step_sub, 'floor');
                }
                if (val < min_sub) {
                    val = min_sub;
                }
                properties.value = val;
                prev_input_value = val;
                prev_change_value = val;
                updateControls();
            }
        });
        // Event-handling setup
        (function () {
            var allowance = 0, genericEventHandler, docWinEventHandler, psWrapMetaControlHandler, prevX = 0, prevY = 0, ps_do_not_trigger_map = {}, ps_wrap_do_not_trigger_map = {};
            function moveSlider(rate, animate) {
                var calculated_value, max_sub = properties.max, min_sub = properties.min;
                if (max_sub >= min_sub) {
                    prev_input_value = properties.value;
                    calculated_value = min_sub + (rate * (max_sub - min_sub));
                    calculated_value = valueByStep(calculated_value, properties.step, 'floor');
                    if (disabled === false) {
                        if (calculated_value !== prev_input_value) {
                            properties.value = calculated_value;
                            trigger_param_list.push(calculated_value);
                            $pebble_slider_object.triggerHandler('input', trigger_param_list);
                            trigger_param_list.length = 0;
                        }
                    }
                }
                updateControls(animate);
            }
            function containsTarget(target, node) {
                var k, len, children;
                if (target === node) {
                    return true;
                }
                children = node.children;
                len = children.length;
                if (len > 0) {
                    for (k = 0; k < len; k += 1) {
                        if (containsTarget(target, children[k])) {
                            return true;
                        }
                    }
                }
                return false;
            }
            /*
                The nowX-nowY-prevX-prevY tandem is a hack for browsers with stupid mousemove event implementation (Chrome, I'm looking at you!).
                What is this stupidity you're talking about?
                    Some browsers fire a single mousemove event of an element everytime a mousedown event of that same element fires.
                LINK(S):
                    http://stackoverflow.com/questions/24670598/why-does-chrome-raise-a-mousemove-on-mousedown
            */
            function changeEvent() {
                var value_sub = properties.value;
                trigger_param_list.push(value_sub);
                // 'seek' event is like a forced-change event
                $pebble_slider_object.triggerHandler('seek', trigger_param_list);
                if (prev_change_value !== value_sub) {
                    $pebble_slider_object.triggerHandler('change', trigger_param_list);
                    prev_change_value = value_sub;
                }
                trigger_param_list.length = 0;
            }
            docWinEventHandler = function docWinEventHandler() {
                //console.log('docWinEventHandler');
                active = false;
                if (disabled === false) {
                    changeEvent();
                }
                $ps_toggle_neck.removeClass('active');
                $window.off('blur', docWinEventHandler);
                $document
                    .off('mousemove touchmove', genericEventHandler)
                    .off('mouseup touchend', docWinEventHandler);
            };
            (function () {
                var is_default_prevented = false, is_propagation_stopped = false, is_immediate_propagation_stopped = false;
                function helper(event) {
                    is_default_prevented = event.isDefaultPrevented();
                    is_propagation_stopped = event.isPropagationStopped();
                    is_immediate_propagation_stopped = event.isImmediatePropagationStopped();
                }
                genericEventHandler = function genericEventHandler(event) {
                    var nowX, nowY, base, dimension, rate;
                    event.preventDefault(); // This somehow disables text-selection
                    //console.log(event);
                    switch (event.type) {
                    // 'touchstart' and 'mousedown' events belong to $ps_wrap
                    case 'touchstart':
                        //console.log('touchstart');
                        // http://stackoverflow.com/questions/4780837/is-there-an-equivalent-to-e-pagex-position-for-touchstart-event-as-there-is-fo
                        event.pageX = event.originalEvent.touches[0].pageX;
                        event.pageY = event.originalEvent.touches[0].pageY;
                        /* falls through */
                    case 'mousedown':
                        // Prevent manual mousedown trigger and disable right-click. Manually-triggered events don't have an 'originalEvent' property
                        if (event.originalEvent === undef || event.which === 3 || is_default_prevented) {
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
                        $ps_wrap.trigger('focus');
                        prevX = nowX;
                        prevY = nowY;
                        $document
                            .on('mousemove touchmove', genericEventHandler)
                            .on('mouseup touchend', docWinEventHandler);
                        $window.on('blur', docWinEventHandler);
                        if (containsTarget(event.target, $ps_toggle_handle[0])) {
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
                        base = floor((nowX - allowance) - $ps_range_limiter.getX());
                        break;
                    case 'vertical':
                        dimension = $ps_range_limiter.height();
                        base = dimension - floor((nowY - allowance) - $ps_range_limiter.getY());
                        //base = floor((nowY - allowance) - $ps_range_limiter.getY());
                        break;
                    }
                    if (base > dimension) {
                        base = dimension;
                    } else if (base < 0) {
                        base = 0;
                    }
                    rate = base / dimension;
                    moveSlider(rate, true);
                };
                psWrapMetaControlHandler = function psWrapMetaControlHandler(event) {
                    var rate, min_sub, event_type = event.type;
                    // trigger's extra parameters won't work with focus and blur events. See https://github.com/jquery/jquery/issues/1741
                    if (!ps_do_not_trigger_map[event_type]) {
                        ps_wrap_do_not_trigger_map[event_type] = true;
                        $pebble_slider_object.one(event_type, helper).triggerHandler(event_type);
                        ps_wrap_do_not_trigger_map[event_type] = false;
                    }
                    if (is_immediate_propagation_stopped) {
                        event.isImmediatePropagationStopped();
                    } else if (is_propagation_stopped) {
                        event.stopPropagation();
                    }
                    if (is_default_prevented) {
                        return;
                    }
                    switch (event_type) {
                    case 'keydown':
                        //console.log(event.which);
                        switch (event.which) {
                        case 8: // Backspace key
                        /* falls through */
                        case 36: // Home key
                            event.preventDefault();
                            moveSlider(0);
                            changeEvent();
                            break;
                        case 33: // Page up key
                        /* falls through */
                        case 38: // Up arrow key
                        /* falls through */
                        case 39: // Right arrow key
                            event.preventDefault();
                            min_sub = properties.min;
                            rate = (((properties.value + properties.step) - min_sub) / (properties.max - min_sub));
                            if (rate > 1) {
                                rate = 1;
                            }
                            moveSlider(rate);
                            changeEvent();
                            break;
                        case 34: // Page down key
                        /* falls through */
                        case 37: // Left arrow key
                        /* falls through */
                        case 40: // Down arrow key
                            event.preventDefault();
                            min_sub = properties.min;
                            rate = (((properties.value - properties.step) - min_sub) / (properties.max - min_sub));
                            if (rate < 0) {
                                rate = 0;
                            }
                            moveSlider(rate);
                            changeEvent();
                            break;
                        case 35: // End key
                            event.preventDefault();
                            moveSlider(1);
                            changeEvent();
                            break;
                        }
                        break;
                    case 'DOMMouseScroll':
                        if (event.originalEvent) {
                            min_sub = properties.min;
                            if (event.originalEvent.detail > 0) {
                                rate = (((properties.value - properties.step) - min_sub) / (properties.max - min_sub));
                                if (rate < 0) {
                                    rate = 0;
                                } else {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            } else {
                                rate = (((properties.value + properties.step) - min_sub) / (properties.max - min_sub));
                                if (rate > 1) {
                                    rate = 1;
                                } else {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }
                            moveSlider(rate);
                            changeEvent();
                        }
                        break;
                    case 'mousewheel':
                        if (event.originalEvent) {
                            min_sub = properties.min;
                            if (event.originalEvent && event.originalEvent.wheelDelta < 0) {
                                rate = (((properties.value - properties.step) - min_sub) / (properties.max - min_sub));
                                if (rate < 0) {
                                    rate = 0;
                                } else {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            } else {
                                rate = (((properties.value + properties.step) - min_sub) / (properties.max - min_sub));
                                if (rate > 1) {
                                    rate = 1;
                                } else {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }
                            moveSlider(rate);
                            changeEvent();
                        }
                        break;
                    }
                };
            }());
            function enableDisableAid(event) {
                switch (event.type) {
                case 'touchstart':
                    /* falls through */
                case 'mousedown':
                    event.preventDefault();
                    break;
                }
            }
            // psEventHandler is mainly used for manually-triggered events (via the trigger / fire method)
            function psEventHandler(event) {
                var event_type = event.type;
                // Prevent invocation when triggered manually from $ps_wrap
                if (!ps_wrap_do_not_trigger_map[event_type]) {
                    //console.log('triggered ' + event_type);
                    ps_do_not_trigger_map[event_type] = true;
                    $ps_wrap.trigger(event_type);
                    ps_do_not_trigger_map[event_type] = false;
                }
            }
            pebble_slider_object.enable = function enable() {
                if (disabled === true) {
                    disabled = false;
                    // $pebble_slider_object's attached events should also be found on $ps_wrap's psWrapMetaControlHandler
                    $pebble_slider_object.on('focus blur mousewheel DOMMouseScroll mousedown mouseup click keydown keyup keypress', psEventHandler);
                    // Always attach psWrapMetaControlHandler first
                    $ps_wrap
                        .removeClass('disabled')
                        .on('focus blur mousewheel DOMMouseScroll mousedown mouseup click keydown keyup keypress', psWrapMetaControlHandler)
                        .attr('tabindex', tab_index)
                        .on('mousedown touchstart', genericEventHandler)
                        .off('mousedown', enableDisableAid);
                }
                return pebble_slider_object;
            };
            pebble_slider_object.disable = function disable() {
                if (disabled === false) {
                    disabled = true;
                    // $pebble_slider_object's attached events should also be found on $ps_wrap's psWrapMetaControlHandler
                    $pebble_slider_object.off('focus blur mousewheel DOMMouseScroll mousedown mouseup click keydown keyup keypress', psEventHandler);
                    if (active) {
                        docWinEventHandler(); // Manually trigger the 'mouseup / window blur' event handler
                    }
                    $ps_wrap
                        .addClass('disabled')
                        .off('focus blur mousewheel DOMMouseScroll mousedown mouseup click keydown keyup keypress', psWrapMetaControlHandler)
                        .removeAttr('tabindex')
                        .off('mousedown touchstart', genericEventHandler)
                        .on('mousedown', enableDisableAid);
                    removeTransitionClass();
                }
                return pebble_slider_object;
            };
            pebble_slider_object.on = function on() {
                applier($_proto.on, $pebble_slider_object, arguments);
                return pebble_slider_object;
            };
            pebble_slider_object.one = function one() {
                applier($_proto.one, $pebble_slider_object, arguments);
                return pebble_slider_object;
            };
            pebble_slider_object.off = function off() {
                applier($_proto.off, $pebble_slider_object, arguments);
                return pebble_slider_object;
            };
            function trigger() {
                applier($_proto.trigger, $pebble_slider_object, arguments);
                return pebble_slider_object;
            }
            pebble_slider_object.trigger = trigger;
            pebble_slider_object.fire = trigger;
            function resetStructure() {
                var parentNode = $ps_wrap[0].parentNode, i, length, item;
                if (parentNode !== null) {
                    //$ps_wrap.detach();
                    $ps_wrap.replaceWith($hot_swap_dummy);
                }
                for (i = 0, length = parts_list.length; i < length; i += 1) {
                    item = parts_list[i];
                    item.removeAttr('class').removeAttr('style');
                    if (item === $ps_wrap) {
                        item.removeAttr('tabindex');
                    }
                }
                initializeParts();
                if (parentNode !== null) {
                    //$ps_wrap.appendTo(parentNode);
                    $hot_swap_dummy.replaceWith($ps_wrap);
                }
            }
            pebble_slider_object.reset = function reset(hard) {
                var i, length;
                pebble_slider_object.disable();
                $pebble_slider_object.off();
                if (Boolean(hard) === true) {
                    resetStructure();
                    for (i = 0, length = parts_list.length; i < length; i += 1) {
                        parts_list[i].off();
                    }
                }
                properties.reset();
                prev_input_value = properties.value;
                prev_change_value = prev_change_value;
                $ps_wrap.attr('tabindex', tab_index);
                refresh(true, true);
                pebble_slider_object.enable();
                return pebble_slider_object;
            };
        }());
        //$ps_toggle_neck.on('transitionend', function () { alert('END'); });
        $ps_wrap.data('ps:host-object', pebble_slider_object).data('pebble-slider-object', pebble_slider_object);
        pebble_slider_object.enable();
        updateControls(false);
        return pebble_slider_object;
    };
}(window, (typeof jQuery === "function" && jQuery) || (typeof module === "object" && typeof module.exports === "function" && module.exports)));