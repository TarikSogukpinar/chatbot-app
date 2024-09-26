const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const startChatSession = async (userId) => {
  const response = await fetch(`${API_URL}/chat/startChatSession`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error("Failed to start chat session");
  }
  return await response.json();
};

export const sendMessageToChat = async (sessionId, index, answer) => {
  const response = await fetch(
    `${API_URL}/chat/${sessionId}/answerChatQuestion/${index}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to send message");
  }
  return await response.json();
};

export const endChatSession = async (sessionId) => {
  const response = await fetch(`${API_URL}/chat/endChatSession/${sessionId}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to end chat session");
  }
  return await response.json();
};
