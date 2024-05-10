import { NextApiRequest, NextApiResponse } from "next";
import formidable, { errors as formidableErrors } from "formidable";
import { promises as fs } from "fs";
import fse from "fs-extra"; // Using fs-extra
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ multiples: true });
  let fields;
  let files;

  try {
    [fields, files] = await form.parse(req);
    console.log("files : ", files);
    const imageFile = files.file && files.file[0];
    // console.log(imageFile);
    if (!imageFile || !imageFile.filepath) {
      return res.status(400).json({ message: "No image file uploaded!" });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // await fs.mkdir(uploadDir, { recursive: true });
    await fse.ensureDir(uploadDir); // Ensure the directory exists

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const newFileName = `${uniqueSuffix}-${imageFile.originalFilename}`;
    const newFilePath = `${uploadDir}/${newFileName}`;

    // await fs.rename(imageFile.filepath, newFilePath);
    await fse.move(imageFile.filepath, newFilePath);

    console.log("uploaded image: ", newFilePath);

    res
      .status(200)
      .json({ message: "image uploaded!", image: `/uploads/${newFileName}` });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ massage: "error upload image!" });
  }
}
