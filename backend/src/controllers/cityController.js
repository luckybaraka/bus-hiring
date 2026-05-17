const db = require('../config/database');

exports.getAllCities = async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, county FROM cities ORDER BY name'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllCities error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};
