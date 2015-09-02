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
(function (window, $, undefined) {
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
    $.createPebbleSlider = function () {
        var $ps_wrap = $(document.createElement('span')),
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
            tabindex = 0,
            trigger_param_list = [],
            $_proto = $.fn,
            active = false,
            disabled = true,
            //step = 0,
            transition_class_added = false,
            min_value = 0,
            max_value = 100,
            value = (min_value >= max_value) ? min_value : (min_value + ((max_value - min_value) / 2)),
            prev_input_value = value,
            prev_change_value = value,
            pebble_slider_object,
            $pebble_slider_object;
        function initializeParts() {
            $ps_wrap.addClass('pebble-slider').addClass('ps-horizontal-type').addClass('ps-wrap').attr('tabindex', tabindex);
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
        function addTransitionClass() {
            //console.log('addTransitionClass');
            $ps_subwrap.addClass('ps-transition').on('transitionend', removeTransitionClass);
            transition_class_added = true;
        }
        function removeTransitionClass() {
            //console.log('removeTransitionClass');
            $ps_subwrap.removeClass('ps-transition').off('transitionend', removeTransitionClass);
            transition_class_added = false;
        }
        function updateStructure() {
            var offset_hor, offset_ver, tr_offset_ver;
            if ($ps_wrap[0].parentNode === null) {
                return; // Bail out since it's not attached to the DOM
            }
            //$ps_toggle_neck.css('width', $ps_toggle_neck.height());
            offset_hor = ($ps_toggle_neck.outerWidth() / 2);
            offset_ver = ($ps_toggle_neck.outerHeight() / 2);
            tr_offset_ver = $ps_toggle_rail.outerHeight() / 2;
            $ps_range_sizer.css('max-height', $ps_wrap.css('height'));
            $ps_toggle_neck
                .css('margin-left', ((offset_hor > 0) ? '-' + offset_hor : 0) + 'px')
                .css('margin-top', (tr_offset_ver - (offset_ver + tr_offset_ver)) + 'px');
                //.css('top', (((($ps_toggle_rail.outerHeight() / 2) - offset_ver) / $ps_toggle_rail.outerHeight()) * 100) + '%');
            $ps_range_limiter.attr('style', 'left: ' + (offset_hor - parseInt($ps_range_rail.css('border-left'), 10)) + 'px !important; right: ' + (offset_hor - parseInt($ps_range_rail.css('border-right'), 10)) + 'px !important;');
            $ps_toggle_overlay_and_limiter.attr('style', 'left: ' + offset_hor + 'px !important; right: ' + offset_hor + 'px !important;');
            return pebble_slider_object;
        }
        // Updates the slider UI
        function refreshControls(animate) {
            var left_rate;
            if ($ps_wrap[0].parentNode === null) {
                return; // Bail out since it's not attached to the DOM
            }
            left_rate = ((value - min_value) / (max_value - min_value));
            if (!!animate && (disabled === false) && (transition_class_added === false)) {
                addTransitionClass();
            }
            $ps_range_bar.css('right', (100 - (left_rate * 100)) + '%');
            $ps_toggle_neck.css('left', (left_rate * 100) + '%');
            return pebble_slider_object;
        }
        // Create the jQueryfied pebble slider object (http://api.jquery.com/jQuery/#working-with-plain-objects)
        $pebble_slider_object = $({
            setTabIndex: function (index) {
                index = Number.toInteger(index);
                $ps_wrap.attr('tabindex', index);
                return pebble_slider_object;
            },
            setMinValue: function (val) {
                min_value = Number(val) || 0;
                if (max_value <= min_value) {
                    max_value = 100;
                }
                return pebble_slider_object;
            },
            setMaxValue: function (val) {
                val = Number(val) || 0;
                max_value = (val <= min_value) ? 100 : val;
                return pebble_slider_object;
            },
            val: function (val) {
                if (arguments.length > 0) {
                    val = Number(val) || 0;
                    if (val > max_value) {
                        val = max_value;
                    }
                    if (val < min_value) {
                        val = min_value;
                    }
                    value = val;
                    prev_input_value = val;
                    prev_change_value = val;
                    refreshControls(true);
                    return pebble_slider_object;
                }
                return value;
            },
            setValue: function (val) {
                val = Number(val) || 0;
                if (val > max_value) {
                    val = max_value;
                }
                if (val < min_value) {
                    val = min_value;
                }
                value = val;
                prev_input_value = val;
                prev_change_value = val;
                refreshControls(true);
                return pebble_slider_object;
            },
            getValue: function () {
                return value;
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
            updateStructure: updateStructure,
            getElement: function () {
                return $ps_wrap;
            }
        });
        pebble_slider_object = $pebble_slider_object[0];
        Object.defineProperty($ps_wrap[0], 'value', {
            get: function () {
                return value;
            },
            set: function (val) {
                val = Number(val) || 0;
                if (val > max_value) {
                    val = max_value;
                }
                if (val < min_value) {
                    val = min_value;
                }
                value = val;
                prev_input_value = val;
                prev_change_value = val;
                refreshControls(true);
            },
            configurable: true,
            enumerable: false
        });
        // Event-handling setup
        (function () {
            var allowance = 0, mouseDownMouseMoveHandler, docWinEventHandler, prevX = 0, prevY = 0;
            /*
                The nowX-prevX-prevY tandem is a hack for browsers with stupid mousemove event implementation (Chrome, I'm looking at you!).
                What is this stupidity you're talking about?
                    Some browsers fire a single mousemove event of an element everytime a mousedown event of that same element fires.
                LINK(S):
                    http://stackoverflow.com/questions/24670598/why-does-chrome-raise-a-mousemove-on-mousedown
            */
            mouseDownMouseMoveHandler = function (event) {
                var nowX, left, width, left_rate;
                switch (event.type) {
                case 'touchstart':
                    //console.log('touchstart');
                    // http://stackoverflow.com/questions/4780837/is-there-an-equivalent-to-e-pagex-position-for-touchstart-event-as-there-is-fo
                    event.pageX = event.originalEvent.touches[0].pageX;
                    event.pageY = event.originalEvent.touches[0].pageY;
                    /* falls through */
                case 'mousedown':
                    event.preventDefault(); // This somehow disables text-selection
                    if (event.which === 3) {
                        return;
                    }
                    active = true;
                    nowX = event.pageX;
                    if (transition_class_added === false) {
                        addTransitionClass();
                    }
                    $ps_toggle_neck.addClass('active');
                    prevX = nowX;
                    prevY = event.pageY;
                    $document.on('mousemove touchmove', mouseDownMouseMoveHandler).on('mouseup touchend', docWinEventHandler);
                    $window.on('blur', docWinEventHandler);
                    if (event.target === $ps_toggle_handle[0] || event.target === $ps_toggle_neck[0]) {
                        allowance = nowX - ($ps_toggle_neck.getX() - parseInt($ps_toggle_neck.css('margin-left'), 10));
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
                    if (nowX === prevX && event.pageY === prevY) {
                        return; // Bail out, since it's a faux mousemove event
                    }
                    if (transition_class_added === true) {
                        removeTransitionClass();
                    }
                    break;
                }
                width = $ps_range_limiter.width();
                left = Math.floor((nowX - allowance) - $ps_range_limiter.getX());
                if (left > width) {
                    left = width;
                } else if (left < 0) {
                    left = 0;
                }
                left_rate = left / width;
                $ps_range_bar.css('right', (100 - (left_rate * 100)) + '%');
                $ps_toggle_neck.css('left', (left_rate * 100) + '%');
                prev_input_value = value;
                value = min_value + (left_rate * (max_value - min_value));
                if (disabled === false) {
                    if (value !== prev_input_value) {
                        trigger_param_list.push(value);
                        $pebble_slider_object.triggerHandler('input', trigger_param_list);
                        trigger_param_list.length = 0;
                    }
                }
            };
            docWinEventHandler = function () {
                //console.log('docWinEventHandler');
                active = false;
                if (disabled === false) {
                    if (prev_change_value !== value) {
                        trigger_param_list.push(value);
                        $pebble_slider_object.triggerHandler('change', trigger_param_list);
                        trigger_param_list.length = 0;
                        prev_change_value = value;
                    }
                }
                $ps_toggle_neck.removeClass('active');
                $window.off('blur', docWinEventHandler);
                $document.off('mousemove touchmove', mouseDownMouseMoveHandler).off('mouseup touchend', docWinEventHandler);
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
            function resetStructure() {
                var parentNode = $ps_wrap[0].parentNode;
                if (parentNode !== null) {
                    $ps_wrap.detach();
                }
                $ps_wrap.removeAttr('class').removeAttr('style').removeAttr('tabindex');
                $ps_subwrap.removeAttr('class').removeAttr('style');
                $ps_range_base.removeAttr('class').removeAttr('style');
                $ps_range_aligner.removeAttr('class').removeAttr('style');
                $ps_range_sizer.removeAttr('class').removeAttr('style');
                $ps_range_rail.removeAttr('class').removeAttr('style');
                $ps_range_limiter.removeAttr('class').removeAttr('style');
                $ps_range_bar.removeAttr('class').removeAttr('style');
                $ps_toggle_overlay_and_limiter.removeAttr('class').removeAttr('style');
                $ps_toggle_base.removeAttr('class').removeAttr('style');
                $ps_toggle_rail.removeAttr('class').removeAttr('style');
                $ps_toggle_neck.removeAttr('class').removeAttr('style');
                $ps_toggle_handle.removeAttr('class').removeAttr('style');
                initializeParts();
                if (parentNode !== null) {
                    $ps_wrap.appendTo(parentNode);
                }
            }
            pebble_slider_object.enable = function () {
                if (disabled === true) {
                    disabled = false;
                    $ps_wrap.removeClass('disabled').attr('tabindex', tabindex);
                    $ps_subwrap.off('mousedown', enableDisableAid).on('mousedown touchstart', mouseDownMouseMoveHandler);
                }
                return pebble_slider_object;
            };
            pebble_slider_object.disable = function () {
                if (disabled === false) {
                    disabled = true;
                    if (active) {
                        docWinEventHandler(); // Manually trigger the 'mouseup / window blur' event handler
                    }
                    $ps_wrap.addClass('disabled').removeAttr('tabindex');
                    $ps_subwrap.off('mousedown touchstart', mouseDownMouseMoveHandler).on('mousedown', enableDisableAid);
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
                    min_value = 0;
                    max_value = 100;
                    value = (min_value >= max_value) ? min_value : (min_value + ((max_value - min_value) / 2));
                    $ps_wrap.removeClass('disabled').attr('tabindex', tabindex);
                    refreshControls(true);
                }
                pebble_slider_object.enable();
                return pebble_slider_object;
            };
        }());
        //$ps_toggle_neck.on('transitionend', function () { alert('END'); });
        $ps_wrap.data('host-object', pebble_slider_object).data('pebble-slider-object', pebble_slider_object);
        pebble_slider_object.enable();
        return pebble_slider_object;
    };
}(window, (typeof jQuery === "function" && jQuery) || (typeof module === "object" && typeof module.exports === "function" && module.exports)));
