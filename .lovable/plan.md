
The user wants context for the Autonomous Workforce Score number (e.g. "64%") so readers know if it's good/bad. Need to add a scale/key to both the live report and the dummy executive audit preview.

Let me check the current gauge component and where the score appears.

The `WorkflowScoreGauge` already shows "Autonomous" vs "Assisted" based on a 60 threshold, but there's no benchmark scale. I need to find the executive audit dummy + live report to know where to add the key.
