import express from 'express';
import { router } from "./users/users.js";
const port = 8000;
const app = express();
app.use((req, res, next) => {
    console.log('ВРемя', Date.now());
});
app.get('/hello', (req, res) => {
    res.end('hello world');
});
app.use((err, req, res, next) => {
    console.log(err.message);
    res.status(401).send(err.message);
});
app.listen(port, () => {
    console.log(`сервер запущена на http://localhost:${port}`);
});
app.use('/users', router);
