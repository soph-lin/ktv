import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

export async function GET() {
  const dir = path.join(process.cwd(), "public", "pfp");

  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    files = [];
  }

  const avatars = files
    .filter((file) => IMAGE_EXTENSIONS.test(file))
    .sort()
    .map((file) => `/pfp/${file}`);

  return NextResponse.json({ avatars });
}
