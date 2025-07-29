## To Do

- Fix this: directive to close question toggles when page transitions from 0 to 1 prevents ability to re-open question toggles on subsequent pages.
- Animation of closing/collapsing of question toggles on transition from page 0 to page 1 looks like total garbage. Drop it.
- Build modal to show full list of democratic principles, link from intro paragraph.

## Pages

### Page 0 (DONE)

- Initially show both polls, and do not show controls
- Set open state on each poll to true (done by making polls set to open on initial render)
- Disable click on importance UserPoll Question to expand/collapse
- Show Controls when there are 3 responses to each question.
- Only Next button should be visible in Controls
- Transition to Page 1 when user clicks Next

### Page 1

- Both polls in closed state, not disabled
- Controls visible, both Back and Next visible and active
- IntroParagraph visible with flex set to 1 1 auto and overflow set to auto
- Transition to Page 2 when user clicks Next
