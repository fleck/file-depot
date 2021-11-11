import { StorageManager, LocalFileSystemStorage } from "@slynova/flydrive"
import path from "path"
import appRoot from "app-root-path"
import { AmazonWebServicesS3Storage } from "@slynova/flydrive-s3"

const production = process.env.NODE_ENV === "production"

let storage

if (production) {
  storage = new StorageManager({
    default: "s3",
    disks: {
      s3: {
        driver: "s3",
        config: {
          key: process.env.S3_KEY,
          endpoint: process.env.S3_ENDPOINT,
          secret: process.env.S3_SECRET,
          bucket: process.env.S3_BUCKET,
          region: process.env.S3_REGION,
        },
      },
    },
  })

  storage.registerDriver("s3", AmazonWebServicesS3Storage)
} else {
  storage = new StorageManager({
    default: "local",

    disks: {
      local: {
        driver: "local",
        config: {
          root: path.join(appRoot.toString(), "storage"),
        },
      },
    },
  })

  storage.registerDriver("local", LocalFileSystemStorage)
}

export const disk = production
  ? storage.disk<AmazonWebServicesS3Storage>("s3")
  : storage.disk<LocalFileSystemStorage>("local")

export const driver = production ? "s3" : "local"
