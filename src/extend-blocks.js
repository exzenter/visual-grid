/**
 * Extend Blocks with Visual Grid attributes and controls
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { Fragment, useMemo } from '@wordpress/element';
import VisualGridControls from './components/VisualGridControls';
import { DEFAULT_VISUAL_GRID } from './presets';
import { generateVisualGridCSS } from './utils/css-generator';
import { stripDefaults } from './utils/strip-defaults';

/**
 * List of supported blocks
 */
const SUPPORTED_BLOCKS = [
    // Core blocks
    'core/group',
    'core/columns',
    'core/column',
    'core/cover',
    'core/image',
    'core/heading',
    'core/paragraph',
    // Kadence blocks
    'kadence/rowlayout',
    'kadence/column',
    'kadence/advancedheading',
    'kadence/iconlist',
    'kadence/tabs',
    'kadence/accordion',
    // Custom blocks
    'simple-morph/glassmorphism-group'
];

/**
 * Add visualGrid attribute to supported blocks
 */
function addVisualGridAttribute(settings, name) {
    if (!SUPPORTED_BLOCKS.includes(name)) {
        return settings;
    }

    return {
        ...settings,
        attributes: {
            ...settings.attributes,
            visualGrid: {
                type: 'object',
                default: DEFAULT_VISUAL_GRID
            }
        }
    };
}

addFilter(
    'blocks.registerBlockType',
    'visual-grid/add-attribute',
    addVisualGridAttribute
);

/**
 * Add Visual Grid controls to block inspector
 */
const withVisualGridControls = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        const { name, attributes, setAttributes, isSelected, clientId } = props;

        if (!SUPPORTED_BLOCKS.includes(name)) {
            return <BlockEdit {...props} />;
        }

        const visualGrid = attributes.visualGrid || DEFAULT_VISUAL_GRID;

        // Generate CSS for editor preview with block selector
        const editorCSS = useMemo(() => {
            if (!visualGrid.enabled) return '';
            // Generate with placeholder and replace with block selector
            let css = generateVisualGridCSS(visualGrid, 'PLACEHOLDER');
            return css.replace(/\[data-visual-grid-id="PLACEHOLDER"\]/g, `[data-block="${clientId}"]`);
        }, [visualGrid, clientId]);

        return (
            <Fragment>
                <BlockEdit {...props} />

                {isSelected && (
                    <InspectorControls>
                        <VisualGridControls
                            visualGrid={visualGrid}
                            setAttributes={setAttributes}
                        />
                    </InspectorControls>
                )}

                {/* Editor Preview Styles */}
                {visualGrid.enabled && editorCSS && (
                    <style>{editorCSS}</style>
                )}
            </Fragment>
        );
    };
}, 'withVisualGridControls');

addFilter(
    'editor.BlockEdit',
    'visual-grid/with-controls',
    withVisualGridControls
);

/**
 * Add data attributes to block wrapper for save
 */
function addVisualGridDataAttributes(extraProps, blockType, attributes) {
    if (!SUPPORTED_BLOCKS.includes(blockType.name)) {
        return extraProps;
    }

    const visualGrid = attributes.visualGrid;

    if (!visualGrid?.enabled) {
        return extraProps;
    }

    // Strip default values to reduce HTML payload
    const strippedGrid = stripDefaults(visualGrid);

    return {
        ...extraProps,
        'data-visual-grid': JSON.stringify(strippedGrid),
        className: `${extraProps.className || ''} has-visual-grid`.trim()
    };
}

addFilter(
    'blocks.getSaveContent.extraProps',
    'visual-grid/add-data-attributes',
    addVisualGridDataAttributes
);
