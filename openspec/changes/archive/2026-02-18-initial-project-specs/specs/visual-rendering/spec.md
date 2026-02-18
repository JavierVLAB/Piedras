## ADDED Requirements

### Requirement: Fade-in and fade-out animations
The system SHALL animate the visibility of content using opacity changes.

#### Scenario: Content appearance
- **WHEN** a scene starts its "fade-in" direction
- **THEN** the opacity increases based on the `fadeInSpeed` until it reaches 255

#### Scenario: Content disappearance
- **WHEN** a scene starts its "fade-out" direction
- **THEN** the opacity decreases based on the `fadeOutSpeed` until it reaches 0

### Requirement: Global screen rotation
The system SHALL support rotating the entire visual output by 90 degrees to accommodate vertical monitors.

#### Scenario: Enabling rotation
- **WHEN** `rotateScreen` is set to true
- **THEN** the canvas is translated and rotated by `HALF_PI` globally

### Requirement: Text rendering with backgrounds
The system SHALL render text phrases with rectangular backgrounds for better legibility over video or images.

#### Scenario: Drawing text
- **WHEN** `drawTextWithBackground` is called
- **THEN** a rectangle is drawn behind the text with configurable padding and colors
