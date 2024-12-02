import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000; // Use the PORT environment variable or default to 3000

// Serve static files from the root directory
app.use(express.static(path.join(process.cwd())));

// Send all requests to index.html (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html')); // Ensure this points to your HTML file
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
