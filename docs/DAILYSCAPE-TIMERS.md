# DailyScape countdowns

Added November 7, 2026. DailyScape displays reset clocks above the checklist and
a timer on every activity card, including cards loaded with Show more. Timers
show days when needed, plus hours, minutes and seconds, and refresh every second
while the workspace is visible. Exact reset times are also shown in local time;
UTC timestamps remain available on the time elements.

## Reset rules

- Daily global resets: 00:00 UTC.
- RS3 global weeklies: Wednesday at 00:00 UTC.
- Global monthlies: the first of the next calendar month at 00:00 UTC.
- Personal cooldowns: calculated from the selected character's completion log
  using the activity's existing rule. OSRS Tears of Guthix uses the start of
  the seventh UTC day; accumulating-stock reminders use their elapsed cooldown.
- Restricted availability: a separate Available in timer distinguishes the
  activity's available day from its reward-cycle reset.
- Repeatable activities show No fixed reset. Personal reminders without a log
  prompt the player to record a completion; an unknown start is not fabricated.

OSRS does not receive an invented global weekly/monthly cycle. Its summary
instead shows the personal Tears reminder and the absence of a standard monthly
cycle. Global countdowns do not assert quest, reward, account or stock eligibility.

References: [RS3 D&D reset rules](https://runescape.wiki/w/Distractions_and_Diversions)
and [OSRS Tears of Guthix](https://oldschool.runescape.wiki/w/Tears_of_Guthix_(minigame)).

## Rollover and interaction

Timers derive remaining time from the current clock and target timestamp, so
background throttling does not accumulate interval drift. Returning to the tab
or window refreshes the visible clocks. Countdown updates replace only clock
fragments, preserving open calculators, input values and focus.

At a reset, checklist status and counts refresh automatically when no card
details/form is in use. An open card defers that full redraw until it closes;
its clock still updates. Historical completion records remain unchanged when a
new period begins. Existing profile and game boundaries remain intact.

The clocks run in the browser and depend on the device clock. They do not create
email, push or closed-browser notifications.

## Verification

Unit fixtures cover second/day formatting, nonnegative expiry, daily/weekly/
monthly boundaries, leap years, personal cooldowns, restricted availability and
all catalog activity timer states. Compiled-site browser checks cover every
activity, live rollover, preserved completion history, open-form preservation
and 320/390/768/1024px layouts in both games.
