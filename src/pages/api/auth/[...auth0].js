import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  onError(req, res, error) {
    console.log(error);
    console.log(req)
    res.status(error.status || 500).end('Check the console for the error');
  }
});
