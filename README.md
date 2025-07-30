## To Do

- Add close button and click-outside-to-close on AllPrinciplesDialog https://www.youtube.com/watch?v=YwHJMlvZRCc
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

### Page 1

- Both polls in closed state, not disabled
- Controls visible, Next visible and active, Back hidden and disabled
- IntroParagraph visible with flex set to 1 1 auto and overflow set to auto
- Transition to Page 2 when user clicks Next
