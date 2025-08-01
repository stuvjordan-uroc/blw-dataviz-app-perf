## Data for vizualizations

Data is built by scripts in src/data/build. See the README.md in that folder to understand how it works.

## To Do

- FIX: On tablet sized screens and above, width of app jumps when poll questions are open/closed.
- FIX: Layout transition from page 0 to page 1 are abrupt and confusing. Find a way to smooth them.

## Pages

### Page 0 (DONE)

- Initially show both polls, and do not show controls
- Set open state on each poll to true (done by making polls set to open on initial render)
- Disable click on importance UserPoll Question to expand/collapse
- Show Controls when there are 3 responses to each question.
- Only Next button should be visible in Controls
- Transition to Page 1 when user clicks Next

### Page 1 (DONE)

- Both polls in closed state, not disabled
- Controls visible, Next visible and active, Back hidden and disabled
- IntroParagraph visible with flex set to 1 1 auto and overflow set to auto
- Transition to Page 2 when user clicks Next

### Page 2

- Both polls in closed state, not disabled
- Controls visible, Next visible and active, Back visible and active
- VizInstructions just below polls. flex 0 0 auto, overflow auto, height 12rem (or something like that...maybe vary this with screen width)
- VisTabs just below VizInstructions and above Controls. flex 1 1 auto, overflow auto
- (STILL TO DO) Importance tab in active state.
