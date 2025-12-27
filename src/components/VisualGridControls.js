/**
 * Visual Grid Controls Component
 */
import { __ } from '@wordpress/i18n';
import {
    PanelBody,
    ToggleControl,
    SelectControl,
    RangeControl,
    Button,
    ButtonGroup,
    ColorPicker,
    Popover,
    __experimentalUnitControl as UnitControl,
    TabPanel
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { PRESETS, applyPreset, DEFAULT_SIDE_CONFIG } from '../presets';

const STYLE_OPTIONS = [
    { label: __('Solid', 'visual-grid'), value: 'solid' },
    { label: __('Dashed', 'visual-grid'), value: 'dashed' },
    { label: __('Dotted', 'visual-grid'), value: 'dotted' }
];

const LENGTH_OPTIONS = [
    { label: __('Page Edge', 'visual-grid'), value: 'page' },
    { label: __('Absolute %', 'visual-grid'), value: 'absolute' },
    { label: __('Relative %', 'visual-grid'), value: 'relative' }
];

const PRESET_OPTIONS = [
    { label: __('Custom', 'visual-grid'), value: 'custom' },
    { label: __('Tailwind Style', 'visual-grid'), value: 'tailwind' },
    { label: __('Modern Grid', 'visual-grid'), value: 'modern' },
    { label: __('Subtle Lines', 'visual-grid'), value: 'subtle' }
];

/**
 * Color Picker Button with Popover
 */
function ColorPickerButton({ color, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="visual-grid-color-picker">
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="visual-grid-color-button"
                style={{
                    backgroundColor: color,
                    width: '36px',
                    height: '36px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            />
            {isOpen && (
                <Popover
                    position="bottom center"
                    onClose={() => setIsOpen(false)}
                >
                    <div style={{ padding: '12px' }}>
                        <ColorPicker
                            color={color}
                            onChange={onChange}
                            enableAlpha={false}
                        />
                    </div>
                </Popover>
            )}
        </div>
    );
}

/**
 * Side Configuration Controls
 */
function SideControls({ label, config, onChange }) {
    return (
        <div className="visual-grid-side-controls">
            <h4 style={{ marginTop: '12px', marginBottom: '8px' }}>{label}</h4>

            <ToggleControl
                label={__('Enable', 'visual-grid')}
                checked={config.enabled}
                onChange={(value) => onChange({ ...config, enabled: value })}
            />

            {config.enabled && (
                <>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <SelectControl
                            label={__('Style', 'visual-grid')}
                            value={config.style}
                            options={STYLE_OPTIONS}
                            onChange={(value) => onChange({ ...config, style: value })}
                            __nextHasNoMarginBottom
                        />
                        <RangeControl
                            label={__('Width', 'visual-grid')}
                            value={config.width}
                            onChange={(value) => onChange({ ...config, width: value })}
                            min={1}
                            max={10}
                            __nextHasNoMarginBottom
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '12px' }}>
                        <div>
                            <label className="components-base-control__label" style={{ display: 'block', marginBottom: '8px' }}>
                                {__('Color', 'visual-grid')}
                            </label>
                            <ColorPickerButton
                                color={config.color}
                                onChange={(value) => onChange({ ...config, color: value })}
                            />
                        </div>
                        <RangeControl
                            label={__('Opacity', 'visual-grid')}
                            value={config.opacity}
                            onChange={(value) => onChange({ ...config, opacity: value })}
                            min={0}
                            max={1}
                            step={0.05}
                            __nextHasNoMarginBottom
                        />
                    </div>

                    <SelectControl
                        label={__('Length Mode', 'visual-grid')}
                        value={config.lengthMode}
                        options={LENGTH_OPTIONS}
                        onChange={(value) => onChange({ ...config, lengthMode: value })}
                    />

                    {config.lengthMode !== 'page' && (
                        <RangeControl
                            label={__('Length Percentage', 'visual-grid')}
                            value={config.lengthPercent}
                            onChange={(value) => onChange({ ...config, lengthPercent: value })}
                            min={1}
                            max={200}
                        />
                    )}
                </>
            )}
        </div>
    );
}

/**
 * Main Visual Grid Controls Component
 */
export default function VisualGridControls({ visualGrid, setAttributes }) {
    const updateVisualGrid = (updates) => {
        setAttributes({
            visualGrid: {
                ...visualGrid,
                ...updates
            }
        });
    };

    const handlePresetChange = (presetName) => {
        const newSettings = applyPreset(presetName, visualGrid);
        setAttributes({ visualGrid: newSettings });
    };

    return (
        <PanelBody
            title={__('Visual Grid', 'visual-grid')}
            initialOpen={false}
            className="visual-grid-panel"
        >
            <ToggleControl
                label={__('Enable Visual Grid', 'visual-grid')}
                checked={visualGrid.enabled}
                onChange={(value) => updateVisualGrid({ enabled: value })}
            />

            {visualGrid.enabled && (
                <>
                    <SelectControl
                        label={__('Preset', 'visual-grid')}
                        value={visualGrid.preset}
                        options={PRESET_OPTIONS}
                        onChange={handlePresetChange}
                    />

                    <ToggleControl
                        label={__('Prevent Line Overlap', 'visual-grid')}
                        help={__('Prevents duplicate lines from overlapping elements', 'visual-grid')}
                        checked={visualGrid.preventOverlap}
                        onChange={(value) => updateVisualGrid({ preventOverlap: value })}
                    />

                    <ToggleControl
                        label={__('Disable on Mobile', 'visual-grid')}
                        help={__('Hide grid lines on mobile devices (< 768px)', 'visual-grid')}
                        checked={visualGrid.disableOnMobile !== false}
                        onChange={(value) => updateVisualGrid({ disableOnMobile: value })}
                    />

                    <div style={{ marginBottom: '16px' }}>
                        <Button
                            variant={visualGrid.linked ? 'primary' : 'secondary'}
                            onClick={() => updateVisualGrid({ linked: !visualGrid.linked })}
                            style={{ width: '100%' }}
                        >
                            {visualGrid.linked
                                ? __('🔗 Sides Linked', 'visual-grid')
                                : __('🔓 Sides Unlinked', 'visual-grid')
                            }
                        </Button>
                    </div>

                    {visualGrid.linked ? (
                        <>
                            <SideControls
                                label={__('Top & Bottom', 'visual-grid')}
                                config={visualGrid.topBottom || DEFAULT_SIDE_CONFIG}
                                onChange={(config) => updateVisualGrid({ topBottom: config })}
                            />
                            <SideControls
                                label={__('Left & Right', 'visual-grid')}
                                config={visualGrid.leftRight || DEFAULT_SIDE_CONFIG}
                                onChange={(config) => updateVisualGrid({ leftRight: config })}
                            />
                        </>
                    ) : (
                        <TabPanel
                            className="visual-grid-tabs"
                            tabs={[
                                { name: 'top', title: __('Top', 'visual-grid') },
                                { name: 'right', title: __('Right', 'visual-grid') },
                                { name: 'bottom', title: __('Bottom', 'visual-grid') },
                                { name: 'left', title: __('Left', 'visual-grid') }
                            ]}
                        >
                            {(tab) => (
                                <SideControls
                                    label={tab.title}
                                    config={visualGrid[tab.name] || DEFAULT_SIDE_CONFIG}
                                    onChange={(config) => updateVisualGrid({ [tab.name]: config })}
                                />
                            )}
                        </TabPanel>
                    )}
                </>
            )}
        </PanelBody>
    );
}
