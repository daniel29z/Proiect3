// Componenta pentru afisarea notificarilor (succes, eroare, info)

// Aici am creat componenta Notification
const Notification = ({ message, type }) => {
  // Daca nu exista mesaj, nu apare nimic
  if (!message) return null;

  // Stiluri de baza comune tuturor tipurilor de notificare
  const base = "p-4 mb-4 text-sm rounded-md text-white text-center font-medium";

  // Mapam tipul notificarii la clasa CSS corespunzatoare
  const styles = {
    success: `${base} bg-green-600`,
    error:   `${base} bg-red-600`,
    info:    `${base} bg-blue-600`,
  };

  return (
    <div className={styles[type] || styles.info}>
      {message}
    </div>
  );
};

export default Notification;
