const generateShortcode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortcode = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    shortcode += characters[randomIndex];
  }
  return shortcode;
}

// This function would check the actual database in production
// For now, it's handled in the main index.js file
const checkShortcodeInDB = (shortcode, database) => {
  return database && database.has(shortcode);
}

module.exports = { generateShortcode, checkShortcodeInDB };

