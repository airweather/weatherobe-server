module.exports = {
  getMain: {
    query: `SELECT l.id, l.image, u.name FROM look l, user u WHERE l.user = u.email ORDER BY id DESC LIMIT 3;` //가장 최신 3개만 일 땐 LIMIT 3
  },
  getDailyLook: {
    query: `SELECT l.id, l.image, l.date, u.name FROM look l, user u WHERE l.user = u.email ORDER BY l.id DESC ;`
  },
  getInfo: {
    query: `SELECT l.*, u.email,u.name  FROM look l, user u WHERE l.id = ? AND u.email = l.user;`
  },
  getMyWardrobe: {
    query: `SELECT l.*, u.email,u.name  FROM look l, user u WHERE l.user = ? AND u.email = l.user;`
  },
  insertInfo: {
    query: `INSERT INTO look (user, date, weather, temperature, top, bottom, shoes, acc, memo, image)
    				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
  },
  editInfo: {
    query: `UPDATE look SET date=?, weather=?, temperature=?, top=?, bottom=?, shoes=?, acc=?, memo=?, image=? WHERE id=?;`
  },
  getImageId: {
    query: `SELECT id FROM look WHERE image=?`
  },
  insertImage: {
    query: `UPDATE look SET image ? WHERE id =?`
  },
  imageInsert:{
    query: `INSERT INTO image (name) VALUES(?);`
  },
  loginInfo: {
    query: `SELECT * FROM user WHERE id = 1;`
  },
  getLogin: {
    query: `SELECT * FROM user WHERE email=? AND password=? AND sso=1`
  },
  memberJoin: {
    query: `INSERT INTO user (email, password, name) VALUES (?, ?, ?);`
  },
  userInsert: {
    query: `INSERT INTO user SET ? ON DUPLICATE KEY UPDATE ?`
  },
  signup: {
    query:`INSERT INTO user SET ?`
  },
  changeUser: {
    query: `UPDATE user SET password=?, name=? WHERE email = ?`
  },
  emailCheck: {
    query:`SELECT email FROM user WHERE email = ?`
  },
  nameCheck: {
    query:`SELECT name FROM user WHERE name = ?`
  },
  withdrawal: {
    query:`DELETE FROM user WHERE email=?;`
  },
  erase: {
    query:`DELETE FROM look WHERE id=?`
  },
  search: {
    query:`SELECT * FROM look WHERE date LIKE ? OR weather LIKE ? OR top LIKE ? OR bottom  LIKE ? OR shoes LIKE ? OR acc LIKE ? OR memo LIKE ?;`
  },
  searchResult: {
    query:`SELECT look.id, look.image, user.name FROM look, user WHERE id IN (?) AND user.email = look.user;`
  },
 
  
}