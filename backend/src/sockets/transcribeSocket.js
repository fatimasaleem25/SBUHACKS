import { transcribeAudioChunk } from "../utils/ai.js";

export default function registerTranscribeSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("start-transcription", (meta = {}) => {
      console.log("start-transcription", meta);
      socket.join(meta.sessionId || socket.id);
      socket.emit("transcription-started", { sessionId: meta.sessionId || socket.id });
    });

    socket.on("audio-chunk", async ({ base64Chunk, sessionId }) => {
      try {
        const result = await transcribeAudioChunk(base64Chunk);
        const transcriptText = result?.text || result?.transcript || "";

        if (transcriptText) {
          socket.to(sessionId || socket.id).emit("transcript-partial", { text: transcriptText });
          socket.emit("transcript-partial", { text: transcriptText });
        }
      } catch (err) {
        console.error("Error transcribing chunk", err.message);
        socket.emit("transcription-error", { error: err.message });
      }
    });

    socket.on("stop-transcription", ({ sessionId }) => {
      socket.to(sessionId || socket.id).emit("transcription-stopped", { sessionId });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
