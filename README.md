<div align="center">
  <img src="https://via.placeholder.com/1200x300/0f172a/ffffff?text=Saarthi+Career+Navigator" alt="Saarthi Banner">
</div>

# Saarthi: The AI Career Navigator

> **A premium, AI-driven career orchestration platform for the modern professional.**

[![Build Status](https://img.shields.io/badge/Build-Success-brightgreen?style=for-the-badge)](https://github.com/knoxiboy/Saarthi)
[![Deployment](https://img.shields.io/badge/Deploy-AWS_Amplify-blue?style=for-the-badge)](https://aws.amazon.com/amplify/)
[![Framework](https://img.shields.io/badge/Framework-Next.js_16-black?style=for-the-badge)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg?style=for-the-badge)](LICENSE)

---

## Preview

<div align="center">
  <img src="https://via.placeholder.com/800x400/1e293b/ffffff?text=Resume+Architecture+Dashboard" alt="Resume Builder Preview">
  <p><i>The Neural Resume Architect interface.</i></p>
</div>

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation Guide](#installation-guide)
- [Environment Variables](#environment-variables)
- [AI/LLM Pipeline](#aillm-pipeline)
- [Performance Optimization](#performance-optimization)
- [Roadmap](#roadmap)

---

## Problem Statement

Navigating a career trajectory today is incredibly noisy. Professionals spend hours tailoring resumes that get rejected by Applicant Tracking Systems (ATS), lack actionable mentorship, and struggle to identify true skill gaps. Generic job boards provide zero personalization, leaving job seekers frustrated and companies struggling to find perfectly matched talent.

---

## Solution Overview

**Saarthi** (Sanskrit for "Charioteer" or "Guide") is a highly personalized career mentor. It combines advanced AI resume analysis, dynamic skill-gap detection, and AI-driven interview preparation into a single, unified platform.

- **ATS Optimization**: Architect resumes that machines understand and humans love.
- **Skill Roadmapping**: Identify exactly what you need to learn for your target role.
- **Actionable Mentorship**: Get 24/7 career advice from a specialized LLM agent.

---

## Core Features

### 📄 Neural Resume Architect
- **What it does**: Ingests your current resume, analyzes it against target job descriptions, and reconstructs it.
- **Why it matters**: Defeats ATS filters through semantic keyword optimization without sounding robotic.
- **Technical Implementation**: PDF text extraction fed into a highly constrained LLM prompt to output optimized bullet points.

### 🗺️ Dynamic Skill Roadmaps
- **What it does**: Generates a step-by-step learning path to transition from your current role to your dream role.
- **Why it matters**: Eliminates the guesswork in upskilling.
- **Technical Implementation**: Graph-based curriculum generation powered by AI.

### 🎙️ AI Mock Interviews
- **What it does**: Conducts technical and behavioral interviews via voice.
- **Why it matters**: Builds confidence in a low-stakes environment.
- **Technical Implementation**: Web Speech API integrated with streaming LLM responses for real-time conversation.

---

## System Architecture

<div align="center">
  <img src="https://via.placeholder.com/800x400/0f172a/ffffff?text=Saarthi+Architecture" alt="Architecture Diagram">
</div>

### Data Flow
1. **Client Interaction**: User uploads resume via Next.js frontend.
2. **Serverless Processing**: AWS Amplify Lambda function processes the PDF.
3. **AI Evaluation**: LangChain orchestrates the parsing and evaluation against live job market data.
4. **Real-time Feedback**: Actionable insights are streamed back to the user's dashboard.

---

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 16, Tailwind CSS | High-performance, SEO-friendly UI |
| **Backend** | Node.js (Serverless) | Scalable API routes |
| **AI/LLM** | OpenAI API, LangChain | Orchestration and text generation |
| **Database** | PostgreSQL | Persistent user profiles and history |
| **Deployment**| AWS Amplify | CI/CD and edge delivery |

---

## Project Structure

```bash
saarthi/
 ┣ app/            # Next.js App Router
 ┣ components/     # UI Components (Dashboards, Forms)
 ┣ lib/            # AI Prompts and Utilities
 ┣ actions/        # Server Actions for DB mutations
 ┗ public/         # Static Assets
```

---

## Installation Guide

### 1. Prerequisites
- Node.js (v18+)

### 2. Clone & Install
```bash
git clone https://github.com/knoxiboy/Saarthi.git
cd Saarthi
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

---

## Environment Variables

| Variable | Description | Required |
| -------- | ----------- | -------- |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | LLM Access | Yes |
| `NEXT_PUBLIC_AWS_REGION` | AWS Config | Yes |

---

## AI/LLM Pipeline (Crucial)

Saarthi’s AI is not a generic wrapper. It uses a **Multi-Agent Orchestration** approach:
1. **The Critic Agent**: Analyzes the resume for weak verbs, missing metrics, and formatting issues.
2. **The Optimizer Agent**: Rewrites bullet points to maximize impact (Action + Context + Result format).
3. **The ATS Agent**: Simulates a corporate ATS to provide a final "match score" against a specific job description.

This pipeline ensures high-fidelity, highly reliable outputs.

---

## Performance Optimization

- **Streaming Responses**: AI feedback is streamed token-by-token to ensure the UI feels lightning fast.
- **Server Components**: Heavy rendering is pushed to the server, keeping the client bundle tiny.

---

## Roadmap

- [x] Neural Resume Architect MVP
- [x] AI Mentorship Chat
- [ ] Voice-based Mock Interviews
- [ ] Direct LinkedIn Profile Sync

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<div align="center">
<i>Empowering your career, one byte at a time.</i>
</div>
