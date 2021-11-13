import { addPrismaModel, paths, RecipeBuilder } from "@blitzjs/installer";
import { join } from "path";

export default RecipeBuilder()
  .setName("file depot")
  .setDescription(
    "store files on s3, GCS, or local file system and reference them via prisma models."
  )
  .setOwner("Jonathan Fleckenstein <jonathan@idealguides.com>")
  .setRepoLink("https://github.com/fleck/file-depot")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `all the packages needed for file processing`,
    packages: [
      { name: "@slynova/flydrive", version: "1.0.3" },
      { name: "@slynova/flydrive-s3", version: "1.0.3" },
      { name: "app-root-path", version: "3.0.0" },
      { name: "busboy", version: "0.3.1" },
      { name: "content-disposition", version: "0.5.3" },
      { name: "react-dropzone", version: "11.4.2" },
      { name: "sharp", version: "0.29.1" },
      { name: "uuid", version: "8.3.2" },
      { name: "@types/app-root-path", version: "1.2.4" },
      { name: "@types/busboy", version: "0.2.3" },
      { name: "@types/content-disposition", version: "0.5.3" },
      { name: "@types/sharp", version: "0.28.3" },
    ],
  })
  .addNewFilesStep({
    stepId: "addApi",
    stepName: "Add API folders",
    explanation: ``,
    targetDirectory: "./app/api",
    templatePath: join(__dirname, "templates", "api"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addFileUtils",
    stepName: "Add File utils",
    explanation: ``,
    targetDirectory: "./app/file",
    templatePath: join(__dirname, "templates", "file"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "updateSchema",
    stepName: "create File model",
    explanation: ``,
    singleFileSearch: paths.prismaSchema(),
    transformPlain(source) {
      return addPrismaModel(source, {
        type: "model",
        name: "File",
        properties: [
          {
            type: "field",
            name: "id",
            fieldType: "Int",
            attributes: [
              { type: "attribute", kind: "field", name: "id", group: "" },
              {
                type: "attribute",
                kind: "field",
                name: "default",
                group: "",
                args: [{ type: "attributeArgument", value: "autoincrement()" }],
              },
            ],
          },
          {
            type: "field",
            name: "key",
            fieldType: "String",
            attributes: [
              { type: "attribute", kind: "field", name: "unique", group: "" },
            ],
          },
          {
            type: "field",
            name: "hash",
            fieldType: "String",
            attributes: [
              { type: "attribute", kind: "field", name: "unique", group: "" },
            ],
          },
          {
            type: "field",
            name: "name",
            fieldType: "String",
          },
          {
            type: "field",
            name: "description",
            fieldType: "String",
            attributes: [
              {
                type: "attribute",
                kind: "field",
                name: "default",
                group: "",
                args: [{ type: "attributeArgument", value: '""' }],
              },
            ],
          },
          {
            type: "field",
            name: "contentType",
            fieldType: "String",
          },
          {
            type: "field",
            name: "metadata",
            fieldType: "Json",
            attributes: [
              {
                type: "attribute",
                kind: "field",
                name: "default",
                group: "",
                args: [{ type: "attributeArgument", value: '"{}"' }],
              },
            ],
          },
          {
            type: "field",
            name: "byteSize",
            fieldType: "Int",
          },
          {
            type: "field",
            name: "serviceName",
            fieldType: "String",
          },
          {
            type: "field",
            name: "createdAt",
            fieldType: "DateTime",
            attributes: [
              {
                type: "attribute",
                kind: "field",
                name: "default",
                group: "",
                args: [{ type: "attributeArgument", value: "now()" }],
              },
            ],
          },
          {
            type: "field",
            name: "updatedAt",
            fieldType: "DateTime",
            attributes: [
              {
                type: "attribute",
                kind: "field",
                name: "updatedAt",
                group: "",
              },
            ],
          },
        ],
      });
    },
  })
  .addTransformFilesStep({
    stepId: "ignoreStorage",
    stepName: "add temp storage directory to gitignore",
    explanation: ``,
    singleFileSearch: ".gitignore",
    transformPlain(gitignore: string) {
      return gitignore + "\n" + "/storage/" + "\n";
    },
  })
  .build();
