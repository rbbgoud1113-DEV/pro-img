import React, { useState } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [script, setScript] = useState("");
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const generate = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("script", script);

    const res = await fetch("http://localhost:5000/generate", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setVideo(data.videoUrl);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>CineMotion AI 🎬</h2>

      <input type="file" onChange={upload} />

      {preview && <img src={preview} width="200" alt="" />}

      <textarea
        placeholder="Enter Telugu script"
        onChange={(e) => setScript(e.target.value)}
      />

      <br />

      <button onClick={generate}>Generate</button>

      {loading && <p>Processing...</p>}

      {video && (
        <video controls width="400">
          <source src={video} />
        </video>
      )}
    </div>
  );
}
