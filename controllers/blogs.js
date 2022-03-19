const Blogspace = require('../models/blogspace');

module.exports.index = async (req,res) => {
	const blogs = await Blogspace.find({}).populate('author').sort('-createdAt');
	res.render('blogs/index',{ blogs });
}

module.exports.userBlogs = async (req, res) => {
	const blogs = await Blogspace.find().populate('author').sort('-createdAt');
	console.log(req.body.blog);
	const filteredBlogs = [];
	for (var i = 0; i < blogs.length; i++) {
		if(blogs[i].author._id.equals(req.user._id)){
			filteredBlogs.push(blogs[i]);
		}
	}
	res.render('blogs/usersBlog',{ filteredBlogs });
}

module.exports.renderNewForm = (req,res) => {
	res.render('blogs/new');
}

module.exports.createBlog = async (req,res) => {
	// if (!req.body.blog) throw new ExpressError('Invalid Campground Data', 400);
	const blog = new Blogspace(req.body.blog);
	blog.author = req.user._id;
	await blog.save();
	req.flash('success', 'Successfully uploaded a Blog');
	res.redirect(`/blogs/${blog._id}`)
}

module.exports.showBlog = async (req, res) => {
	const blog = await Blogspace.findById(req.params.id).populate({
		path: 'comments',
		populate: {
			path: 'author'
		}
	}).populate('author');
	if(!blog){
		req.flash('error', 'Blog not found');
		return res.redirect('/blogs');
	}
	res.render('blogs/show',{ blog });
}

module.exports.renderEditForm = async (req, res) => {
	const blog = await Blogspace.findById(req.params.id);
	res.render('blogs/edit',{ blog });
}

module.exports.updateBlog = async (req,res) => {
	const { id } = req.params;
	const blog = await Blogspace.findByIdAndUpdate(id, { ...req.body.blog });
	req.flash('success', 'Successfully updated a blog');
	res.redirect(`/blogs/${blog._id}`);
}

module.exports.deleteBlog = async (req,res) => {
	const { id } = req.params;
	await Blogspace.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted a blog');
	res.redirect('/blogs');
}