import { useStore } from '@nanostores/react';
import { ShoppingBag, UserRound } from 'lucide-react';
import { $cartCount } from '../../lib/session/session';

interface Props {
  /** First name of the logged-in user, or null for visitors. Rendered on the server from the session. */
  firstName: string | null;
  /** Cart units when the page was rendered. */
  count: number | null;
}

export default function HeaderAccount({ firstName, count: rendered }: Props) {
  // A cart change on this page (add to cart, cart view) updates the store; until then show the server's count.
  const changed = useStore($cartCount);
  const count = changed ?? rendered;

  return (
    <>
      <a className="btn btn--quiet" href="/cart" aria-label={`Cart${count ? `, ${count} items` : ''}`}>
        <ShoppingBag size={18} aria-hidden="true" />
        {count ? <span className="tnum">{count}</span> : <span className="cart-word">Cart</span>}
      </a>
      {firstName ? (
        <a className="btn btn--quiet" href="/account">
          <UserRound size={18} aria-hidden="true" />
          <span>{firstName}</span>
        </a>
      ) : (
        <a className="btn btn--quiet" href="/login">
          Log in
        </a>
      )}
    </>
  );
}
