import { BrowserRouter } from "react-router-dom";
import { AppContent } from "./AppContent";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { GameProvider } from "./GameProvider";

export function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}
