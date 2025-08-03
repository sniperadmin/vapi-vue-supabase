<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// Main app component - router-view will handle all routing
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
              'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

/* Global button styles */
button {
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Global input styles */
input, textarea {
  font-family: inherit;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive design */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
</style>