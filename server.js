import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000; // Use the PORT environment variable or default to 3000

// Serve static files from the 'public' directory and other relevant directories
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.static(path.join(process.cwd(), 'src')));
app.use(express.static(path.join(process.cwd(), 'node_modules'))); // Optional, if needed

// Send all requests to index.html (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html')); // Ensure this points to your HTML file
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`); // Use localhost for clarity
});
