# File Depot ![Warehouse Rack](./rack.png)

## install

```bash
blitz install fleck/file-depot
```

## bug with recipe

there appears to be a bug with recipes (or maybe I'm doing something wrong).
These files get created as:

```
app/api/files/[key]/[filename].ts/[filename].ts
app/api/files/[key]/variant/[variation]/[filename].ts/[filename].ts
```

when the paths should be:

```
app/api/files/[key]/[filename].ts
app/api/files/[key]/variant/[variation]/[filename].ts
```

## hook and urlFor

```ts
import { useFileUpload } from "app/file/useFileUpload"
import { urlFor } from "app/file/url"

const Home: BlitzPage = () => {
  const { getRootProps, fileInput, getInputProps, file } = useFileUpload()

  return (
    <div className="container">
      <main>
        <div {...getRootProps()}>
          click to upload file
          <input ref={fileInput} id="file-upload" name="file-upload" {...getInputProps()} />
        </div>
        Show the original image:
        {file && <img src={urlFor(file)} />}
        Show rotate variation
        {file && <img src={urlFor(file, "rotate")} />}
        // ...
```

## Associating an image/file to an existing model

```ts
model Item {
  id                         Int       @id @default(autoincrement())
  featured                   Boolean   @default(false)
  name                       String?   @db.VarChar
  url                        String?   @db.VarChar
  text                       String?
  fileId                     Int?
  image                      File?     @relation(fields: [fileId], references: [id])
}
```
