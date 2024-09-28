import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";
import fsPromises from "fs/promises";
import os from "os"; // Import to get the temp directory

export async function POST(request) {
  const { text, speed, pitch, variant } = await request.json();

  // Validate input
  if (!text || text.trim() === "") {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  // Prepare audio directory
  const audioDir = path.resolve("public", "audio");
  await fsPromises.mkdir(audioDir, { recursive: true });

  // Generate a unique filename for the audio file
  const audioFile = `${randomUUID()}.wav`;
  const audioFilePath = path.join(audioDir, audioFile);

  // Save the text to a temporary file
  const tempDir = os.tmpdir(); // Get system temp directory
  const tempTextFile = path.join(tempDir, `${randomUUID()}.txt`);
  console.log(tempTextFile);
  await fsPromises.writeFile(tempTextFile, text);

  // Build the espeak command arguments, using the temporary text file as input
  const espeakArgs = ['--stdout', '-s', speed, '-p', pitch, `-v${variant}`, '-f', tempTextFile];

  try {
    // Execute the espeak command using spawn
    await executeCommand('espeak', espeakArgs, audioFilePath);

    // Clean up the temporary text file
    await fsPromises.unlink(tempTextFile);

    const audioURL = `/audio/${audioFile}`;
    return NextResponse.json({ filePath: audioURL }, { status: 200 });
  } catch (error) {
    console.error("Error during TTS generation:", error);
    return NextResponse.json({ error: "Failed to generate speech." }, { status: 500 });
  }
}

// Helper function to execute a shell command and stream the output to a file
function executeCommand(command, args, outputPath) {
  return new Promise((resolve, reject) => {

    // If spawn command giving error then give full path of espeak.exe as commented below
    // const espeakPath = 'C:\\Program Files\\eSpeak\\espeak.exe';
    // const espeakProcess = spawn(espeakPath, args);

    const espeakProcess = spawn(command, args);
    const writeStream = fs.createWriteStream(outputPath);

    espeakProcess.stdout.pipe(writeStream);

    espeakProcess.on('error', (error) => {
      reject(error);
    });

    espeakProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}
