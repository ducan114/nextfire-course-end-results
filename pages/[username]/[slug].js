import { getPost, getPostPaths, getPostRef } from '../../lib/firebase';
import PostContent from '../../components/PostContent';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import styles from '../../styles/PostPage.module.css';
import Metatags from '../../components/Metatags';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { serverTimestamp, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useContext, useState } from 'react';
import { UserContext } from '../../lib/context';
import ImageUploader from '../../components/ImageUploader';
import HeartButton from '../../components/HeartButton';
import Link from 'next/link';

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const { post, path } = await getPost(username, slug);

  if (!post) return { notFound: true };

  return {
    props: { post, path },
    revalidate: 5000
  };
}

export async function getStaticPaths() {
  const paths = await getPostPaths();
  return {
    paths,
    fallback: 'blocking'
  };
}

export default function PostPage({ post, path }) {
  const { username, user } = useContext(UserContext);
  const postRef = getPostRef(path);
  const [realtimePost] = useDocumentData(postRef);
  const actualPost = realtimePost || post;
  const admin = post.username == username;

  return (
    <main className={styles.container}>
      <Metatags title={actualPost.title} />
      {admin ? (
        <PostManager post={post} postRef={postRef} />
      ) : (
        <>
          <section>
            <PostContent post={actualPost} />
          </section>
          <aside className='card'>
            <p>
              <strong>{actualPost.heartCount || 0} ❤️</strong>
            </p>
            {user ? (
              <HeartButton postRef={postRef} />
            ) : (
              <Link href='/enter'>
                <button className='btn-blue'>Sign up to heart</button>
              </Link>
            )}
          </aside>
        </>
      )}
    </main>
  );
}

function PostManager({ post, postRef }) {
  const [preview, setPreview] = useState(false);

  return (
    post && (
      <>
        <section>
          <h1>{post.title}</h1>
          <p>ID: {post.slug}</p>
          <PostForm postRef={postRef} defaultValues={post} preview={preview} />
        </section>
        <aside>
          <h3>Tools</h3>
          <button onClick={() => setPreview(!preview)}>
            {preview ? 'Edit' : 'Preview'}
          </button>
        </aside>
      </>
    )
  );
}

function PostForm({ defaultValues, postRef, preview }) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: 'onChange'
  });

  const { isValid, isDirty, errors } = formState;

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp()
    });

    reset({ content, published });

    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className='card'>
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register('content', {
            maxLength: {
              value: 20000,
              message: 'Content is too long'
            },
            minLength: {
              value: 10,
              message: 'Content is too short'
            },
            required: {
              value: true,
              message: 'Content is required'
            }
          })}
        ></textarea>

        {errors.content && (
          <p className='text-danger'>{errors.content.message}</p>
        )}

        <fieldset>
          <input
            className={styles.checkbox}
            type='checkbox'
            {...register('published')}
          />
          <label>Published</label>
        </fieldset>

        <button
          type='submit'
          className='btn-green'
          disabled={!isDirty || !isValid}
        >
          Save changes
        </button>
      </div>
    </form>
  );
}
