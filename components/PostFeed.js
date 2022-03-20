import { serverTimestamp } from 'firebase/firestore';
import kebabCase from 'lodash.kebabcase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { UserContext } from '../lib/context';
import { createPost } from '../lib/firebase';

export default function PostFeed({ posts, admin }) {
  return (
    <>
      {posts &&
        posts.map(post => (
          <PostItem post={post} key={post.slug} admin={admin} />
        ))}

      {admin && <CreatePost />}
    </>
  );
}

function PostItem({ post, admin = false }) {
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);

  return (
    <div className='card'>
      <Link href={`/${post.username}`}>
        <a>
          <strong>By @{post.username}</strong>
        </a>
      </Link>

      <Link href={`/${post.username}/${post.slug}`}>
        <h2>
          <a>{post.title}</a>
        </h2>
      </Link>

      <footer>
        <span>
          {wordCount} words. {minutesToRead} min read
        </span>

        <span className='push-left'>❤️ {post.heartCount} Hearts</span>
      </footer>
    </div>
  );
}

function CreatePost() {
  const router = useRouter();
  const { user, username } = useContext(UserContext);
  const [title, setTitle] = useState('');

  const slug = encodeURI(kebabCase(title));
  const isValid = title.length > 3 && title.length < 100;

  const createNewPost = async e => {
    e.preventDefault();
    const data = {
      title,
      slug,
      uid: user.uid,
      published: false,
      content: '# Hello world!',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
      username
    };

    await createPost(user.uid, slug, data);

    toast.success('Post created!');
    router.push(`/${username}/${slug}`);
  };

  return (
    <form onSubmit={createNewPost}>
      <input
        className='post-input'
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder='Post title'
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type='submit' className='btn-green' disabled={!isValid}>
        Create new post
      </button>
    </form>
  );
}
