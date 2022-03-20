import { useState } from 'react';
import { getPosts } from '../lib/firebase';
import PostFeed from '../components/PostFeed';
import Loader from '../components/Loader';
import Metatags from '../components/Metatags';

const LIMIT = 1;

export async function getServerSideProps() {
  const { posts, postsEnd } = await getPosts(LIMIT);
  return {
    props: { posts, postsEnd }
  };
}

export default function HomePage(props) {
  const [posts, setPosts] = useState(props.posts);
  const [isLoading, setIsLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(props.postsEnd);

  const getMorePosts = async () => {
    setIsLoading(true);
    const lastPost = posts[posts.length - 1];

    const { posts: newPosts, postsEnd: isEnded } = await getPosts(
      LIMIT,
      lastPost
    );

    setPosts(posts.concat(newPosts));

    setPostsEnd(isEnded);
    setIsLoading(false);
  };

  return (
    <main>
      <Metatags title='Home' />
      <PostFeed posts={posts} />

      {!isLoading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={isLoading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  );
}
