/*
PROMPT FOR GITHUB COPILOT:

This is a request to generate a complete, beautiful, and scalable Student Dashboard for our AI proctoring system "PROCTO".

TECHNOLOGY:

Use React (functional component) with Hooks.

Use Tailwind CSS for all styling.

Use heroicons for all icons.

Use recharts for any charts.

AESTHETIC:

IMPORTANT: Adhere to a light theme with clean, modern aesthetics similar to industrial-grade SaaS dashboards.

Background: White or very light gray (e.g., bg-white or bg-gray-50).

Cards/Widgets: White with a subtle border (border-gray-200) and shadow (shadow-sm).

Text: Dark grays and blacks (e.g., text-gray-900 for titles, text-gray-600 for descriptions).

Sidebar: Dark (e.g., bg-gray-900) or White, but must be distinct. Let's use a dark sidebar (bg-gray-900 with white/light gray text) for contrast.

OVERALL STRUCTURE (Dashboard Layout):
The main component should render a 2-column layout:

Sidebar (Left Column, fixed):

Contains the "PROCTO" logo at the top.

A list of navigation links, each with an icon and text:

"Dashboard" (icon: home) - Active state

"My Exams" (icon: academic-cap)

"Results" (icon: chart-bar)

"Profile" (icon: user)

"Settings" (icon: cog)

At the bottom, a "Sign Out" link (icon: arrow-left-on-rectangle).

Main Content Area (Right Column, scrollable):

Should have a bg-gray-50 background.

Header: A simple header bar with a "Welcome, Aayush!" message and a User Profile Avatar/Icon on the right.

Dashboard Content: A flexible grid system (grid grid-cols-1 lg:grid-cols-3 gap-6) to hold the widgets.

DASHBOARD CONTENT (Widgets):
Please create the following widgets inside the main content grid:

"Upcoming Exam" Widget (Large, spans 2 columns):

Title: "Upcoming Exam"

Should show details for the next exam:

Exam Title: "Computer Networks Final"

Course: "CS-401"

Date & Time: "October 26, 2025 - 10:00 AM"

Duration: "90 minutes"

A prominent "Join Exam" button (primary color, e.g., blue or purple). This button should be disabled until the exam time.

A "System Check" link/button (secondary) to let the student test their webcam/mic.

"Quick Stats" Widgets (Small, 3 in a row):

Create 3 small stat cards that will fill the 3rd column (or stack on mobile).

Stat Card 1: "Exams Taken"

Icon (e.g., check-circle)

Value: "8"

Label: "Exams Taken"

Stat Card 2: "Average Score"

Icon (e.g., chart-pie)

Value: "85%"

Label: "Average Score"

Stat Card 3: "Pending Results"

Icon (e.g., clock)

Value: "2"

Label: "Pending Results"

"Recent Activity" Widget (Medium, spans 2 columns):

Title: "Recent Activity & Results"

A list or table of the last 3-4 exams.

Each item should show:

Exam Name ("Intro to AI")

Date Taken ("Oct 20, 2025")

Score/Status ("92%" or "Pending Review")

A "View Details" link.

"My Performance" Chart (Medium, spans 1 column):

Title: "My Performance"

Use recharts to create a simple LineChart.

X-axis: Exam (e.g., "Exam 1", "Exam 2", "Exam 3").

Y-axis: Score.

Use placeholder data: [{name: 'Exam 1', score: 75}, {name: 'Exam 2', score: 88}, {name: 'Exam 3', score: 82}].

The chart should be responsive.

FUNCTIONALITY:

Use placeholder data for all dynamic content.

Ensure the entire layout is responsive (sidebar should collapse or stack on mobile).

All components should be self-contained within this one file for easy generation.
*/
