import { disk } from "app/file/disk";
import { BlitzApiRequest, BlitzApiResponse, NotFoundError } from "blitz";
import db from "db";
import createContentDisposition from "content-disposition";
import path from "path";
import { localPath } from "app/api/files/create";
import {
  validTransformKey,
  transformFunctions,
  Transform,
} from "../../../../../file/transforms";
import crypto from "crypto";

export const variantPath = (key: string, variation: Transform) =>
  path.join(
    "variant",
    key.substring(0, 2),
    key.substring(2, 4),
    /** Use the functions source as a key for the transform then it'll update if the implementation changes  */
    crypto
      .createHash("sha1")
      .update(transformFunctions[variation].toString())
      .digest("hex")
  );

export default async function handler(
  req: BlitzApiRequest,
  res: BlitzApiResponse
) {
  const { key, contentDisposition, variation } = req.query;

  if (!key || key instanceof Array) {
    throw new NotFoundError();
  }

  if (typeof variation !== "string" || !validTransformKey(variation)) {
    throw new NotFoundError("invalid variation");
  }

  const file = await db.file.findFirst({ where: { key } });

  if (!file) throw new NotFoundError();

  if (file.contentType) {
    res.setHeader("content-type", file.contentType);
  }

  res.setHeader(
    "content-disposition",
    createContentDisposition(file.name, {
      type: contentDisposition === "attachment" ? "attachment" : "inline",
    })
  );

  res.setHeader("Cache-Control", "public, max-age=31536000");

  const existingVariant = disk.getStream(variantPath(file.key, variation));

  existingVariant
    .on("error", function createVariant() {
      const originalFile = disk.getStream(localPath(file.key));

      const transformedFile = transformFunctions[variation](originalFile);

      disk.put(variantPath(file.key, variation), transformedFile);

      transformedFile.pipe(res);

      originalFile.on("error", function noVariantOrOriginalFileIsFound() {
        res.statusCode = 404;
      });
    })
    .pipe(res);
}
