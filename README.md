# Logger

Common logger facility for node projects.

# Configuration

All available transports and configuration options listed below:

```
"logger": {
    "console": {
        "level": "debug"
    },
    "file": {
        "level": "info",
        "filename": "./var/log/log"
    },
    "raven": {
        "level": "error",
        "sentryDsn": ""
    },
    "logstash": {
        "level": "debug",
        "port": 5044,
        "host": ""
    }
}
```

# Usage

Module defines three factories:

* LoggerFactory - plain old logger
* LoggerWithContextFactory - wrapper around logger, allow to append some context data to all log records
* ErrorFormatterFactory - helper function, that format errors in generic manner, when logger usage is not possible for some reasons

```js
'use strict';

const config = require('config');
const {
    Logger,
    ErrorFormatterFactory
} = require('logger');

const logger            = new Logger(config.logger);
const loggerWithContext = logger.withContext('context');
const errorFormatter    = new ErrorFormatterFactory().create();

const error = new Error('error message');

logger.error(error.message, error);

loggerWithContext.error(error.message, error);

console.log(
    errorFormatter('some type', error)
);
```
