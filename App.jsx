
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

function shortId(){ return Math.random().toString(36).slice(2,8).toUpperCase(); }

function Snow(){ 
  // Render several snowflakes with random positions/animations
  const flakes = Array.from({length:22}).map((_,i)=>({id:i, left:Math.random()*100, delay:Math.random()*10, dur:5+Math.random()*10, size:8+Math.random()*10}));
  return (
    <div className="snow" aria-hidden>
      {flakes.map(f => (
        <div key={f.id} className="flake" style={{left: f.left + '%', animationDuration: f.dur + 's', animationDelay: f.delay + 's', fontSize: f.size + 'px'}}>❄</div>
      ))}
    </div>
  )
}

export default function App(){
  const [view,setView] = useState('welcome'); // welcome, home, create, join, my-result, admin
  // create
  const [groupName, setGroupName] = useState('');
  const [created, setCreated] = useState(null);

  // join form
  const [joinId, setJoinId] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [budget, setBudget] = useState('');
  const [myToken, setMyToken] = useState(localStorage.getItem('secretmatch_token') || '');
  const [myMatch, setMyMatch] = useState(null);

  // admin
  const [adminGroupId, setAdminGroupId] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Animations
  useEffect(()=>{ if(view==='welcome'){ const t=setTimeout(()=>setView('home'), 1800); return ()=>clearTimeout(t); } }, [view]);

  async function createGroup(){
    const id = shortId();
    const pass = shortId();
    const gRef = doc(db, 'groups', id);
    await setDoc(gRef, { name: groupName || 'Angelito Secreto', createdAt: Date.now(), adminPass: pass });
    setCreated({ id, pass });
    setGroupName('');
    setView('created');
  }

  async function addParticipant(gid){
    if(!gid) return alert('Ingresa el ID del grupo');
    if(!nickname) return alert('El seudónimo es obligatorio');
    const token = uuidv4();
    const p = { name, nickname, size, color, budget, token, createdAt: Date.now() };
    await addDoc(collection(db, 'groups', gid, 'participants'), p);
    localStorage.setItem('secretmatch_token', token);
    setMyToken(token);
    setName(''); setNickname(''); setSize(''); setColor(''); setBudget('');
    alert('Perfil agregado. Guarda tu token: ' + token);
  }

  async function generateMatches(gid, pass){
    if(!gid) return alert('Ingresa el ID del grupo');
    const gRef = doc(db, 'groups', gid);
    const gSnap = await getDoc(gRef);
    if(!gSnap.exists()) return alert('Grupo no encontrado');
    const data = gSnap.data();
    if(data.adminPass !== pass) return alert('Contraseña admin incorrecta');
    const partsSnap = await getDocs(collection(db, 'groups', gid, 'participants'));
    const arr = partsSnap.docs.map(d => ({ id:d.id, ...d.data() }));
    if(arr.length<2) return alert('Se necesitan al menos 2 participantes');
    const shuffled = arr.slice().sort(()=>0.5 - Math.random());
    const matches = {};
    for(let i=0;i<shuffled.length;i++){
      const giver = shuffled[i];
      const receiver = shuffled[(i+1)%shuffled.length];
      matches[giver.token] = {
        receiverId: receiver.id,
        receiverNickname: receiver.nickname,
        receiverName: receiver.name,
        receiverSize: receiver.size,
        receiverColor: receiver.color,
        receiverBudget: receiver.budget
      };
    }
    const matchesCol = collection(db, 'groups', gid, 'matches');
    const prev = await getDocs(matchesCol);
    const batch = writeBatch(db);
    prev.docs.forEach(d => batch.delete(doc(db, 'groups', gid, 'matches', d.id)));
    await batch.commit();
    for(const token in matches){
      await setDoc(doc(db, 'groups', gid, 'matches', token), matches[token]);
    }
    alert('Emparejamientos generados. Cada participante podrá ver solo su destinatario con su token.');
  }

  async function viewMyMatch(gid, token){
    if(!gid || !token) return alert('Necesitas ID del grupo y tu token');
    const mRef = doc(db, 'groups', gid, 'matches', token);
    const mSnap = await getDoc(mRef);
    if(!mSnap.exists()) return alert('Aún no hay emparejamiento para este token o token inválido');
    setMyMatch(mSnap.data());
    setView('my-result');
  }

  return (
    <div className="min-h-screen p-6">
      <Snow />
      <header className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-vino text-white text-xl shadow-lg">🎄</div>
          <div>
            <h1 className="text-2xl font-semibold mont text-vino">Angelito Secreto</h1>
            <p className="text-sm text-gray-600">Intercambio de regalos - privado y sencillo</p>
          </div>
        </div>
        <nav className="space-x-2">
          <button className="px-3 py-2 rounded-md bg-[#f8e6d6] text-[#7b1026] font-medium" onClick={()=>setView('home')}>Inicio</button>
          <button className="px-3 py-2 rounded-md bg-[#e9f6f1] text-[#0b3d2e] font-medium" onClick={()=>setView('create')}>Crear grupo</button>
          <button className="px-3 py-2 rounded-md bg-[#fff3e6] text-[#7b1026] font-medium" onClick={()=>setView('join')}>Unirme / Ver resultado</button>
          <button className="px-3 py-2 rounded-md bg-[#fff] text-[#7b1026] font-medium" onClick={()=>setView('admin')}>Panel admin</button>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto mt-8">
        {view==='welcome' && (
          <section className="bg-white/70 rounded-2xl p-8 shadow-xl text-center">
            <h2 className="text-3xl font-semibold text-vino mont">Angelito Secreto 🎁</h2>
            <p className="mt-2 text-gray-700">¡Organiza tu intercambio navideño en segundos!</p>
            <button className="mt-6 px-6 py-3 rounded-full bg-vino text-white font-semibold" onClick={()=>setView('home')}>Entrar</button>
          </section>
        )}

        {view==='home' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-pino">Cómo funciona</h3>
              <ol className="mt-3 list-decimal list-inside text-sm text-gray-700">
                <li>Crea un grupo y comparte el ID.</li>
                <li>Cada familiar agrega su perfil y guarda su token.</li>
                <li>Cuando estés listo, genera emparejamientos (admin).</li>
                <li>Cada participante ve solo a quién le tocó.</li>
              </ol>
            </div>
            <div className="bg-white/80 p-6 rounded-xl shadow-md flex flex-col justify-center items-center">
              <h3 className="text-xl font-semibold text-vino">Consejo</h3>
              <p className="text-sm text-gray-700">Usa nombres reales en el admin y seudónimos visibles para mantener la sorpresa.</p>
            </div>
          </section>
        )}

        {view==='create' && (
          <section className="mt-6 bg-white/90 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-vino">Crear grupo</h2>
            <input className="mt-3 p-2 border rounded w-full" placeholder="Nombre del grupo" value={groupName} onChange={e=>setGroupName(e.target.value)} />
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-vino text-white rounded" onClick={createGroup} disabled={!groupName}>Crear</button>
              <button className="px-4 py-2 bg-[#fff3e6] text-[#7b1026] rounded" onClick={()=>{setGroupName(''); setView('home')}}>Cancelar</button>
            </div>
            {created && (
              <div className="mt-4 p-3 bg-[#fff8f0] border rounded text-sm">
                <strong>ID:</strong> {created.id} <br/> <strong>Contraseña admin:</strong> {created.pass}
              </div>
            )}
          </section>
        )}

        {view==='join' && (
          <section className="mt-6 bg-white/90 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-vino">Unirme y crear mi perfil</h2>
            <input className="mt-3 p-2 border rounded w-full" placeholder="ID del grupo" value={joinId} onChange={e=>setJoinId(e.target.value)} />
            <input className="mt-3 p-2 border rounded w-full" placeholder="Nombre real" value={name} onChange={e=>setName(e.target.value)} />
            <input className="mt-3 p-2 border rounded w-full" placeholder="Seudónimo (visible)" value={nickname} onChange={e=>setNickname(e.target.value)} />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <input className="p-2 border rounded w-full" placeholder="Talla" value={size} onChange={e=>setSize(e.target.value)} />
              <input className="p-2 border rounded w-full" placeholder="Color favorito" value={color} onChange={e=>setColor(e.target.value)} />
            </div>
            <input className="mt-3 p-2 border rounded w-full" placeholder="Presupuesto sugerido" value={budget} onChange={e=>setBudget(e.target.value)} />
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-pino text-white rounded" onClick={()=>addParticipant(joinId)} disabled={!joinId || !nickname}>Agregar mi perfil</button>
              <button className="px-4 py-2 bg-[#fff3e6] text-[#7b1026] rounded" onClick={()=>{setJoinId(''); setName(''); setNickname(''); setSize(''); setColor(''); setBudget('');}}>Limpiar</button>
            </div>

            <hr className="my-4" />
            <h3 className="text-lg font-medium text-vino">Ver mi destinatario</h3>
            <p className="text-sm text-gray-600">Si guardaste tu token en este navegador se rellenará automáticamente.</p>
            <input className="mt-2 p-2 border rounded w-full" placeholder="Token" value={myToken} onChange={e=>setMyToken(e.target.value)} />
            <div className="mt-3">
              <button className="px-4 py-2 bg-[#fff3e6] text-[#7b1026] rounded" onClick={()=>viewMyMatch(joinId, myToken)} disabled={!joinId || !myToken}>Ver a quién le tocó</button>
            </div>
          </section>
        )}

        {view==='my-result' && myMatch && (
          <section className="mt-6 bg-white/95 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-vino">Tu destinatario</h2>
            <div className="mt-3">
              <p><strong>Seudónimo:</strong> {myMatch.receiverNickname}</p>
              <p><strong>Nombre:</strong> {myMatch.receiverName}</p>
              <p><strong>Talla:</strong> {myMatch.receiverSize}</p>
              <p><strong>Color favorito:</strong> {myMatch.receiverColor}</p>
              <p><strong>Presupuesto sugerido:</strong> {myMatch.receiverBudget}</p>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-vino text-white rounded" onClick={()=>{ setView('home'); setMyMatch(null); }}>Volver</button>
            </div>
          </section>
        )}

        {view==='admin' && (
          <section className="mt-6 bg-white/90 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-vino">Panel admin</h2>
            <p className="text-sm text-gray-600">El admin no verá perfiles; solo puede generar emparejamientos.</p>
            <input className="mt-3 p-2 border rounded w-full" placeholder="ID del grupo" value={adminGroupId} onChange={e=>setAdminGroupId(e.target.value)} />
            <input className="mt-3 p-2 border rounded w-full" placeholder="Contraseña admin" value={adminPass} onChange={e=>setAdminPass(e.target.value)} />
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-vino text-white rounded" onClick={()=>generateMatches(adminGroupId, adminPass)} disabled={!adminGroupId || !adminPass}>Generar emparejamientos</button>
              <button className="px-4 py-2 bg-[#fff3e6] text-[#7b1026] rounded" onClick={()=>{ setAdminGroupId(''); setAdminPass(''); }}>Limpiar</button>
            </div>
          </section>
        )}

      </main>

      <footer className="max-w-3xl mx-auto mt-10 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Angelito Secreto — Prototipo navideño</p>
      </footer>
    </div>
  )
}
