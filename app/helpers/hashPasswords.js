const bcrypt = require('bcryptjs');
const saltRounds = 10;

const generatePass = async (pass) => {
  const generateSalt = await bcrypt.genSalt(saltRounds);
  const generateHash = await bcrypt.hash(pass, generateSalt);

  return generateHash;
};

const comparePass = async (requestPass, dbPass) => {
  const match = await bcrypt.compare(requestPass, dbPass);
  return match;
};

module.exports = {
  generatePass,
  comparePass
}
