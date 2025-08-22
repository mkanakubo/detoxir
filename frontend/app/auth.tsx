'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  return (
    <main>
      <h1>Welcome to Detoxir</h1>
      <a href="/auth/login">Login</a>
      <a href="/auth/logout">Logout</a>
    </main>
  );
}
