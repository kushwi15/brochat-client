# BroChat Client - High-Performance AI Interface

BroChat is a premium, real-time AI chat application built with **React 19**, **Vite 8**, and **Tailwind CSS 4**. It provides a "ChatGPT-like" experience with token-by-token streaming, voice interactions, and a sleek, modern UI.

## 🚀 Quick Start

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary (Frontend direct upload)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3. Development
Run the development server:
```bash
npm run dev
```

---

## 🛠️ Deep Tech Stack

### Core Frameworks
- **React 19**: Utilizing the new `use` hook, improved `ref` handling, and optimized concurrent rendering.
- **Vite 8**: Providing nearly instantaneous Hot Module Replacement (HMR).
- **TypeScript**: Strict type checking for state, API responses, and SignalR events.

### State & Logic
- **Zustand**: Using a "slice" pattern to manage Auth, Chat, and App state separately while allowing cross-slice interaction. Includes middleware for local storage persistence.
- **SignalR Client**: Managed as a singleton service (`signalrService.ts`) to ensure a single WebSocket connection throughout the app lifecycle.
- **Axios Interceptors**: Handles 401 errors by automatically triggering a `/refresh` call and retrying failed requests seamlessly.

### Styling & UI
- **Tailwind CSS 4**: Featuring the new high-performance engine and zero-config setup.
- **Shadcn UI (Radix UI)**: Accessible, headless components styled with custom CSS variables for easy theme switching.
- **Framer Motion**: Powering the sidebar transitions, message entrance animations, and the new **smooth-slide file preview system**.
- **Cloudinary SDK**: Integrated for high-performance, deferred media uploads.

---

## 📂 Project Structure & Component Importance

### `src/components/chat/`
- **`Sidebar.tsx`**: Manages conversation history lists, "New Chat" actions, and user profile settings.
- **`MessageList.tsx`**: A virtualized-style list that auto-scrolls and renders markdown.
- **`ChatInput.tsx`**: A sophisticated textarea that handles auto-resize, "Enter to Send," and multi-line inputs.
- **`MessageItem.tsx`**: Renders individual messages with distinct styles for "User" vs "AI," including code block highlighting.

### `src/services/`
- **`api.ts`**: The backbone of REST communication. Contains a "failed queue" logic to handle multiple simultaneous requests during a token refresh.
- **`signalrService.ts`**: The hub of real-time logic. Listeners for `ReceiveMessageChunk` update the Zustand store in real-time to trigger UI updates.

### `src/store/`
- **`useAuthStore.ts`**: Stores JWT tokens and user metadata. Handles the initialization of "Guest IDs" for unauthenticated users.
- **`useChatStore.ts`**: The most complex store. Manages a Map of messages and a "streaming" state to prevent UI flickers during rapid updates.

---

## 🌟 Advanced Features

### 1. Real-Time AI Streaming (SSE over SignalR)
Unlike traditional REST requests, BroChat uses a persistent WebSocket connection. When the AI generates a response, it is sent in "chunks." The frontend assembles these chunks in real-time, allowing users to start reading the beginning of a response while the end is still being generated.

### 2. JARVIS Voice Mode (TTS)
When enabled, the app uses the `window.speechSynthesis` API. It specifically filters for "Google UK English Male" or "George" voices. If the preferred voice isn't available, it falls back gracefully to the best available system voice.

### 3. Intelligent Guest Mode
Guests are assigned a unique UUID stored in `localStorage`. The backend tracks this UUID to enforce rate limits (5 messages/10 mins). To maintain performance and security, **multimodal file uploads are disabled for guests**, encouraging users to register for the full experience.

### 4. Multimodal Vision (Images & PDFs)
BroChat is now fully multimodal. Users can drag and drop multiple images or PDFs directly into the chat. Files are previewed locally with instant feedback and only uploaded to Cloudinary when the message is actually sent.

### 5. Code Syntax Highlighting
AI responses containing code blocks are automatically detected and styled using custom CSS, making BroChat an excellent tool for developers.

---

## 🛡️ Security Architecture

### CSRF Resistance
BroChat is **inherently secure** against Cross-Site Request Forgery:
1. **No Session Cookies**: The API does not rely on session cookies for authentication.
2. **Authorization Header**: Every sensitive request must include the `Authorization: Bearer <token>` header.
3. **Browser Security**: Browsers prevent scripts on malicious sites from reading your app's local storage or adding custom headers to cross-site requests.

### Refresh Token Security
- **HttpOnly**: The refresh token is stored in a cookie that JavaScript cannot access, preventing XSS-based token theft.
- **SameSite Policy**: Cookies are configured with `SameSite=Lax` or `Strict` to prevent them from being sent in cross-site contexts.

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub.
2. Connect the repo to Vercel.
3. Add environment variables:
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://api.brochat.com/api`)
   - `VITE_HUB_URL`: Your backend hub URL (e.g., `https://api.brochat.com/hubs/chat`)
4. Vercel will automatically detect the Vite project and deploy.
