# First Reference - Blockchain Document Portal

A modern web application for secure document verification using blockchain technology.

## Project Structure

The project is organized into the following structure:

```
src/
├── assets/         # Static assets (images, fonts, etc.)
├── components/     # React components
│   ├── layout/     # Layout components (Navbar, Footer, etc.)
│   ├── sections/   # Page section components
│   └── ui/         # Reusable UI components
├── pages/          # Full page components
├── styles/         # Global styles
├── types/          # TypeScript type definitions
├── App.tsx         # Main app component
└── main.tsx        # Application entry point
```

### Component Organization

- **layout/** - Components that define the overall layout of the application
  - Navbar.tsx - Main navigation
  - Footer.tsx - Footer containing links and information
  - ScrollToTop.tsx - Utility component for scrolling to top on navigation

- **sections/** - Components that make up sections of pages
  - HeroSection.tsx - Hero section for the homepage
  - FeaturesSection.tsx - Features showcase section
  - HowItWorksSection.tsx - How it works explanation section
  - FaqSection.tsx - Frequently asked questions section
  - TestimonialsSection.tsx - User testimonials section

- **ui/** - Reusable UI components
  - LoadingScreen.tsx - Loading screen with animation
  - OrganizationWarning.tsx - Warning dialog for organization registration

### Pages

- HomePage.tsx - Landing page with sections
- LoginPage.tsx - User login page
- RegisterTypePage.tsx - Page to select registration type
- IndividualRegisterPage.tsx - Registration page for individuals
- OrganizationRegisterPage.tsx - Registration page for organizations
- PricingPage.tsx - Pricing information page
- Dashboard.tsx - User dashboard (after login)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
``` 