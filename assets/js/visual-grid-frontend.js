/**
 * Visual Grid - Frontend JavaScript
 * Approach 5: Absolute positioning in <html> element
 * Lines are positioned once based on element's document position
 */

(function () {
    'use strict';

    console.log('Visual Grid: Script loaded (v5 - html absolute)');

    /**
     * Check if current viewport is mobile (< 768px)
     */
    function isMobileViewport() {
        return window.innerWidth < 768;
    }

    /**
     * Convert hex color to rgba
     */
    function hexToRgba(hex, opacity) {
        if (!hex) return 'rgba(0, 0, 0, ' + opacity + ')';
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            return 'rgba(0, 0, 0, ' + opacity + ')';
        }
        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
    }

    /**
     * Generate background style based on line style
     */
    function getBackgroundStyle(style, color, direction) {
        var deg = direction === 'horizontal' ? '90deg' : '180deg';

        switch (style) {
            case 'dashed':
                return 'repeating-linear-gradient(' + deg + ', ' + color + ' 0px, ' + color + ' 8px, transparent 8px, transparent 16px)';
            case 'dotted':
                return 'repeating-linear-gradient(' + deg + ', ' + color + ' 0px, ' + color + ' 2px, transparent 2px, transparent 6px)';
            case 'solid':
            default:
                return color;
        }
    }

    /**
     * Get element's position relative to document (not viewport)
     */
    function getDocumentOffset(element) {
        var rect = element.getBoundingClientRect();
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft,
            bottom: rect.bottom + scrollTop,
            right: rect.right + scrollLeft,
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * Track processed lines for overlap prevention
     */
    var processedLines = {
        top: {},
        bottom: {},
        left: {},
        right: {}
    };

    /**
     * Check if a line should be prevented due to overlap
     */
    function shouldPreventOverlap(pos, side, preventOverlap) {
        if (!preventOverlap) return false;

        var key;
        switch (side) {
            case 'top': key = Math.round(pos.top); break;
            case 'bottom': key = Math.round(pos.bottom); break;
            case 'left': key = Math.round(pos.left); break;
            case 'right': key = Math.round(pos.right); break;
            default: return false;
        }

        if (processedLines[side][key]) {
            return true;
        }
        processedLines[side][key] = true;
        return false;
    }

    /**
     * Create a line element with absolute document positioning
     */
    function createLineElement(side, config, pos, docHeight, docWidth) {
        var line = document.createElement('div');
        line.className = 'visual-grid-line visual-grid-line-' + side;

        var color = hexToRgba(config.color, config.opacity);

        if (side === 'top' || side === 'bottom') {
            // Horizontal lines
            var width, leftPos;

            if (config.lengthMode === 'page') {
                // Full document width
                width = docWidth + 'px';
                leftPos = '0';
            } else if (config.lengthMode === 'absolute') {
                // Percentage of viewport width, centered
                width = config.lengthPercent + 'vw';
                leftPos = ((100 - config.lengthPercent) / 2) + 'vw';
            } else {
                // Relative to element
                var relWidth = pos.width * config.lengthPercent / 100;
                width = relWidth + 'px';
                leftPos = (pos.left + (pos.width - relWidth) / 2) + 'px';
            }

            line.style.width = width;
            line.style.height = config.width + 'px';
            line.style.left = leftPos;
            line.style.top = (side === 'top' ? pos.top : pos.bottom) + 'px';
            line.style.background = getBackgroundStyle(config.style, color, 'horizontal');

        } else {
            // Vertical lines (left/right)
            var height, topPos;

            if (config.lengthMode === 'page') {
                // Full document height
                height = docHeight + 'px';
                topPos = '0';
            } else if (config.lengthMode === 'absolute') {
                // Percentage of viewport height, centered
                height = config.lengthPercent + 'vh';
                topPos = ((100 - config.lengthPercent) / 2) + 'vh';
            } else {
                // Relative to element
                var relHeight = pos.height * config.lengthPercent / 100;
                height = relHeight + 'px';
                topPos = (pos.top + (pos.height - relHeight) / 2) + 'px';
            }

            line.style.height = height;
            line.style.width = config.width + 'px';
            line.style.top = topPos;
            line.style.left = (side === 'left' ? pos.left : pos.right) + 'px';
            line.style.background = getBackgroundStyle(config.style, color, 'vertical');
        }

        // Absolute positioning (relative to documentElement)
        line.style.position = 'absolute';
        line.style.pointerEvents = 'none';
        line.style.zIndex = '-1';

        return line;
    }

    /**
     * Process a single visual grid element
     */
    function processElement(element, container, docHeight, docWidth) {
        var dataAttr = element.getAttribute('data-visual-grid');
        if (!dataAttr) return;

        var visualGrid;
        try {
            visualGrid = JSON.parse(dataAttr);
        } catch (e) {
            console.error('Visual Grid: Failed to parse', e);
            return;
        }

        if (!visualGrid || !visualGrid.enabled) return;

        // Check if disabled on mobile
        if (visualGrid.disableOnMobile !== false && isMobileViewport()) {
            console.log('Visual Grid: Skipping element on mobile');
            return;
        }

        var pos = getDocumentOffset(element);
        console.log('Visual Grid: Element at', pos);

        // Collect enabled sides
        var sides = {};

        if (visualGrid.linked) {
            if (visualGrid.topBottom && visualGrid.topBottom.enabled) {
                sides.top = visualGrid.topBottom;
                sides.bottom = visualGrid.topBottom;
            }
            if (visualGrid.leftRight && visualGrid.leftRight.enabled) {
                sides.left = visualGrid.leftRight;
                sides.right = visualGrid.leftRight;
            }
        } else {
            if (visualGrid.top && visualGrid.top.enabled) sides.top = visualGrid.top;
            if (visualGrid.bottom && visualGrid.bottom.enabled) sides.bottom = visualGrid.bottom;
            if (visualGrid.left && visualGrid.left.enabled) sides.left = visualGrid.left;
            if (visualGrid.right && visualGrid.right.enabled) sides.right = visualGrid.right;
        }

        for (var side in sides) {
            if (sides.hasOwnProperty(side)) {
                if (shouldPreventOverlap(pos, side, visualGrid.preventOverlap)) {
                    continue;
                }
                var line = createLineElement(side, sides[side], pos, docHeight, docWidth);
                container.appendChild(line);
            }
        }
    }

    /**
     * Initialize visual grid
     */
    function init() {
        console.log('Visual Grid: Initializing v5...');

        // Remove existing container
        var existing = document.getElementById('visual-grid-container');
        if (existing) {
            existing.parentNode.removeChild(existing);
        }

        var elements = document.querySelectorAll('[data-visual-grid]');
        console.log('Visual Grid: Found ' + elements.length + ' elements');

        if (elements.length === 0) return;

        // Get full document dimensions
        var docHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        var docWidth = Math.max(
            document.body.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.clientWidth,
            document.documentElement.scrollWidth,
            document.documentElement.offsetWidth
        );

        // Create container attached to <html>
        var container = document.createElement('div');
        container.id = 'visual-grid-container';

        // Reset overlap tracking
        processedLines = { top: {}, bottom: {}, left: {}, right: {} };

        for (var i = 0; i < elements.length; i++) {
            processElement(elements[i], container, docHeight, docWidth);
        }

        // Append to documentElement (<html>), not body
        document.documentElement.appendChild(container);

        console.log('Visual Grid: Created', container.children.length, 'lines');
    }

    // Debounce helper
    function debounce(func, wait) {
        var timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(func, wait);
        };
    }

    // Initialize after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(init, 100);
        });
    } else {
        setTimeout(init, 100);
    }

    // Reinitialize on load (images etc might change layout)
    window.addEventListener('load', function () {
        setTimeout(init, 200);
    });

    // Reinitialize on resize (debounced)
    window.addEventListener('resize', debounce(init, 200));

})();
