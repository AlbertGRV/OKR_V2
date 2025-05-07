
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json()); 
const PORT = process.env.PORT || 9109;

function readDB() {
  const data = fs.readFileSync('db.json', 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync('db.json', JSON.stringify(data, null, 2), 'utf8');
}

app.get('/menu', (req, res) => {
  try {
    const dishes = readDB();
    res.status(200).json(dishes);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось загрузить меню' });
  }
});

app.get('/menu/:id', (req, res) => {
  const dishes = readDB();
  const dish = dishes.find(d => d.id === req.params.id);

  if (!dish) {
    return res.status(404).json({ error: 'Блюдо не найдено' });
  }

  res.status(200).json(dish);
});

app.post('/menu', (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Укажите корректное имя блюда' });
  }

  const newDish = {
    id: uuidv4(),
    name,
    count: 0,
    createdAt: new Date().toISOString()
  };

  const dishes = readDB();
  dishes.push(newDish);
  writeDB(dishes);

  res.status(201).json(newDish);
});

app.put('/menu/:id', (req, res) => {
  const dishes = readDB();
  const index = dishes.findIndex(d => d.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Блюдо не найдено' });
  }

  const updatedDish = {
    ...dishes[index],
    ...req.body,
    id: dishes[index].id,
    createdAt: dishes[index].createdAt
  };

  dishes[index] = updatedDish;
  writeDB(dishes);

  res.status(200).json(updatedDish);
});

app.patch('/menu/:id', (req, res) => {
  const dishes = readDB();
  const index = dishes.findIndex(d => d.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Блюдо не найдено' });
  }

  dishes[index].count += 1;
  writeDB(dishes);

  res.status(200).json(dishes[index]);
});

app.delete('/menu/:id', (req, res) => {
  const dishes = readDB();
  const filtered = dishes.filter(d => d.id !== req.params.id);

  if (dishes.length === filtered.length) {
    return res.status(404).json({ error: 'Блюдо не найдено' });
  }

  writeDB(filtered);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту: ${PORT}`);
});