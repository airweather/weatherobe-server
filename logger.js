const {createLogger, transports, format, Logger} = require("winston");
const {combine, colorize, timestamp, label, simple, printf} = format;
const dotenv = require('dotenv');
dotenv.config();

const printFormat = printf(({timestamp, level, message}) => {
  return `${timestamp} ${level} : ${message}`;
})

const printLogFormat = {
  file: combine(
    label({
      label: "weatherobe",
    }),
    timestamp({
      format: "YYYY-MM-DD HH:mm:dd"
    }),
    printFormat
  ),
  console: combine(
    colorize(),
    simple()
  )
};

  const opts = {
    file:  new transports.File({
      filename: "access.log",
      dirname: "./logs",
      level: "info",
      format: printLogFormat.file,
    }),
    console: new transports.Console({
      level: "info",
      format: printLogFormat.console,
    })
  }

const logger = createLogger({
  transports: [opts.file],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(opts.console);
}

logger.stream = {
  write: (message) => logger.info(message),
}
module.exports = logger;