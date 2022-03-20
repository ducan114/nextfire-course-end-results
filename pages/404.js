import Link from 'next/link';
import styles from '../styles/Custom404.module.css';

export default function Custom404() {
  return (
    <main className={styles.container}>
      <h1>404 - That page does not seem to exists...</h1>
      <iframe
        src='https://giphy.com/embed/l2JehQ2GitHGdVG9y'
        width='480'
        height='362'
        allowFullScreen
      ></iframe>
      <Link href='/'>
        <button className='btn-blue'>Go home</button>
      </Link>
    </main>
  );
}
