 New Features Design Prompt

Same design system applies: Inter + JetBrains Mono, #C0152A primary, 12-col grid, 12px card radius. Build these as new pages in the same Figma file.


Page 5 — Donor Profile Page
Layout: Full-width hero header + 2-col content below
Hero Section (full-width card, crimson gradient bg):
┌────────────────────────────────────────────────────────────┐
│  [Avatar 72px — initials]   Rahul Kumar                    │
│                             O+  •  Chennai  •  Age 25      │
│                             Member since Jan 2026           │
│                             ● Available to Donate           │
│                             [ Edit Profile ]  [ Share ]     │
└────────────────────────────────────────────────────────────┘

Background: crimson-to-dark-red linear gradient, white text
Avatar: white circle, crimson initials, 72px
Blood group badge: white bg, crimson text (inverted from normal)
Availability: green pulsing dot if available

Left Column (7 cols) — Donation History Timeline:

Section header: Donation History (3 donations)
Timeline component: vertical line, dot per entry

  ● Jan 15, 2026 — City Blood Bank, Chennai — 1 unit
  ● Oct 3, 2025  — LifeCare Blood Center   — 1 unit
  ● Jun 20, 2025 — RedCross Blood Bank     — 1 unit

Each entry: card with bank name, location chip, units donated, date
Hover: highlight card with rose tint

Next Eligibility Countdown (top of left col):
┌─────────────────────────────────────────┐
│  🕐 Next Eligible to Donate             │
│  April 15, 2026                          │
│  [ ████████░░░░░ ]  62 days remaining   │
└─────────────────────────────────────────┘

Progress bar: crimson fill, shows % of 90-day cooldown elapsed
If eligible now: green banner ✅ You're eligible to donate today!

Right Column (5 cols):
Stats Card:
  3      Total Donations
  3 units   Blood Donated
  2      Lives Impacted (est.)

Each stat: large number, muted label below, separated by dividers

Badge System:
  🏅 First Drop     — First donation
  🔥 3x Donor       — 3 donations
  ⭐ Life Saver      — Emergency fulfillment
  🔒 Iron Donor     — Locked (5+ donations)

Earned badges: full color with glow
Locked: grayscale with lock icon + "X more donations"
Tooltip on hover shows unlock condition

Emergency Contact Card:

Toggle to show/hide contact number (privacy)
WhatsApp quick-contact button (green)


Page 6 — Blood Camp / Event Management
Layout: Split — list view left, detail/create panel right
Page Header:
Blood Donation Camps
Organize and manage donation drives in your area
[ + Create New Camp ]
Left — Camp List (scrollable):
Each camp card:
┌────────────────────────────────────────┐
│  📍 SRM Institute Camp                 │
│  March 22, 2026 • 9:00 AM – 5:00 PM   │
│  Kattankulathur, Chennai               │
│  ████████░░░░  47/100 registered       │
│  [ Active ]  [ View Details ]          │
└────────────────────────────────────────┘

Status badge: Upcoming (amber) / Active (green pulsing) / Completed (gray)
Registration bar: crimson progress fill with count label
Filter tabs above list: All | Upcoming | Active | Completed

Right — Create / Edit Camp Form:
Camp Name          [ _________________ ]
Organizer          [ _________________ ]
Date               [ 📅 Date Picker    ]
Time               [ Start ] → [ End  ]
Venue / Address    [ _________________ ]
                   [ _________________ ]
Max Capacity       [ ─ 100 + ]
Target Blood Groups [✓A+][✓B+][○AB-]...
Description        [ Textarea         ]

[ Publish Camp ]

Blood group selector: pill checkboxes, all 8 types
Capacity stepper: min 10, max 1000

Camp Detail Modal (on "View Details"):

Full-screen overlay, 800px wide
Tabs: Overview | Registered Donors | Results
Overview: map embed placeholder + all camp info
Registered Donors: table with name, blood group, check-in status
Results: units collected per blood group (bar chart)

QR Code Component:

Each camp generates a QR code for on-site donor registration
Bottom of detail view: [ Download QR ] [ Print ]


Page 7 — Notifications & Alerts
Layout: Full-page notification center + floating alert bell in navbar
Navbar Bell (global component update):
🔔  [3]   ← red badge count

Click opens a dropdown panel (360px wide, max 5 items preview + "See all")
Unread items: rose left border + bold text
Urgent items: amber background row

Notification Center Page:
Left (3 cols) — Filter Sidebar:
  All Notifications     (24)
  ─────────────────
  🚨 Urgent Requests   (3)
  🩸 Donor Alerts      (8)
  📅 Camp Reminders    (5)
  ✅ Fulfillments       (6)
  ℹ️  System             (2)

Active filter: crimson left border
Count badges: pill chips

