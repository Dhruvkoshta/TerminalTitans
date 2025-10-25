/*
PROMPT FOR GITHUB COPILOT:

This is a request to generate a complete, scalable authentication component for "PROCTO".
This single component must manage multiple views: "Sign In", "Sign Up", and "Forgot Password".

TECHNOLOGY:

Use React (functional component) with Hooks (useState).

Use Tailwind CSS for all styling.

Use heroicons for any icons.

AESTHETIC:

Match the existing dark-mode theme of the "PROCTO" website.

Background: Dark (e.g., bg-gray-900 or bg-black).

Text: Light (e.g., text-gray-200).

Primary Button: Bright purple/violet.

Secondary Button: Dark with a light border.

Form Inputs: Dark background, light text, light border.

STRUCTURE (SINGLE COMPONENT):

Main Function (AuthPage):

Should use a useState hook (e.g., const [view, setView] = useState('signin')) to control which form is visible. Default to 'signin'.

Should render a main layout container (centered on the page).

Inside the container, render the "PROCTO" logo at the top.

Use a conditional (switch statement or ternary) based on the view state to render ONE of the following:

SignInForm

SignUpForm

ForgotPasswordForm

CheckYourEmail (a success message after forgot password)

Sign In Form (SignInForm component):

Pass setView as a prop.

Heading: "Welcome Back" or "Sign In".

Social Logins:

"Continue with Google" button (with Google logo).

"Continue with Microsoft" button (with Microsoft logo).

A divider with "or" in the middle.

Email Input (label + input).

Password Input (label + input, with a "show/hide password" toggle icon).

"Forgot password?" link. Clicking this calls setView('forgot').

"Sign In" button (primary purple).

At the bottom: "Don't have an account? Sign Up" link. Clicking this calls setView('signup').

Sign Up Form (SignUpForm component):

Pass setView as a prop.

Heading: "Create Account".

Social Logins: (Same as Sign In).

A divider with "or" in the new middle.

Name Input (label + input).

Email Input (label + input).

Password Input (label + input, with "show/hide password" toggle).

Confirm Password Input (label + input, with "show/hide password" toggle).

User Type Dropdown: A <select> input with "Student" and "Educator" options.

"Sign Up" button (primary purple).

At the bottom: "Already have an account? Sign In" link. Clicking this calls setView('signin').

Forgot Password Form (ForgotPasswordForm component):

Pass setView as a prop.

Heading: "Forgot Password".

Sub-heading: "Enter your email, and we'll send you a link to reset your password."

Email Input (label + input).

"Send Reset Link" button (primary purple).

At the bottom: "Back to Sign In" link. Clicking this calls setView('signin').

On successful submission (simulated): Call setView('checkEmail').

Check Your Email (CheckYourEmail component):

Pass setView as a prop.

A large checkmark icon.

Heading: "Check Your Email".

Sub-heading: "We've sent a password reset link to your email address."

"Back to Sign In" link. Clicking this calls setView('signin').

FUNCTIONALITY:

All forms should have onSubmit handlers that log the form data to the console for now (e.g., handleSignIn, handleSignUp).

Include basic client-side validation logic (e.g., check if passwords match on sign-up).

Make the component responsive (stack vertically on mobile).

The component should NOT include the main site navbar (Home, Dashboard, etc.) to provide a focused, distraction-free auth experience.
*/
