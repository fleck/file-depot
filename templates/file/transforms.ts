import sharp from "sharp"

export const transformFunctions = {
  searchResult: (file: NodeJS.ReadableStream) => file.pipe(sharp().resize({ width: 600 })),
}

export type Transform = keyof typeof transformFunctions

export const validTransformKey = (key: string): key is Transform => key in transformFunctions
