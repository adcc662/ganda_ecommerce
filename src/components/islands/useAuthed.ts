import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { $user, loginHref } from '../../lib/session/session';

/** Returns the user once mounted; sends visitors without a session to log in. */
export function useAuthed() {
  const user = useStore($user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (!user) window.location.replace(loginHref(window.location.pathname + window.location.search));
  }, [user]);

  return ready ? user : null;
}
