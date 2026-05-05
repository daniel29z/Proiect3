// Toate apelurile HTTP catre backend sunt centralizate aici


// Aici am definit URL-urile
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = `${API_URL}/api/employees`;

// Toate cele trei filtre sunt optionale si pot fi combinate

// Aici am creat functia de preluare a angajatilor cu filtre optionale
export async function getAllEmployees(search = "", position = "", veteran = false) {
  // Construim query string-ul dinamic cu URLSearchParams
  const params = new URLSearchParams();

  // Adaugam parametrul de cautare doar daca nu este gol
  if (search.trim()) params.append("search", search.trim());

  // Adaugam filtrul de pozitie doar daca este selectat ceva specific
  if (position && position !== "all") params.append("position", position);

  // Adaugam filtrul de „veterani” doar daca este activ
  if (veteran) params.append("veteran", "true");

  // Construim URL-ul final cu sau fara query string
  const queryString = params.toString();
  const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch employees");
  return response.json();
}


// Returneaza lista unica de pozitii pentru dropdown

// Aici am creat functia de preluare a pozitiilor
export async function getPositions() {
  const response = await fetch(`${BASE_URL}/positions`);
  if (!response.ok) throw new Error("Failed to fetch positions");
  return response.json();
}


// Adauga un angajat nou

// Aici am creat functia pentru adaugarea unui angajat
export async function addEmployee(employeeData) {
  const response = await fetch(BASE_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(employeeData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to add employee");
  }
  return response.json();
}


// Actualizeaza un angajat existent


// Aici am creat functia pentru actualizarea unui angajat
export async function updateEmployee(id, employeeData) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(employeeData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to update employee");
  }
  return response.json();
}


// Sterge un angajat dupa ID

// Aici am creat functia pentru stergerea unui angajat
export async function deleteEmployee(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to delete employee");
  }
  return response.json();
}
