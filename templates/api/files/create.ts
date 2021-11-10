import { BlitzApiRequest, BlitzApiResponse } from "blitz"
import db from "db"
import Busboy from "busboy"
import path from "path"
import { disk, driver } from "app/file"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"
import crypto from "crypto"

export const localPath = (key: string) =>
  path.join(path.join(key.substring(0, 2), key.substring(2, 4)), key)

const hashIt = (file: NodeJS.ReadableStream) => {
  const createHash = crypto.createHash("sha1").setEncoding("hex")
  file.pipe(createHash)

  return new Promise<string>((resolve) => {
    file.on("end", function () {
      createHash.end()
      resolve(createHash.read())
    })
  })
}

export default async function handler(req: BlitzApiRequest, res: BlitzApiResponse) {
  if (!req.headers["content-type"]?.includes("multipart/form-data")) {
    res.writeHead(406, { Connection: "close" })
    res.end("must be multipart/form-data")
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    const busboy = new Busboy({ headers: req.headers })

    const key = uuidv4()

    busboy.on("file", async (_fieldName, file, filename, _encoding, mimetype) => {
      /**
       * Once blitz has a standard interface for jobs we should allow processing
       * to happen in the background.
       * if (backgroundJobsAvailable) {
       *    jobs.queue(processInBackground)
       * }
       */
      const imageProcessor = sharp()

      file.pipe(imageProcessor)

      const [hash, metadata] = await Promise.all([hashIt(file), imageProcessor.metadata()])

      const existingFile = await db.file.findFirst({ where: { hash } })

      if (existingFile) {
        res.json(existingFile)

        resolve()
      } else {
        if (!metadata.size) {
          throw new Error("File is empty")
        }

        await disk.put(localPath(key), imageProcessor)

        const file = await db.file.create({
          data: {
            key,
            hash,
            name: filename,
            contentType: mimetype,
            serviceName: driver,
            byteSize: metadata.size,
            metadata: {
              ...metadata,
              // Remove non serializable data
              exif: undefined,
              icc: undefined,
              iptc: undefined,
              xmp: undefined,
              tifftagPhotoshop: undefined,
            },
          },
        })

        res.json(file)

        resolve()
      }
    })

    req.pipe(busboy)
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
