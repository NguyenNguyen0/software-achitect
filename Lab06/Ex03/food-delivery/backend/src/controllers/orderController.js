const pool = require('../config/database');

const createOrder = async (req, res) => {
  const { restaurant_id, items, delivery_address, note } = req.body;
  if (!restaurant_id || !items?.length || !delivery_address)
    return res.status(400).json({ message: 'Thiếu thông tin đơn hàng' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify items + calculate total
    let total = 0;
    const verifiedItems = [];
    for (const item of items) {
      const result = await client.query(
        'SELECT * FROM menu_items WHERE id=$1 AND restaurant_id=$2 AND is_available=true',
        [item.menu_item_id, restaurant_id]
      );
      if (result.rows.length === 0) throw new Error(`Món ${item.menu_item_id} không khả dụng`);
      const menuItem = result.rows[0];
      const subtotal = menuItem.price * item.quantity;
      total += subtotal;
      verifiedItems.push({ ...item, name: menuItem.name, price: menuItem.price, subtotal });
    }

    const delivery_fee = total >= 200000 ? 0 : 25000;
    const total_amount = total + delivery_fee;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address, delivery_fee, note)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, restaurant_id, total_amount, delivery_address, delivery_fee, note || null]
    );
    const order = orderResult.rows[0];

    // Insert order items
    for (const item of verifiedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, name, price, quantity, subtotal) VALUES ($1,$2,$3,$4,$5,$6)',
        [order.id, item.menu_item_id, item.name, item.price, item.quantity, item.subtotal]
      );
    }

    await client.query('COMMIT');

    const fullOrder = await pool.query(
      `SELECT o.*, r.name as restaurant_name,
       json_agg(json_build_object('id',oi.id,'name',oi.name,'price',oi.price,'quantity',oi.quantity,'subtotal',oi.subtotal)) as items
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id=$1
       GROUP BY o.id, r.name`,
      [order.id]
    );
    res.status(201).json(fullOrder.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: err.message || 'Lỗi tạo đơn hàng' });
  } finally {
    client.release();
  }
};

const getUserOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, r.name as restaurant_name, r.image_url as restaurant_image,
       json_agg(json_build_object('name',oi.name,'quantity',oi.quantity,'price',oi.price,'subtotal',oi.subtotal) ORDER BY oi.name) as items
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id=$1
       GROUP BY o.id, r.name, r.image_url
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, r.name as restaurant_name, r.image_url as restaurant_image,
       json_agg(json_build_object('name',oi.name,'quantity',oi.quantity,'price',oi.price,'subtotal',oi.subtotal)) as items
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id=$1 AND o.user_id=$2
       GROUP BY o.id, r.name, r.image_url`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

const updateOrderStatus = async (req, res) => {
  const FLOW = ['pending','confirmed','preparing','ready','delivering','delivered'];
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!FLOW.includes(status) && status !== 'cancelled')
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });

    const result = await pool.query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, updateOrderStatus };
