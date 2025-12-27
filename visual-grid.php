<?php
/**
 * Plugin Name: Visual Grid
 * Description: Extends Gutenberg and Kadence blocks with visual grid lines using pseudo-elements
 * Version: 1.0.0
 * Author: Visual Grid Team
 * Text Domain: visual-grid
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('VISUAL_GRID_VERSION', '1.0.0');
define('VISUAL_GRID_PATH', plugin_dir_path(__FILE__));
define('VISUAL_GRID_URL', plugin_dir_url(__FILE__));

/**
 * Enqueue editor scripts and styles
 */
function visual_grid_enqueue_editor_assets() {
    $asset_file = VISUAL_GRID_PATH . 'build/index.asset.php';
    
    if (!file_exists($asset_file)) {
        return;
    }
    
    $asset = include $asset_file;
    
    wp_enqueue_script(
        'visual-grid-editor',
        VISUAL_GRID_URL . 'build/index.js',
        $asset['dependencies'],
        $asset['version'],
        true
    );
    
    wp_enqueue_style(
        'visual-grid-editor',
        VISUAL_GRID_URL . 'assets/css/visual-grid-editor.css',
        array(),
        VISUAL_GRID_VERSION
    );
}
add_action('enqueue_block_editor_assets', 'visual_grid_enqueue_editor_assets');

/**
 * Enqueue frontend scripts and styles
 */
function visual_grid_enqueue_frontend_assets() {
    wp_enqueue_style(
        'visual-grid-frontend',
        VISUAL_GRID_URL . 'assets/css/visual-grid-frontend.css',
        array(),
        VISUAL_GRID_VERSION
    );
    
    wp_enqueue_script(
        'visual-grid-frontend',
        VISUAL_GRID_URL . 'assets/js/visual-grid-frontend.js',
        array(),
        VISUAL_GRID_VERSION,
        true
    );
}
add_action('wp_enqueue_scripts', 'visual_grid_enqueue_frontend_assets');

/**
 * Add visual grid data attributes to block wrapper
 */
function visual_grid_render_block($block_content, $block) {
    // Supported blocks
    $supported_blocks = array(
        'core/group',
        'core/columns',
        'core/column',
        'core/cover',
        'core/image',
        'core/heading',
        'core/paragraph',
        'kadence/rowlayout',
        'kadence/column',
        'kadence/advancedheading',
        'kadence/iconlist',
        'kadence/tabs',
        'kadence/accordion',
        'simple-morph/glassmorphism-group'
    );
    
    if (!in_array($block['blockName'], $supported_blocks)) {
        return $block_content;
    }
    
    if (empty($block['attrs']['visualGrid']) || empty($block['attrs']['visualGrid']['enabled'])) {
        return $block_content;
    }
    
    $grid = $block['attrs']['visualGrid'];
    $unique_id = 'vg-' . substr(md5(uniqid()), 0, 8);
    
    // Build data attribute with JSON settings
    $grid_data = wp_json_encode($grid);
    
    // More robust regex - handle whitespace and various tag formats
    $pattern = '/^(\s*)(<[a-z][a-z0-9]*)((?:\s+[^>]*)?)(>)/is';
    
    $replacement = function($matches) use ($grid_data, $unique_id) {
        $whitespace = $matches[1];
        $tag_start = $matches[2];
        $existing_attrs = $matches[3];
        $tag_end = $matches[4];
        
        // Add has-visual-grid class
        if (preg_match('/class\s*=\s*["\']([^"\']*)["\']/', $existing_attrs, $class_match)) {
            $existing_attrs = preg_replace(
                '/class\s*=\s*["\']([^"\']*)["\']/',
                'class="$1 has-visual-grid"',
                $existing_attrs
            );
        } else {
            $existing_attrs .= ' class="has-visual-grid"';
        }
        
        return $whitespace . $tag_start . $existing_attrs . 
               ' data-visual-grid="' . esc_attr($grid_data) . '"' .
               ' data-visual-grid-id="' . $unique_id . '"' . $tag_end;
    };
    
    $block_content = preg_replace_callback($pattern, $replacement, $block_content, 1);
    
    return $block_content;
}
add_filter('render_block', 'visual_grid_render_block', 10, 2);

