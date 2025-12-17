# Design Guidelines: 99 Group Property Industry Quiz Generator

## Design Approach

**Selected Approach:** Design System - Enterprise Productivity Application

**Reference Inspiration:** Linear + Notion + Carbon Design System

**Rationale:** This is a utility-focused corporate learning tool requiring clarity, efficiency, and professional presentation. Design should prioritize readability, form usability, and content hierarchy over visual flair.

---

## Typography System

**Primary Font:** Inter (Google Fonts)
**Secondary Font:** JetBrains Mono (for question numbers, code-like elements)

**Hierarchy:**
- Page Titles: 2.5rem (40px), font-weight 700, tracking-tight
- Section Headings: 1.875rem (30px), font-weight 600
- Question Titles: 1.25rem (20px), font-weight 600
- Body Text: 1rem (16px), font-weight 400, line-height 1.6
- Labels/Meta: 0.875rem (14px), font-weight 500, uppercase tracking-wide
- Explanations: 0.9375rem (15px), font-weight 400, line-height 1.7

---

## Layout & Spacing System

**Spacing Units:** Tailwind units of 3, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Page margins: py-12 or py-16
- Card spacing: space-y-6

**Container Strategy:**
- Max-width: max-w-4xl (quiz content optimized for readability)
- Form inputs: max-w-2xl
- Centered layouts with mx-auto

**Grid System:**
- Single column for quiz questions (optimal readability)
- Two-column for configuration form (topic + settings side-by-side on desktop)
- Answer key: Single column with clear visual separation

---

## Core Components

### 1. Header/Navigation
- Clean top bar with 99 Group branding (left)
- "New Quiz" button (right)
- Minimal height, fixed position
- Border-bottom separator

### 2. Configuration Form (Quiz Generator)
**Layout:** Card-based container with clear sections

**Elements:**
- Large text input for topic (full-width, prominent)
- Number stepper for question count (compact, inline)
- Radio group for difficulty mode (horizontal layout on desktop, vertical on mobile)
- Validation messages appear inline below topic field
- "Generate Quiz" primary button (large, prominent)
- Secondary "Clear" button

**Visual Treatment:**
- Rounded corners (rounded-lg)
- Subtle border treatment
- Clear field labels above inputs
- Help text below inputs (muted)

### 3. Quiz Display Interface
**Structure:**
- Question counter badge at top (e.g., "Question 3 of 10")
- Question text in card with generous padding
- Option buttons as large, full-width clickable cards
- Clear visual hierarchy between selected/unselected states
- "Case Study" label badge for scenario-based questions

**Question Cards:**
- White/neutral background
- Border treatment
- Shadow on hover for options
- Clear numbering (e.g., "A.", "B.", "C.", "D.")
- Adequate spacing between options (gap-4)

### 4. Answer Key Section
**Layout:**
- Accordion-style or expandable cards per question
- Correct answer highlighted prominently
- Explanation text with clear typography
- "Learning Note" section with distinct visual treatment
- Reference links as subtle, underlined text links

**Visual Hierarchy:**
- Question number + correct answer indicator (checkmark icon)
- Explanation paragraph
- Boxed "Why This Matters" section
- External link indicators for references

### 5. Export Functionality
- Download button (outlined style)
- Format indicator ("Plain Text")
- Icon from Heroicons (document-arrow-down)

---

## Icon System

**Library:** Heroicons (via CDN)

**Usage:**
- Question type indicators (chat-bubble-left-right for multiple choice, document-text for case study)
- Validation states (check-circle, x-circle)
- Actions (arrow-down-tray for export, plus for new quiz)
- Navigation (chevron-right, chevron-down for accordions)

---

## Component States

**Interactive Elements:**
- Default: Neutral with border
- Hover: Subtle shadow lift, border emphasis
- Active/Selected: Border highlight, background shift
- Disabled: Reduced opacity (opacity-50)
- Error: Border treatment for validation

**Form Inputs:**
- Focus: Ring treatment (ring-2)
- Error: Border change with inline message
- Success: Checkmark icon

---

## Accessibility Standards

- All interactive elements minimum 44px touch target
- Form labels properly associated
- ARIA labels for icon-only buttons
- Keyboard navigation support (tab order)
- Error messages linked to form fields
- Semantic HTML throughout (article for questions, section for quiz parts)

---

## Images

**No hero image required** - This is a productivity application, not a marketing page.

**Optional Imagery:**
- 99 Group logo in header (SVG, small size ~32px height)
- Empty state illustration when no quiz generated (subtle, centered)
- Success state icon when quiz generated

**Illustration Style:** Minimal, line-art or simple geometric shapes if needed for empty states

---

## Page Layout Structure

### Quiz Generator Page (Landing)
1. Header with branding
2. Main form container (centered, max-w-2xl)
3. Configuration inputs in logical flow
4. Generate button (prominent)

### Quiz Display Page
1. Header with "Back" navigation
2. Quiz metadata (topic, question count, difficulty)
3. Questions container (stacked vertically, space-y-8)
4. Each question as separate card
5. Answer key section (collapsible or separate scroll area)

### Results/Export View
1. Summary statistics card
2. Export options
3. "Generate Another Quiz" CTA

---

## Animation Guidelines

**Minimal motion:**
- Smooth transitions for card states (150ms ease)
- Accordion expand/collapse (200ms ease-out)
- Button hover effects (100ms ease)
- NO scroll-triggered animations
- NO complex page transitions

---

## Responsive Behavior

**Desktop (lg:):**
- Two-column form layout for configuration
- Wider containers (max-w-4xl for quiz)

**Tablet (md:):**
- Single column configuration
- Maintained spacing

**Mobile (base):**
- Stack all elements vertically
- Full-width buttons
- Reduced padding (p-4 instead of p-8)
- Collapsible sections for answer key