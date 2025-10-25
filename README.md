Angelito Secreto - Prototipo navideño (Tailwind + Firebase)

Instrucciones rápidas:

1) Requisitos:
   - Node.js v18+ recomendado
   - npm

2) Instalar:
   npm install

3) Ejecutar en desarrollo:
   npm run dev
   Abre http://localhost:5173

4) Configuración:
   Ya incluí tu firebaseConfig en src/firebase.js (la configuración que me diste).

5) Deploy (Vercel):
   - Crea repo en GitHub y sube este proyecto.
   - Conecta el repo en Vercel (Import Project).
   - Vercel detectará Vite; usa build: npm run build y Output dir: dist.
   - Si necesitas, sube vercel.json (ya incluido).

6) Seguridad:
   - Añade reglas de Firestore para proteger matches (leer sólo doc cuyo id=token) y restringir escritura.
   - Si quieres, te genero las reglas y el flujo para añadir Firebase Auth.

7) ¿Qué más quieres que haga?
   - Generar reglas de Firestore (archivo firestore.rules).
   - Crear deploy automático y con variable de entorno si necesitas.