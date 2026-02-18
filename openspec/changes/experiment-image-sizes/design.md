## Context
The current idle image rendering in `public/Scene.js` uses a hardcoded scale factor of `0.8` (80% of the screen). This makes it difficult for the user to adjust the size without diving into the rendering logic.

## Goals / Non-Goals

**Goals:**
- Move the hardcoded scale factor to a configurable variable.
- Place this variable in the "TIEMPOS DE ANIMACIÓN CONFIGURABLES" section of `Scene.js`.
- Ensure the user can easily find and modify this value.

**Non-Goals:**
- Changing the aspect ratio of the images.
- Modifying other rendering components unless necessary for scaling.

## Decisions

- **Decision 1: Use a class property `this.idleImageScale`**: This allows the value to be set in the constructor and used in the `renderIdleImage` method.
- **Decision 2: Centralize configuration**: Even though `Scene.js` doesn't currently have a global config object, we'll keep the variable at the top of the constructor where other "configurable" values are located.

## Risks / Trade-offs

- **Risk**: Setting a scale > 1.0 might cause images to be cut off.
- **Mitigation**: This is expected behavior if the user wants larger images; we will document it as an option.
