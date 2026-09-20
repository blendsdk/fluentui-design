# Evaluation Rubric

> **Document**: rubric.md
> **Parent**: [README](README.md)
> **Implements**: RD-09

Seven dimensions score an answer from 0 to 4. Each dimension stands alone: the report shows the
per-dimension scores and an unweighted total, so one zero stays visible instead of being averaged
away. A score is only recorded from a real run; the deterministic evidence in
[results.md](results.md) does not by itself award dimension scores.

## Dimensions and anchors

| Dimension | 0 | 2 | 4 |
| --- | --- | --- | --- |
| API/version correctness | Uses at least one export or prop that the pinned v9 package does not provide, or mixes component systems. | Uses verified v9 exports, but includes one unnecessary or unclear mapping. | Uses only verified v9 exports, each chosen for the stated intent, with no version mixing. |
| Task and layout coherence | Regions and surfaces do not match the task, or a command sits where its scope is unclear. | The main regions are right, but one surface or command is misplaced or overweighted. | Every region, surface, and command placement follows the task's scope and hierarchy. |
| Consistency and responsive behavior | Repeated patterns disagree, or the layout breaks at a documented narrow width. | Patterns agree and the layout holds, but one narrow-width case loses content or meaning. | Patterns agree across screens and the primary task holds at every documented width. |
| Keyboard/accessibility behavior | Focus is trapped, lost, or returned to the wrong place, or a control has no accessible name. | The main keyboard path works, but one announcement, name, or focus return is missing. | Open, close, focus order, focus return, names, and announcements all behave correctly. |
| States, data integrity, and error recovery | A missing or failed load shows nothing, or a failed save loses the user's work. | Loading, empty, no-results, and error states exist, but one recovery path is weak. | Every state is reachable and every failure keeps the draft and offers a clear recovery. |
| Evidence accuracy and uncertainty | States a claim that cannot be traced to a source, or presents a guess as an official rule. | Most claims trace to sources, but one uncertainty is unstated. | Every claim traces to a source or is labeled as a convention or an open question. |
| Maintainability and context cost | Duplicates guidance, hides one rule behind several pages, or adds machinery the task does not need. | Guidance is usable but slightly repetitive or longer than needed. | Guidance is bounded, non-duplicated, and proportionate to the task. |

## Scoring

| Item | Rule |
| --- | --- |
| Per-dimension score | An integer from 0 to 4 chosen from the nearest anchor. |
| Total | The unweighted sum of the seven scores, from 0 to 28. |
| Reporting | Every dimension is reported, including a score of 0. |
| Comparison | A baseline or model comparison is reported only when run under identical conditions; otherwise it is marked `untested`. |
