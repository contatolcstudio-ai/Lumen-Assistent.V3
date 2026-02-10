
import React from 'react';
import { Navigate } from 'react-router-dom';

// Este componente foi descontinuado e as Artes Universais foram integradas em Marketing.tsx
// Redirecionando para o novo Marketing Central.
export default function SocialArt() {
  return <Navigate to="/marketing" replace />;
}
