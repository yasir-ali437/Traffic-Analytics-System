import { EncryptStorage } from "encrypt-storage";

export const encryptStorage = new EncryptStorage(
  process.env.REACT_APP_Encrypt_Storage_SECRET_KEY,
  {
    prefix: "@optra",
  }
);
