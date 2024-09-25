"use client";

import { useState, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]); // Mesajları tutar
  const [inputValue, setInputValue] = useState(""); // Input alanının değerini tutar
  const [currentQuestion, setCurrentQuestion] = useState(""); // Şu anki soruyu tutar
  const [sessionId, setSessionId] = useState(null); // Session ID'sini tutar
  const [chatStarted, setChatStarted] = useState(false); // Chat'in başlayıp başlamadığını tutar

  // Chat oturumunu başlatır
  const startChat = async () => {
    const response = await fetch("http://localhost:6060/api/chat/start", {
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
  };

  // Kullanıcıdan gelen cevap ve bir sonraki sorunun alınması
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const updatedMessages = [...messages, { text: inputValue, from: "user" }];
    setMessages(updatedMessages);
    setInputValue("");

    const response = await fetch(
      `http://localhost:6060/api/chat/${sessionId}/question/${messages.length}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer: inputValue }),
      }
    );

    const data = await response.json();

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-lg">
        {/* Eğer chat başlamadıysa başlangıç ekranını göster */}
        {!chatStarted ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Welcome to the Chatbot!
            </h2>
            <button
              onClick={startChat}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
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
                  className={`p-3 rounded-xl max-w-xs ${
                    message.from === "user"
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200 self-start"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={currentQuestion ? "Answer..." : "Waiting for bot..."}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
