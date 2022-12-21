const { request } = require('express');
const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

app.use(session({
  secret: 'secret code',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 //쿠키 유효 시간
  }
}));

app.use(express.json({
  limit: '50mb'
}));

const server = app.listen(3000, ()=> {
  console.log('Server started. port 3000.');
});

let sql = require('./sql.js');

fs.watchFile(__dirname + '/sql.js', (curr, prev) => {
  console.log('sql변경');
  delete require.cache[require.resolve('./sql.js')];
  sql = require('./sql.js');
});

const db = {
  database: process.env.DATABASE,
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD
}

console.log(process.env.DATABASE);

const dbPool = require('mysql').createPool(db);

app.post('/upload/:name/:fileName', async (request, res) => {
  let {
    name,
    fileName
  } = request.params;
  const dir = `${__dirname}/uploads/${name}`;
  const file = `${dir}/${fileName}`;
  if (!request.body.data) return fs.unlink(file, async (err) => res.send({
    err
  }));
  
  const data = request.body.data.slice(request.body.data.indexOf(';base64,') + 8);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFile(file, data, 'base64'
  , async (error) => {
    console.log('uploaded : ', file)
    if (error) {
      res.send({
        error
      });
    } else {
      res.send("ok");
    }
  }
  );
});

app.get('/download/:name/:fileName', (request, res) => {
  const {
    name,
    fileName
  } = request.params;
  const filepath = `${__dirname}/uploads/${name}/${fileName}`;
  res.header('Content-Type', `image/${fileName.substring(fileName.lastIndexOf("."))}`);
  if (!fs.existsSync(filepath)) res.send(404, {
    error: 'Can not found file.'
  });
  else fs.createReadStream(filepath).pipe(res);
});

app.post('/api/delete/:name/:fileName', async (request, res) => {
  let {
    name,
    fileName
  } = request.params;
  const dir = `${__dirname}/uploads/${name}`;
  const file = `${dir}/${fileName}`;
  fs.access(file, fs.constants.F_OK, (err) => { // A
    if (err) return (
      console.log('삭제할 수 없는 파일입니다')
    );
  });
  fs.unlink(file, (err) => err ?  
   console.log(err) : console.log(`${dir} 를 정상적으로 삭제했습니다`));
});

app.post('/api/getLogin', async (request, res) => {
  try{
    let loginInfo = await req.db('getLogin', request.body.param);
    if(loginInfo) {
      request.session['email'] = loginInfo[0].email;
      res.send(loginInfo[0]);
    }else {
      res.send({error:"Login Error"});
    }
  } catch(err) {
    res.send({
      error: "DB access error"
    })
  }
});

app.post('/api/kakaoLogin', async (request, res) => {
  try{
    await req.db('userInsert', request.body.param);
    if(request.body.param.length > 0) {
      for(let key in request.body.param[0]) {
        request.session[key] = request.body.param[0][key];
        return res.send(request.body.param[0]);
      }
    }
    else {
      res.send({error:"Kakao Login Error"});
    }
  } catch(err) {
    res.send({
      error: "DB access error"
    })
  }
});

app.post('/api/emailCheck', async (request, res) => {
  try{
    const emailCheck = await req.db('emailCheck', request.body.param);
    if(emailCheck) {
      console.log(emailCheck[0].email);
      res.send(emailCheck[0].email);
    }
  } catch(err) {
    res.send(false)
  }
});

app.post('/api/nameCheck', async (request, res) => {
  try{
    const nameCheck = await req.db('nameCheck', request.body.param);
    if(nameCheck) {
      res.send(nameCheck[0].name);
    }
  } catch(err) {
    res.send(false)
  }
});

app.post('/api/signup', async (request, res) => {
  try{
    const signup = await req.db('signup', request.body.param);
    if(signup) {
      res.send(signup);
    }
  } catch(err) {
    res.send(err)
  }
});

app.post('/api/signout', async (request, res) => {
  try{
    const signout = await req.db('withdrawal', request.body.param[0]);
    const dir = `${__dirname}/uploads/${request.body.param[1]}`;
    if(signout) {
      fs.rmdir(dir, { recursive: true }, (err) => err ?  
      console.log(err) : console.log(`${dir} 를 정상적으로 삭제했습니다`));
      res.send(signout);
    }
  } catch(err) {
    res.send(err)
  }
});


app.post('/apirole/:alias', async (request, res) => {
  if(!request.session.email) {
    return res.status(401).send({error:'You Need to Login.'});
  }
  try {
    res.send(await req.db(request.params.alias));
  } catch(err) {
    res.status(500).send({
      error: err
    });
  }
});

app.post('/api/:alias', async (request, res) => {
  try {
    res.send(await req.db(request.params.alias, request.body.param));
  } catch(err) {
    res.status(500).send({
      error: err
    });
  }
});

const req = {
  async db(alias, param = [], where = '') {
    return new Promise((resolve, reject) => dbPool.query(sql[alias].query + where, param, (error, rows) => {
      if (error) {
        if (error.code != 'ER_DUP_ENTRY')
          console.log(error);
        resolve({
          error
        });
      } else resolve(rows);
    }));
  }
}