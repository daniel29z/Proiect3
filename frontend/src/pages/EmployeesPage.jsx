// Pagina principala — contine bara de cautare, filtrele si grila de angajati

import { useState, useEffect } from "react";
import EmployeeCard    from "../components/EmployeeCard";
import EmployeeForm    from "../components/EmployeeForm";
import Notification    from "../components/Notification";
import {
  getAllEmployees,
  getPositions,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeesApi";

export default function EmployeesPage() {

  const [allEmployees,   setAllEmployees]   = useState([]); 
  const [employees,      setEmployees]      = useState([]); 
  const [positions,      setPositions]      = useState([]); 

  const [inputValue,     setInputValue]     = useState("");   
  const [searchTerm,     setSearchTerm]     = useState("");   
  const [activePosition, setActivePosition] = useState("all"); 
  const [veteranOnly,    setVeteranOnly]    = useState(false); 

  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [notification,   setNotification]   = useState({ message: "", type: "info" });

  const [editingEmployee, setEditingEmployee] = useState(null); 
  const [showForm,        setShowForm]        = useState(false); 

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(inputValue), 400);
    return () => clearTimeout(timer); 
  }, [inputValue]);

  useEffect(() => {
    setLoading(true);
    getPositions()
      .then(setPositions)
      .catch(err => console.error("Pozitii:", err));

    getAllEmployees("", "all", false)
      .then((data) => {
        setAllEmployees(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []); 

  useEffect(() => {
    let rezultat = [...allEmployees];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      rezultat = rezultat.filter(emp =>
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term)
      );
    }

    if (activePosition !== "all") {
      rezultat = rezultat.filter(emp => emp.position === activePosition);
    }

    if (veteranOnly) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      rezultat = rezultat.filter(emp => {
        if (!emp.hireDate) return false;
        return new Date(emp.hireDate) <= sixMonthsAgo;
      });
    }

    setEmployees(rezultat);
  }, [searchTerm, activePosition, veteranOnly, allEmployees]); 

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedData = JSON.parse(content);
        let dataArray = parsedData.employees ? parsedData.employees : parsedData;

        dataArray.sort((a, b) => {
          const numeA = a.lastName.toLowerCase();
          const numeB = b.lastName.toLowerCase();
          if (numeA < numeB) return -1; 
          if (numeA > numeB) return 1;  
          return 0;                     
        });

        setAllEmployees(dataArray);
        
        const newPositions = [...new Set(dataArray.map(emp => emp.position))].sort();
        setPositions(newPositions);

        showNotification("Fișier încărcat și sortat cu succes!", "success");
      } catch (err) {
        showNotification("Eroare la citirea fișierului JSON.", "error");
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  function showNotification(message, type = "success") {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  }

  function resetFilters() {
    setInputValue("");
    setActivePosition("all");
    setVeteranOnly(false);
  }

  async function handleFormSubmit(formData) {
    try {
      if (editingEmployee) {
        const updated = await updateEmployee(editingEmployee.id, formData);
        setAllEmployees(prev => prev.map(e => (e.id === updated.id ? updated : e)));
        showNotification("Angajat actualizat cu succes!", "success");
      } else {
        const created = await addEmployee(formData);
        setAllEmployees(prev => [created, ...prev]);
        showNotification("Angajat adaugat cu succes!", "success");
      }
      setEditingEmployee(null);
      setShowForm(false);
    } catch (err) {
      showNotification(err.message || "Eroare la salvare.", "error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Sigur vrei sa stergi acest angajat?")) return;
    try {
      await deleteEmployee(id);
      setAllEmployees(prev => prev.filter(e => e.id !== id));
      showNotification("Angajat sters cu succes!", "success");
    } catch (err) {
      showNotification("Eroare la stergere.", "error");
    }
  }

  function handleEdit(employee) {
    setEditingEmployee(employee);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Header sticky */}
      <header className="sticky top-0 z-10 bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-indigo-400">
              Filtru Angajati
            </h1>
            <p className="text-sm text-gray-300">
              {loading
                ? "Se cauta..."
                : `${employees.length} ${employees.length === 1 ? "angajat gasit" : "angajati gasiti"}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200 cursor-pointer flex items-center gap-2">
              <span>Încarcă Fisier</span>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>

            <button
              onClick={() => {
                setShowForm(prev => !prev);
                setEditingEmployee(null);
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors duration-200"
            >
              {showForm ? "✕ Inchide" : "Adauga Angajat"}
            </button>
          </div>
        </div>

        {/* Bara de cautare */}
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Cauta dupa prenume sau nume..."
              className="w-full pl-9 pr-10 py-2.5 border border-gray-700 rounded-xl text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-gray-700 transition"
            />
            {inputValue && (
              <button
                onClick={() => setInputValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filtre: pozitie + veterani */}
        <div className="max-w-6xl mx-auto px-4 pb-4 flex flex-wrap items-center gap-3">
          <select
            value={activePosition}
            onChange={e => setActivePosition(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-700 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">Toate pozitiile</option>
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={veteranOnly}
              onChange={e => setVeteranOnly(e.target.checked)}
              className="accent-indigo-500"
            />
            Veterani (≥ 6 luni)
          </label>

          {(inputValue || activePosition !== "all" || veteranOnly) && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-xs text-indigo-400 underline hover:text-indigo-300"
            >
              Sterge filtrele
            </button>
          )}
        </div>
      </header>

      {/* Continut principal */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        <Notification message={notification.message} type={notification.type} />

        {showForm && (
          <EmployeeForm
            onSubmit={handleFormSubmit}
            editingEmployee={editingEmployee}
            onCancel={() => {
              setEditingEmployee(null);
              setShowForm(false);
            }}
          />
        )}

        {error && (
          <p className="text-center text-red-400 py-10">⚠ {error}</p>
        )}

        {!error && !loading && employees.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-2">
              {searchTerm
                ? `Niciun angajat gasit pentru "${searchTerm}".`
                : veteranOnly
                  ? "Niciun angajat veteran gasit."
                  : activePosition !== "all"
                    ? `Niciun angajat pe pozitia "${activePosition}".`
                    : "Nu exista angajati."}
            </p>
            <button
              onClick={resetFilters}
              className="text-indigo-400 underline hover:text-indigo-300 text-sm"
            >
              Sterge filtrele
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-700" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-700 rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {!loading && employees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}