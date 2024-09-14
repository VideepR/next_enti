const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path=require('path')


const serviceAccount = require("./key.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/static',express.static(path.join(__dirname,'publics')))
app.use('/assets',express.static(path.join(__dirname,'publics/assets')))

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));


app.post('/register', async (req, res) => {
    const { fullname, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.send('Passwords do not match');
    }

    try {
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (doc.exists) {
            return res.send('User already exists');
        }

        await userRef.set({ fullname, email, password });

        req.session.user = email;
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (doc.exists && doc.data().password === password) {
            req.session.user = email;
            res.redirect('/dashboard');
        } else {
            res.render('loginin', { error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user }); 
    } else {
        res.redirect('/loginin');
    }
});





app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/', (req, res) => {
    res.render('loginin');
});

app.get('/i', (req, res) => {
    res.render('inter');
});
app.get('/e',(req,res)=>{
    res.render('engineering')
});
app.get('/m',(req,res)=>{
    res.render('inter/mpc')
});
app.get('/b',(req,res)=>{
    res.render('inter/bipc')
});
app.get('/c',(req,res)=>{
    res.render('inter/cec')
});
app.get('/h',(req,res)=>{
    res.render('inter/hec')
});
app.get('/vo',(req,res)=>{
    res.render('inter/vocational courses')
});
app.get('/em',(req,res)=>{
    res.render('engineering/mech')
});
app.get('/ecv',(req,res)=>{
    res.render('engineering/civil')
});
app.get('/ee',(req,res)=>{
    res.render('engineering/eee')
});
app.get('/ec',(req,res)=>{
    res.render('engineering/ece')
});
app.get('/ecs',(req,res)=>{
    res.render('engineering/cse')
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
