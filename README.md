# Visual Grid

A WordPress Gutenberg plugin that extends core blocks and Kadence blocks with visual grid lines - inspired by the Tailwind CSS website design.

## Features

- **Visual Grid Lines**: Add pseudo-element borders that extend to the page edge
- **Supports Core Blocks**: Group, Columns, Column, Cover, Image, Heading, Paragraph
- **Supports Kadence Blocks**: Row Layout, Column, Advanced Heading, Icon List, Tabs, Accordion
- **3 Preset Styles**: Tailwind Style, Modern Grid, Subtle Lines
- **Flexible Configuration**:
  - Line style: solid, dashed, dotted
  - Width: 1-10px
  - Color with opacity
  - Length modes: Page Edge, Absolute %, Relative %
- **Linked/Unlinked Sides**: Configure Top/Bottom and Left/Right together or individually
- **Overlap Prevention**: Optional checkbox to prevent duplicate lines at same positions

## Installation

1. Clone/copy to `wp-content/plugins/visual-grid/`
2. Run `npm install` and `npm run build`
3. Activate plugin in WordPress Admin

## Usage

1. Add any supported block
2. Open Block Settings → Visual Grid panel
3. Enable Visual Grid
4. Choose a preset or customize settings
5. Configure which sides should have grid lines

## Development

```bash
npm install       # Install dependencies
npm run start     # Development mode with watch
npm run build     # Production build
```

## Requirements

- WordPress 6.0+
- PHP 7.4+
- Node.js for building
