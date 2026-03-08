import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const InterviewPage = () => {
  const webcamRef = useRef(null);

  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [similarity, setSimilarity] = useState(null);
  const [loading, setLoading] = useState(false);

  const captureAndVerify = async () => {

  if (!userId) {
    setStatus("❌ Please enter your Unique ID");
    return;
  }

  setLoading(true);
  setStatus("📸 Capturing image...");
  setSimilarity(null);

  try {

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      setStatus("❌ No image captured");
      setLoading(false);
      return;
    }

    const res = await fetch(imageSrc);
    const blob = await res.blob();

    const formData = new FormData();
    formData.append("unique_id", userId);
    formData.append("frame", blob, "frame.jpg");

    setStatus("🔍 Verifying identity...");

    const response = await axios.post(
      "http://127.0.0.1:8000/interview/verify",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        timeout: 5000 // important
      }
    );

    const data = response.data;

    if (data.status === "Verification successful") {

      setSimilarity(data.similarity);
      setStatus("✅ Accepted. Continue the interview");

    } else {

      setSimilarity(data.similarity ?? null);
      setStatus("❌ Face verification failed"); 

    }

  } catch (error) {

    console.error(error);

    if (error.code === "ECONNABORTED") {
      setStatus("❌ Server timeout");
    } else if (error.response) {
      setStatus("❌ Server returned error");
    } else {
      setStatus("❌ Server not reachable. Please try again.");
    }

    setSimilarity(null);
  }

  setLoading(false);
};
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "40px",
        fontFamily: "Arial",
      }}
    >
      <h2>🎥 Interview Face Verification</h2>

      <input
        type="text"
        placeholder="Enter your Unique ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value.toUpperCase())}
        style={{
          padding: "10px",
          marginBottom: "20px",
          fontSize: "16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <br />

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
        style={{
          borderRadius: "10px",
          border: "2px solid #444",
        }}
      />

      <br /><br />

      <button
        onClick={captureAndVerify}
        disabled={loading}
        style={{
          padding: "12px 25px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "6px",
          backgroundColor: "#1976d2",
          color: "white",
          border: "none",
        }}
      >
        {loading ? "Processing..." : "Verify & Start Interview"}
      </button>

      <div style={{ marginTop: "25px" }}>
        <h3>{status}</h3>

{similarity !== null && similarity !== undefined && (
  <p>
    🔢 Similarity Score: <strong>{Number(similarity).toFixed(3)}</strong>
  </p>
)}
      </div>
    </div>
  );
};

export default InterviewPage;