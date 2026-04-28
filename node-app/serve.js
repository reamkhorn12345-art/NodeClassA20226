import app from './src/app.js';

const PORT = process.env.PORT || 3000;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Server failed:', error.message);
    process.exit(1);
  }
};

startServer();