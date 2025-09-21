// Helper function to decode JWT token
export const decodeJWT = (token) => {
    try {
        // Split the token into parts
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }

        // Decode the payload (second part)
        const payload = parts[1];
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};


// Helper function to safely render user/poster information
export const renderPostedBy = (postedByData) => {
    if (!postedByData) return 'HR Team';
    if (typeof postedByData === 'string') return postedByData;
    if (typeof postedByData === 'object') {
        return postedByData.name || postedByData.email || 'HR Team';
    }
    return 'HR Team';
};