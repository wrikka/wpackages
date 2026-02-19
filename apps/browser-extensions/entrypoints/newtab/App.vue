<script setup lang="ts">

import { ref, onMounted } from "vue";

const chatInput = ref<HTMLInputElement | null>(null);
const newMessage = ref("");
const messages = ref([
  { sender: "ai", text: "Hello! How can I help you today?" },
]);

const _sendMessage = () => {
  if (newMessage.value.trim() === "") return;

  messages.value.push({ sender: "user", text: newMessage.value });
  const userMessage = newMessage.value;
  newMessage.value = "";

  // Simulate AI response
  setTimeout(() => {
    messages.value.push({
      sender: "ai",
      text: `This is a placeholder response to "${userMessage}"`,
    });
  }, 1000);
};

onMounted(() => {
  chatInput.value?.focus();
});

</script>

<template>

  <div class="chatbot-container">
    <header class="chatbot-header">
      <h1>Wai AI Assistant</h1>
      <p>Your intelligent new tab dashboard</p>
    </header>
    <main class="chat-window">
      <div class="message-list">
        <div v-for="(message, index) in messages" :key="index" class="message" :class="message.sender === 'user' ? 'sent' : 'received'">
          <p>{{ message.text }}</p>
        </div>
      </div>
    </main>
    <footer class="chat-input-area">
      <input
        ref="chatInput"
        v-model="newMessage"
        type="text"
        class="chat-input"
        placeholder="Type your message here..."
        @keydown.enter="_sendMessage"
      />
      <button class="send-button" @click="_sendMessage">Send</button>
    </footer>
  </div>

</template>

<style scoped>

.chatbot-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.chatbot-header {
  padding: 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #dcdfe6;
  text-align: center;
}

.chatbot-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #303133;
}

.chatbot-header p {
  margin: 0.25rem 0 0;
  color: #606266;
}

.chat-window {
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  max-width: 70%;
  word-wrap: break-word;
}

.message.received {
  background-color: #e9e9eb;
  color: #303133;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.message.sent {
  background-color: #409eff;
  color: #ffffff;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.chat-input-area {
  display: flex;
  padding: 1rem;
  background-color: #ffffff;
  border-top: 1px solid #dcdfe6;
}

.chat-input {
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  outline: none;
  font-size: 1rem;
}

.chat-input:focus {
  border-color: #409eff;
}

.send-button {
  margin-left: 0.75rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: #409eff;
  color: #ffffff;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #66b1ff;
}

</style>