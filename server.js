import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Create the Express app
const app = express();
const PORT = process.env.PORT || 3000; // Use the PORT environment variable or default to 3000

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'dist' directory (or wherever your built files are)
app.use(express.static(path.join(__dirname, 'dist')));

// Send all requests to index.html (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
