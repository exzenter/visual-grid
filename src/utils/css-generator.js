/**
 * CSS Generator for Visual Grid pseudo-elements
 * Uses ::before for horizontal lines (top/bottom)
 * Uses ::after for vertical lines (left/right)
 */

/**
 * Convert hex color to rgba
 */
export function hexToRgba(hex, opacity) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return `rgba(0, 0, 0, ${opacity})`;
    }
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get length value based on mode
 */
function getLengthValue(config, direction) {
    switch (config.lengthMode) {
        case 'page':
            return direction === 'horizontal' ? '100vw' : '100vh';
        case 'absolute':
            return direction === 'horizontal'
                ? `${config.lengthPercent}vw`
                : `${config.lengthPercent}vh`;
        case 'relative':
            return `${config.lengthPercent}%`;
        default:
            return direction === 'horizontal' ? '100vw' : '100vh';
    }
}

/**
 * Generate background style based on line style
 */
function getBackgroundStyle(style, color, direction) {
    const deg = direction === 'horizontal' ? '90deg' : '180deg';

    switch (style) {
        case 'dashed':
            return `repeating-linear-gradient(${deg}, ${color} 0px, ${color} 8px, transparent 8px, transparent 16px)`;
        case 'dotted':
            return `repeating-linear-gradient(${deg}, ${color} 0px, ${color} 2px, transparent 2px, transparent 6px)`;
        case 'solid':
        default:
            return color;
    }
}

/**
 * Generate complete CSS for all sides
 * Strategy: Use ::before for top line, ::after for bottom line
 * Use additional absolutely positioned elements via CSS for left/right
 */
export function generateVisualGridCSS(visualGrid, uniqueId) {
    if (!visualGrid.enabled) {
        return '';
    }

    const selector = `[data-visual-grid-id="${uniqueId}"]`;
    let css = `${selector} { position: relative; overflow: visible; }\n`;

    // Collect enabled sides
    let topConfig = null;
    let bottomConfig = null;
    let leftConfig = null;
    let rightConfig = null;

    if (visualGrid.linked) {
        if (visualGrid.topBottom?.enabled) {
            topConfig = visualGrid.topBottom;
            bottomConfig = visualGrid.topBottom;
        }
        if (visualGrid.leftRight?.enabled) {
            leftConfig = visualGrid.leftRight;
            rightConfig = visualGrid.leftRight;
        }
    } else {
        if (visualGrid.top?.enabled) topConfig = visualGrid.top;
        if (visualGrid.bottom?.enabled) bottomConfig = visualGrid.bottom;
        if (visualGrid.left?.enabled) leftConfig = visualGrid.left;
        if (visualGrid.right?.enabled) rightConfig = visualGrid.right;
    }

    // Generate TOP line using ::before
    if (topConfig) {
        const color = hexToRgba(topConfig.color, topConfig.opacity);
        const length = getLengthValue(topConfig, 'horizontal');
        const background = getBackgroundStyle(topConfig.style, color, 'horizontal');

        css += `${selector}::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: ${length};
  height: ${topConfig.width}px;
  background: ${background};
  pointer-events: none;
  z-index: -1;
}\n`;
    }

    // Generate BOTTOM line using ::after
    if (bottomConfig) {
        const color = hexToRgba(bottomConfig.color, bottomConfig.opacity);
        const length = getLengthValue(bottomConfig, 'horizontal');
        const background = getBackgroundStyle(bottomConfig.style, color, 'horizontal');

        css += `${selector}::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: ${length};
  height: ${bottomConfig.width}px;
  background: ${background};
  pointer-events: none;
  z-index: -1;
}\n`;
    }

    // Generate LEFT line using box-shadow on ::before (if no top) or a gradient overlay
    // Actually, we'll use a different approach: outline + clip-path or multiple backgrounds
    // For simplicity, let's use absolute positioned pseudo elements with specific targeting

    // For left/right, we need a different approach since we've used up ::before and ::after
    // Solution: Use box-shadow to simulate lines, or use background-image with gradients

    // Alternative approach: Use border-image or linear-gradients on the main element
    if (leftConfig || rightConfig) {
        let gradients = [];
        let sizes = [];
        let positions = [];

        if (leftConfig) {
            const color = hexToRgba(leftConfig.color, leftConfig.opacity);
            const length = getLengthValue(leftConfig, 'vertical');
            const width = leftConfig.width;

            if (leftConfig.style === 'solid') {
                gradients.push(`linear-gradient(180deg, ${color}, ${color})`);
            } else if (leftConfig.style === 'dashed') {
                gradients.push(`repeating-linear-gradient(180deg, ${color} 0px, ${color} 8px, transparent 8px, transparent 16px)`);
            } else if (leftConfig.style === 'dotted') {
                gradients.push(`repeating-linear-gradient(180deg, ${color} 0px, ${color} 2px, transparent 2px, transparent 6px)`);
            }
            sizes.push(`${width}px ${length}`);
            positions.push(`left center`);
        }

        if (rightConfig) {
            const color = hexToRgba(rightConfig.color, rightConfig.opacity);
            const length = getLengthValue(rightConfig, 'vertical');
            const width = rightConfig.width;

            if (rightConfig.style === 'solid') {
                gradients.push(`linear-gradient(180deg, ${color}, ${color})`);
            } else if (rightConfig.style === 'dashed') {
                gradients.push(`repeating-linear-gradient(180deg, ${color} 0px, ${color} 8px, transparent 8px, transparent 16px)`);
            } else if (rightConfig.style === 'dotted') {
                gradients.push(`repeating-linear-gradient(180deg, ${color} 0px, ${color} 2px, transparent 2px, transparent 6px)`);
            }
            sizes.push(`${width}px ${length}`);
            positions.push(`right center`);
        }

        if (gradients.length > 0) {
            css += `${selector} {
  background-image: ${gradients.join(', ')};
  background-size: ${sizes.join(', ')};
  background-position: ${positions.join(', ')};
  background-repeat: no-repeat;
}\n`;
        }
    }

    return css;
}

/**
 * Generate CSS for a single side (legacy, for compatibility)
 */
export function generateSideCSS(side, config, uniqueId) {
    if (!config.enabled) {
        return '';
    }
    // This is now handled by generateVisualGridCSS
    return '';
}
