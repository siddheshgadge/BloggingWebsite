const Joi = require('joi');

module.exports.blogSchema = Joi.object({
	blog: Joi.object({
		title: Joi.string().required().min(2),
		subtitle: Joi.string().required().min(2),
		description: Joi.string().required().min(10)
	}).required()
});

module.exports.commentSchema = Joi.object({
	comment: Joi.object({
		body: Joi.string().required().min(2)
	}).required()	
})