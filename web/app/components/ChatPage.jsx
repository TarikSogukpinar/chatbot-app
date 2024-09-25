"use client";

import { useState, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]); // Mesajları tutar
  const [inputValue, setInputValue] = useState(""); // Input alanının değerini tutar
  const [currentQuestion, setCurrentQuestion] = useState(""); // Şu anki soruyu tutar
  const [sessionId, setSessionId] = useState(null); // Session ID'sini tutar
  const [chatStarted, setChatStarted] = useState(false); // Chat'in başlayıp başlamadığını tutar
  const [loading, setLoading] = useState(false); // Yüklenme durumunu kontrol eder

  // Yeni chat oturumu başlat
  const startChat = async () => {
    setLoading(true); // Spinner'ı başlat
    const response = await fetch("http://localhost:6060/api/v1/chat/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: "123456" }), // Varsayılan bir userId
    });
    const data = await response.json();
    setSessionId(data.sessionId); // Session ID'yi ayarla
    setCurrentQuestion(data.question); // İlk soruyu ayarla
    setMessages([{ text: data.question, from: "bot" }]); // Mesajları başlat
    setChatStarted(true); // Chat'in başladığını işaretle
    setLoading(false); // Spinner'ı durdur
  };

  // Kullanıcıdan gelen cevap ve bir sonraki sorunun alınması
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    setLoading(true); // Spinner'ı başlat

    const updatedMessages = [...messages, { text: inputValue, from: "user" }];
    setMessages(updatedMessages);
    setInputValue("");

    const response = await fetch(
      `http://localhost:6060/api/v1/chat/${sessionId}/question/${messages.length}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer: inputValue }),
      }
    );

    const data = await response.json();
    setLoading(false); // Spinner'ı durdur

    if (data.nextQuestion) {
      setCurrentQuestion(data.nextQuestion);
      setMessages([
        ...updatedMessages,
        { text: data.nextQuestion, from: "bot" },
      ]);
    } else {
      setMessages([...updatedMessages, { text: "Chat ended", from: "bot" }]);
    }
  };

  const endChat = async () => {
    if (!sessionId) return;

    setLoading(true);
    const response = await fetch(
      `http://localhost:6060/api/v1/chat/end/${sessionId}`,
      {
        method: "POST",
      }
    );
    await response.json();
    setMessages([{ text: "Chat ended", from: "bot" }]);
    setChatStarted(false);
    setSessionId(null);
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-950 to-gray-950">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-lg">
        {!chatStarted ? (
          <div className="flex flex-col items-center justify-center h-full rounded-md">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Welcome to the Chatbot! 🤖
            </h2>
            <button
              onClick={startChat}
              className="bg-gray-950 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Start Chat
            </button>
          </div>
        ) : (
          <>
            {/* Eğer chat başladıysa mesajları ve input alanını göster */}
            <div className="flex flex-col space-y-3 h-96 overflow-y-scroll p-4 border border-gray-200 rounded-lg bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl max-w-xs animate-fade-in ${
                    message.from === "user"
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200 self-start"
                  }`}
                >
                  {message.text}
                </div>
              ))}
              {loading && (
                <div className="flex justify-center items-center mt-4">
                  <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  currentQuestion ? "Answer..." : "Waiting for bot..."
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                className={`bg-gray-950 text-white p-3 rounded-lg hover:bg-blue-700 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                Send
              </button>
              <button
                onClick={endChat}
                className={`bg-red-800 text-white p-3 rounded-lg hover:bg-red-700 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                End Chat
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
