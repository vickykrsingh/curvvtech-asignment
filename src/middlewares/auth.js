
import jwt from 'jsonwebtoken';

const auth = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('AUTH Authorization header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('AUTH No token provided');
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('AUTH Token valid, user:', decoded);
    next();
  } catch (err) {
    console.log('AUTH Invalid token:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

};
export default auth;
