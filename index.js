const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

//mongodb://localhost:27017/busTracking

// Connect to MongoDB
const uri = 'mongodb://localhost:27017/busTracking';
let db;

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully!');
        db = mongoose.connection; // Set the db variable after connection
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Define Bus Schema
const busSchema = new mongoose.Schema({
    busId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    }
});

// Create Bus Model
const Bus = mongoose.model('Bus', busSchema);

// Registration Endpoint
app.post('/register', async (req, res) => {
    const { busId, password } = req.body;

    // Add your logic to validate busId and password
    // Check if busId already exists, hash the password, and save to the database

    // Example:
    try {
        const existingBus = await Bus.findOne({ busId });
        if (existingBus) {
            return res.status(400).json({ error: 'Bus ID already exists.' });
        }

        const newBus = new Bus({ busId, password }); // Hash password here
        await newBus.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Login Endpoint
// Login Endpoint
app.post('/login', async (req, res) => {
    const { busId, password } = req.body;
    
    try {
        console.log(`Attempting to log in: Bus ID: ${busId}, Password: ${password}`);
        const bus = await Bus.findOne({ busId });
        console.log('Bus found:', bus);
        
        if (bus && await bcrypt.compare(password, bus.password)) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Error during login: ' + error.message });
    }
});


// Update Location Endpoint
app.get('/getLocation', async (req, res) => {
    const { busId } = req.query;

    // Validate the input
    if (!busId) {
        return res.status(400).json({ error: 'Bus ID is required.' });
    }

    try {
        const bus = await Bus.findOne({ busId });
        if (!bus || !bus.location) {
            return res.status(404).json({ error: 'Bus not found or no location available.' });
        }

        return res.json({ location: bus.location });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching bus location: ' + error.message });
    }
});
    

app.post('/updateLocation', async (req, res) => {
    const { busId, latitude, longitude } = req.body;

    // Validate the input
    if (!busId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Missing busId, latitude, or longitude' });
    }

    try {
        // Update the bus location
        const updatedBus = await Bus.findOneAndUpdate(
            { busId },
            { location: { latitude, longitude } },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedBus) {
            return res.status(404).json({ error: 'Bus not found.' });
        }

        return res.status(200).json({ message: 'Location updated successfully!', bus: updatedBus });
    } catch (error) {
        console.error('Error updating location in MongoDB:', error);
        return res.status(500).json({ error: 'Failed to update location.' });
    }
});




// Fetch Location Endpoint
app.get('/buses', async (req, res) => {
    try {
        const buses = await db.collection('buses').find({}).toArray(); // Use the db variable
        res.json({ busIds: buses.map(bus => bus.busId) });
    } catch (error) {
        console.error('Error fetching bus IDs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all registered bus IDs
//app.get('/buses', async (req, res) => {
   // try {
  //      const buses = await db.collection('buses').find({}).toArray(); // Use the db variable
 //       res.json({ busIds: buses.map(bus => bus.busId) });
 //   } catch (error) {
//        console.error('Error fetching bus IDs:', error);
//        res.status(500).json({ error: 'Internal Server Error' });
//    }
//});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



