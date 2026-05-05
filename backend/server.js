// Backend pentru Proiectul nr. 3: Filtrarea angajatilor

// Aici am importat modulele necesare: express, cors, joi
const express = require("express");
const cors    = require("cors");
const Joi     = require("joi");
const fs      = require("fs");
const path    = require("path");

// Aici am initializat aplicatia Express
const app = express();

// Aici am activat CORS si parsarea JSON, pentru comunicarea cu frontend-ul React
app.use(cors());
app.use(express.json());

// Aici am definit URL-ul json-server care gestioneaza fisierul db.json
const JSON_SERVER_URL = "http://localhost:3000/employees";

// Middleware: validam ID-ul din rute cu parametru :id
// Returnam „400” daca ID-ul nu este un numar valid

// Aici am creat middleware-ul de validare a ID-ului
const validateId = (req, res, next) => {
  if (!req.params.id || req.params.id.trim() === "") {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// Schema Joi - defineste structura valida a unui angajat

// Aici am definit schema Joi pentru validarea datelor angajatilor
const employeeSchema = Joi.object({
  firstName: Joi.string().trim().min(2).required(),
  lastName:  Joi.string().trim().min(2).required(),
  position:  Joi.string().trim().min(2).required(),
  
  // hireDate este optional - unii angajati nu au data angajarii
  hireDate:  Joi.string().allow("").optional(),
});

// GET  - ruta de test, confirma ca serverul ruleaza


// Aici am adaugat ruta de test
app.get("/", (req, res) => {
  res.send("Employee Filter API is running...");
});


// Aici am creat ruta principala de GET pentru filtrare multipla
app.get("/api/employees", async (req, res) => {
  try {
    // Aici am preluat toti angajatii din json-server
    const response = await fetch(JSON_SERVER_URL);
    const data     = await response.json();

    // Aici am extras parametrii de filtrare din query string
    const { search, position, veteran } = req.query;

    // Pornim cu lista completa si aplicam filtrele succesiv
    let result = data;

    // Filtru 1: cautare dupa prenume sau nume (case-insensitive)

    if (search && search.trim()) {
      // Aici am aplicat filtrul de cautare text, insensibil la majuscule
      const term = search.trim().toLowerCase();
      result = result.filter(emp =>
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term)
      );
    }

    // Filtru 2: cautare dupa pozitie
    if (position && position !== "all") {
      // Aici am aplicat filtrul de pozitie
      result = result.filter(emp =>
        emp.position.toLowerCase() === position.toLowerCase()
      );
    }

    // Filtru 3: angajati cu >= 6 luni vechime
    if (veteran === "true") {
      // Calculam data de acum 6 luni in urma
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Aici am filtrat angajatii cu data angajarii mai veche de 6 luni
      result = result.filter(emp => {
        if (!emp.hireDate) return false; 
        // excludem angajatii fara data
        const hireDate = new Date(emp.hireDate);
        return hireDate <= sixMonthsAgo;
      });
    }

    // Returnam rezultatele filtrate
    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});


// Aici am creat ruta pentru obtinerea pozitiilor unice
app.get("/api/employees/positions", async (req, res) => {
  try {
    const response  = await fetch(JSON_SERVER_URL);
    const data      = await response.json();
    // Extragem valorile unice cu Set, apoi convertim inapoi la Array
    const positions = [...new Set(data.map(emp => emp.position))].sort();
    res.status(200).json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

// Returneaza un singur angajat dupa ID

// Aici am creat ruta GET pentru un singur angajat
app.get("/api/employees/:id", validateId, async (req, res) => {
  try {
    const empId    = req.params.id;
    const response = await fetch(`${JSON_SERVER_URL}/${empId}`);
    if (!response.ok) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const employee = await response.json();
    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});

// Adauga un angajat nou cu validare Joi

// Aici am creat ruta POST pentru adaugarea unui angajat
app.post("/api/employees", async (req, res) => {
  // Validam datele trimise de client cu schema Joi
  const { error } = employeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const response   = await fetch(JSON_SERVER_URL);
    const employees  = await response.json();

    // Generare ID numeric unic (urmatorul numar disponibil)
    const newId = employees.length > 0
      ? Math.max(...employees.map(e => Number(e.id))) + 1
      : 1;

    // Construim obiectul noului angajat
    const newEmployee = { id: newId, ...req.body };

    // Trimitere catre json-server
    const postResponse = await fetch(JSON_SERVER_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(newEmployee),
    });
    const data = await postResponse.json();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ error: "Failed to add employee" });
  }
});

// Actualizeaza un angajat existent cu validare Joi


// Aici am creat ruta PUT pentru actualizarea unui angajat
app.put("/api/employees/:id", validateId, async (req, res) => {
  const { error } = employeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const empId         = req.params.id;
    const updatedEmployee = { id: Number(empId), ...req.body };

    const response = await fetch(`${JSON_SERVER_URL}/${empId}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(updatedEmployee),
    });
    if (!response.ok) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Failed to update employee" });
  }
});

// Sterge un angajat dupa ID


// Aici am creat ruta DELETE pentru stergerea unui angajat
app.delete("/api/employees/:id", validateId, async (req, res) => {
  try {
    const empId    = req.params.id;
    const response = await fetch(`${JSON_SERVER_URL}/${empId}`);
    if (!response.ok) {
      return res.status(404).json({ error: "Employee not found" });
    }
    await fetch(`${JSON_SERVER_URL}/${empId}`, { method: "DELETE" });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Failed to delete employee" });
  }
});


// Pornire server pe portul 5000

// Aici am pornit serverul Express
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Verificam repornirea automata
console.log("Server started!");
