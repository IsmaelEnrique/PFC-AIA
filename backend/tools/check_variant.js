import pool from '../db/db.js';

(async ()=>{
  try{
    console.log('Query variante id 22:');
    const v = await pool.query('SELECT * FROM variante WHERE id_variante = $1', [22]);
    console.log(JSON.stringify(v.rows, null, 2));

    console.log('Query producto id 1:');
    const p = await pool.query('SELECT * FROM producto WHERE id_producto = $1', [1]);
    console.log(JSON.stringify(p.rows, null, 2));

    console.log('Query variante for product 1:');
    const v2 = await pool.query('SELECT * FROM variante WHERE id_producto = $1', [1]);
    console.log(JSON.stringify(v2.rows, null, 2));
  }catch(e){
    console.error(e);
  }finally{
    await pool.end();
  }
})();
