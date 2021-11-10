import { disk } from "app/file"
import { BlitzApiRequest, BlitzApiResponse, NotFoundError } from "blitz"
import db from "db"
import createContentDisposition from "content-disposition"
import path from "path"
import { localPath } from "app/api/files/create"
import { validTransformKey, transformFunctions } from "../../../../../transforms"

export const variantPath = (hash: string, variation: string) =>
  path.join("variant", hash.substring(0, 2), hash.substring(2, 4), variation)

export default async function handler(req: BlitzApiRequest, res: BlitzApiResponse) {
  const { key, contentDisposition, variation } = req.query

  if (!key || key instanceof Array) {
    throw new NotFoundError()
  }

  if (typeof variation !== "string" || !validTransformKey(variation)) {
    throw new NotFoundError("invalid variation")
  }

  const file = await db.file.findFirst({ where: { key } })

  if (!file) throw new NotFoundError()

  if (file.contentType) {
    res.setHeader("content-type", file.contentType)
  }

  res.setHeader(
    "content-disposition",
    createContentDisposition(file.name, {
      type: contentDisposition === "attachment" ? "attachment" : "inline",
    }),
  )

  res.setHeader("Cache-Control", "public, max-age=31536000")

  const existingVariant = disk.getStream(variantPath(file.key, variation))

  existingVariant
    .on("error", function createVariant() {
      const originalFile = disk.getStream(localPath(file.key))

      transformFunctions[variation](originalFile).pipe(res)

      originalFile.on("error", function noVariantOrOriginalFileIsFound() {
        res.statusCode = 404
      })
    })
    .pipe(res)
}
