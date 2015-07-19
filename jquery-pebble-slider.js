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
(function (window, $) {
    "use strict";
    var $document = $(document), $window = $(window);
    $.createPebbleSlider = function () {
        var $ps_wrap = $(document.createElement('span')),
            $ps_base = $(document.createElement('span')),
            $ps_range_rail = $(document.createElement('span')),
            $ps_range_subrail = $(document.createElement('span')),
            $ps_range_bar = $(document.createElement('span')),
            $ps_toggle_overlay = $(document.createElement('span')),
            $ps_toggle_rail = $(document.createElement('span')),
            $ps_toggle_neck = $(document.createElement('span')),
            $ps_toggle_handle = $(document.createElement('span')),
            active = false,
            disabled = true,
            //step = 0,
            transition_class_added = false,
            onInputHandler = $.noop,
            onChangeHandler = $.noop,
            min_value = 0,
            max_value = 100,
            value = (min_value >= max_value) ? min_value : (min_value + ((max_value - min_value) / 2)),
            prev_input_value = value,
            prev_change_value = value,
            pebble_slider_object;
        $ps_wrap.addClass('pebble-slider ps-horizontal-type ps-wrap');
        $ps_wrap.attr('data-value', value).attr('tabindex', 0);
        $ps_base.addClass('ps-base');
        $ps_range_rail.addClass('ps-range-rail');
        $ps_range_subrail.addClass('ps-range-subrail');
        $ps_range_bar.addClass('ps-range-bar');
        $ps_toggle_overlay.addClass('ps-toggle-overlay');
        $ps_toggle_rail.addClass('ps-toggle-rail');
        $ps_toggle_neck.addClass('ps-toggle-neck');
        $ps_toggle_handle.addClass('ps-toggle-handle');
        // Connect the parts
        $ps_wrap.append($ps_base);
        $ps_base.append($ps_range_rail);
        $ps_range_rail.append($ps_range_subrail);
        $ps_range_subrail.append($ps_range_bar);
        $ps_base.append($ps_toggle_overlay);
        $ps_toggle_overlay.append($ps_toggle_rail);
        $ps_toggle_rail.append($ps_toggle_neck);
        $ps_toggle_neck.append($ps_toggle_handle);
        // Some utilities
        function addTransitionClass() {
            //console.log('addTransitionClass');
            $ps_base.addClass('ps-transition').on('transitionend', removeTransitionClass);
            transition_class_added = true;
        }
        function removeTransitionClass() {
            //console.log('removeTransitionClass');
            $ps_base.removeClass('ps-transition').off('transitionend', removeTransitionClass);
            transition_class_added = false;
        }
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
        // Create the pebble slider object
        pebble_slider_object = {
            setOnInputHandler: function (handler) {
                if (typeof handler === "function") {
                    onInputHandler = handler;
                } else {
                    onInputHandler = $.noop;
                }
                return pebble_slider_object;
            },
            setOnChangeHandler: function (handler) {
                if (typeof handler === "function") {
                    onChangeHandler = handler;
                } else {
                    onChangeHandler = $.noop;
                }
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
                    $ps_wrap.attr('data-value', val);
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
                $ps_wrap.attr('data-value', val);
                refreshControls(true);
                return pebble_slider_object;
            },
            getValue: function () {
                return value;
            },
            attachTo: function (arg) {
                $ps_wrap.appendTo(arg);
                removeTransitionClass();
                refreshControls();
                return pebble_slider_object;
            },
            getElement: function () {
                return $ps_wrap;
            }
        };
        // Event setup
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
                var nowX = event.pageX, left, width, left_rate;
                switch (event.type) {
                case 'mousedown':
                    event.preventDefault(); // This somehow disables text-selection
                    event.stopPropagation();
                    active = true;
                    if (transition_class_added === false) {
                        addTransitionClass();
                    }
                    $ps_toggle_neck.addClass('active');
                    prevX = nowX;
                    prevY = event.pageY;
                    $document.on('mousemove', mouseDownMouseMoveHandler).on('mouseup', docWinEventHandler);
                    $window.on('blur', docWinEventHandler);
                    if (event.target === $ps_toggle_handle[0] || event.target === $ps_toggle_neck[0]) {
                        allowance = nowX - ($ps_toggle_neck.getX() - parseInt($ps_toggle_neck.css('margin-left'), 10));
                        return;
                    }
                    allowance = 0;
                    break;
                case 'mousemove':
                    if (nowX === prevX && event.pageY === prevY) {
                        return; // Bail out, since it's a faux mousemove event
                    }
                    if (transition_class_added === true) {
                        removeTransitionClass();
                    }
                    break;
                }
                width = $ps_range_subrail.width();
                left = Math.floor((nowX - allowance) - $ps_range_subrail.getX());
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
                        //console.log('onInputHandler');
                        onInputHandler(value);
                    }
                }
                $ps_wrap.attr('data-value', value);
            };
            docWinEventHandler = function () {
                //console.log('docWinEventHandler');
                active = false;
                if (disabled === false) {
                    if (prev_change_value !== value) {
                        onChangeHandler(value);
                        prev_change_value = value;
                    }
                }
                $ps_toggle_neck.removeClass('active');
                $window.off('blur', docWinEventHandler);
                $document.off('mousemove', mouseDownMouseMoveHandler).off('mouseup', docWinEventHandler);
            };
            function enableDisableAid(event) {
                switch (event.type) {
                case 'mousedown':
                    event.preventDefault();
                    break;
                case 'focus':
                    $ps_wrap.blur();
                    break;
                }
            }
            pebble_slider_object.enable = function () {
                if (disabled === true) {
                    disabled = false;
                    $ps_wrap.removeClass('disabled').off('mousedown focus', enableDisableAid).on('mousedown', mouseDownMouseMoveHandler);
                }
            };
            pebble_slider_object.disable = function () {
                if (disabled === false) {
                    disabled = true;
                    if (active) {
                        docWinEventHandler(); // Manually trigger the 'mouseup / window blur' event handler
                    }
                    $ps_wrap.addClass('disabled').off('mousedown', mouseDownMouseMoveHandler).on('mousedown focus', enableDisableAid);
                    removeTransitionClass();
                }
            };
        }());
        //$ps_toggle_neck.on('transitionend', function () { alert('END'); });
        $ps_wrap.data('host-object', pebble_slider_object).data('pebble-slider-object', pebble_slider_object);
        pebble_slider_object.enable();
        return pebble_slider_object;
    };
}(window, (typeof jQuery === "function" && jQuery) || (typeof module === "object" && typeof module.exports === "function" && module.exports)));
