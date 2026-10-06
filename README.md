# Control de Asistencia — Apps Script

## Objetivo
Web App responsive para controlar la asistencia de 30 participantes
durante 10 sesiones, con Google Sheets como almacenamiento y Google
Apps Script como backend.

## Arquitectura
```
Agente IA (OpenCode) -> VS Code -> Git/GitHub + clasp
     -> Google Apps Script -> Google Sheets
     -> Web App -> Dispositivo móvil
```

## Tecnologías
- Node.js (LTS)
- @google/clasp 3.4.1
- Google Apps Script (V8)
- Google Sheets
- HTML/CSS/JavaScript (mobile-first)
- Git + GitHub
- OpenCode (agente de IA)

## Archivos del proyecto
| Archivo | Responsabilidad |
|---|---|
| Code.gs | Punto de entrada doGet() |
| Config.gs | SPREADSHEET_ID y nombres de hojas |
| Setup.gs | prepararBaseDatos() |
| Asistencia.gs | obtenerSesiones, obtenerParticipantes, guardarAsistencia |
| index.html | Interfaz mobile-first |
| appsscript.json | Manifiesto |

## Instalación
```bash
npm install -g @google/clasp@latest
clasp login
clasp clone SCRIPT_ID
clasp push
```

## Ejecución inicial
1. Editar SPREADSHEET_ID en Config.gs
2. clasp push
3. clasp open-script
4. Ejecutar prepararBaseDatos() y autorizar permisos
5. Verificar las 3 hojas en BD_Control_Asistencia

## Publicación
Implementar > Implementaciones de prueba > Aplicación web -> URL /dev
Implementar > Nueva implementación -> URL /exec

## Comandos Git
```bash
git init
git add .
git commit -m "mensaje"
git push origin main
git tag v1.0
git push origin v1.0
```

## Uso del agente de IA
- Se utilizó OpenCode como agente dentro de VS Code.
- El agente generó los archivos .gs e index.html a partir de una
  especificación previa.
- Todos los cambios fueron revisados con `git diff` antes de
  aceptarlos.
- Se ejecutaron pruebas manuales: 25/30 presentes, sin duplicados,
  y prueba desde dispositivo móvil.
- El agente NO tuvo acceso a credenciales; .clasprc.json está en
  .gitignore.

## Estado
Versión funcional v1.0.