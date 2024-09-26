import fs from 'fs/promises';  // Use the promise-based version of fs
import path from 'path';
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }

    // Construct the full path to the file to delete
    const fileToDelete = path.join(process.cwd(), 'public', filePath);
    console.log("Deleting file:", fileToDelete);

    // Delete the file asynchronously
    await fs.unlink(fileToDelete);

    // Send success response
    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Failed to delete file:", err);

    if (err.code === 'ENOENT') {
      // File does not exist
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    } else {
      // Some other error
      return NextResponse.json({ error: "Error deleting file" }, { status: 500 });
    }
  }
}
