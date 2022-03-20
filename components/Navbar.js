import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '../lib/context';
import { logOut } from '../lib/firebase';

export default function Navbar() {
  const { user, username } = useContext(UserContext);

  return (
    <nav className='navbar'>
      <ul>
        <li>
          <Link href='/'>
            <button className='btn-logo'>FEED</button>
          </Link>
        </li>

        {user && (
          <li className='push-left'>
            <SignOutButton />
          </li>
        )}

        {user && username && (
          <li>
            <Link href={`/${username}`}>
              <img src={user?.photoURL} />
            </Link>
          </li>
        )}

        {!user && (
          <>
            <li>
              <Link href='/enter'>
                <button className='btn-blue'>Sign In</button>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

function SignOutButton() {
  return <button onClick={async () => await logOut()}>Sign Out</button>;
}
