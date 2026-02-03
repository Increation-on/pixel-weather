// temp-background-task.js
module.exports = {
  // Заглушка
  defineTask: () => console.log('BackgroundTask stub'),
  registerTaskAsync: async () => true,
  isAvailableAsync: async () => false
};
