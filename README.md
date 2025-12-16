# Xandeum Overwatch

A premium, real-time analytics platform for monitoring the Xandeum Storage Network. Built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Ethereal Design**: Deep atmospheric glows, floating glass panels, and slow-breathing gradients
- **Aurora Background**: Animated aurora borealis effect with noise texture overlay
- **Glass Morphism**: Premium glass card components with backdrop blur
- **Animated Stats**: Count-up animations for network statistics
- **Node Grid**: Bento-style responsive grid with pulsing status indicators
- **Shimmer Effects**: Animated progress bars with shimmer effects

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + clsx + tailwind-merge
- **Motion**: Framer Motion
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles with aurora and noise effects
│   ├── layout.tsx           # Root layout with Background component
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── dashboard/
│   │   ├── Hero.tsx         # Hero section with search bar
│   │   ├── StatsRow.tsx     # Animated statistics cards
│   │   └── NodeGrid.tsx     # Bento-style node grid
│   ├── layout/
│   │   └── Background.tsx   # Aurora and noise overlay
│   └── ui/
│       └── GlassCard.tsx    # Reusable glass morphism card
├── lib/
│   └── utils.ts             # Utility functions (cn)
└── services/
    └── nodeService.ts       # Mock node data service
```

## Design Philosophy

The UI is designed to feel "Ethereal," "Alive," and "Premium" - inspired by Gemini 1.5 Pro meets Minority Report. Key design elements include:

- Deep void background (#0a0a0f)
- Aurora borealis gradient animation
- 4% opacity noise texture overlay
- Glass morphism with backdrop blur
- Smooth animations and transitions
- Pulsing status indicators
- Shimmer effects on progress bars

## Mock Data

The application currently uses mock data from `services/nodeService.ts`, which generates 50 nodes with:
- Random IP addresses
- Storage capacity (1TB - 500TB)
- Uptime percentage (85% - 99.9%)
- Global geographic distribution
- Active/offline status

Replace the mock service with real Xandeum RPC calls when ready.


