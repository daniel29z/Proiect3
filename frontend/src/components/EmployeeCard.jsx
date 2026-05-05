// Afiseaza datele unui angajat intr-un card vizual

import { useState } from "react";

function computeTenure(hireDate) {
  if (!hireDate) return null;

  const hire  = new Date(hireDate);
  const now   = new Date();

  const months =
    (now.getFullYear() - hire.getFullYear()) * 12 +
    (now.getMonth() - hire.getMonth());

  const years  = Math.floor(months / 12);
  const remMon = months % 12;

  if (years === 0) return `${remMon} lun${remMon === 1 ? "a" : "i"}`;
  if (remMon === 0) return `${years} an${years === 1 ? "" : "i"}`;
  return `${years} an${years === 1 ? "" : "i"} si ${remMon} lun${remMon === 1 ? "a" : "i"}`;
}

function isVeteran(hireDate) {
  if (!hireDate) return false;
  const hire       = new Date(hireDate);
  const sixMonths  = new Date();
  sixMonths.setMonth(sixMonths.getMonth() - 6);
  return hire <= sixMonths;
}

export default function EmployeeCard({ employee, onEdit, onDelete, searchTerm = "" }) {
  const [expanded, setExpanded] = useState(false);

  const tenure  = computeTenure(employee.hireDate);
  const veteran = isVeteran(employee.hireDate);

  function highlight(text) {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.trim()})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-yellow-500/50 text-white rounded px-0.5">{part}</mark>
        : part
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-700 flex flex-col justify-between">

      {/* Header: initiale + nume */}
      <div className="flex items-center gap-3 mb-4">

        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
          {employee.firstName[0]}{employee.lastName[0]}
        </div>

        <div>
          <p className="text-base font-semibold text-indigo-300">
            {highlight(employee.firstName)} {highlight(employee.lastName)}
          </p>
          <p className="text-xs text-gray-400">{employee.position}</p>
        </div>
      </div>

      {/*  Badge veteran  */}
      {veteran && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-900/30 text-amber-400 border-amber-800/50">
             Veteran
          </span>
        </div>
      )}

      {/*  Detalii  */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="text-xs text-indigo-400 hover:text-indigo-300 text-left mb-2 transition-colors"
      >
        {expanded ? "▲ Ascunde detalii" : "▼ Arata detalii"}
      </button>

      {expanded && (
        <div className="text-sm text-gray-300 space-y-1 mb-4">
          <p>
            <span className="font-medium text-gray-400">Pozitie:</span>{" "}
            {employee.position}
          </p>
          <p>
            <span className="font-medium text-gray-400">Data angajarii:</span>{" "}
            {employee.hireDate
              ? new Date(employee.hireDate).toLocaleDateString("ro-RO")
              : "Necunoscuta"}
          </p>
          {tenure && (
            <p>
              <span className="font-medium text-gray-400">Vechime:</span>{" "}
              {tenure}
            </p>
          )}
        </div>
      )}

      {/* Butoane actiuni - Edit si Delete */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-700">
          {onEdit && (
            <button
              onClick={() => onEdit(employee)}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-indigo-300 hover:bg-gray-600 transition-colors duration-200"
            >
             Editeaza
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(employee.id)}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-red-400 hover:bg-gray-600 transition-colors duration-200"
            >
              Sterge
            </button>
          )}
        </div>
      )}
    </div>
  );
}