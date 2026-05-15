// src/utils/hashIds.js
import { useParams } from 'react-router-dom';
import Hashids from 'hashids';

const hashids = new Hashids('maurilink-secret-key-2024', 8);

export const encodeId = (id) => {
  if (!id && id !== 0) return null;
  return hashids.encode(Number(id));
};

export const decodeId = (hashedId) => {
  if (!hashedId) return null;
  
  if (typeof hashedId === 'number') return hashedId;
  if (typeof hashedId === 'string' && /^\d+$/.test(hashedId)) {
    return parseInt(hashedId, 10);
  }
  
  try {
    const decoded = hashids.decode(hashedId);
    return decoded[0] || null;
  } catch (error) {
    console.error('Error decoding ID:', error);
    return null;
  }
};

export const useDecodedId = () => {
  const { id } = useParams();
  const decodedId = decodeId(id);
  return { 
    encodedId: id, 
    decodedId, 
    isValid: decodedId !== null && decodedId !== undefined 
  };
};