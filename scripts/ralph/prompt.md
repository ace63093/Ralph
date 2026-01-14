# Ralph Single-Iteration Loop

1) Read prd.md + prd.json + progress.txt + agents.md (+ any folder agents.md).
2) Pick ONE highest priority incomplete story.
3) Implement only that story.
4) Run the story's testCommand (and any necessary general tests).
5) If tests pass: set passes=true and status=complete; otherwise leave unchanged.
6) Append outcome to progress.txt.
7) Commit with message "story(<id>): <title>".
8) If all stories pass, output:
   <promise>NCENTRAL_DASHBOARD_COMPLETE</promise>
