<high_level_design>
## 1. Brand & Art Direction Overview
Kenmei is a modern, clean manga/manhwa tracking platform with a sophisticated light theme design. The visual style emphasizes minimalism with subtle gradients, soft shadows, and a focus on content discovery. The design features large hero sections with beautiful manga artwork backgrounds, clean typography hierarchies, and a professional dashboard aesthetic. The overall feel is contemporary and user-friendly, targeting manga enthusiasts with a premium but accessible experience.

## 2. Color Palette (Light Theme)

| Token | HEX / RGB | Usage | Notes |
|-------|-----------|-------|-------|
| Primary Blue | #3B82F6 | Primary buttons, links, active states | Main brand color |
| Dark Text | #1F2937 | Headlines, primary text | High contrast text |
| Medium Gray | #6B7280 | Secondary text, descriptions | Readable secondary text |
| Light Gray | #9CA3AF | Tertiary text, placeholders | Subtle text elements |
| Background White | #FFFFFF | Main backgrounds, cards | Clean white base |
| Light Background | #F9FAFB | Section backgrounds | Subtle background variation |
| Border Gray | #E5E7EB | Borders, dividers | Subtle borders |
| Success Green | #10B981 | Status indicators, success states | Reading status |
| Pink Accent | #EC4899 | Premium badges, special highlights | Premium features |
| Orange Accent | #F59E0B | Star ratings, highlights | Rating system |

## 3. Typography Scale (Clone Exactly)

**Primary Font**: System font stack (likely Inter or similar modern sans-serif)

- **Hero Headlines**: 48-64px, font-weight: 700, line-height: 1.1
- **Section Headlines**: 32-40px, font-weight: 700, line-height: 1.2
- **Subsection Titles**: 24px, font-weight: 600, line-height: 1.3
- **Card Titles**: 18px, font-weight: 600, line-height: 1.4
- **Body Text**: 16px, font-weight: 400, line-height: 1.6
- **Small Text**: 14px, font-weight: 400, line-height: 1.5
- **Caption Text**: 12px, font-weight: 400, line-height: 1.4

## 4. Spacing & Layout Grid (Clone Exactly)

- **Container Max Width**: 1200px
- **Section Padding**: 80px top/bottom, 24px horizontal
- **Card Padding**: 24px
- **Button Padding**: 12px 24px (medium), 16px 32px (large)
- **Grid Gaps**: 24px for cards, 16px for smaller elements
- **Border Radius**: 8px for cards, 6px for buttons, 4px for small elements
- **Responsive Breakpoints**: Mobile (768px), Tablet (1024px), Desktop (1200px+)

## 5. Visual Effects & Treatments (Clone Exactly)

- **Card Shadows**: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
- **Hover Shadows**: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)
- **Button Shadows**: 0 1px 2px rgba(0, 0, 0, 0.05)
- **Transitions**: 150ms ease-in-out for all interactive elements
- **Gradient Overlays**: Linear gradients on hero backgrounds for text readability
- **Border Radius**: Consistent 8px for cards, 6px for buttons

## 6. Component Styles (Clone Exactly)

**Navigation Bar**:
- Clean white background with subtle border
- Logo on left, navigation items center, auth buttons right
- 64px height with horizontal padding

**Hero Section**:
- Large background image with gradient overlay
- Centered content with manga artwork accent
- Primary CTA button with shadow and hover effects

**Feature Cards**:
- Three-column grid layout
- Background images with rounded corners
- Overlay text with consistent typography
- Subtle hover animations

**Dashboard Preview**:
- Realistic interface mockup
- Clean table layouts with proper spacing
- Status badges with appropriate colors
- Search and filter components

**Footer**:
- Dark background with organized link columns
- Logo and description on left
- Link categories in organized columns

## 7. Site Sections (Clone Exactly)

1. **Navigation Header**
   - Logo, main navigation menu, login/register buttons

2. **Hero Section**
   - Main headline with manga artwork
   - Subtitle describing the service
   - Primary CTA button
   - Dashboard preview mockup

3. **Cross-site Tracking Section**
   - Section title and description
   - Three-column feature grid with images
   - "Check supported sites" link

4. **Platform Action Section**
   - Dark background with feature highlights
   - Platform interface mockup
   - Feature list with icons

5. **Discovery Section**
   - Light background
   - Feature description with icons
   - Manga grid showcase
   - "Start discovering" CTA

6. **Social Features Section**
   - Community aspects description
   - Social profile mockup
   - Three feature highlights

7. **Premium Features Section**
   - Premium benefits showcase
   - Three-column feature layout
   - "Explore premium" CTA

8. **Final CTA Section**
   - Scenic background image
   - Call-to-action headline
   - Primary CTA button

9. **Footer**
   - Dark background
   - Logo and tagline
   - Organized link categories
   - Social media links

10. **Cookie Notice**
    - Bottom banner with accept button
    - Link to cookie policy
</high_level_design>

<theme>
light
</theme>

