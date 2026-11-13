import { useStore } from '@nanostores/react';
import { ShoppingBag, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { $cartCount, $user, refreshCartCount } from '../../lib/session/session';

export default function HeaderAccount() {
  const user = useStore($user);
  const count = useStore($cartCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshCartCount();
  }, [user?.email]);

  // Server render has no session; avoid a flash of the wrong state.
  if (!mounted) return <div style={{ width: 168 }} aria-hidden="true" />;

  return (
    <>
      <a className="btn btn--quiet" href={user ? '/cart' : '/login?next=/cart'} aria-label={`Cart${count ? `, ${count} items` : ''}`}>
        <ShoppingBag size={18} aria-hidden="true" />
        <span className="tnum">{count ? count : 'Cart'}</span>
      </a>
      {user ? (
        <a className="btn btn--quiet" href="/account">
          <UserRound size={18} aria-hidden="true" />
          <span>{user.firstName}</span>
        </a>
      ) : (
        <a className="btn btn--quiet" href="/login">
          Log in
        </a>
      )}
    </>
  );
}
