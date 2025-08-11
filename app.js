const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/users', (req, res) => {
    fs.readFile('users.json', (err, data) => {
        if (err) return res.status(500).json([]);
        res.json(JSON.parse(data || '[]'));
    });
});

app.post('/add-user', (req, res) => {
    const { name, email, age } = req.body;
    fs.readFile('users.json', (err, data) => {
        let users = [];
        if (!err && data.length) users = JSON.parse(data);
        users.push({ name, email, age });
        fs.writeFile('users.json', JSON.stringify(users, null, 2), () => res.json({ message: 'User added' }));
    });
});

app.put('/edit-user/:index', (req, res) => {
    const { index } = req.params;
    const { name, email, age } = req.body;
    fs.readFile('users.json', (err, data) => {
        let users = JSON.parse(data);
        users[index] = { name, email, age };
        fs.writeFile('users.json', JSON.stringify(users, null, 2), () => res.json({ message: 'User updated' }));
    });
});

app.delete('/delete-user/:index', (req, res) => {
    const { index } = req.params;
    fs.readFile('users.json', (err, data) => {
        let users = JSON.parse(data);
        users.splice(index, 1);
        fs.writeFile('users.json', JSON.stringify(users, null, 2), () => res.json({ message: 'User deleted' }));
    });
});

app.listen(8080, () => console.log(`Server running at http://localhost:8080`));
