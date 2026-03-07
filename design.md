# 🎨 Design Documentation - Saarthi

## 1. Architectural Overview
Saarthi is built on a modern, event-driven architecture that prioritizes speed and scalability.

### 🏗️ Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **State Management**: React Hooks + URL-based state for navigation.
- **Backend-less Server**: Next.js Server Actions for secure database/AI mutations.
- **Database**: Neon (Serverless PostgreSQL) + Drizzle ORM.
- **AI Infrastructure**: 
  - **Groq LPU**: Ultra-low latency chat and reasoning.
  - **AWS Bedrock**: (Integration ready) for high-depth course generation.
- **Workflows**: Inngest for handling long-running AI synthesis tasks.

## 2. UI/UX Design Philosophy

### 🌑 Premium Dark Theme
We opted for a "Space Obsidian" palette (Slate 950) accented with Cyan and Blue gradients. This reduces eye strain during long document editing sessions while feeling "premium".

### ✨ Glassmorphism & Depth
- **Borders**: 1px subtle white/10 borders to define sections without heavy shadows.
- **Blurs**: High-density backdrop filters (`backdrop-blur-xl`) for overlays and modals.
- **Typography**: Inter & Outfit for a clean, technical, yet approachable feel.

### 📐 Component Architecture
- **Atomic Design**: Small UI primitives (buttons, inputs) in `/components/ui`.
- **Domain Modules**: Shared features like `saarthi-profile` for consistency across tools.

## 3. Data Flow

### 🔄 Neural Resume Generation
1. User inputs data in YAML/Form.
2. `WritingDisplay` processes markdown real-time.
3. PDF-Generator captures the DOM state, applies a "Paper-Themed" CSS layer, and emits a high-res PDF.

### 🧠 AI Roadmap Logic
1. User goal + Timeline -> Groq Analysis.
2. AI emits a structured JSON object.
3. Inngest triggers a background worker to fetch curated YouTube resources for each milestone.
4. History page polls the database for status updates.

## 4. Security & Compliance
- **Auth**: Clerk handles OAuth and Session JWTs.
- **Database**: Row Level Security (RLS) patterns implemented via Drizzle queries to ensure users only see their own `userEmail` records.
