# Studora

Studora is a study partner for university students. This repository contains the Next.js frontend prototype and its local study workspace.

## Preview

![Studora dashboard in light theme with sample learning data](docs/dashboard.png)

<sub>Dashboard preview using the built-in sample learning pack. The screenshots below show the current interface; study data in the prototype is stored locally in the browser.</sub>

<details>
<summary>Explore the dark theme, global AI assistant, and all 12 other pages</summary>

### Global AI assistant

![Studora global AI assistant with the dashboard behind it](docs/assistant-ai.png)

### Dashboard — dark theme

![Studora dashboard in dark theme](docs/dashboard-dark.png)

<table>
  <tr>
    <td width="50%"><strong>Material library</strong><br><img src="docs/pustaka-materi.png" alt="Studora material library" width="100%"></td>
    <td width="50%"><strong>AI study workspace</strong><br><img src="docs/workspace-ai.png" alt="Studora AI study workspace" width="100%"></td>
  </tr>
  <tr>
    <td width="50%"><strong>Study planner</strong><br><img src="docs/learning-plan.png" alt="Studora study planner" width="100%"></td>
    <td width="50%"><strong>Tasks and deadlines</strong><br><img src="docs/task-deadline.png" alt="Studora tasks and deadlines" width="100%"></td>
  </tr>
  <tr>
    <td width="50%"><strong>Quizzes and exercises</strong><br><img src="docs/quiz-exercise.png" alt="Studora quizzes and exercises" width="100%"></td>
    <td width="50%"><strong>Notes and summaries</strong><br><img src="docs/catatan-ringkasan.png" alt="Studora notes and summaries" width="100%"></td>
  </tr>
  <tr>
    <td width="50%"><strong>AI agents</strong><br><img src="docs/agent-ai.png" alt="Studora AI agents" width="100%"></td>
    <td width="50%"><strong>Study history</strong><br><img src="docs/history-sessions.png" alt="Studora study history" width="100%"></td>
  </tr>
  <tr>
    <td width="50%"><strong>Notifications</strong><br><img src="docs/notif.png" alt="Studora notifications" width="100%"></td>
    <td width="50%"><strong>Settings</strong><br><img src="docs/settings.png" alt="Studora settings" width="100%"></td>
  </tr>
  <tr>
    <td width="50%"><strong>Help and support</strong><br><img src="docs/help.png" alt="Studora help and support" width="100%"></td>
    <td width="50%"><strong>Account access</strong><br><img src="docs/login-page.png" alt="Studora account access page" width="100%"></td>
  </tr>
</table>

</details>

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
npx playwright install chromium
npm run typecheck
npm run build
npm run test:e2e
```
