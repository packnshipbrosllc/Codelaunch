# 📋 Copyable Files for React Flow Integration

These files are ready to copy/paste for implementing AI Chat Panel and Mood Board features.

## 📁 File List

### 1. `01-CREATE-PAGE.tsx` → `src/app/create/page.tsx`
**Main React Flow page component**
- User input form for app ideas
- Mindmap generation API call
- Renders MindmapFlow component
- Dark theme: `bg-gradient-to-br from-gray-900 via-purple-900 to-black`
- State management: `mindmapData`, `idea`, `isGenerating`, `error`

### 2. `02-MINDMAPFLOW.tsx` → `src/components/MindmapFlow.tsx`
**React Flow visualization component**
- Uses `reactflow` library
- Generates nodes/edges from `MindmapData`
- Dark theme styling (gray-900 background, purple dots)
- Fixed height: `h-[800px]`
- Props: `data: MindmapData`, `onSave?: () => void`

### 3. `03-GLOBALS-CSS.css` → `src/app/globals.css`
**Global styles and Tailwind config**
- Basic Tailwind CSS setup
- CSS variables for dark mode
- Font configurations

### 4. `04-MINDMAP-TYPES.ts` → `src/types/mindmap.ts`
**TypeScript type definitions**
- `MindmapData` interface (main data structure)
- `Competitor`, `TechStack`, `Feature`, `Monetization`, `UserPersona` interfaces
- API request/response types

---

## 🎨 Current Theme Styling

- **Background**: Dark gradient `from-gray-900 via-purple-900 to-black`
- **Cards**: `bg-gray-800/50 backdrop-blur-sm border border-purple-500/20`
- **Text**: White/light gray with purple accents
- **Buttons**: Purple to pink gradients `from-purple-500 to-pink-500`
- **React Flow**: Dark background `bg-gray-900` with purple dots `#4c1d95`

---

## 🔗 Integration Points for New Features

### AI Chat Panel (Right Side)
- Add state: `const [showAIChat, setShowAIChat] = useState(true)`
- Pass `mindmapData` as context to AI chat
- Create `/api/chat` endpoint for streaming responses

### Mood Board Panel (Left Side)
- Add state: `const [moodBoardImages, setMoodBoardImages] = useState<string[]>([])`
- Add drag & drop image upload
- Integrate with Supabase Storage

### Layout Update
When `mindmapData` exists, change from:
```
[MindmapFlow Component]
```

To:
```
[Mood Board] [MindmapFlow] [AI Chat]
  (Left)      (Center)      (Right)
```

---

## 🚀 Quick Copy Instructions

1. Open each numbered file (01-04)
2. Copy the entire contents (including the comment header)
3. Paste into the corresponding file path shown in the header
4. Remove the comment header from the destination file if desired

---

## 📦 Dependencies Needed

Make sure these are installed:
- `reactflow` - For the mindmap visualization
- `@clerk/nextjs` - For authentication
- `next` - Framework
- `tailwindcss` - Styling

---

## ✨ Ready for Enhancement!

These files provide the complete foundation for:
- ✅ React Flow mindmap visualization
- ✅ Dark theme styling
- ✅ State management structure
- ✅ Type definitions

You can now add:
- 🤖 AI Chat Panel component
- 🎨 Mood Board Panel component
- 📡 Chat API endpoint
- 💾 Image upload to Supabase

