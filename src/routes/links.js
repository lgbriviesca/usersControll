const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {
  res.render('links/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
  const { destination, route, details, vehicle, dueTo } = req.body;
  const newLink = {
    destination,
    route,
    details,
    vehicle,
    dueTo,
    user_id: req.user.id,
  };
  await pool.query('INSERT INTO links set ?', [newLink]);
  //todos los mensajes llevan la leyenda de success porque así nombré al mensaje de respuesta.
  //a diferencia de los de error, que son "message"
  req.flash('success', 'Link added successfully');
  res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {
  console.log(req.user.id);
  const links = await pool.query(
    'SELECT * FROM links WHERE user_id = ?',
    req.user.id
  );
  res.render('links/list', { links });
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await pool.query(`DELETE FROM links WHERE id = ${id}`);
  req.flash('success', 'Link removed successfully');
  res.redirect('/links');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const links = await pool.query(`SELECT * FROM links WHERE id = ${id}`);
  console.log(links[0]);
  res.render('links/edit', { link: links[0] });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { title, description, url } = req.body;
  const linkToUpdate = { title, description, url };
  await pool.query(`UPDATE links set ? WHERE id = ${id}`, [linkToUpdate]);
  req.flash('success', 'Link updated successfully');
  res.redirect('/links');
});

module.exports = router;
