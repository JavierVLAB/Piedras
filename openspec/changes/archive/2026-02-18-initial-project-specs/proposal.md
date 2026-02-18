## Why

The project currently lacks formal documentation for its core logic and design decisions. This change initializes the OpenSpec structure to provide a clear overview of how the p5.js installation works, focusing on its main components and design choices for easier maintenance and future development.

## What Changes

- Initialize the project's OpenSpec repository structure.
- Document the main functional blocks: image classification, state transitions, and rendering.
- Capture key design decisions like the p5.js 2.0 asynchronous setup and global screen rotation support.

## Capabilities

### New Capabilities
- `image-detection`: Handling camera input and classifying it through an ml5.js model.
- `scene-management`: Managing transitions between active interaction and idle states based on configurable thresholds.
- `visual-rendering`: Rendering text and images with animations (fade-in/out) and support for different screen orientations.

### Modified Capabilities
- None

## Impact

- Documentation only: Creates `openspec/specs/` and initial specification files.
- No changes to existing code in `public/`.
