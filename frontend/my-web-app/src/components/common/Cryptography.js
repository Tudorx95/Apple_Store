const SECRET_KEY = '1234567890abcdef1234567890abcdef';

const bufferToBase64 = (buffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper function to convert a base64 string back to an array buffer
const base64ToBuffer = (base64) => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const hexToBuffer = (hex) => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  return bytes.buffer;
};

// Use this key for encryption and decryption
// Dynamic random generator on server
// Function to fetch the encryption key from the server securely
const fetchEncryptionKey = async (route) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/${route}`, { method: "GET" });
    const data = await response.json();
    return data.key;  // here key is in hex format
  } catch (error) {
    console.error("Error fetching encryption key:", error);
    return null;
  }
};

const cryptKey = async () => {
  const keyHex = await fetchEncryptionKey('encryption-key');
  if (!keyHex) return console.error("Encryption key not available");
  const keyBuffer = hexToBuffer(keyHex);

  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  return key;
};

const descryptKey = async () => {
  const keyHex = await fetchEncryptionKey('decryption-key');
  if (!keyHex) return console.error("Encryption key not available");
  const keyBuffer = hexToBuffer(keyHex);

  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  return key;
};

// Encryption/Decryption using AES/GCM (Galois/Counter Mode)
// Function to encrypt product data
const encryptData = async (data) => {
  const key = await cryptKey();
  if (!key) return console.error("Encryption key not available");

  const encoder = new TextEncoder();  // convert the JS object into a readable format
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization a random initialization vector (IV)
  const encodedData = encoder.encode(JSON.stringify(data));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },  // iv is unique; Specify encryption algorithm and IV
    key,
    encodedData
  );

  const encryptedData = bufferToBase64(encrypted);
  const ivBase64 = bufferToBase64(iv);

  return { encryptedData, iv: ivBase64 };
};

// Function to decrypt product data
const decryptData = async (encryptedData, ivBase64) => {
  const key = await descryptKey();
  if (!key) return console.error("Decryption key not available");

  const decoder = new TextDecoder();  // convert binary data into readable json format 
  const iv = base64ToBuffer(ivBase64);
  const encryptedBuffer = base64ToBuffer(encryptedData);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBuffer
  );

  return JSON.parse(decoder.decode(decrypted));
};

export { bufferToBase64, base64ToBuffer, encryptData, decryptData };