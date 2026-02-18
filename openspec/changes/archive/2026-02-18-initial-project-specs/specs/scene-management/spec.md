## ADDED Requirements

### Requirement: Detection scene transition
The system SHALL display a specific scene when a valid class is detected.

#### Scenario: Enter detection mode
- **WHEN** a new class is detected by the image classifier
- **THEN** a Scene is created with the corresponding content and a fade-in animation starts

### Requirement: Idle state transition
The system SHALL transition to an "idle" state when no detection has occurred for a configurable period.

#### Scenario: Enter idle mode
- **WHEN** no detection is active for more than the `idleThreshold` (default 30 seconds)
- **THEN** the system selects a random idle image and starts showing it with a fade-in animation

### Requirement: Configurable timers
The system SHALL allow configuration of idle threshold and scene durations.

#### Scenario: Adjusting timers
- **WHEN** the `idleThreshold` or `idleSceneDuration` values are modified in `SceneManager.js`
- **THEN** the timing behavior of transitions is updated accordingly
