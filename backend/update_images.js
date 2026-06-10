const pool = require('./src/config/db');

// Fine-tune specific product images
const specificImages = [
  { name: 'chicken burger',     url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
  { name: 'french fries',       url: 'https://images.unsplash.com/photo-1576107232684-1279f0c58b7b?w=400&q=80' },
  { name: 'chocolate cake',     url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },
  { name: 'brownie',            url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80' },
  { name: 'veggie pizza',       url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
  { name: 'grilled chicken',    url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400&q=80' },
  { name: 'chicken submarine',  url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80' },
  { name: 'hot coffee',         url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80' },
  { name: 'iced tea',           url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
  { name: 'orange juice',       url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
  { name: 'mango juice',        url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80' },
  { name: 'strawberry milkshake', url: 'https://images.unsplash.com/photo-1553530979-212543ba6561?w=400&q=80' },
];

async function main() {
  try {
    for (const item of specificImages) {
      const result = await pool.query(
        `UPDATE products SET image_url = $1 WHERE LOWER(name) LIKE $2 AND is_active = TRUE RETURNING name`,
        [item.url, `%${item.name}%`]
      );
      if (result.rows.length > 0) {
        console.log(`✅ Updated: ${result.rows.map(r => r.name).join(', ')}`);
      }
    }
    console.log('\n🎉 Fine-tuning complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}
main();
