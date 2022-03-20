import {
  logInWithGoogle,
  isExistingUsername,
  writeUserAndUserName
} from '../lib/firebase';
import { useContext } from 'react';
import { UserContext } from '../lib/context';
import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';

const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

export default function EnterPage() {
  const { user, username } = useContext(UserContext);
  const router = useRouter();
  if (username) router.push('/');

  return <main>{user ? !username && <UsernameForm /> : <SignInButton />}</main>;
}

function SignInButton() {
  return (
    <button
      className='btn-google'
      onClick={async () => await logInWithGoogle()}
    >
      <img src='/google.png' />
      Sign In With Google
    </button>
  );
}

function UsernameForm() {
  const [formValue, setFormValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useContext(UserContext);

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  const onChange = e => {
    setFormValue(e.target.value.toLowerCase());
    setIsLoading(true);
  };

  const onSubmit = async e => {
    e.preventDefault();
    await writeUserAndUserName(user, formValue);
  };

  const checkUsername = useCallback(
    debounce(async username => {
      if (re.test(username)) {
        const isExisted = await isExistingUsername(username);
        setIsValid(!isExisted);
      } else setIsValid(false);

      setIsLoading(false);
    }, 500),
    []
  );

  return (
    <section>
      <form onSubmit={onSubmit}>
        <input
          type='text'
          name='username'
          placeholder='Username'
          value={formValue}
          onChange={onChange}
        />
        <UsernameMessage
          username={formValue}
          isValid={isValid}
          isLoading={isLoading}
        />
        <button type='submit' className='btn-green' disabled={!isValid}>
          Choose
        </button>
      </form>

      <div>valid: {isValid.toString()}</div>
      <div>loading: {isLoading.toString()}</div>
    </section>
  );
}

function UsernameMessage({ username, isValid, isLoading }) {
  if (isLoading) return <p className='text-info'>Checking...</p>;

  if (isValid) return <p className='text-success'>{username} is available!</p>;

  if (re.test(username))
    return <p className='text-danger'>That username is taken!</p>;

  return <p className='text-info'>Please input a valid username</p>;
}
