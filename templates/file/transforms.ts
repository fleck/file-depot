import sharp from "sharp";

export const transformFunctions = {
  rotate: (file: NodeJS.ReadableStream) => file.pipe(sharp().rotate(90)),
};

export type Transform = keyof typeof transformFunctions;

export const validTransformKey = (key: string): key is Transform =>
  key in transformFunctions;
