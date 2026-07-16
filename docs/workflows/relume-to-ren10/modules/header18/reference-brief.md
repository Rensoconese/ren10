# Reference Brief — Header18

## Retrieval metadata

- Family: headers
- Module ID: header18
- Retrieved through: authenticated Relume MCP `get_component`
- Retrieved at: 2026-07-15
- Source variants returned: one complete section
- Supporting files named by the source: button, input, dialog, utils

## Retrieved facts

- One content-height section uses a constrained container and generous responsive block padding.
- The upper copy area is one column on mobile and two top-aligned columns from medium width.
- The h1 is the sole left-column child.
- The right column contains one description followed by exactly one email form and one legal/terms line.
- The form contains exactly one email input and one submit button. It stacks on mobile and becomes input plus max-content submit in one row from small width.
- One full-width landscape media region follows the copy area.
- The media region contains exactly one button trigger with one image, one dark scrim, and one centered play-circle affordance.
- Exactly one modal contains one loading indicator and exactly one aspect-video iframe. The iframe remains hidden until load and uses progressive medium/large width caps.
- The iframe allows autoplay, encrypted media, picture-in-picture, and fullscreen.
- There is no extra CTA, navigation, logo, background video, second form, second trigger, second dialog, or second iframe.

## Responsive states

- Mobile: copy columns stack h1 then support; form stacks input then submit; landscape trigger remains full width.
- Small: form becomes a two-column `1fr/max-content` row.
- Medium: copy becomes two columns with aligned starts; modal video gains the medium width cap.
- Large: copy gap and section spacing increase; modal video gains the larger cap.

## Interaction states

- Closed: h1, description, email form, legal line, terms destination, and landscape trigger are visible.
- Open/loading: modal opens, loading status is visible, iframe is hidden.
- Open/loaded: loading status hides and one playable video surface becomes visible.
- Dismissed: explicit close, Escape, or backdrop dismissal closes and restores focus to the trigger.
- Form: source only prevents submission and logs the input; Ren10 must provide native validation, corrective error, polite success, and native fallback navigation.
- JavaScript disabled: the reference has no explicit fallback; Ren10 must preserve image/copy/form/terms and add one real video-alternative destination.

## Visual relationships

- The copy block precedes the landscape media with a large vertical separation.
- Heading and support columns are top aligned at medium and wider widths.
- The form is constrained relative to the support column.
- The landscape trigger is one uninterrupted full-width surface with centered play affordance above a uniform scrim.
- Exact resolved colors, dimensions, and pixels were not returned and are intentionally supplied by Ren10.

## Unavailable evidence

- The MCP returned source but no rendered preview.
- Exact computed token values, owned production assets, focus styling, loading failure state, and no-JavaScript rendering were not supplied.

## Public-output exclusions

- Do not copy Relume prose, utility classes, placeholder URLs, YouTube URL, React state code, Radix/shadcn dependencies, Tailwind, relume-icons, or injected HTML.
- Do not use fragment-only terms links, console-only form submission, placeholder alt text, or framework runtime code.
