const { blogSchema, commentSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Blogspace = require('./models/blogspace');
const Comment = require('./models/comment')

module.exports.isLoggedIn = (req, res, next) => {
	if(!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'You must be first Log In');
		return res.redirect('/login');
	}
	next();
}

module.exports.validateBlog = (req, res, next) => {
	const { error } = blogSchema.validate(req.body);
	if(error){
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400)
	} else{
		next();
	}
}

module.exports.validateComment = (req, res, next) => {
	const { error } = commentSchema.validate(req.body);
	if(error){
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400)
	} else{
		next();
	}
}

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const blog = await Blogspace.findById(id);
	if(!blog.author.equals(req.user._id)){
		req.flash('error','You do not have permission');
		return res.redirect(`/blogs/${id}`);
	}
	next(); 
}

module.exports.isCommentAuthor = async (req, res, next) => {
	const { id, commentId } = req.params;
	const comment = await Comment.findById(commentId);
	if(!comment.author.equals(req.user._id)){
		req.flash('error','You do not have permission');
		return res.redirect(`/blogs/${id}`);
	}
	next(); 
}

