const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  if (req.accepts('json')) {
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  } else {
    res.set('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error ${statusCode}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
          }
          .error-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 20px;
          }
          h1 {
            color: #e74c3c;
            margin-top: 0;
          }
          .error-details {
            background: #f8f8f8;
            padding: 1rem;
            border-radius: 4px;
            margin: 1rem 0;
            text-align: left;
            font-family: monospace;
            overflow-x: auto;
          }
          .home-link {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background 0.3s;
          }
          .home-link:hover {
            background: #2980b9;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>${statusCode} - ${getStatusMessage(statusCode)}</h1>
          <p>${err.message || 'Something went wrong!'}</p>
          
          ${process.env.NODE_ENV !== 'production' ? `
            <div class="error-details">
              <p><strong>Error:</strong> ${err.message}</p>
              <p><strong>Stack:</strong><br>${err.stack.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}
          
          <a href="/" class="home-link">Go to Homepage</a>
        </div>
      </body>
      </html>
    `);
  }
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

function getStatusMessage(statusCode) {
  const statusMessages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    503: 'Service Unavailable'
  };
  return statusMessages[statusCode] || 'Error';
}

module.exports = { errorHandler, notFound };
