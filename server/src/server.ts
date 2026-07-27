import 'reflect-metadata';
import app from './app.js';
import container from './inversify.config.js';
import type { ILoggerService } from './services/interfaces/index.js';
import SERVICETYPES from './services/service.types.js';

const PORT = 3001;

app.listen(PORT, () => {
  container.get<ILoggerService>(SERVICETYPES.LoggerService).info('Server', `Express server listening on port ${PORT}`);
});
