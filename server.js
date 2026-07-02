const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(express.json()); 
app.use(cors());

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api', productRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api' , cartRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api' , orderRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});