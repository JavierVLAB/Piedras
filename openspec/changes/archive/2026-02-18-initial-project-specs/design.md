## Context

The project is an interactive installation developed with p5.js and ml5.js. It requires real-time image classification from a camera feed and dynamic content display based on the detection results.

## Goals / Non-Goals

**Goals:**
- Provide a robust architecture for image classification and scene transitions.
- Support different hardware setups (horizontal/vertical monitors) with minimal code changes.
- Ensure smooth animations (fades) for a polished user experience.

**Non-Goals:**
- Not focusing on security or database management.
- Not implementing complex user authentication or cloud storage.
- No network-based communication or multi-user interaction.

## Decisions

### 1. p5.js 2.0 Asynchronous Setup
The project follows the p5.js 2.0 recommendation of using `async/await` inside the `setup()` function for loading external assets (JSON, fonts, images).
- **Rationale**: Simplifies error handling and ensures all assets are ready before the `draw()` loop starts.
- **Alternatives**: Using the traditional `preload()` function, which is less modern and can lead to more complex loading logic in larger projects.

### 2. Decoupled Scene Management
All logic related to transitions between active detection and idle states is handled by a `SceneManager` class.
- **Rationale**: Keeps `sketch.js` focused on the main p5.js lifecycle (setup, draw) and input handling. This separation makes it easier to test and extend the system with new states.
- **Alternatives**: Hardcoding state transitions inside the `draw()` loop, which quickly becomes unmanageable.

### 3. Global Screen Rotation
A global `rotateScreen` flag applies a translation and rotation (`HALF_PI`) at the beginning of the `draw()` function.
- **Rationale**: Allows the installation to run on vertically mounted monitors without needing to adjust the coordinates in all individual rendering functions.
- **Alternatives**: Manually recalculating `(x, y)` for every element, which is error-prone and tedious.

### 4. Encapsulated Rendering (Scene Class)
Each "scene" (detection text, idle image, idle text) is an instance of a `Scene` class that manages its own opacity and rendering.
- **Rationale**: Simplifies the animation logic (fade-in/out) by making it local to each scene object.
- **Alternatives**: Managing global timers and opacity variables in `SceneManager`, which increases complexity when multiple scenes overlap during transitions.

## Risks / Trade-offs

- **[Risk] Performance on low-end hardware** → Mitigation: Keep the classification resolution low (320x240) and limit the number of active objects in the scene.
- **[Risk] Camera detection accuracy** → Mitigation: Use a high confidence threshold (>80%) and filter out generic classes.
