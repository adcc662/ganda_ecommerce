import { useState } from 'react';
import { api, signOut } from '../../lib/session/session';
import { Notice, messageOf } from './ui';
import { useAuthed } from './useAuthed';

export default function Account() {
  const user = useAuthed();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  async function logoutEverywhere() {
    if (!window.confirm('Log out on every device? You will need to log in again here too.')) return;
    setBusy(true);
    try {
      await api.logoutAll();
      signOut();
      window.location.assign('/');
    } catch (e) {
      setError(messageOf(e));
      setBusy(false);
    }
  }

  return (
    <div className="account">
      <dl className="pane account__card">
        <div><dt>Name</dt><dd>{user.firstName} {user.lastName}</dd></div>
        <div><dt>Email</dt><dd>{user.email}</dd></div>
      </dl>
      <nav className="account__links" aria-label="Your account">
        <a className="btn" href="/orders">Your orders</a>
        <a className="btn" href="/sell/listings">Your listings</a>
        <a className="btn" href="/cart">Cart</a>
      </nav>
      <section className="account__session">
        <h2>Sessions</h2>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="account__actions">
          <button className="btn" onClick={() => { signOut(); window.location.assign('/'); }}>Log out</button>
          <button className="btn btn--danger" onClick={logoutEverywhere} disabled={busy}>
            {busy ? 'Logging out…' : 'Log out on every device'}
          </button>
        </div>
        <p className="meta">Use “every device” if you logged in somewhere you no longer trust.</p>
      </section>
      <style>{`
        .account { display: grid; gap: 32px; max-width: 640px; }
        .account__card { margin: 0; padding: 8px 24px; }
        .account__card div { display: grid; grid-template-columns: 100px 1fr; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--bark-rule); }
        .account__card div:last-child { border: 0; }
        .account__card dt { color: var(--lichen); }
        .account__card dd { margin: 0; color: var(--ash); }
        .account__links, .account__actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .account__session { display: grid; gap: 12px; }
        .account__session h2 { font-size: 1.25rem; }
      `}</style>
    </div>
  );
}
