const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `invaild ${err.path}:${err.value}.`;
  return new AppError(message, 400);
}


const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB=err=>{
  const errors = Object.values(err.errors).map(el=>el.message)
  const message = `Invalid input data${errors.join('. ')}`
  return new AppError(message,400)
}

const handleJWTError= () => new AppError('invalid token please log in again',401)
const handleJWTExpired= () => new AppError('Your token has been expired, please log again',401)

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very Wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';



  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);


  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name==='ValidatorError') error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error =handleJWTError()
    if (error.name==='TokenExpiredError') error = handleJWTExpired()
    sendErrorProd(error, res);

  }
};
