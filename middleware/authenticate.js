const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {

  let payload = decodeURIComponent(req.body.toString());
  parsed = JSON.parse(payload);
  const token = parsed.token;
  console.log(token);
  if (!token) {
    return res.send(JSON.stringify({"response":true,status: 401, data: {}, 'error': {"code":403,"description":"Invalid token"}}));
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.send(JSON.stringify({"response":true,status: 401, data: {}, 'error': {"code":403,"description":"Invalid token"}}));
  }
  return next();
};

module.exports = verifyToken;
