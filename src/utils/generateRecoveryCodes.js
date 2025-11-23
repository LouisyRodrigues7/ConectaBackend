import bcrypt from "bcryptjs";

export function generateRecoveryCodes() {
  const codes = [];
  const hashedCodes = [];

  for (let i = 0; i < 4; i++) {
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // código 4 dígitos
    const hashed = bcrypt.hashSync(code, 10);

    codes.push(code);         // estes retornam para o usuário
    hashedCodes.push(hashed); // estes vão para o banco
  }

  return { codes, hashedCodes };
}
