const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWT_SECRET = require('../config/main.js').JWT_SECRET;
const db = require('../models');
const User = db.users;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = JWT_SECRET;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
		try {
			const user = await User.findOne({
				where : {
					id : jwt_payload.sub
				}
			});
			if (!user) {
				return done(null, false);
			}
			done(null, user);
		} catch (error) {
			done(error, false);
		}
    }));
};


