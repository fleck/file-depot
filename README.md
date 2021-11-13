# File Depot ![Warehouse Rack](./rack.png)

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
