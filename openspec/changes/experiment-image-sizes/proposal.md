## Why
The user wants to easily control the size of idle images (the images shown when no detection is active). Currently, this size is controlled by a hardcoded "magic number" (0.8) inside the rendering logic.

## What Changes
- Add a configurable `idleImageScale` property to the `Scene` class.
- Expose this configuration in the "CONFIGURABLE TIMES/SETTINGS" section at the top of the relevant files.
- Update `renderIdleImage` to use this new configuration.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `visual-rendering`: Add requirement for configurable idle image scaling.

## Impact
- `public/Scene.js`: New configuration variable and updated rendering logic.
