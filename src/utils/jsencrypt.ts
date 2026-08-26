import { JSEncrypt } from "jsencrypt";

export type TextCipher = {
  encrypt: (plain: string) => string | false;
  decrypt: (cipher: string) => string | false;
};

/**
 * Remember-me cookies are encrypted with this frontend RSA pair so the
 * password is not stored in plaintext. The private key is bundled with the
 * client, so this is obfuscation, not transport security, and does not
 * replace HTTPS or backend password hashing.
 */
export const REMEMBER_ME_PUBLIC_KEY =
  "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH\n" +
  "nzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ==";

export const REMEMBER_ME_PRIVATE_KEY =
  "MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAqhHyZfSsYourNxaY\n" +
  "7Nt+PrgrxkiA50efORdI5U5lsW79MmFnusUA355oaSXcLhu5xxB38SMSyP2KvuKN\n" +
  "PuH3owIDAQABAkAfoiLyL+Z4lf4Myxk6xUDgLaWGximj20CUf+5BKKnlrK+Ed8gA\n" +
  "kM0HqoTt2UZwA5E2MzS4EI2gjfQhz5X28uqxAiEA3wNFxfrCZlSZHb0gn2zDpWow\n" +
  "cSxQAgiCstxGUoOqlW8CIQDDOerGKH5OmCJ4Z21v+F25WaHYPxCFMvwxpcw99Ecv\n" +
  "DQIgIdhDTIqD2jfYjPTY8Jj3EDGPbH2HHuffvflECt3Ek60CIQCFRlCkHpi7hthh\n" +
  "YhovyloRYsM+IS9h/0BzlEAuO0ktMQIgSPT3aFAgJYwKpqRYKlLDVcflZFCKY7u3\n" +
  "UP8iWi1Qw0Y=";

export function createRsaCipher(publicKey = REMEMBER_ME_PUBLIC_KEY, privateKey = REMEMBER_ME_PRIVATE_KEY): TextCipher {
  return {
    encrypt(plain) {
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(publicKey);
      return encryptor.encrypt(plain);
    },
    decrypt(cipher) {
      const encryptor = new JSEncrypt();
      encryptor.setPrivateKey(privateKey);
      return encryptor.decrypt(cipher);
    },
  };
}

export const rememberMeCipher = createRsaCipher();

export function encrypt(plain: string): string | false {
  return rememberMeCipher.encrypt(plain);
}

export function decrypt(cipher: string): string | false {
  return rememberMeCipher.decrypt(cipher);
}
