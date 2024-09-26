"use client";

import { useState, useEffect } from "react";
import { sendMessageToChat, startChatSession } from "../utils/chatApi";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [chatStarted, setChatStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    try {
      setLoading(true);
      const data = await startChatSession("123456");
      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
      setMessages([{ text: data.question, from: "bot" }]);
      setChatStarted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    try {
      setLoading(true);
      const updatedMessages = [...messages, { text: inputValue, from: "user" }];
      setMessages(updatedMessages);
      setInputValue("");

      const data = await sendMessageToChat(
        sessionId,
        messages.length,
        inputValue
      );
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setMessages([
          ...updatedMessages,
          { text: data.nextQuestion, from: "bot" },
        ]);
      } else {
        setMessages([...updatedMessages, { text: "Chat ended", from: "bot" }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const endChat = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      await endChatSession(sessionId);
      setMessages([{ text: "Chat ended", from: "bot" }]);
      setChatStarted(false);
      setSessionId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
