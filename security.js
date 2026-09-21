(() => {
  const authConfig = { apiKey: 'AIzaSyCLWf5X5fKnjpHnSxBB5Kgdd-VmdMJuOVA', authDomain: 'pendientes-6c0c8.firebaseapp.com', projectId: 'pendientes-6c0c8' };
  const initializeApp = firebase.initializeApp.bind(firebase);
  firebase.initializeApp = (config, ...args) => initializeApp({ ...config, ...authConfig }, ...args);
  const style = document.createElement('style');
  style.textContent = '#authGate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:linear-gradient(135deg,#0f172a,#312e81)}#authCard{width:min(100%,420px);background:#fff;border-radius:20px;padding:32px;box-shadow:0 24px 60px #0008}#authCard input{width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;margin-top:6px}#authCard button{width:100%;border:0;border-radius:10px;padding:11px;font-weight:700;cursor:pointer}#authError{min-height:20px;color:#be123c;font-size:12px;margin-top:12px}body:not(.is-admin) #btnOpenEditMaster,body:not(.is-admin) #btnQuickEditMaster,body:not(.is-admin) #btnClearMaster,body:not(.is-admin) #btnAddMasterRecord,body:not(.is-admin) button[onclick^=editMasterEntry],body:not(.is-admin) button[onclick^=deleteMasterEntry],body:not(.is-admin) button[onclick^=quickLinkDestino]{display:none!important}';
  document.head.appendChild(style);
  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', '<section id="authGate"><form id="authCard"><div style="width:42px;height:42px;border-radius:12px;background:#4f46e5;color:#fff;display:grid;place-items:center;margin-bottom:16px"><i class="fa-solid fa-shield-halved"></i></div><h2 style="font-size:20px;font-weight:800;color:#0f172a">Acceso autorizado</h2><p style="font-size:13px;color:#64748b;margin:6px 0 18px">Ingresa con tu correo y contraseña asignados.</p><label style="font-size:12px;font-weight:700;color:#334155">Correo electrónico<input id="authEmail" type="email" autocomplete="email" required></label><label style="font-size:12px;font-weight:700;color:#334155;display:block;margin-top:12px">Contraseña<input id="authPassword" type="password" autocomplete="current-password" required></label><button style="background:#4f46e5;color:#fff;margin-top:18px" type="submit">Iniciar sesión</button><button id="forgotPassword" style="background:transparent;color:#4f46e5;margin-top:8px" type="button">¿Olvidaste tu contraseña?</button><button id="guestAccess" style="background:#eef2ff;color:#3730a3;margin-top:8px" type="button">Usuario invitado</button><p id="authError"></p></form></section>');
    const gate = document.getElementById('authGate'), error = document.getElementById('authError'), auth = firebase.auth();
    const roleRef = uid => firebase.database().ref('roles/' + uid);
    const signOut = async () => { await auth.signOut(); location.reload(); };
    document.getElementById('guestAccess').addEventListener('click', () => {
      gate.remove();
      const status = document.getElementById('masterStatusText');
      if (status) status.textContent = 'Modo invitado: cargando Base Maestra de solo lectura...';
      if (typeof loadMasterFromFirebase === 'function') loadMasterFromFirebase();
    });
    document.getElementById('authCard').addEventListener('submit', async event => {
      event.preventDefault(); error.textContent = '';
      try { await auth.signInWithEmailAndPassword(document.getElementById('authEmail').value.trim(), document.getElementById('authPassword').value); }
      catch (e) { error.textContent = 'No fue posible iniciar sesión. Revisa tus datos.'; }
    });
    document.getElementById('forgotPassword').addEventListener('click', async () => {
      const email = document.getElementById('authEmail').value.trim();
      if (!email) { error.textContent = 'Escribe primero tu correo electrónico.'; return; }
      try { await auth.sendPasswordResetEmail(email); error.style.color = '#047857'; error.textContent = 'Te enviamos instrucciones para restablecer tu contraseña.'; }
      catch (e) { error.textContent = 'No fue posible enviar el correo de recuperación.'; }
    });
    auth.onAuthStateChanged(async user => {
      if (!user) return;
      const role = (await roleRef(user.uid).once('value')).val();
      if (role !== 'admin' && role !== 'user') { error.textContent = 'Tu cuenta no tiene acceso autorizado.'; await auth.signOut(); return; }
      document.body.classList.toggle('is-admin', role === 'admin'); gate.remove();
      const session = document.createElement('div');
      session.className = 'fixed bottom-4 left-4 z-40 bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg';
      session.innerHTML = '<strong>' + (role === 'admin' ? 'Admin' : 'User') + '</strong> · ' + user.email + ' <button id="logoutButton" class="ml-2 underline">Salir</button>';
      document.body.appendChild(session); document.getElementById('logoutButton').addEventListener('click', signOut);
      if (typeof loadMasterFromFirebase === 'function') loadMasterFromFirebase();
    });
  });
})();
