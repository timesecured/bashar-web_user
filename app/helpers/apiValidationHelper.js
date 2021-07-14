const joi = require('joi');

module.exports = {

	validateBody: (schema) => {
		return (req, res, next) => {
			const result = joi.validate(req.body, schema, (err, value) => {
				if (err) {
					return res.status(422).json({
						success: false,
						message: err.details[0].message.replace(/[^a-zA-Z ]/g, ""),
					});
				} else {
					req.data = value;
					next();
				}
			});
		}
	},
	validateQuery: (schema) => {
		return (req, res, next) => {
			const result = joi.validate(req.query, schema, (err, value) => {
				if (err) {
					return res.status(422).json({
						success: false,
						message: err.details[0].message.replace(/[^a-zA-Z ]/g, ""),
					});
				} else {
					req.data = value;
					next();
				}
			});
		}
	},
	validateFile: (schema) => {
		return (req, res, next) => {
			const result = joi.validate(req.file, schema, (err, value) => {
				if (err) {
					return res.status(422).json({
						success: false,
						message: err.details[0].message.replace(/[^a-zA-Z ]/g, ""),
					});
				} else {
					req.data = value;
					next();
				}
			});
		}
	},

	schemas: {

		signInSchema: joi.object().keys({
			userName: joi.string().required(),
			password: joi.string().required(),
			deviceType: joi.number().empty(''),
			deviceToken: joi.string().empty(''),
		}),

		updateProfileSchema: joi.object().keys({
			email: joi.string().required(),
			firstName: joi.string().empty(''),
			lastName: joi.string().empty(''),
			gender: joi.string().empty(''),
			about: joi.string().empty(''),
			phone: joi.string().empty(''),
			dob: joi.string().empty(''),
		}),

		createUserSchema: joi.object().keys({
			firstName: joi.string().empty(''),
			lastName: joi.string().empty(''),
			userName: joi.string().required(),
			email: joi.string().required(),
			password: joi.string().required(),
			phone: joi.string().empty(''),
			deviceType: joi.number().empty(''),
			deviceToken: joi.string().empty(''),
		}),

		forgotPasswordSchema: joi.object().keys({
			email: joi.string().required(),
		}),

		socialLoginSchema: joi.object().keys({
			userName: joi.string().required(),
			email: joi.string().required(),
			socialType: joi.number().required(),
			socialId: joi.string().required(),
			deviceType: joi.number().empty(''),
			deviceToken: joi.string().empty(''),
		}),

		addVaultSchema: joi.object().keys({
			name: joi.string().required(),
			fileName: joi.string().empty(''),
			phoneNumber: joi.string().required(),
			beneficiaries: joi.string().required(),
			triggerType: joi.number().required(),
			triggerDate: joi.string().empty(''),
			triggerTime: joi.string().empty(''),
			alertDuration: joi.number().empty(''),
			notes: joi.string().empty(''),
		}),

		updateVaultSchema: joi.object().keys({
			vaultId: joi.number().required(),
			vaultFiles: joi.number().empty(''),
			name: joi.string().empty(''),
			fileName: joi.string().empty(''),
			phoneNumber: joi.string().empty(''),
			beneficiaries: joi.string().empty(''),
			triggerType: joi.number().empty(''),
			triggerDate: joi.string().empty(''),
			triggerTime: joi.string().empty(''),
			alertDuration: joi.number().empty(''),
			notes: joi.string().empty(''),
		}),

		userIdSchema: joi.object().keys({
			userId: joi.number().required(),
		}),

		addBeneficiarySchema: joi.object().keys({
			name: joi.string().required(),
			relation: joi.string().required(),
			email: joi.string().required(),
			workContact: joi.string().empty(''),
			homeContact: joi.string().empty(''),
			mobileNumber: joi.string().empty(''),
			image: joi.string().empty(''),
		}),

		contactUsSchema: joi.object().keys({
			name: joi.string().required(),
			email: joi.string().required(),
			subject: joi.string().required(''),
			message: joi.string().empty('')
		}),


	}
}
