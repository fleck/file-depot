# File Depot ![Warehouse Rack](./rack.png)

## bug with recipe

note that there appears to be a bug with recipes (or maybe I'm doing something wrong).
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
