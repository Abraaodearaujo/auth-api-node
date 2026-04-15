function pad(value) {
  return String(value).padStart(2, '0');
}

function timestamp() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours(),
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function format(level, message, meta) {
  const parts = [`[${timestamp()}]`, level.toUpperCase(), message];
  if (meta) {
    const details = typeof meta === 'string' ? meta : JSON.stringify(meta);
    parts.push(details);
  }
  return parts.join(' ');
}

const logger = {
  info: (message, meta) => console.log(format('info', message, meta)),
  warn: (message, meta) => console.warn(format('warn', message, meta)),
  error: (message, meta) => console.error(format('error', message, meta)),
};

module.exports = logger;
