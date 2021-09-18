import type { RowDataPacket } from "mysql2";

export function isRowDataPacket(data: object): data is RowDataPacket {
  return (data as RowDataPacket).length !== undefined;
}
