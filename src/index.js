import express from 'express';
import summaly from 'summaly';
import privateip from 'private-ip';
const app = express();
const port = process.env.PORT || 3000;

const asyncWrapper = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}

app.get('/', asyncWrapper(async (req, res) => {
    const url = req.query.url;
    if (!url) {
        res.statusCode = 400;
        res.end('Please provide a URL');
        return;
    }
    let urlInfo = null;
    try {
        urlInfo = new URL(url);
    } catch (e) {
        console.log(e.stack);
        res.statusCode = 400;
        res.end('Invalid URL');
        return;
    }
    if (urlInfo.protocol !== 'http:' && urlInfo.protocol !== 'https:') {
        res.statusCode = 400;
        res.end('Only HTTP and HTTPS are supported');
        return;
    }
    if (await privateip(urlInfo.hostname)) {
        res.statusCode = 400;
        res.end('Forbidden');
        return;
    }

    try {
        const summary = await summaly.default(url);
        res.statusCode = 200;
        res.json(summary);
    } catch (e) {
        console.log(e);
        console.log(e.stack);
    }

}));

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
