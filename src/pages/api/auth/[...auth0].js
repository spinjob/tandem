import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';

export default handleAuth({
  async callback(req, res) {
    try {
      // Handle the callback
      await handleCallback(req, res);
    } catch (error) {
      console.error('Auth Callback Error:', error);
      
      // Check if it's a MongoDB connection error
      if (error.message && error.message.includes('ENOTFOUND')) {
        return res.status(500).json({
          error: 'Database Connection Error',
          message: 'Unable to connect to the database. Please try again later.'
        });
      }
      
      // Handle other errors
      return res.status(error.status || 500).json({
        error: error.name,
        message: error.message
      });
    }
  },
  
  onError(req, res, error) {
    console.error('Auth Error:', error);
    res.status(error.status || 500).json({
      error: error.name,
      message: error.message
    });
  }
});
