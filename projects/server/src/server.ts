import 'reflect-metadata';

import app from './app';
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`${new Date().toISOString()}: Express server listening on port ${PORT}`);
});
