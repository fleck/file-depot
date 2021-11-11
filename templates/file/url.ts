import type { Transform } from "app/file/transforms"
import type { File } from "db"

export const urlFor = (file: File, transform?: Transform) =>
  `/api/files/${file.key}${transform ? `/variant/${transform}` : ""}/${file.name}`
