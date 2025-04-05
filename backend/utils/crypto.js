const crypto = require('crypto');

const encryptPassword = (plainPassword) => {
    try {
        // The key used in OpenSSL command was 'abracadabra'
        const key = Buffer.from('abracadabra');

        // Create cipher (same as OpenSSL command: openssl enc -aes-128-ecb -pbkdf2 -md sha256 -pass pass:abracadabra -nosalt -base64)
        const cipher = crypto.createCipheriv('aes-128-ecb', key, '');

        // Encrypt
        let encrypted = cipher.update(plainPassword, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        return encrypted;
    } catch (error) {
        console.error('Error encrypting password:', error);
        return null;
    }
};

const decryptPassword = (encryptedPassword) => {
    try {
        // The key used in OpenSSL command was 'abracadabra'
        const key = Buffer.from('abracadabra');

        // Create decipher
        const decipher = crypto.createDecipheriv('aes-128-ecb', key, '');

        // Decrypt
        let decrypted = decipher.update(encryptedPassword, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Error decrypting password:', error);
        return null;
    }
};

// Helper function to test encryption/decryption
const testEncryption = (password) => {
    console.log('Original password:', password);
    const encrypted = encryptPassword(password);
    console.log('Encrypted password:', encrypted);
    const decrypted = decryptPassword(encrypted);
    console.log('Decrypted password:', decrypted);
    return encrypted;
};

const decryptAdminPassword = () => {
    try {
        const encryptedPassword = 'a3K2hQe3K98Cm35bOw68C5ShkGIKVhev6nYL8+EGlXSSdwuTPT37wC4tmNsfaUkZ';
        const key = Buffer.from('abracadabra');

        // Create decipher with AES-128-ECB
        const decipher = crypto.createDecipheriv('aes-128-ecb', key, '');

        // Decrypt
        let decrypted = decipher.update(encryptedPassword, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        console.log('Original hash:', encryptedPassword);
        console.log('Decrypted password:', decrypted);
        return decrypted;
    } catch (error) {
        console.error('Error decrypting admin password:', error);
        return null;
    }
};

// Test the decryption
decryptAdminPassword();

module.exports = {
    encryptPassword,
    decryptPassword,
    testEncryption,
    decryptAdminPassword
}; 