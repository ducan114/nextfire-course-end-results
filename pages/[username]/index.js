import UserProfile from '../../components/UserProfile';
import PostFeed from '../../components/PostFeed';
import {
  getUidWithUsername,
  getUserAndRecentPosts,
  getUserPostsQuery
} from '../../lib/firebase';
import Metatags from '../../components/Metatags';
import { useContext } from 'react';
import { UserContext } from '../../lib/context';
import { useCollection } from 'react-firebase-hooks/firestore';

export async function getServerSideProps({ query }) {
  const { username } = query;
  const { user, posts } = await getUserAndRecentPosts(username, 5);

  if (!user) return { notFound: true };

  const uid = await getUidWithUsername(username);

  return {
    props: { user, posts, uid }
  };
}

export default function UserProfilePage({ user, posts, uid }) {
  const { username } = useContext(UserContext);
  const [querySnapshot] = useCollection(getUserPostsQuery(uid));
  const admin = user.username == username;
  const realtimePosts = querySnapshot?.docs.map(doc => doc.data());

  return (
    <main>
      <Metatags title={user.displayName} />
      <UserProfile user={user} />
      <PostFeed posts={admin ? realtimePosts : posts} admin={admin} />
    </main>
  );
}
