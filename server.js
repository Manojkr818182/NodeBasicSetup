require('dotenv').config();
require('./config/conn');
const { ERROR_MESSEGE } = require('./src/utils/constants');
const exceptionLogger = require('./src/utils/exceptionLogger');
const path = require('path');
const express = require('express');
const routes = require('./src/routes/user_routes');

const app = express();
const PORT = process.env.PORT || 6060;

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', routes);

app.use((err, req, res, next) => {
  exceptionLogger.error({
    message: err.message,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers
    }
  });
  res.json({
    status: 0,
    message: ERROR_MESSEGE.SERVER_ERROR
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
