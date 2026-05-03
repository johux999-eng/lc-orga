# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0.0] - 2026-05-03

### Added
- **Rejection reason**: Heads can now include an optional explanation when rejecting a task. The reason appears as an amber banner on the task card so the assignee knows exactly what to fix before resubmitting.
- Rejection reason is automatically cleared when a task is resubmitted or approved.

### Changed
- **Assignee dropdown** no longer shows unapproved (pending) members — prevents assigning tasks to users who haven't been cleared yet.
- **Dashboard counters** (open, pending, done) now only count tasks assigned to approved members, keeping the headline numbers consistent with the per-member table.
- **Onboarding form** no longer offers the Chair role for self-registration; "Chairs" team is also blocked server-side for head/member accounts.

### Fixed
- **Race condition in task submission**: a double-submit no longer silently creates two state transitions — the second request is rejected at both application and database level.
- **Race condition in approve/reject**: concurrent approve + reject no longer causes a silent no-op; the losing action now surfaces a clear error to the user.
- **Head permission bypass**: heads could previously approve or reject tasks assigned to `group='all'` or `members_all` (cross-team groups). These now correctly require chair approval.
- **Auth hardening in rejectTask**: heads are now properly blocked from rejecting tasks outside their team, head-group tasks, and tasks with no assignee.
- **approveTask race guard**: the final update now includes a `status = pending_review` check, matching the pattern already used in rejectTask and submitTask.
- **Review queue refresh**: approving a new user now revalidates `/review` so newly-approved heads' tasks appear immediately.
- **Rejection reason bounds**: input is capped at 500 characters on both the UI and server.
- **Modal backdrop**: the reject modal backdrop is disabled while the rejection is in flight, preventing accidental dismissal mid-submit.
