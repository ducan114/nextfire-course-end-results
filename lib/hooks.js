import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    let unsubscribe;

    if (user) {
      unsubscribe = onSnapshot(doc(firestore, 'users', user.uid), doc =>
        setUsername(doc.data()?.username)
      );
    } else setUsername(null);

    return unsubscribe;
  }, [user]);

  return { user, username };
}
