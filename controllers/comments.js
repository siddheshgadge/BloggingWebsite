const Blogspace = require('../models/blogspace');
const Comment = require('../models/comment');

module.exports.createComments = async (req,res) => {
	const blog = await Blogspace.findById(req.params.id);
	const comment = new Comment(req.body.comment);
	comment.author = req.user._id;
	blog.comments.push(comment);
	await comment.save();
	await blog.save();
	req.flash('success', 'Successfully commented');
	res.redirect(`/blogs/${blog._id}`);
}

module.exports.deleteComments = async (req,res) => {
	const { id, commentId} = req.params;
	Blogspace.findByIdAndUpdate(id, { $pull: {comments: commentId} });
	await Comment.findByIdAndDelete(commentId);
	req.flash('success', 'Successfully deleted a comment');
	res.redirect(`/blogs/${id}`);
}