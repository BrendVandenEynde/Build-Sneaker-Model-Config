import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(process.cwd(), 'dist')));

// Send all requests to index.html (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html')); // Ensure this points to your built HTML file
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
