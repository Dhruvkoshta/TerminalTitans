import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return Response.json({ message: "file is required" }, { status: 400 });
    }

    // Derive extension from filename or type
    const originalName = (file as File).name || "upload";
    const type = (file as File).type || "application/octet-stream";
    const extFromName = path.extname(originalName);
    const extFromType = type.split("/")[1] ? `.${type.split("/")[1]}` : "";
    const ext = extFromName || extFromType || "";

    // Generate unique filename
    const base = crypto.randomUUID();
    const fileName = `${base}${ext}`;

    const webRoot = process.cwd();
    const uploadDir = path.join(webRoot, "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const urlPath = `/uploads/${fileName}`;
    return Response.json({ url: urlPath, fileName, type });
  } catch (e) {
    return Response.json({ message: "Upload failed" }, { status: 500 });
  }
}
