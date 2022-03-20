import { getApps, initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import {
  getFirestore,
  collection,
  where,
  query,
  limit,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  orderBy,
  collectionGroup,
  Timestamp,
  startAfter,
  setDoc
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';

const firebaseConfigs = {
  apiKey: 'AIzaSyBgAzOnDzRyXIosMTx9lz6ojs0NOSeLUD8',
  authDomain: 'nextfire-14122.firebaseapp.com',
  projectId: 'nextfire-14122',
  storageBucket: 'nextfire-14122.appspot.com',
  messagingSenderId: '290781658231',
  appId: '1:290781658231:web:7dfe14958b0989c0e89a72',
  measurementId: 'G-FRW8M1HQFH'
};

let app;

if (!getApps().length) {
  app = initializeApp(firebaseConfigs);
}

export const auth = getAuth(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);

export async function getUserWithUsername(username) {
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('username', '==', username), limit(1));
  const userDoc = (await getDocs(q)).docs[0];
  return userDoc;
}

export function postToJSON(doc) {
  const data = doc.data();
  if (!data) return null;

  return {
    ...data,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt.toMillis()
  };
}

export async function logInWithGoogle() {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (err) {}
}

export async function logOut() {
  await signOut(auth);
}

export async function isExistingUsername(username) {
  const ref = doc(firestore, 'usernames', username);
  return (await getDoc(ref)).exists();
}

export async function writeUserAndUserName(user, username) {
  try {
    const batch = writeBatch(firestore);
    const userRef = doc(firestore, 'users', user.uid);
    const usernameRef = doc(firestore, 'usernames', username);

    batch.set(userRef, {
      username,
      photoURL: user.photoURL,
      displayName: user.displayName
    });
    batch.set(usernameRef, { uid: user.uid });

    await batch.commit();
  } catch (err) {}
}

export async function getUserAndRecentPosts(username, lim) {
  const userDoc = await getUserWithUsername(username);

  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();
    const postQuery = query(
      collection(userDoc.ref, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(lim)
    );

    posts = (await getDocs(postQuery)).docs.map(postToJSON);
  }

  return { user, posts };
}

export async function getPosts(lim, lastPost = null) {
  const constrants = [
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(lim + 1)
  ];

  if (lastPost) {
    const cursor =
      typeof lastPost.createdAt == 'number'
        ? Timestamp.fromMillis(lastPost.createdAt)
        : lastPost.createdAt;
    constrants.push(startAfter(cursor));
  }

  const postsQuery = query(collectionGroup(firestore, 'posts'), ...constrants);

  const posts = (await getDocs(postsQuery)).docs.map(postToJSON);
  const postsEnd = posts.length < lim + 1;

  if (!lastPost || !postsEnd) posts.pop();

  return { posts, postsEnd };
}

export async function getPost(username, slug) {
  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = doc(userDoc.ref, 'posts', slug);
    const postDoc = await getDoc(postRef);

    if (postDoc) {
      post = postToJSON(postDoc);
      path = postRef.path;
    }
  }

  return { post, path };
}

export async function getPostPaths() {
  const paths = (await getDocs(collectionGroup(firestore, 'posts'))).docs.map(
    doc => {
      const { username, slug } = doc.data();
      return { params: { username, slug } };
    }
  );

  return paths;
}

export function getPostRef(path) {
  return doc(firestore, path);
}

export function getUserPostsQuery(uid) {
  const ref = collection(doc(collection(firestore, 'users'), uid), 'posts');
  const postsQuery = query(ref, orderBy('createdAt', 'desc'));
  return postsQuery;
}

export async function createPost(uid, slug, data) {
  const ref = doc(
    collection(doc(collection(firestore, 'users'), uid), 'posts'),
    slug
  );
  await setDoc(ref, data);
}

export async function getUidWithUsername(username) {
  const ref = doc(collection(firestore, 'usernames'), username);
  return (await getDoc(ref)).data().uid;
}
