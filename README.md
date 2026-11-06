# Studora

Studora is a study partner for university students. This repository contains the Next.js frontend prototype and its local study workspace.

## Run locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current capabilities

- Import PDF, DOCX, PPTX, and TXT materials up to 50 MB. Files stay in this browser and are stored in IndexedDB.
- Write notes, take the authored sample quizzes, manage study sessions and task deadlines, and review local progress.
- Load or remove the optional sample learning pack from the Materials page.

Study data is stored in this browser and does not sync between devices. Authentication, AI generation, cloud storage, calendar sync, and live support are not connected yet. Workspace drafts save the selected material and learning preferences; they do not analyze uploaded files.

## Checks

```bash
npm run typecheck
npm run build
```
