# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.4 application using React 19.1.0, created with `create-next-app`. The project uses the App Router architecture with Turbopack for fast development builds.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Create production build with Turbopack
- `npm start` - Start production server (must run `npm run build` first)

### Code Quality
- `npm run lint` - Run ESLint with Next.js core-web-vitals configuration

### Package Management
- `npm install` - Install dependencies
- `npm install <package>` - Add new dependency
- `npm install <package> --save-dev` - Add development dependency

## Architecture and Structure

### App Router Structure
This project uses Next.js 15 App Router with the following key structure:
- `src/app/` - Main application directory using App Router
- `src/app/layout.js` - Root layout component with Geist font configuration
- `src/app/page.js` - Home page component
- `src/app/globals.css` - Global styles with Tailwind CSS and custom CSS variables
- `public/` - Static assets (SVG icons for Next.js, Vercel, etc.)

### Styling System
- **Tailwind CSS v4** - Utility-first CSS framework
- **PostCSS** - CSS processing with `@tailwindcss/postcss` plugin
- **Custom CSS Variables** - Dark/light theme support via CSS variables
- **Geist Fonts** - Sans and mono fonts from Vercel optimized with `next/font`

### Path Configuration
- `@/*` alias configured in `jsconfig.json` maps to `./src/*`
- Use `@/components/ComponentName` for importing from src directory

### ESLint Configuration
- Uses flat config format (eslint.config.mjs)
- Extends `next/core-web-vitals` rules
- Ignores: `node_modules/`, `.next/`, `out/`, `build/`, `next-env.d.ts`

### Build Configuration
- **Turbopack** enabled for both dev and build commands for faster compilation
- Minimal Next.js configuration in `next.config.mjs`
- PostCSS configured for Tailwind CSS processing

### Theme System
The application includes built-in dark/light theme support:
- CSS variables in `globals.css` define theme colors
- Automatic dark mode detection via `prefers-color-scheme`
- Tailwind CSS classes use these variables through the theme configuration

### Development Workflow
1. Edit `src/app/page.js` to modify the main page
2. Add new pages by creating files in `src/app/` following App Router conventions
3. Components should be placed in `src/` with appropriate subdirectories
4. Static assets go in `public/` directory
5. Use Tailwind classes for styling, with custom CSS variables for theming

### Key Dependencies
- **React 19.1.0** - Latest React with concurrent features
- **Next.js 15.5.4** - App Router, image optimization, font optimization
- **Tailwind CSS v4** - Latest major version with new features
- **ESLint** - Code quality with Next.js specific rules

