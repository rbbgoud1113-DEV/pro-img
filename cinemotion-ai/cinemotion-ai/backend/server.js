const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// 🔑 ADD YOUR KEYS HERE
const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";
const STABILITY_API_KEY = "YOUR_STABILITY_API_KEY";

// Telugu Voice
async function generateVoice(text) {
  const res = await axios.post(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
    {
      input: { text },
      voice: { languageCode: "te-IN" },
      audioConfig: { audioEncoding: "MP3" }
    }
  );

  const audio = Buffer.from(res.data.audioContent, "base64");
  fs.writeFileSync("audio.mp3", audio);
  return "audio.mp3";
}

// Image → Video
async function generateVideo(imagePath) {
  const image = fs.readFileSync(imagePath);

  const res = await axios.post(
    "https://api.stability.ai/v2beta/image-to-video",
    image,
    {
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        "Content-Type": "image/png"
      },
      responseType: "arraybuffer"
    }
  );

  fs.writeFileSync("video.mp4", res.data);
  return "video.mp4";
}

// Merge
function merge(video, audio) {
  return new Promise((resolve, reject) => {
    exec(
      `ffmpeg -y -i ${video} -i ${audio} -c:v copy -c:a aac output.mp4`,
      (err) => {
        if (err) reject(err);
        resolve("output.mp4");
      }
    );
  });
}

// API
app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    const script = req.body.script || "హలో ఇది ఒక వీడియో";

    const audio = await generateVoice(script);
    const video = await generateVideo(req.file.path);
    const final = await merge(video, audio);

    res.json({
      videoUrl: `http://localhost:5000/${final}`
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed" });
  }
});

app.use(express.static("."));

app.listen(5000, () => console.log("Server running on 5000"));