<sections>
<clone_section>
    <file_path>src/components/sections/navigation.tsx</file_path>
    <design_instructions>
    Clone the top navigation header with the Kenmei logo on the left and navigation menu items (Track, Discover, Social, Premium, Resources) in the center, plus Log in and Register buttons on the right. Use clean white background with subtle shadows and responsive design that collapses to hamburger menu on mobile. Include the light logo version and ensure proper spacing and typography.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/light-logo-8ogL60VF-1.svg?"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/hero.tsx</file_path>
    <design_instructions>
    Clone the hero section with large "Every Series One Tracker" headline, featuring the manga cover image as a visual accent between "Every Series" and "One Tracker". Include the subtitle about syncing reading across 20+ sites and the "Get started for free" call-to-action button. Add the dashboard preview image below with both light and dark versions that can be toggled. Use the light hero background image and include proper spacing, typography, and responsive design.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/icons/landing-page-manga-1.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/icons/hero-bookmark-2.png?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-dashboard-2.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/dark-hero-dashboard-3.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-bg-1.jpg?"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/cross-site-tracking.tsx</file_path>
    <design_instructions>
    Clone the "Cross-site tracking" section with "If Series Exists, You'll Find It Here" subtitle and "Check 20+ supported sites" link. Include the three feature cards: "Track Everything, Everywhere", "Find Your Next Read", and "Your Library, Your Way" with their respective images and descriptions. Each card should have both light and dark mode image versions and proper hover effects.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-track-everything-4.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/dark-track-everything-5.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-find-next-6.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/dark-find-next-7.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-organise-8.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/dark-organise-9.jpg?"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/platform-action.tsx</file_path>
    <design_instructions>
    Clone the dark "See the platform in action" section with "Start tracking in under 1 minute" subtitle. Include the feature list on the left with bookmark icon for "Take Control of Your Collection", filter icon for filtering capabilities, notes icon for adding notes and ratings, and history icon for detailed history. On the right, show the platform interface preview image. Include the "Get started for free" button and use the platform background image.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/platform-bg-10.png?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/bookmark-icon-3.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/platform-filter-icon-4.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/platform-notes-icon-5.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/platform-history-icon-6.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/platform-11.jpg?"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/discovery-tool.tsx</file_path>
    <design_instructions>
    Clone "The Ultimate Tracking Tool" section with "Your taste, our picks—perfect match" subtitle and "Start discovering" button. Include the left side features with sparkles icon for "From hidden gems to trending hits", flame icon for "Discover what's hot right now", search icon for "Uncover hidden gems", and filters icon for advanced filtering. On the right, show the discovery section with both light and dark versions that display manga covers and filtering options.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/light-sparkles-icon-7.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/dark-sparkles-icon-8.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/light-flame-icon-9.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/dark-flame-icon-10.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/light-search-icon-11.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/dark-search-icon-12.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/light-filters-icon-13.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/dark-filters-icon-14.svg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-discovery-section-12.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/icons/dark-discovery-section-3.jpg?"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/community.tsx</file_path>
    <design_instructions>
    Clone "More Than Just Tracking" section with "Join the Community" subtitle. Include three feature descriptions: "Your Profile, Your Rules" with profile customization details, "Connect With Friends" for social features, and "Reading Stats That Matter" for analytics. Show the social features interface with both light and dark versions displaying user profiles, activity feeds, and reading statistics.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-social-13.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/icons/dark-social-4.jpg?"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/premium.tsx</file_path>
    <design_instructions>
    Clone "Go Premium & Unlock More" section with "Supercharge Your Tracking Experience" subtitle and "Explore premium" button. Include three premium feature cards: "Personalized Recommendations" with smart suggestion features, "Smart Suggestions System" with real-time notifications, and "And More..." with additional premium features. Each card should have both light and dark mode versions of their respective images.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-personalized-reccs-14.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/icons/dark-personalized-reccs-5.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-smart-suggestions-15.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/icons/dark-smart-suggestions-6.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-discovery-16.jpg?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/icons/dark-discovery-7.jpg?"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/final-cta.tsx</file_path>
    <design_instructions>
    Clone the final call-to-action section with "Ready for Your Next Favourite Read?" headline over a scenic landscape background image. Include the "Get started for free" button centered below the headline with proper overlay styling to ensure text readability over the background image.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/bg-cta-17.png?"]</assets>
  </clone_section>

  <clone_section>
    <file_path>src/components/sections/footer.tsx</file_path>
    <design_instructions>
    Clone the footer section with dark background using the footer background image. Include the Kenmei logo on the left with the tagline "Your favourite tracker for discovering and tracking new series." Create four columns of links: Product (Supported Sites, Pricing, About), Resources (Suggestions, Changelog, Status, Blog), Legal (Cookies, Privacy, Terms), and Social (Discord, X). Use proper typography and spacing with the dark logo version.
    </design_instructions>
    <assets>["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/bg-footer-18.png?", "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/dark-logo-BzMF6V4R-2.svg?"]</assets>
  </clone_section>
</sections>