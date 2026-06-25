import 'reflect-metadata';
import app from './app';
import container from './inversify.config';
import { ILoggerService } from './services/interfaces';
import SERVICETYPES from './services/service.types';

const PORT = 3001;

app.listen(PORT, () => {
  container.get<ILoggerService>(SERVICETYPES.LoggerService).info('Server', `Express server listening on port ${PORT}`);
});
