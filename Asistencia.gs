function obtenerSesiones() {
  const ss = obtenerLibro_();
  const hoja = ss.getSheetByName(HOJAS.SESIONES);

  if (!hoja || hoja.getLastRow() < 2) {
    return [];
  }

  const datos = hoja
    .getRange(2, 1, hoja.getLastRow() - 1, 5)
    .getValues();

  const zona = Session.getScriptTimeZone();

  return datos.map(fila => ({
    id: fila[0],
    numero: fila[1],
    fecha: fila[2] instanceof Date
      ? Utilities.formatDate(fila[2], zona, 'yyyy-MM-dd')
      : fila[2],
    tema: fila[3],
    estado: fila[4]
  }));
}

function obtenerParticipantes(idSesion) {
  if (!idSesion) {
    throw new Error('Debes seleccionar una sesión.');
  }

  const ss = obtenerLibro_();
  const hojaParticipantes = ss.getSheetByName(HOJAS.PARTICIPANTES);
  const hojaAsistencias = ss.getSheetByName(HOJAS.ASISTENCIAS);

  const participantes = hojaParticipantes.getLastRow() < 2
    ? []
    : hojaParticipantes
        .getRange(2, 1, hojaParticipantes.getLastRow() - 1, 4)
        .getValues();

  const asistencias = hojaAsistencias.getLastRow() < 2
    ? []
    : hojaAsistencias
        .getRange(2, 1, hojaAsistencias.getLastRow() - 1, 4)
        .getValues();

  const estadoPorParticipante = new Map();

  asistencias.forEach(fila => {
    if (fila[0] === idSesion) {
      estadoPorParticipante.set(fila[1], fila[2]);
    }
  });

  return participantes
    .filter(fila => fila[3] === true)
    .map(fila => ({
      id: fila[0],
      nombre: fila[1],
      correo: fila[2],
      presente: estadoPorParticipante.get(fila[0]) === 'PRESENTE'
    }));
}

function guardarAsistencia(idSesion, participantes) {
  if (!idSesion) {
    throw new Error('Debes seleccionar una sesión.');
  }

  if (!Array.isArray(participantes) || participantes.length === 0) {
    throw new Error('No se recibieron participantes.');
  }

  const ss = obtenerLibro_();
  const hoja = ss.getSheetByName(HOJAS.ASISTENCIAS);

  const existentes = hoja.getLastRow() < 2
    ? []
    : hoja.getRange(2, 1, hoja.getLastRow() - 1, 4).getValues();

  const indice = new Map();

  existentes.forEach((fila, i) => {
    indice.set(`${fila[0]}|${fila[1]}`, i);
  });

  const ahora = new Date();

  participantes.forEach(p => {
    const clave = `${idSesion}|${p.id}`;
    const registro = [
      idSesion,
      p.id,
      p.presente ? 'PRESENTE' : 'AUSENTE',
      ahora
    ];

    if (indice.has(clave)) {
      existentes[indice.get(clave)] = registro;
    } else {
      indice.set(clave, existentes.length);
      existentes.push(registro);
    }
  });

  if (hoja.getLastRow() > 1) {
    hoja.getRange(2, 1, hoja.getLastRow() - 1, 4).clearContent();
  }

  if (existentes.length > 0) {
    hoja.getRange(2, 1, existentes.length, 4).setValues(existentes);
    hoja.getRange(2, 4, existentes.length, 1)
      .setNumberFormat('yyyy-mm-dd hh:mm:ss');
  }

  marcarSesionRegistrada_(idSesion);

  const presentes = participantes.filter(p => p.presente).length;

  return {
    ok: true,
    idSesion,
    presentes,
    ausentes: participantes.length - presentes,
    total: participantes.length
  };
}

function marcarSesionRegistrada_(idSesion) {
  const ss = obtenerLibro_();
  const hoja = ss.getSheetByName(HOJAS.SESIONES);

  if (!hoja || hoja.getLastRow() < 2) return;

  const datos = hoja
    .getRange(2, 1, hoja.getLastRow() - 1, 5)
    .getValues();

  const posicion = datos.findIndex(fila => fila[0] === idSesion);

  if (posicion >= 0) {
    hoja.getRange(posicion + 2, 5).setValue('REGISTRADA');
  }
}

function obtenerReporte() {
  const ss = obtenerLibro_();
  const hojaAsis = ss.getSheetByName(HOJAS.ASISTENCIAS);
  const hojaPart = ss.getSheetByName(HOJAS.PARTICIPANTES);
  const hojaSes = ss.getSheetByName(HOJAS.SESIONES);

  if (!hojaAsis || hojaAsis.getLastRow() < 2) {
    return { porParticipante: [], porSesion: [], totalSesiones: 0 };
  }

  const asistencias = hojaAsis
    .getRange(2, 1, hojaAsis.getLastRow() - 1, 4)
    .getValues();

  const participantes = hojaPart.getLastRow() < 2 ? []
    : hojaPart.getRange(2, 1, hojaPart.getLastRow() - 1, 4).getValues();

  const sesiones = hojaSes.getLastRow() < 2 ? []
    : hojaSes.getRange(2, 1, hojaSes.getLastRow() - 1, 5).getValues();

  const totalSesiones = sesiones.length;

  const porParticipante = participantes
    .filter(p => p[3] === true)
    .map(p => {
      const presentes = asistencias.filter(a => a[1] === p[0] && a[2] === 'PRESENTE').length;
      return {
        id: p[0],
        nombre: p[1],
        presentes,
        ausentes: totalSesiones - presentes,
        porcentaje: totalSesiones > 0 ? Math.round((presentes / totalSesiones) * 100) : 0
      };
    });

  const porSesion = sesiones.map(s => {
    const regs = asistencias.filter(a => a[0] === s[0]);
    const presentes = regs.filter(a => a[2] === 'PRESENTE').length;
    return {
      id: s[0],
      numero: s[1],
      presentes,
      total: regs.length,
      porcentaje: regs.length > 0 ? Math.round((presentes / regs.length) * 100) : 0
    };
  });

  return { porParticipante, porSesion, totalSesiones };
}