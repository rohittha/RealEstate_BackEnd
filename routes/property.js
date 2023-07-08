const router = require("express").Router();
const multer = require("multer");
const { Property, validate } = require("../models/property");
const upload = multer({ dest: "uploads/" }); // Specify the directory to store uploaded images

router.post("/", upload.single("imagefile"), async (req, res) => {
  try {
    console.log("in property start!");
    const imageFile = req.body.imagefile;
    const { error } = validate(req.body);

    // if error display to property
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // if property exists, send error messsage
    const property = await Property.findOne({
      addressline1: req.body.addressline1,
    });
    if (property)
      return res
        .status(409)
        .send({ message: "Property with given address already Exist!" });

    //to encrypt the password
    // const salt = await bcrypt.genSalt(Number(process.env.SALT));
    // const hashPassword = await bcrypt.hash(req.body.password, salt);

    // save property to db
    await new Property({ ...req.body }).save();
    res.status(201).send({ message: "Property created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/getAllProperty", async (req, res) => {
  try {
    console.log("inside getAllProperty");
    const properties = await Property.find();
    if (!properties)
      return res.status(409).send({ message: "No property found!" });
    else res.json(properties);

    console.log("properties= ", properties);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
