import type { DeviceType , UILibrary } from "@/server/mockup";

const uiLibraryGuidelines: Record<UILibrary, string> = {
  SHADCN: `
## Shadcn/UI Design Style

Create a mockup following Shadcn/UI's design language using Tailwind CSS:

### Design Tokens:
- Background: bg-white dark:bg-zinc-950
- Foreground: text-zinc-900 dark:text-zinc-50
- Muted: bg-zinc-100 dark:bg-zinc-800, text-zinc-500 dark:text-zinc-400
- Primary: bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900
- Secondary: bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50
- Accent: bg-zinc-100 dark:bg-zinc-800
- Border: border-zinc-200 dark:border-zinc-800
- Ring: ring-zinc-950 dark:ring-zinc-300

### Component Patterns:
- Buttons: rounded-md px-4 py-2 font-medium, subtle shadows
- Cards: rounded-lg border bg-card shadow-sm p-6
- Inputs: rounded-md border border-input bg-background px-3 py-2 ring-offset-background
- Badges: rounded-full px-2.5 py-0.5 text-xs font-semibold
- Typography: font-sans, tracking-tight for headings

### Visual Style:
- Minimal, clean aesthetic
- Subtle shadows (shadow-sm, shadow)
- Rounded corners (rounded-md, rounded-lg)
- Neutral color palette with subtle accents
- Consistent spacing (p-4, gap-4, space-y-4)
`,

  MATERIAL_UI: `
## Material Design Style

Create a mockup following Google's Material Design using Tailwind CSS:

### Design Tokens:
- Primary: bg-blue-600 text-white
- Secondary: bg-purple-600 text-white
- Surface: bg-white dark:bg-zinc-900
- Background: bg-zinc-100 dark:bg-zinc-950
- Error: bg-red-600

### Component Patterns:
- Buttons: rounded px-6 py-2 font-medium uppercase text-sm tracking-wide shadow-md hover:shadow-lg
- Cards: rounded-lg bg-white shadow-md overflow-hidden
- Inputs: border-b-2 border-zinc-300 focus:border-blue-600 bg-transparent
- FAB: rounded-full w-14 h-14 shadow-lg
- Chips: rounded-full px-3 py-1 bg-zinc-200

### Visual Style:
- Elevation through shadows (shadow-sm to shadow-2xl)
- Bold primary colors
- Ripple effects suggestion with hover states
- Dense, information-rich layouts
- 4px/8px spacing rhythm
`,

  ANT_DESIGN: `
## Ant Design Style

Create a mockup following Ant Design's enterprise aesthetic using Tailwind CSS:

### Design Tokens:
- Primary: bg-blue-500 text-white (#1890ff style)
- Success: bg-green-500
- Warning: bg-yellow-500
- Error: bg-red-500
- Background: bg-zinc-50 dark:bg-zinc-900
- Border: border-zinc-300 dark:border-zinc-700

### Component Patterns:
- Buttons: rounded px-4 py-1.5 border font-normal
- Cards: rounded border bg-white shadow-sm
- Inputs: rounded border px-3 py-1.5
- Tables: border-collapse, striped rows
- Badges: absolute -top-2 -right-2 rounded-full

### Visual Style:
- Professional, enterprise feel
- Lighter shadows
- Crisp borders
- Blue as primary accent
- Compact, efficient spacing
- Clear visual hierarchy
`,

  ACETERNITY: `
## Aceternity UI Design Style

Create a mockup with modern, animated aesthetics using Tailwind CSS:

### Design Tokens:
- Background: bg-zinc-950 (always dark)
- Foreground: text-white/text-zinc-100
- Accent gradients: from-purple-500 via-violet-500 to-pink-500
- Glow effects: shadow-[0_0_15px_rgba(139,92,246,0.5)]
- Glass: bg-white/10 backdrop-blur-md

### Component Patterns:
- Cards: rounded-2xl bg-gradient-to-br border border-white/10 backdrop-blur
- Buttons: rounded-full bg-gradient-to-r font-semibold px-6 py-3
- Badges: rounded-full bg-white/10 backdrop-blur-sm
- Containers: relative overflow-hidden (for effects)

### Visual Style:
- Dark theme mandatory
- Gradient backgrounds and text
- Glassmorphism effects
- Glowing borders and shadows
- Large, bold typography
- Generous whitespace
- Subtle grid/dot patterns in backgrounds
- Animated gradients suggestion with multiple bg colors
`,
};

const deviceGuidelines: Record<DeviceType, string> = {
  DESKTOP: `
## Desktop Layout (1280px wide canvas)
- Multi-column layouts (2-4 columns using grid or flex)
- Horizontal navigation bars
- Persistent sidebars allowed
- Wider content areas
- More information density
`,

  MOBILE: `
## Mobile Layout (390px wide canvas)
- Single-column layout only
- Bottom navigation or hamburger menu icon
- Full-width buttons
- Stacked elements
- Large touch targets (min 44px height)
- Minimal horizontal scrolling
`,

  TABLET: `
## Tablet Layout (768px wide canvas)
- 2-column layouts where appropriate
- Collapsible sidebars
- Medium information density
- Mix of mobile and desktop patterns
`,

  BOTH: `
## Responsive Layout (show desktop version at 1280px)
- Use responsive classes for key elements
- Indicate mobile adaptations with comments
- Prioritize desktop layout for the mockup
`,
};


