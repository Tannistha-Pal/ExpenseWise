const sendSuccess = (res, message, data = {}, status = 200) => {
  return res.status(status).json({ success: true, message, data, ...data });
};

const sendError = (res, status, message, error = null) => {
  return res.status(status).json({ success: false, message, data: null, error: error || message });
};

module.exports = { sendSuccess, sendError };
