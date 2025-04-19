const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Symptoms List (Replace with all 132 symptoms)
const symptoms = ["itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing"]; 

// Serve Home Page
app.get('/', (req, res) => {
    res.render('index');
});

// Serve Survey Page
app.get('/survey', (req, res) => {
    res.render('survey', { symptoms });
});

// Prediction Route
app.post('/predict', (req, res) => {
    let inputFeatures = symptoms.map(symptom => req.body[symptom] ? 1 : 0);

    console.log("✅ Received Symptoms:", inputFeatures.length);
    if (inputFeatures.length !== 132) {
        return res.status(400).json({ error: `Expected 132 features, got ${inputFeatures.length}` });
    }

    // Spawn a Python process to load the model and predict
    const pythonProcess = spawn('python', ['predict.py', JSON.stringify(inputFeatures)]);

    pythonProcess.stdout.on('data', (data) => {
        const prediction = data.toString().trim();
        console.log("✅ Model Prediction:", prediction);
        res.render('survey', { symptoms, prediction });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error("❌ Error:", data.toString());
        res.status(500).json({ error: "Internal Server Error" });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Symptoms List (Replace with all 132 symptoms)
const symptoms = ["itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing"]; 

// Serve Survey Page
app.get('/survey', (req, res) => {
    res.send(`
        <html>
        <head><title>Health Survey</title></head>
        <body>
            <h1>Health Survey</h1>
            <form action="/predict" method="POST">
                ${symptoms.map(symptom => `
                    <label>
                        <input type="checkbox" name="${symptom}" value="1">
                        ${symptom.replace("_", " ").toUpperCase()}
                    </label>
                    <input type="hidden" name="${symptom}" value="0">
                    <br>
                `).join('')}
                <button type="submit">Submit</button>
            </form>
        </body>
        </html>
    `);
});

// Prediction Route
app.post('/predict', (req, res) => {
    let inputFeatures = symptoms.map(symptom => req.body[symptom] ? 1 : 0);

    console.log("✅ Received Symptoms:", inputFeatures.length);
    if (inputFeatures.length !== 132) {
        return res.status(400).json({ error: `Expected 132 features, got ${inputFeatures.length}` });
    }

    // Call Python script for prediction
    const pythonProcess = spawn('python', ['predict.py', JSON.stringify(inputFeatures)]);

    pythonProcess.stdout.on('data', (data) => {
        const prediction = data.toString().trim();
        console.log("✅ Model Prediction:", prediction);
        res.send(`
            <html>
            <head><title>Prediction Result</title></head>
            <body>
                <h1>Predicted Condition: ${prediction}</h1>
                <a href="/survey">Go Back</a>
            </body>
            </html>
        `);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error("❌ Error:", data.toString());
        res.status(500).json({ error: "Internal Server Error" });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