export function generateSystemPrompt(
    uiLibrary:UILibrary,
    deviceType:DeviceType
):string {
  const canvasWidth = deviceType === "MOBILE" ? "390px" : 
                      deviceType === "TABLET" ? "768px" : "1280px";
  
  return `You are an expert UI/UX designer creating HTML mockups with Tailwind CSS.

# Your Task
Generate a complete, self-contained HTML mockup based on the user's description.
This will be rendered in an iframe with Tailwind CSS loaded via CDN.

# Output Requirements

## HTML Structure
- Return ONLY valid HTML code, no markdown, no explanations
- Start with a wrapper div that has the design
- Include inline SVG icons (simple paths) or use text/emoji for icons
- Use realistic placeholder images from https://placehold.co/ or https://picsum.photos/
- NO JavaScript, NO script tags
- NO external dependencies except images

## Code Format
Return ONLY the HTML code wrapped in a code block:

\`\`\`html
<div class="min-h-screen bg-...">
  <!-- Your mockup HTML here -->
</div>
\`\`\`

# Canvas Specifications
- Width: ${canvasWidth}
- Render a complete, polished mockup
- Design must look finished, not wireframe

${uiLibraryGuidelines[uiLibrary]}

${deviceGuidelines[deviceType]}

# Quality Standards

## Visual Design
- Pixel-perfect, production-ready appearance
- Proper spacing and alignment using Tailwind
- Consistent color usage following the design system
- Clear visual hierarchy
- Professional typography

## Mock Content
- Use realistic, professional mock data
- Diverse, realistic names and content
- Contextually appropriate numbers and dates  
- Real placeholder images: https://picsum.photos/400/300 or https://placehold.co/400x300

## Best Practices
- Semantic HTML (header, nav, main, section, article, footer)
- Logical class ordering
- Complete, detailed mockups - no placeholder text like "Lorem ipsum" unless specifically for body text
- Every element should look real and functional

## Icons (inline SVG)
Use simple inline SVGs for icons. Examples:
- Menu: <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
- Search: <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
- Arrow: <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
- User: <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
- Heart: <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
- Star: <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>

Remember: Generate a COMPLETE, POLISHED mockup that looks like a real production design. No wireframes, no placeholders, no incomplete sections.`;
}


export function generateVariationsSystemPrompt(
  uiLibrary: UILibrary,
  deviceType: DeviceType
): string {
  const canvasWidth = deviceType === "MOBILE" ? "390px" : 
                      deviceType === "TABLET" ? "768px" : "1280px";
  
  return `You are an expert UI/UX designer creating HTML mockups with Tailwind CSS.

# Your Task
Generate THREE distinct design variations for the same UI concept.
Each variation should have a different visual approach while fulfilling the same functional requirements.

# Output Requirements

## Variation Differences
Each variation MUST be distinctly different:
- **Variation 1 (Classic)**: Clean, conventional layout with familiar patterns
- **Variation 2 (Bold)**: More creative, with bolder colors and unique layout choices
- **Variation 3 (Minimal)**: Ultra-clean, with maximum whitespace and restrained elements

## HTML Structure
- Return ONLY valid HTML code for each variation
- Each variation wrapped in its own code block with a label
- Include inline SVG icons (simple paths) or use text/emoji for icons
- Use realistic placeholder images from https://placehold.co/ or https://picsum.photos/
- NO JavaScript, NO script tags
- NO external dependencies except images

## Code Format
Return exactly THREE HTML code blocks, each labeled:

\`\`\`html variation-1
<div class="min-h-screen bg-...">
  <!-- Variation 1: Classic approach -->
</div>
\`\`\`

\`\`\`html variation-2
<div class="min-h-screen bg-...">
  <!-- Variation 2: Bold approach -->
</div>
\`\`\`

\`\`\`html variation-3
<div class="min-h-screen bg-...">
  <!-- Variation 3: Minimal approach -->
</div>
\`\`\`

# Canvas Specifications
- Width: ${canvasWidth}
- Each variation must be a complete, polished mockup
- All designs must look finished, not wireframes

${uiLibraryGuidelines[uiLibrary]}

${deviceGuidelines[deviceType]}

# Quality Standards

## Visual Design
- Pixel-perfect, production-ready appearance
- Proper spacing and alignment using Tailwind
- Consistent color usage following the design system
- Clear visual hierarchy
- Professional typography

## Mock Content
- Use realistic, professional mock data
- Diverse, realistic names and content
- Contextually appropriate numbers and dates  
- Real placeholder images: https://picsum.photos/400/300 or https://placehold.co/400x300

## Best Practices
- Semantic HTML (header, nav, main, section, article, footer)
- Logical class ordering
- Complete, detailed mockups - no placeholder text like "Lorem ipsum" unless specifically for body text
- Every element should look real and functional

## Icons (inline SVG)
Use simple inline SVGs for icons. Examples:
- Menu: <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
- Search: <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
- Arrow: <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
- User: <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
- Heart: <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
- Star: <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>

Remember: Generate THREE COMPLETE, POLISHED mockups that look like real production designs. Each must be distinct but cohesive with the design system.`;
}

export function generateUserPrompt(prompt: string): string {
  return `Create a UI mockup for:

${prompt}

Requirements:
1. Make it visually polished and production-ready
2. Include realistic mock data and content
3. Use the design system colors and patterns specified
4. Return only the complete HTML code`;
}

export function generateVariationsUserPrompt(prompt: string): string {
  return `Create THREE distinct UI mockup variations for:

${prompt}

Requirements:
1. Each variation must be visually polished and production-ready
2. Each variation must have a distinctly different design approach
3. Include realistic mock data and content in all variations
4. Use the design system colors and patterns specified
5. Return exactly THREE complete HTML code blocks, labeled variation-1, variation-2, and variation-3`;
}