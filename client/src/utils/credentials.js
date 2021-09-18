export function isUser(authority) {
  return ["admin", "user"].includes(authority);
}

export function isAdmin(authority) {
  return authority === "admin";
}
