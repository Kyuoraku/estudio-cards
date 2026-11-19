
# 📚 Cards Estudio

A web app for creating and studying flashcards. Supports **single-answer** and **multiple-answer** question types, stores data locally, and includes a game mode for active recall.

---

## 🚀 Tech Stack

- **React** + **Vite**  
- **Material UI**  
- **Vitest**, **Jest**, **React Testing Library**  
- **localStorage** for data persistence  
- No backend (fully browser-based SPA)

---

## 🎯 Main Features

- 📘 **Subject management**: Create, edit, and delete subjects.
- 🧠 **Flashcard creation**:
  - **Single-answer** type (only one correct option).
  - **Multiple-answer** type (one or more correct options).
- 🎮 **Game mode**:
  - Presents random flashcards per subject.
  - Validates answers in real time.
  - Allows user to retry, proceed, or exit.
- 💾 **Import/export support** via `.json` files.
- 🧪 **Unit and integration tests** for every feature, traced to the specs in [`specs/`](specs/README.md).

---

## 📂 Project Structure

```bash
src/
├── components/         # Reusable components (cards, forms, tables)
├── hooks/              # Custom hooks (e.g., useApp)
├── lib/                # Helpers and localStorage access logic
├── pages/              # Main views (home, subjects, game, etc.)
├── styles/             # Global styles (if any)
└── App.jsx             # Main router
```

---

## 📦 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/cards-estudio.git
cd cards-estudio

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm run test:run       # single run
npm run test:coverage  # with coverage thresholds
```

Functional specifications live in [`specs/`](specs/README.md); every test name starts with the requirement ID it verifies (e.g. `[CARD-11]`).

---

## 📄 Data Format

Data is stored in `localStorage` using the following keys:

- `estudio-cards-subjects`: list of subjects
- `estudio-cards-cards`: list of cards, each with:
  ```json
  {
    "id": "card-id",
    "subject_id": "subject-id",
    "question": "What is X?",
    "options": [
      { "title": "Option A", "isCorrect": true },
      { "title": "Option B", "isCorrect": false }
    ]
  }
  ```

---

## 📌 Project Status

✅ Fully functional for personal use  
🔧 Actively in development: improving multiple-answer validation and game UI  
📥 Planned: game history, stats, and responsive design improvements

---

## 🙌 Author

Developed by **Nico** as a personal project to improve academic study sessions.  
Inspired by tools like Anki, but simplified and backend-free.  
Contributions and suggestions are welcome.
