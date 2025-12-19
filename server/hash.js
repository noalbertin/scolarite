import bcrypt from "bcrypt";

const password = "Jean123";

const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);

console.log(hash);
