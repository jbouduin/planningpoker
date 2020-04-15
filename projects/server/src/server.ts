import app from './app';
const PORT = 3001;

app.listen(PORT, () => {
    console.log(new Date() + ' Express server listening on port ' + PORT);
});
