const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper to read DB
const readDB = () => {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 4), 'utf8');
};

// Get all food items
app.get('/api/menu', (req, res) => {
    const db = readDB();
    res.json(db.foodItems);
});

// Get all restaurants
app.get('/api/restaurants', (req, res) => {
    const db = readDB();
    res.json(db.restaurants);
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ success: true, name: user.name, favorites: user.favorites || [] });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Register
app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    const db = readDB();
    
    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const newUser = { email, password, name, favorites: [] };
    db.users.push(newUser);
    writeDB(db);
    
    res.json({ success: true, name: newUser.name, favorites: [] });
});

// Toggle Favorite
app.post('/api/user/favorite', (req, res) => {
    let { email, foodId } = req.body;
    foodId = Number(foodId); // Ensure it's a number
    
    console.log(`Toggle heart: user=${email}, foodId=${foodId}`);
    
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    
    if (!user) {
        console.error(`User not found: ${email}`);
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.favorites) user.favorites = [];
    
    const index = user.favorites.indexOf(foodId);
    if (index === -1) {
        user.favorites.push(foodId);
        console.log(`Added ${foodId} to ${email}'s favorites`);
    } else {
        user.favorites.splice(index, 1);
        console.log(`Removed ${foodId} from ${email}'s favorites`);
    }
    
    writeDB(db);
    res.json({ success: true, favorites: user.favorites });
});

app.listen(PORT, () => {
    console.log(`Savor Backend running at http://localhost:${PORT}`);
});
