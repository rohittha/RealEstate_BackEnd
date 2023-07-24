const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { Property, validate } = require("../models/property");
// const upload = multer({ dest: "uploads/" }); // Specify the directory to store uploaded images

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

router.post("/", upload.array("files"), async (req, res) => {
  try {
    console.log("in property start!");
    const files = req.files.map((file) => file.filename);
    const data = JSON.parse(req.body.data);

    const { error } = validate(data);

    // if error display to property
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // if property exists, send error messsage
    const property = await Property.findOne({
      addressline1: data.addressline1,
    });

    console.log("property:", property);
    if (property)
      return res
        .status(409)
        .send({ message: "Property with given address already Exist!" });

    //to encrypt the password
    // const salt = await bcrypt.genSalt(Number(process.env.SALT));
    // const hashPassword = await bcrypt.hash(req.body.password, salt);

    // save property to db
    const finalData = {
      ...data,
      propertyImages: files,
    };

    await new Property(finalData).save();
    // await new Property({ ...req.body }).save();
    res.status(201).send({ message: "Property created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/getProperties", async (req, res) => {
  try {
    console.log("inside getAllProperty req.body: ", req.body);
    const query = req.body;
    console.log("query: ", query);

    const properties = await Property.find(query);
    if (!properties) {
      console.log("No property found!");
      return res.status(409).send({ message: "No property found!" });
    } else res.json(properties);

    //console.log("properties= ", properties);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/getAllProperty", async (req, res) => {
  try {
    console.log("inside getAllProperty req.body: ", req.body);

    const properties = await Property.find();
    if (!properties) {
      console.log("No property found!");
      return res.status(409).send({ message: "No property found!" });
    } else res.json(properties);
    console.log("===", properties);
    //console.log("properties= ", properties);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
