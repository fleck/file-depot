import { useCallback, useRef, useState } from "react"
import { File as FileModel } from "db"
import { useDropzone } from "react-dropzone"
import { getAntiCSRFToken } from "blitz"

export const useFileUpload = () => {
  const fileInput = useRef<HTMLInputElement>(null)

  const [filename, setSelectedFileName] = useState("")

  const [progress, setProgress] = useState(0)

  const [done, setDone] = useState(false)

  const [error, setError] = useState(false)

  const [localURL, setLocalURL] = useState("")

  const [file, setFile] = useState<FileModel>()

  const onDrop = useCallback(([acceptedFile]: File[]) => {
    if (acceptedFile) {
      setSelectedFileName(acceptedFile.name)

      setLocalURL(URL.createObjectURL(acceptedFile))

      const formData = new FormData()
      formData.append("file", acceptedFile)

      const xhr = new XMLHttpRequest()
      xhr.responseType = "json"

      xhr.open("POST", "/api/files/create")

      xhr.setRequestHeader("anti-csrf", getAntiCSRFToken())

      xhr.upload.onprogress = (event) => {
        const percentages = +((event.loaded / event.total) * 100).toFixed(2)
        setProgress(percentages)
      }

      xhr.send(formData)

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return
        if (xhr.status !== 200) {
          setError(true)
        }

        const file: FileModel = xhr.response

        setFile(file)

        setDone(true)
      }
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return { localURL, getRootProps, fileInput, getInputProps, filename, file, progress, done, error }
}
