# Vinylia

> A personal vinyl record library with storytelling at its heart

**Vinylia** is a modern mobile application that transforms vinyl collecting into a rich, personal storytelling experience. Built with React Native and Expo, it combines seamless vinyl cataloging with emotional depth through user stories, moods, and social interactions.

---

## Overview

Vinylia reimagines the vinyl collection experience for the digital age. Rather than just tracking records, it captures the memories, emotions, and stories behind each album—creating a living archive of musical moments.

### Core Experience

**Smart Vinyl Management**
- Instant vinyl search powered by MusicBrainz API
- Barcode scanning for quick addition
- Automatic metadata fetching (artist, album, year, tracklist, artwork)
- Visual grid-based library with mood filtering

**Storytelling Layer**
- Personal stories attached to each vinyl record
- Mood tagging system (Energetic, Melancholic, Calm, Nostalgic, Warm)
- Timeline-based organization
- Auto-save functionality for uninterrupted writing

**Social Discovery**
- User profiles and following system
- Discover other collectors' libraries
- Like and comment on stories
- Lightweight interaction without notification spam

**Polished UX**
- Dark, modern interface inspired by vinyl culture
- Smooth animations and gesture-friendly navigation
- Accessibility features (reduced motion support)
- Thoughtful empty states and loading experiences

---

## Tech Stack

### Frontend
- **React Native** (0.81.5) - Cross-platform mobile development
- **Expo** (54.0) - Development platform with EAS build support
- **TypeScript** - Type-safe codebase
- **Expo Router** - File-based navigation system
- **TanStack React Query** - Server state management
- **Reanimated** - High-performance animations
- **Lucide Icons** - Modern icon system

### Backend & Services
- **Supabase** - Authentication, PostgreSQL database, real-time features
- **MusicBrainz API** - Comprehensive vinyl metadata source
- **Row Level Security** - Database-level authorization

### Design System
- Custom typography, colors, spacing, and shadow tokens
- Mood-based color palette
- Reusable component library
- Gesture handler for native interactions

---

## Architecture Highlights

```
src/
├── components/       # Reusable UI components
│   ├── Button.tsx
│   ├── VinylCard.tsx
│   ├── VinylGrid.tsx
│   ├── MoodPill.tsx
│   └── StoryTextArea.tsx
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
│   ├── useAutoSave.ts
│   ├── useToast.tsx
│   └── useReducedMotion.ts
├── services/        # API & business logic
│   ├── supabase.ts
│   ├── auth-service.ts
│   └── story-service.ts
├── theme/           # Design system tokens
└── types/           # TypeScript definitions
```

### Custom Hooks
- **useAutoSave** - Debounced auto-saving for story writing
- **useReducedMotion** - Accessibility-aware animations
- **useToast** - Global notification system

### Type-Safe Development
Comprehensive TypeScript coverage including:
- Database schema type definitions
- Component prop interfaces
- Service layer typing
- Navigation type safety

---

## Key Features Implemented

**Authentication & Onboarding**
- Email/password authentication
- Secure session management
- Protected routes

**Vinyl Management**
- Text-based search via MusicBrainz
- Barcode scanner integration
- Personal library with filtering
- Collections for organizing records

**Storytelling**
- Rich text story composition
- Mood tagging and filtering
- Auto-save with debouncing
- Story timeline view

**Social Layer**
- User profiles with bio and stats
- Follow/unfollow system
- Story likes and comments
- Discover feed

**User Experience**
- Smooth page transitions
- Loading and error states
- Empty state designs
- Toast notifications
- Reduced motion support

---

## Design Philosophy

**Fast & Frictionless**
- One-tap vinyl addition
- Instant search results
- Optimistic UI updates

**Emotional Engagement**
- Stories over statistics
- Mood-based organization
- Personal context for each record

**Modern & Warm**
- Dark color palette with warm accents
- Large album artwork
- Subtle animations
- Gesture-driven interactions

**Mindful Social**
- No metrics competition
- Natural stopping points
- Meaningful connections over vanity metrics

---

## Technical Achievements

- **Cross-Platform**: iOS, Android, and Web support
- **Performance**: Image lazy loading, optimized re-renders, debounced inputs
- **Offline-Ready**: AsyncStorage for local caching
- **Accessibility**: Reduced motion support, semantic structure
- **Production-Ready**: Error boundaries, comprehensive loading states
- **Developer Experience**: Strong typing, modular architecture, custom hooks

---

## Platform Support

- iOS (iPhone & iPad)
- Android (Phone & Tablet)
- Web (Progressive Web App via Expo)

---

## About This Project

Vinylia was built to demonstrate modern mobile development practices, combining:
- **Full-Stack Mobile Development** - From backend integration to polished UI
- **Modern React Patterns** - Hooks, context, custom abstractions
- **Real-Time Backend** - Supabase integration with RLS
- **Thoughtful Design** - User-centered UX/UI
- **Production-Grade Quality** - Clean architecture, error handling, accessibility

This project showcases capabilities in cross-platform mobile app development with a focus on creating meaningful, emotionally engaging user experiences.

---

**Built with passion for vinyl culture and modern mobile development.**

*Portfolio project demonstrating modern mobile app development. Built with React Native, Expo, TypeScript, and Supabase.*
