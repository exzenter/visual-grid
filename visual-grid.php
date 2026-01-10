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

    // Pass settings to frontend
    wp_localize_script('visual-grid-frontend', 'visual_grid_settings', array(
        'console_output' => (bool) get_option('visual_grid_console_output', 0)
    ));
}
add_action('wp_enqueue_scripts', 'visual_grid_enqueue_frontend_assets');

/**
 * Add Admin Menu and Settings
 */
function visual_grid_admin_menu() {
    add_options_page(
        __('Visual Grid Settings', 'visual-grid'),
        __('Visual Grid', 'visual-grid'),
        'manage_options',
        'visual-grid',
        'visual_grid_settings_page'
    );
}
add_action('admin_menu', 'visual_grid_admin_menu');

/**
 * Register Settings
 */
function visual_grid_register_settings() {
    register_setting('visual_grid_settings', 'visual_grid_console_output', array(
        'type' => 'boolean',
        'default' => false,
        'sanitize_callback' => 'rest_sanitize_boolean'
    ));

    add_settings_section(
        'visual_grid_main_section',
        __('General Settings', 'visual-grid'),
        null,
        'visual-grid'
    );

    add_settings_field(
        'visual_grid_console_output',
        __('Console Output', 'visual-grid'),
        'visual_grid_console_output_render',
        'visual-grid',
        'visual_grid_main_section'
    );
}
add_action('admin_init', 'visual_grid_register_settings');

function visual_grid_console_output_render() {
    $value = get_option('visual_grid_console_output', 0);
    ?>
    <input type="checkbox" name="visual_grid_console_output" value="1" <?php checked(1, $value); ?> />
    <p class="description"><?php _e('Enable console logging on the frontend for debugging.', 'visual-grid'); ?></p>
    <?php
}

function visual_grid_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form action="options.php" method="post">
            <?php
            settings_fields('visual_grid_settings');
            do_settings_sections('visual-grid');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

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

