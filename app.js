if(process.env.NODE_ENV !== "production"){
	require('dotenv').config();
}

const express = require('express');
const path = require('path');

const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo');

const { blogSchema, commentSchema } = require('./schemas.js');

const Blogspace = require('./models/blogspace');
const Comment = require('./models/comment');
const User = require('./models/user');

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

const blogRoutes = require('./routes/blogs');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/blog-camp';
mongoose.connect( dbUrl , {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || '123456';

const store = MongoDBStore.create({
	mongoUrl: dbUrl,
	secret: secret,
	touchAfter: 24 * 60 * 60
});

store.on("error", function(e) {
	console.log("Session store error", e)
});

const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: false,
	saveUninitialized:true,
	cookie: {
		httpOnly: true,
		//secure: true,
		expires: Date.now() + 1000*60*60*8,
		maxAge: Date.now() + 1000*60*60*8
	}
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})

app.locals.moment = require('moment');

app.use('/',userRoutes);
app.use('/blogs',blogRoutes);
app.use('/blogs/:id/comments',commentRoutes);

app.get('/', (req,res) => {
	res.render('Home');
})

app.all('*',(req, res, next) => {
	next(new ExpressError('Page not found',404));
})

app.use((err,req,res,next) => {
	const { statusCode = 500 } = err;
	if(!err.message) err.message = "Something went wrong!";
	res.status(statusCode).render('error', { err });
})


const port = process.env.PORT || 3000;
app.listen(port , () => {
	console.log(`Serving on port ${port}`);
})