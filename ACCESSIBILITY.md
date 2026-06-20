# Accessibility Statement

## ♿ WCAG 2.1 Level AA Compliance

COGNO FocusFlow is committed to ensuring digital accessibility for people with disabilities. We continuously improve the user experience for everyone and apply relevant accessibility standards.

---

## Conformance Status

**Target Level:** WCAG 2.1 AA  
**Current Conformance:** Partially Conformant (ongoing improvements)

---

## Accessibility Features

### 1. Perceivable

#### Text Alternatives (1.1.1)
- **Alt Text**: All images have descriptive alt attributes
- **Icon Labels**: Icon-only buttons include `aria-label`
- **Chart Descriptions**: Data visualizations have text summaries

```tsx
// Example: Accessible icon button
<button aria-label="Close crisis overlay">
  <XIcon className="w-6 h-6" aria-hidden="true" />
</button>
```

#### Color Contrast (1.4.3, 1.4.6)
- **AAA Compliance**: 7:1 contrast ratio for body text
- **AA Compliance**: 4.5:1 for large text
- **High Contrast Mode**: Dark theme with enhanced contrast
- **Color Independence**: No information conveyed by color alone

#### Resize Text (1.4.4)
- **Rem-Based Typography**: Scales with browser settings (up to 200%)
- **No Fixed Widths**: Layouts adapt to text size changes
- **Zoom Support**: Responsive design tested up to 400% zoom

#### Non-Text Contrast (1.4.11)
- **UI Components**: 3:1 contrast for buttons, inputs, focus indicators
- **Interactive Elements**: Clear visual distinction from background

---

### 2. Operable

#### Keyboard Accessible (2.1.1, 2.1.2)
- **Full Keyboard Navigation**: All features usable with keyboard only
- **Tab Order**: Logical focus flow through pages
- **No Keyboard Trap**: Users can exit all interactive elements
- **Shortcuts**:
  - `Ctrl/Cmd + K`: Open command palette
  - `Esc`: Close modals/dialogs
  - `Arrow Keys`: Navigate menus
  - `Space/Enter`: Activate buttons

```tsx
// Example: Keyboard event handling
<Dialog onKeyDown={(e) => {
  if (e.key === 'Escape') handleClose();
}}>
```

#### Focus Visible (2.4.7)
- **High-Contrast Outlines**: 3px solid outline on focused elements
- **Focus Indicators**: Never removed with CSS
- **Skip Links**: "Skip to main content" for screen reader users

#### Focus Order (2.4.3)
- **Logical Sequence**: Tab order follows visual layout
- **Modal Focus Trap**: Focus confined to modal when open
- **Auto-Focus**: First input in forms receives focus

#### Page Titled (2.4.2)
- **Unique Titles**: Each page has descriptive `<title>`
- **Document Structure**: Proper `<h1>` - `<h6>` hierarchy

---

### 3. Understandable

#### Language (3.1.1)
- **Lang Attribute**: `<html lang="en">` declared
- **Consistent Navigation**: Same navigation across all pages

#### On Input (3.2.2)
- **No Unexpected Changes**: Forms don't auto-submit
- **Clear Labels**: All inputs have associated `<label>` elements

```tsx
// Example: Accessible form input
<div>
  <label htmlFor="journal-content">Journal Entry</label>
  <textarea 
    id="journal-content"
    name="content"
    aria-describedby="content-hint"
    required
  />
  <p id="content-hint">Describe your thoughts and feelings</p>
</div>
```

#### Error Identification (3.3.1)
- **Clear Error Messages**: Specific, actionable feedback
- **Error Summaries**: Listed at top of form with links to fields
- **Inline Validation**: Real-time feedback as user types

#### Error Suggestion (3.3.3)
```tsx
// Example: Accessible error handling
{errors.email && (
  <p role="alert" className="text-red-600">
    Please enter a valid email address (e.g., user@example.com)
  </p>
)}
```

---

### 4. Robust

#### Parsing (4.1.1)
- **Valid HTML5**: No duplicate IDs, proper nesting
- **Semantic Markup**: `<nav>`, `<main>`, `<aside>`, `<article>`

#### Name, Role, Value (4.1.2)
- **ARIA Roles**: Applied to custom components
- **ARIA States**: `aria-expanded`, `aria-pressed`, `aria-selected`
- **Live Regions**: `aria-live="polite"` for dynamic content

```tsx
// Example: Accessible custom component
<div
  role="tab"
  aria-selected={isActive}
  aria-controls="panel-1"
  tabIndex={isActive ? 0 : -1}
>
  Dashboard
</div>
```

#### Status Messages (4.1.3)
- **Toast Notifications**: `role="status"` or `role="alert"`
- **Screen Reader Announcements**: Important updates announced

---

## Assistive Technology Support

### Tested With:
- **Screen Readers**:
  - JAWS (Windows)
  - NVDA (Windows)
  - VoiceOver (macOS/iOS)
  - TalkBack (Android)
- **Browser Zoom**: Up to 400% tested
- **Voice Control**: Dragon NaturallySpeaking
- **Switch Control**: iOS Switch Control

---

## Motion & Animation

### Reduced Motion (prefers-reduced-motion)
```css
/* Respects user preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Known Issues & Roadmap

### Current Limitations:
1. **AI Chat Streaming**: Screen reader support for SSE streaming (in progress)
2. **Chart Accessibility**: Recharts SVG elements need enhanced ARIA labels
3. **Mobile Gestures**: Alternative keyboard controls for swipe actions

### Planned Improvements (Q3 2026):
- [ ] Add headings to Recharts visualizations
- [ ] Implement `aria-live` for AI streaming responses
- [ ] Add focus management for dynamic content insertion
- [ ] Conduct third-party WCAG audit
- [ ] User testing with disability advocacy groups

---

## Feedback

We welcome feedback on accessibility issues:

**Contact:** nagabhushanarajus.ds@mitmysore.in  
**Subject:** Accessibility Feedback - COGNO FocusFlow

Please include:
- Page/component name
- Assistive technology used
- Browser and version
- Description of the issue

**Response Time:** 48 hours

---

**Last Updated:** June 20, 2026  
**Accessibility Coordinator:** Nagabhushana
