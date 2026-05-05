// Componenta radacina - defineste rutele aplicatiei

// Aici am importat Routes si Route din react-router-dom pentru rutare
import { Routes, Route } from "react-router-dom";
import EmployeesPage from "./pages/EmployeesPage";

function App() {
  return (
    // Definim rutele aplicatiei
    <Routes>
      {/* Ruta principala - pagina cu angajati si filtre */}
      <Route path="/" element={<EmployeesPage />} />
    </Routes>
  );
}

export default App;
