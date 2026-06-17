import 'reflect-metadata';

import SERVICETYPES from './services/service.types';

import container from './inversify.config';
import { ILoggerService } from './services/interfaces';
import app from './app';

const PORT = 3001;

app.listen(PORT, () => {
  container.get<ILoggerService>(SERVICETYPES.LoggerService).info('Server', `Express server listening on port ${PORT}`);
});
