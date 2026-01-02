/**
 * Visual Grid Presets
 */
export const PRESETS = {
    tailwind: {
        label: 'Tailwind Style',
        style: 'solid',
        width: 1,
        color: '#e5e7eb',
        opacity: 1.0,
        lengthMode: 'page',
        lengthPercent: 100
    },
    modern: {
        label: 'Modern Grid',
        style: 'solid',
        width: 1,
        color: '#3b82f6',
        opacity: 0.15,
        lengthMode: 'page',
        lengthPercent: 100
    },
    subtle: {
        label: 'Subtle Lines',
        style: 'dashed',
        width: 1,
        color: '#000000',
        opacity: 0.05,
        lengthMode: 'page',
        lengthPercent: 100
    },
    custom: {
        label: 'Custom',
        style: 'solid',
        width: 1,
        color: '#000000',
        opacity: 0.1,
        lengthMode: 'page',
        lengthPercent: 100
    }
};

/**
 * Default side configuration
 */
export const DEFAULT_SIDE_CONFIG = {
    enabled: false,
    style: 'solid',
    width: 1,
    color: '#000000',
    opacity: 0.1,
    lengthMode: 'page',
    lengthPercent: 100
};

/**
 * Default visual grid attributes
 */
export const DEFAULT_VISUAL_GRID = {
    enabled: false,
    preset: 'custom',
    linked: true,
    preventOverlap: false,
    disableOnMobile: true,
    exclusionSelectors: '',
    overlaySelectors: '',
    topBottom: { ...DEFAULT_SIDE_CONFIG },
    leftRight: { ...DEFAULT_SIDE_CONFIG },
    top: { ...DEFAULT_SIDE_CONFIG },
    right: { ...DEFAULT_SIDE_CONFIG },
    bottom: { ...DEFAULT_SIDE_CONFIG },
    left: { ...DEFAULT_SIDE_CONFIG }
};

/**
 * Apply preset to visual grid settings
 */
export function applyPreset(presetName, currentSettings) {
    const preset = PRESETS[presetName];
    if (!preset || presetName === 'custom') {
        return { ...currentSettings, preset: presetName };
    }

    const sideConfig = {
        enabled: true,
        style: preset.style,
        width: preset.width,
        color: preset.color,
        opacity: preset.opacity,
        lengthMode: preset.lengthMode,
        lengthPercent: preset.lengthPercent
    };

    return {
        ...currentSettings,
        preset: presetName,
        topBottom: { ...sideConfig },
        leftRight: { ...sideConfig },
        top: { ...sideConfig },
        right: { ...sideConfig },
        bottom: { ...sideConfig },
        left: { ...sideConfig }
    };
}
