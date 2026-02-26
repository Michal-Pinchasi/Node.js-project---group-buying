require('dotenv').config(); 
const express = require('express');
const connectDB = require('./db/db');
const groupRoutes = require('./routes/groupRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();
const mongoose = require('mongoose');
const errorMiddleware = require('./middleware/errorMiddleware');


connectDB();


app.use(express.json()); 

app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);

app.set('view engine', 'ejs');
app.get('/', (req, res) => res.redirect('/groups'));
app.use(errorMiddleware);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

