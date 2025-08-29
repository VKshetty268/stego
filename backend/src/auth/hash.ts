import bcrypt from "bcrypt";
export const hash = (s: string) => bcrypt.hash(s, 12);
export const verify = (s: string, h: string) => bcrypt.compare(s, h);
