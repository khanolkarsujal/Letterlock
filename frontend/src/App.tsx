import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./ui/state/AppContext";
import GlobalDialogs from "./ui/components/GlobalDialogs";
import ScreenIntake from "./ui/screens/ScreenIntake";
import ScreenScan from "./ui/screens/ScreenScan";
import ScreenReview from "./ui/screens/ScreenReview";
import ScreenGenerating from "./ui/screens/ScreenGenerating";
import ScreenConnectionError from "./ui/screens/ScreenConnectionError";
import ScreenLetter from "./ui/screens/ScreenLetter";

// Each screen renders its own Header and Footer (matching the prototype structure).
// App.tsx only provides routing, global state, and global dialogs (toast / wipe modal).
function App() {
  return (
    <AppProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ScreenIntake />} />
          <Route path="/scan" element={<ScreenScan />} />
          <Route path="/review" element={<ScreenReview />} />
          <Route path="/generating" element={<ScreenGenerating />} />
          <Route path="/connection-error" element={<ScreenConnectionError />} />
          <Route path="/letter" element={<ScreenLetter />} />
        </Routes>
        <GlobalDialogs />
      </MemoryRouter>
    </AppProvider>
  );
}

export default App;
