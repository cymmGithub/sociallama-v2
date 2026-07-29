## ADDED Requirements

### Requirement: Every image on an English blog surface carries a recorded verdict

Every media row reachable from a published English post — its cover, its in-body images and its OG image — SHALL have a recorded verdict stating whether the image is fit to show an English reader. The verdict SHALL be one of `accept`, `crop`, `replace` or `recreate`, and SHALL be stored in a committed artifact keyed by media id, so it survives the change and does not have to be re-derived.

A verdict SHALL be reached by looking at the image. It SHALL NOT be inferred from alt text, filename or any other metadata, because none of those record whether words appear inside the picture.

#### Scenario: Every reachable image is accounted for
- **WHEN** the audit is complete
- **THEN** every media id reachable from a published English post has exactly one verdict
- **AND** no id carries a verdict of "unknown" or an empty value

#### Scenario: An image judged fine is recorded, not skipped
- **WHEN** a reviewer examines an image and finds nothing that would mislead an English reader
- **THEN** the image is recorded with the verdict `accept`
- **AND** it is not omitted from the artifact

#### Scenario: A newly added image does not invalidate the audit
- **WHEN** a post is translated after the audit and introduces media ids not previously seen
- **THEN** only the unseen ids require inspection
- **AND** existing verdicts remain valid

### Requirement: The test is comprehension, not the presence of Polish

An image SHALL be judged by whether a reader who speaks no Polish would misunderstand the point the image illustrates. The mere presence of Polish characters in an image SHALL NOT be sufficient grounds for replacement.

An image whose Polish text is the subject under discussion — a post explaining a Polish interface, a screenshot of the very notice the paragraph describes — SHALL be eligible for `accept`.

#### Scenario: Polish text that is the subject is accepted
- **WHEN** a post discusses a Polish-language interface and the image shows that interface
- **THEN** the image may be accepted as-is
- **AND** the reason is recorded with the verdict

#### Scenario: Polish text that obscures the point is not accepted
- **WHEN** an image is the sole illustration of a general point and its meaning is carried entirely by Polish words
- **THEN** the image is marked `crop`, `replace` or `recreate`

#### Scenario: Incidental Polish does not trigger a replacement
- **WHEN** Polish appears only in background chrome, a street sign, or an unrelated fragment of interface
- **THEN** the image is accepted

### Requirement: An accepted image still tells an English reader what it says

Where an image is accepted with legible Polish text that carries meaning, its English `alt` SHALL quote that text and follow it with a parenthetical English gloss, per the convention established by `add-english-blog`. Accepting an image SHALL NOT leave an English reader with no route to its meaning.

#### Scenario: Accepted image with meaningful Polish text
- **WHEN** an image is accepted and displays a Polish slogan, headline or dialog
- **THEN** its English alt quotes the Polish and gives an English gloss in parentheses

#### Scenario: Accepted image with no meaningful text
- **WHEN** an image is accepted because its Polish is incidental
- **THEN** no gloss is required

### Requirement: A replaced image is genuine, not retouched

Where an image is replaced, the replacement SHALL be a genuine capture or an authored asset. A screenshot SHALL NOT be produced by editing Polish text out of an existing screenshot, because the result asserts an interface state that may never have existed.

Where a genuine English-language capture cannot be obtained, the image SHALL be cropped or accepted with a gloss rather than doctored.

#### Scenario: An English capture is available
- **WHEN** the same screen can be captured from an English-locale account
- **THEN** that capture replaces the Polish one

#### Scenario: No English capture is available
- **WHEN** the screen cannot be genuinely captured in English
- **THEN** the image is cropped or accepted with a gloss
- **AND** it is not retouched to remove the Polish text

### Requirement: Replacing a shared image is a decision for both locales

Media rows are shared across locales; only `alt` is localized. Replacing an image file therefore changes what Polish readers see as well. Any `replace` or `recreate` SHALL be recorded as affecting both locales, and SHALL be followed by a review of the `alt` text in **both** Polish and English, since the existing alt describes the file that was swapped out.

#### Scenario: A cover is replaced
- **WHEN** a post cover is replaced
- **THEN** the Polish and English alt for that media row are both re-checked against the new image
- **AND** the change is recorded as affecting the Polish post as well

#### Scenario: An image is accepted or cropped
- **WHEN** the verdict is `accept`
- **THEN** no alt review is required beyond the gloss rule above

### Requirement: Covers are resolved before in-body images

Post covers SHALL be audited and resolved before in-body images. A cover is reused by the blog hub, the post cards, the related-posts rail and the social preview image, so it reaches readers in more places than the post that owns it.

#### Scenario: Ordering
- **WHEN** the work is scheduled
- **THEN** every cover has a verdict before in-body images are inspected

### Requirement: Case-study and services images are out of scope

Images belonging to case studies and services pages SHALL NOT be altered by this change, even where they carry Polish text. On those surfaces the Polish text is the client work being presented, and replacing it would misrepresent the artefact.

#### Scenario: A case-study creative carries Polish text
- **WHEN** a case-study image displays a Polish campaign slogan
- **THEN** it is left unchanged and is not recorded in this audit
