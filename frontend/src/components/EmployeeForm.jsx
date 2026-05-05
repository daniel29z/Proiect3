// Formular pentru adaugarea si editarea angajatilor

import { useState, useEffect } from "react";

export default function EmployeeForm({ onSubmit, editingEmployee, onCancel }) {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName:  "",
    position:  "",
    hireDate:  "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        firstName: editingEmployee.firstName,
        lastName:  editingEmployee.lastName,
        position:  editingEmployee.position,
        hireDate:  editingEmployee.hireDate || "",
      });
    } else {
      setFormData({ firstName: "", lastName: "", position: "", hireDate: "" });
    }
    setErrors({});
  }, [editingEmployee]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const newErrors = {};
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2)
      newErrors.firstName = "Prenumele trebuie sa aiba minim 2 caractere";
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2)
      newErrors.lastName = "Numele trebuie sa aiba minim 2 caractere";
    if (!formData.position.trim() || formData.position.trim().length < 2)
      newErrors.position = "Pozitia trebuie sa aiba minim 2 caractere";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    await onSubmit(formData);
  }

  // Clasa CSS
  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[field] 
        ? "border-red-500 bg-red-900/20 text-white" 
        : "border-gray-600 bg-gray-700 text-white focus:bg-gray-600"
    }`;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 mb-6">
      <h2 className="text-xl font-semibold text-indigo-400 mb-4 text-center">
        {editingEmployee ? "Editeaza Angajat" : "Adauga Angajat Nou"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Camp Prenume */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Prenume
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Ex: John"
            className={inputClass("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs text-red-400 mt-1">⚠ {errors.firstName}</p>
          )}
        </div>

        {/* Camp Nume */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nume
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Ex: Johnson"
            className={inputClass("lastName")}
          />
          {errors.lastName && (
            <p className="text-xs text-red-400 mt-1">⚠ {errors.lastName}</p>
          )}
        </div>

        {/* Camp Pozitie */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Pozitie
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Ex: Manager"
            className={inputClass("position")}
          />
          {errors.position && (
            <p className="text-xs text-red-400 mt-1">⚠ {errors.position}</p>
          )}
        </div>

        {/* Camp Data Angajarii */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Data Angajarii{" "}
            <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            name="hireDate"
            value={formData.hireDate}
            onChange={handleChange}
            className={inputClass("hireDate")}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Butoane Submit si Cancel */}
        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 font-medium"
          >
            {editingEmployee ? "Salveaza Modificarile" : "Adauga Angajat"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-700 text-gray-300 py-2.5 rounded-lg border border-gray-600 hover:bg-gray-600 transition-all duration-200 font-medium"
          >
            Anuleaza
          </button>
        </div>
      </form>
    </div>
  );
}