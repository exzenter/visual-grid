/**
 * Strip default values from visualGrid object
 * Only outputs values that differ from defaults to reduce HTML payload
 */
import { DEFAULT_VISUAL_GRID, DEFAULT_SIDE_CONFIG } from '../presets';

/**
 * Deep comparison helper
 */
function isEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object' || a === null || b === null) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Strip default values from a side config
 */
function stripDefaultsFromSide(sideConfig) {
    if (!sideConfig) return undefined;

    const stripped = {};
    let hasChanges = false;

    for (const key in sideConfig) {
        if (sideConfig[key] !== DEFAULT_SIDE_CONFIG[key]) {
            stripped[key] = sideConfig[key];
            hasChanges = true;
        }
    }

    // If nothing changed and it's disabled, don't output at all
    if (!hasChanges && !sideConfig.enabled) {
        return undefined;
    }

    // If enabled is the only change, just output that
    if (Object.keys(stripped).length === 1 && stripped.enabled === true) {
        return { enabled: true };
    }

    return hasChanges ? stripped : undefined;
}

/**
 * Strip default values from visualGrid object
 */
export function stripDefaults(visualGrid) {
    if (!visualGrid || !visualGrid.enabled) {
        return { enabled: false };
    }

    const stripped = {};

    // Always include enabled if true
    if (visualGrid.enabled) {
        stripped.enabled = true;
    }

    // Only include non-default values
    if (visualGrid.preset !== DEFAULT_VISUAL_GRID.preset) {
        stripped.preset = visualGrid.preset;
    }

    if (visualGrid.linked !== DEFAULT_VISUAL_GRID.linked) {
        stripped.linked = visualGrid.linked;
    }

    if (visualGrid.preventOverlap !== DEFAULT_VISUAL_GRID.preventOverlap) {
        stripped.preventOverlap = visualGrid.preventOverlap;
    }

    if (visualGrid.disableOnMobile !== DEFAULT_VISUAL_GRID.disableOnMobile) {
        stripped.disableOnMobile = visualGrid.disableOnMobile;
    }

    if (visualGrid.exclusionSelectors && visualGrid.exclusionSelectors !== '') {
        stripped.exclusionSelectors = visualGrid.exclusionSelectors;
    }

    if (visualGrid.overlaySelectors && visualGrid.overlaySelectors !== '') {
        stripped.overlaySelectors = visualGrid.overlaySelectors;
    }

    // Strip side configs
    const sides = ['topBottom', 'leftRight', 'top', 'right', 'bottom', 'left'];
    for (const side of sides) {
        const strippedSide = stripDefaultsFromSide(visualGrid[side]);
        if (strippedSide !== undefined) {
            stripped[side] = strippedSide;
        }
    }

    return stripped;
}
