## ADDED Requirements

### Requirement: Desktop rows open into a two-column ledger

On desktop viewports each FAQ entry SHALL lay out as two columns: the numbered question in the left column and, when the entry is expanded, its answer in the right column beside the question — not underneath it. The expand/collapse toggle SHALL sit at the row's right edge. The question's display size SHALL reach 2.25rem at the desktop end of its fluid scale, with the small-viewport floor unchanged. The answer SHALL keep its existing text size and reading measure; the row's width is filled by the answer's position, not by enlarged body type.

Small viewports SHALL keep the stacked presentation — question above, answer below — exactly as before this change. The presentation SHALL be achieved without changing the disclosure semantics: answers remain served in the initial HTML, entries remain independently expandable, and the expansion animation and its fallbacks remain as specified elsewhere in this capability.

#### Scenario: Open desktop row is two columns

- **WHEN** an entry is expanded on a desktop viewport
- **THEN** its answer renders beside the question in a second column, the toggle sits at the row's right edge, and no open row shows a majority-empty right half

#### Scenario: Question size at desktop

- **WHEN** the section renders at desktop widths
- **THEN** the question's computed size reaches 2.25rem at the scale's cap, and questions wrap within their column rather than running the row's full width

#### Scenario: Mobile keeps the stacked rows

- **WHEN** the section renders at a mobile viewport
- **THEN** questions and answers stack vertically exactly as before this change, at their previous sizes

#### Scenario: Disclosure guarantees survive the restructure

- **WHEN** the two-column presentation is active and entries are expanded, collapsed, and re-expanded — including with reduced motion and with JavaScript disabled
- **THEN** every behavior specified by the other requirements of this capability (served-in-HTML answers, independent entries, animation fallback, no clipping after the settled reveal, visible focus indicator) still holds

#### Scenario: English questions fit the column

- **WHEN** the English homepage renders the section at desktop widths
- **THEN** every English question renders within the question column without truncation or overflow

#### Scenario: No mid-word break in compound terms

- **WHEN** the question containing "in-house" wraps within its column
- **THEN** "in-house" stays on one line rather than breaking after its hyphen
