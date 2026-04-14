import bcrypt from "bcrypt";
import User from "../models/User.js";

const DEFAULT_ADMIN_EMAIL = "admin@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "123456";

async function ensureDefaultAdmin() {
  const existingUser = await User.findOne({
    where: { email: DEFAULT_ADMIN_EMAIL },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    await User.create({
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Admin padrao criado: ${DEFAULT_ADMIN_EMAIL}`);
    return;
  }

  if (existingUser.role !== "admin") {
    await existingUser.update({ role: "admin" });
    console.log(`Permissao de admin garantida para: ${DEFAULT_ADMIN_EMAIL}`);
  }
}

export default ensureDefaultAdmin;
