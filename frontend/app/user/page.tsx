'use client';
import { useUser } from '@auth0/nextjs-auth0';
import Image from 'next/image';

export default function Profile() {
  const { user, isLoading } = useUser();
  return (
    <>
      {isLoading && <p>Loading...</p>}
      {user && (
        <div>
          <Image
            src={user.picture ?? '/default-profile.png'}
            alt="Profile"
            width={80}
            height={80}
            style={{ borderRadius: '50%' }}
          />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