Right (9 cols) — Notification Feed:
Notification card types:
Urgent Request:
┌─────────────────────────────────────────────────────┐
│  🚨 URGENT   2 mins ago                             │
│  O- blood needed at Apollo Hospital, Chennai        │
│  Patient: Emergency Surgery • 2 units required      │
│  [ View Matching Donors ]  [ Dismiss ]              │
└─────────────────────────────────────────────────────┘

Amber left border, amber background tint
Pulsing red dot on "URGENT" label

Eligibility Reminder:
┌─────────────────────────────────────────────────────┐
│  🩸 You're eligible to donate again!    1 hour ago  │
│  It's been 90 days since your last donation.        │
│  [ Find a Camp Near Me ]                            │
└─────────────────────────────────────────────────────┘
Camp Reminder:
┌─────────────────────────────────────────────────────┐
│  📅 Camp Tomorrow: SRM Blood Drive    6 hours ago   │
│  March 22 • 9:00 AM • Kattankulathur                │
│  [ View Details ]  [ Add to Calendar ]              │
└─────────────────────────────────────────────────────┘
Notification Settings (gear icon top-right):

Toggle list: each notification type with on/off switch
Delivery preference: In-App / Email / SMS (multi-select pills)

Empty State:
  🔔
  You're all caught up!
  No new notifications right now.

Page 8 — Analytics & Reports
Layout: Full dashboard page with chart-heavy grid
Page Header:
Analytics & Reports
[ This Month ▾ ]  [ Export PDF ]  [ Export CSV ]

Date range picker: presets (This Week / This Month / Last 3 Months / Custom)

Row 1 — KPI Trend Cards (4 cols, same style as dashboard but with sparklines):
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Donations       │  │  Requests Raised │  │  Fulfilment Rate │  │  New Donors      │
│  94  ↑12%        │  │  47  ↑8%         │  │  87%  ↑3%        │  │  23  ↓5%         │
│  [sparkline]     │  │  [sparkline]     │  │  [sparkline]     │  │  [sparkline]     │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘

Sparkline: 7-day mini line chart, crimson stroke, no axes

Row 2 — Main Charts (split 7/5):
Left — Donation Trends (Area Chart, 7 cols):

X-axis: dates, Y-axis: units donated
Area fill: crimson gradient (top opacity 30% → 0%)
Hover tooltip: date + count + blood group breakdown
Toggle lines: All | O+ | A+ | B+ | AB+

Right — Blood Group Demand (Donut Chart, 5 cols):

Each blood group = a segment, crimson family palette
Center label: Total Requests: 47
Legend: blood group + count + % below chart
Hover: segment expands slightly

Row 3 — Tables (split 6/6):
Left — Hospital-wise Request Table:
HospitalRequestsFulfilledPendingRateApollo Hospital1816289%

Color-coded rate: green >80%, amber 60-80%, red <60%
Sortable columns (click header = sort arrow)

Right — Top Donors Leaderboard:
  🥇  Rahul Kumar    O+   3 donations
  🥈  Meena Devi     AB+  2 donations
  🥉  Priya Sharma   A+   2 donations
       ...

Rank medal icons for top 3
Clicking a row opens Donor Profile page

Row 4 — Monthly Report Summary (full width card):
  March 2026 Summary
  ─────────────────────────────────────────────────────
  Most requested: O+  (18 requests)     Busiest hospital: Apollo Chennai
  Lowest supply:  AB- (2 units left)    Peak day: March 8 (12 donations)
  ─────────────────────────────────────────────────────
  [ Download Full Report PDF ]

Horizontal layout, 4 highlight stats with icons
Subtle amber warning for "Lowest supply" item


Updated Sidebar Navigation
Add the new items to the sidebar:
  🩸  BloodLink
  ──────────────────
  📊  Dashboard
  👤  Donor Registration
  🔍  Search Donors
  🚨  Patient Request
  ──────────────────
  🏅  Donor Profiles       ← NEW
  📅  Blood Camps          ← NEW
  🔔  Notifications   [3]  ← NEW (with badge)
  📈  Analytics            ← NEW
  ──────────────────
  ⚙️   Settings
  [Avatar]  Dinesh  →  Logout

New Component Library Additions
ComponentVariantsTimeline Entrydefault / highlighted / latestAchievement Badgeearned / locked / new (animated shimmer)Progress Bardefault / countdown / capacitySparkline Chartup-trend / down-trend / flatCamp Cardupcoming / active / completedNotification Rowurgent / info / reminder / success / unreadDonut Chart4-segment / 8-segmentLeaderboard Rowrank 1 / rank 2 / rank 3 / default

Figma Prototype Flows to Add
FlowTriggerDestinationDonor card → ProfileClick donor cardDonor Profile pageBell icon → NotificationClick navbar bellNotification dropdownUrgent alert CTAClick "View Matching Donors"Search Donors (pre-filtered)Camp card → DetailClick "View Details"Camp detail modalAnalytics row clickClick hospital rowFiltered request view