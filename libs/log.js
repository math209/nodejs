const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, colorize, simple, printf} = format;


const myFormat = printf(info => {
    return `${info.timestamp.replace(/T/, ' ').replace(/\..+/, '')} [${info.label}]: ${info.message}`;
});

module.exports = (module) =>{
    return createLogger({
        format: combine(
            colorize(),//{all: true}
            timestamp(),
            label({label: module.filename.split('/').slice(-2).join('/')}),
            myFormat
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'error.log', level: 'error'})
        ]
    });
}
