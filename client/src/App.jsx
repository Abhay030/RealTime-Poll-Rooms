import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePollPage from "./pages/CreatePollPage";
import PollPage from "./pages/PollPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <a href="/" className="text-xl font-bold text-white hover:text-indigo-400">
              🗳️ Poll Rooms
            </a>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-3xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<CreatePollPage />} />
            <Route path="/poll/:id" element={<PollPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
