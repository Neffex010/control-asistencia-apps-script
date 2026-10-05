const SPREADSHEET_ID = "1kQBki3sB_-qZhe0f_9pLdkM5k3VQsYRcGgrtbE3p1TQ";

const HOJAS = Object.freeze({
  PARTICIPANTES: "Participantes",
  SESIONES: "Sesiones",
  ASISTENCIAS: "Asistencias",
});

function obtenerLibro_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.includes("PEGA_AQUI")) {
    throw new Error(
      "Configura SPREADSHEET_ID en Config.gs antes de ejecutar la aplicación.",
    );
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}
