## ADDED Requirements

### Requirement: Configurable idle image scaling
The system SHALL allow users to configure the scale factor of images shown during the idle state.

#### Scenario: Scaling idle image
- **WHEN** the `idleImageScale` property is set in the `Scene` class
- **THEN** the image is rendered with the specified scale factor relative to the available screen space
