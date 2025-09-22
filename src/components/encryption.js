/**
 * Client-side encryption utilities for secure file sharing
 * Uses Web Crypto API for AES-GCM encryption
 */

export class FileEncryption {
  
  /**
   * Generate a new AES-GCM encryption key
   * @returns {Promise<CryptoKey>} Generated encryption key
   */
  static async generateKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Export a key to raw format for storage/transmission
   * @param {CryptoKey} key - The key to export
   * @returns {Promise<ArrayBuffer>} Exported key
   */
  static async exportKey(key) {
    return await window.crypto.subtle.exportKey("raw", key);
  }

  /**
   * Import a key from raw format
   * @param {ArrayBuffer} keyData - Raw key data
   * @returns {Promise<CryptoKey>} Imported key
   */
  static async importKey(keyData) {
    return await window.crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypt file data using AES-GCM
   * @param {ArrayBuffer} data - File data to encrypt
   * @param {CryptoKey} key - Encryption key
   * @returns {Promise<{encryptedData: ArrayBuffer, iv: Uint8Array}>} Encrypted data and IV
   */
  static async encryptFile(data, key) {
    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      data
    );

    return {
      encryptedData,
      iv
    };
  }

  /**
   * Decrypt file data using AES-GCM
   * @param {ArrayBuffer} encryptedData - Encrypted file data
   * @param {CryptoKey} key - Decryption key
   * @param {Uint8Array} iv - Initialization vector
   * @returns {Promise<ArrayBuffer>} Decrypted data
   */
  static async decryptFile(encryptedData, key, iv) {
    return await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encryptedData
    );
  }

  /**
   * Convert ArrayBuffer to Base64 string for storage
   * @param {ArrayBuffer} buffer - Buffer to convert
   * @returns {string} Base64 encoded string
   */
  static arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string back to ArrayBuffer
   * @param {string} base64 - Base64 encoded string
   * @returns {ArrayBuffer} Decoded buffer
   */
  static base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Encrypt a file and prepare it for IPFS upload
   * @param {File} file - File to encrypt
   * @returns {Promise<{encryptedBuffer: ArrayBuffer, keyData: string, iv: string}>}
   */
  static async encryptFileForUpload(file) {
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Generate encryption key
      const key = await this.generateKey();
      
      // Encrypt the file
      const { encryptedData, iv } = await this.encryptFile(arrayBuffer, key);
      
      // Export key for storage
      const keyData = await this.exportKey(key);
      
      return {
        encryptedBuffer: encryptedData,
        keyData: this.arrayBufferToBase64(keyData),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('File encryption failed:', error);
      throw new Error('Failed to encrypt file: ' + error.message);
    }
  }

  /**
   * Decrypt a file downloaded from IPFS
   * @param {ArrayBuffer} encryptedData - Encrypted file data
   * @param {string} keyDataBase64 - Base64 encoded key
   * @param {string} ivBase64 - Base64 encoded IV
   * @returns {Promise<ArrayBuffer>} Decrypted file data
   */
  static async decryptFileFromDownload(encryptedData, keyDataBase64, ivBase64) {
    try {
      // Convert base64 back to ArrayBuffer
      const keyData = this.base64ToArrayBuffer(keyDataBase64);
      const iv = new Uint8Array(this.base64ToArrayBuffer(ivBase64));
      
      // Import the key
      const key = await this.importKey(keyData);
      
      // Decrypt the file
      const decryptedData = await this.decryptFile(encryptedData, key, iv);
      
      return decryptedData;
    } catch (error) {
      console.error('File decryption failed:', error);
      throw new Error('Failed to decrypt file: ' + error.message);
    }
  }

  /**
   * Generate a password-based key derivation
   * @param {string} password - User password
   * @param {Uint8Array} salt - Salt for key derivation
   * @returns {Promise<CryptoKey>} Derived key
   */
  static async deriveKeyFromPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Import password as key material
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    // Derive AES key from password
    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Check if Web Crypto API is available
   * @returns {boolean} True if Web Crypto API is supported
   */
  static isSupported() {
    return !!(window.crypto && window.crypto.subtle);
  }

  /**
   * Create a downloadable blob from decrypted data
   * @param {ArrayBuffer} decryptedData - Decrypted file data
   * @param {string} mimeType - MIME type of the file
   * @returns {Blob} Downloadable blob
   */
  static createDownloadBlob(decryptedData, mimeType) {
    return new Blob([decryptedData], { type: mimeType });
  }

  /**
   * Trigger download of decrypted file
   * @param {Blob} blob - File blob to download
   * @param {string} filename - Name for the downloaded file
   */
  static downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export convenience functions
export const {
  generateKey,
  encryptFileForUpload,
  decryptFileFromDownload,
  isSupported,
  createDownloadBlob,
  downloadBlob,
  arrayBufferToBase64,
  base64ToArrayBuffer
} = FileEncryption;

export default FileEncryption;
