const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    //check user exists or not
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(401).send({ message: "Invalid Email or Password" });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Email or Password" });

    const token = await user.generateAuthToken();

    // if email and password correct, send token
    res.status(200).send({ data: token, message: "logged in successfully" });
  } catch (error) {
    console.log("error on signup:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/test", async (req, res) => {
  try {
    res.status(200).send({ message: "Test ran successfully for azure!!! " });
  } catch (error) {
    console.log("test not working:", error);
    res.status(500).send({ message: "Internal Server Error test" });
  }
});

const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;
