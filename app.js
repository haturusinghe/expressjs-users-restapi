const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api', userRoutes);

app.get('/', (req, res) => {
    res.send('Welcome');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong.' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
