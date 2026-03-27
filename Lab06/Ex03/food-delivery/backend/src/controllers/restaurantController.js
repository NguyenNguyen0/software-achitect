const pool = require('../config/database');

const getAllRestaurants = async (req, res) => {
  try {
    const { cuisine, search } = req.query;
    let query = 'SELECT * FROM restaurants WHERE 1=1';
    const params = [];
    if (cuisine) { params.push(cuisine); query += ` AND cuisine_type=$${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`; }
    query += ' ORDER BY rating DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const rResult = await pool.query('SELECT * FROM restaurants WHERE id=$1', [id]);
    if (rResult.rows.length === 0)
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });

    const catResult = await pool.query(
      'SELECT * FROM categories WHERE restaurant_id=$1 ORDER BY sort_order',
      [id]
    );
    const itemResult = await pool.query(
      'SELECT * FROM menu_items WHERE restaurant_id=$1 AND is_available=true ORDER BY name',
      [id]
    );

    const restaurant = rResult.rows[0];
    restaurant.categories = catResult.rows.map(cat => ({
      ...cat,
      items: itemResult.rows.filter(item => item.category_id === cat.id)
    }));

    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

module.exports = { getAllRestaurants, getRestaurantById };
