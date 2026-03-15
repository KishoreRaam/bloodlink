Emergency Blood Availability & Donor Matching System

Brand Identity
Product Name: BloodLink
Tagline: Every second counts. Every donor matters.
Tone: Urgent but reassuring. Clinical precision meets human warmth.
Color Palette:
RoleColorHexPrimaryDeep Crimson#C0152APrimary LightSoft Rose#FDECEAAccentWarm Amber#F59E0B (for urgency badges)SuccessMuted Green#16A34ASurfaceOff-White#FAFAFABackgroundLight Gray#F3F4F6Text PrimaryNear Black#111827Text MutedSlate#6B7280BorderLight#E5E7EB
Typography:

Headings: Inter — Bold/Semibold
Body: Inter — Regular/Medium
Data/Tags: JetBrains Mono — for blood group badges, IDs


Layout System

Grid: 12-column, 24px gutter, 1280px max-width
Sidebar nav: 240px fixed, collapsible on mobile
Card radius: 12px
Button radius: 8px
Input radius: 8px
Elevation: Subtle box-shadow: 0 1px 3px rgba(0,0,0,0.08)


Global Components to Design
1. Sidebar Navigation

Logo top-left: red drop icon + "BloodLink" wordmark
Nav items with icons: Dashboard, Register Donor, Search Donors, Patient Request
Active state: crimson left border + rose background fill
Bottom: user avatar + name + logout

2. Blood Group Badge

Pill shape, monospace font
Color-coded: O+/O- → crimson, A+/A- → blue, B+/B- → purple, AB+/AB- → amber
Size: 28px height, 48px min-width

3. Status Badge

Available → green dot + label
Not Available → gray dot + label
Pending → amber dot
Fulfilled → green check
Urgent → red pulsing dot (animated)

4. Primary Button

Background: #C0152A, white text, hover: #A01020
Icon-left variant for "Register Donor", "Submit Request"
Loading state: spinner inside button

5. Input Fields

Label above, 14px gray
Focus: 2px crimson border ring
Error state: red border + error message below with icon
Dropdown: custom styled, not browser-default


Page 1 — Dashboard (Admin View)
Layout: Sidebar left + main content area
Top Row — 4 Stat Cards (equal width):
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  🩸 Total Donors │  │ ✅ Available Now │  │ ⏳ Pending Reqs  │  │ 💉 Total Donated│
│      247         │  │      183         │  │       12         │  │      94 units   │
│  ↑ 4 this week   │  │  74% of total    │  │  3 urgent        │  │  this month     │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘

Each card: white bg, subtle border, colored icon in top-right corner
Trend indicator: small arrow + delta text in muted color

Middle Row:

Left (7 cols): Recent Patient Requests table

Columns: Patient, Blood Group (badge), Hospital, Date, Status (badge), Action
Row hover: light rose tint
"Fulfil" CTA per row — small crimson button


Right (5 cols): Blood Group Availability bar chart

Horizontal bars, crimson fill, blood group labels on Y-axis
Clean, no gridlines, just value labels at bar end



Bottom Row:

Recent Donor Registrations — card grid (3 cols)

Each card: avatar circle with initials, name, blood group badge, location, availability dot
Hover: slight lift shadow




Page 2 — Donor Registration
Layout: Centered single-column form, max-width 640px
Header:
← Back to Dashboard
Register New Donor
Add a blood donor to the system
Form Sections (with section headers):
Personal Information

Full Name (text input, full width)
Age (number input) + Gender (segmented control: Male / Female / Other) — side by side

Blood & Medical

Blood Group (large visual selector — 8 grid buttons, each showing the group; selected = crimson fill)
Availability Status (toggle switch: Available / Not Available)

Contact Details

Contact Number (tel input with +91 prefix)
Address (textarea, 3 rows)

Bottom:

Register Donor (full-width primary button)
Below: Already registered? Search donors → (ghost link)

Success State:

Full-width green success banner slides in from top:
✅ Donor Rahul Kumar (O+) registered successfully!
Form resets after 2s

Validation States:

Real-time inline errors on blur
Blood group: shows "Required" if submitted without selection


Page 3 — Search Donors
Layout: Filter bar top + results grid below
Filter Bar (horizontal, card-style):
[ Blood Group ▾ ]  [ City / Location ]  [ Availability ▾ ]  [ 🔍 Search ]

Blood group: multi-select dropdown with colored badges
Location: text input with autocomplete suggestions
Availability: toggle — All / Available Only
Search button: crimson, right-aligned

Results Header:
Showing 12 available donors for O+ in Chennai
Donor Cards (3-col grid):
┌──────────────────────────────┐
│  [Avatar initials]  O+ badge │
│  Rahul Kumar                 │
│  📍 Chennai                  │
│  📞 98765•••••  [Reveal]     │
│  ● Available                 │
│                              │
│  [ Contact Donor ]           │
└──────────────────────────────┘

Contact number masked by default, tap to reveal (privacy)
Contact Donor → opens modal with full contact + WhatsApp deeplink button
Unavailable donors: full card at 40% opacity, no CTA

Empty State:
🩸 No available donors found for AB- in Hosur
Try expanding your search area or check back later.
[ Clear Filters ]
Center-aligned, illustrated empty state icon

Page 4 — Patient Request
Layout: Two-column split, 60/40
Left — Request Form:

Page title: 🚨 Emergency Blood Request
Subtitle: Fill this form to find matching donors instantly

Patient Details:

Patient Name
Blood Group (same visual grid selector from Registration)
Units Required (stepper input: − 1 +, min 1 max 10)
Hospital (searchable dropdown, pre-populated from DB)
Request Date (date picker, defaults to today)
Urgency Level (radio: Normal / Urgent — urgent shows amber warning)

Submit Button: Full-width, large, crimson — Find Matching Donors
Right — Live Match Preview (updates on blood group select):
Matching Donors for O+

  Rahul Kumar    O+   Chennai   ● Available
  Meena Devi     O+   Chennai   ● Available
  ─────────────────────────────────────────
  + 3 more available donors

Updates in real-time as user selects blood group
"No matches yet" state if no group selected
After submit: right panel shows final matched list with contact buttons

Post-Submit Modal:
✅ Request Submitted!
Request ID: #REQ-2026-0047
2 donors matched for O+ in Chennai.
We'll notify the hospital within 15 minutes.

[ View All Requests ]  [ New Request ]

Interaction & Animation Specs
ElementInteractionSidebar itemsSlide underline on hover, 150ms easeStat cardsSubtle scale 1.02 on hoverDonor cardsBox-shadow lift on hover, 200msBlood group selectorSpring bounce on selectForm submitButton shows spinner, then success stateSearch resultsSkeleton loaders while fetching (3 card placeholders)Status badgesPulsing dot for "Urgent" requests (CSS keyframe)Page transitionsFade + 8px slide up, 250ms

Mobile Considerations (375px breakpoint)

Sidebar collapses to bottom tab bar (4 icons)
Stat cards stack 2×2
Donor grid becomes single column
Blood group selector wraps to 4×2 grid
Forms go full-width single column


Figma Setup Instructions

Set up Local Variables: define all colors as tokens (color/primary, color/surface, etc.)
Build Auto Layout on all cards and form rows
Use Component variants for: Badge (status × 5), Button (primary/ghost/danger × loading), Input (default/focus/error)
Create Interactive Components for: blood group selector, availability toggle, stepper
Use Figma Prototype flows: Registration → Success, Search → Contact Modal, Request → Match Results