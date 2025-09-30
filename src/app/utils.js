
export const getUserId = () => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('authToken');
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1]; // JWT payload
    const decoded = JSON.parse(atob(payloadBase64));
    console.log('Decoded JWT:', decoded.UserId);
    return decoded.UserId;
  } catch (err) {
    console.error('Invalid token', err);
    return null;
  }
};

