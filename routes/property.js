const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { Property, validate } = require("../models/property");
// const upload = multer({ dest: "uploads/" }); // Specify the directory to store uploaded images
// Azure code :
const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();

// Multer config for -> localhost
// const storage = multer.diskStorage({
//   destination: "./uploads/",
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

const storage = multer.memoryStorage(); // Multer config for -> Azure to store in memory temporarily
const upload = multer({ storage });

// // AZURE storage code  START------------------------------------
// async function uploadToHomeiseImages() {
//   try {
//     console.log("Azure Blob storage code start");
//     // Quick start code goes here
//     const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
//     const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
//     if (!accountName) throw Error("Azure Storage accountName not found");

//     const blobServiceClient = new BlobServiceClient(
//       `https://${accountName}.blob.core.windows.net`,
//       new DefaultAzureCredential()
//     );

//     // UPLOAD BLOBS TO CONTAINER =================
//     // Create a unique name for the blob
//     const blobName = "hmfile-" + uuidv1() + ".txt";
//     const imageBuffer = req.file.buffer;
//     const bufferSize = Buffer.byteLength(imageBuffer);

//     // Get reference to the container
//     const containerClient = blobServiceClient.getContainerClient(containerName);

//     // Get a block blob client
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//     // Display blob name and url
//     console.log(
//       `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
//     );

//     // Upload data to the blob
//     const data = "Hello, World!";
//     const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
//     console.log(
//       `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
//     );

//     // UPLOAD BLOBS TO CONTAINER =============
//   } catch (err) {
//     console.err(`Error: ${err.message}`);
//   }
// }

// uploadToHomeiseImages()
//   .then(() => console.log("Done"))
//   .catch((ex) => console.log(ex.message));

// AZURE storage code END ----------------------------

// Post Method to upload image -----------------------------------------------------------------------------------
router.post("/", upload.single("files"), async (req, res) => {
  try {
    console.log("Azure upload start !");
    //const files = req.files.map((file) => file.filename);
    const files = req.file.originalname;
    const imagefile = req.file.buffer;
    const bufferSize = Buffer.byteLength(imagefile);
    const filename = req.file.originalname;
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    const data = JSON.parse(req.body.data);

    const { error } = validate(data);

    // if error display to property
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // if property exists, send error messsage
    const property = await Property.findOne({
      addressline1: data.addressline1,
    });

    // -----------------------------------------------------
    console.log("Azure Blob storage code start");

    const AZURE_STORAGE_CONNECTION_STRING =
      process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw Error("Azure Storage Connection string not found");
    }

    // Create the BlobServiceClient object with connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // // Quick start code goes here
    // const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    // if (!accountName) throw Error("Azure Storage accountName not found");

    // const blobServiceClient = new BlobServiceClient(
    //   `https://${accountName}.blob.core.windows.net`,
    //   new DefaultAzureCredential()
    // );

    // Get container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // UPLOAD BLOBS TO CONTAINER =================
    // Create a unique name for the blob
    const blobName = "hmfile-" + uuidv1() + path.extname(filename);

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Display blob name and url
    console.log(
      `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
    );

    //const dataLength = dataToUpload get byte length TODO
    const uploadBlobResponse = await blockBlobClient.upload(
      imagefile,
      bufferSize
    );
    console.log(
      `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
    );

    // UPLOAD BLOBS TO CONTAINER =============
    // -----------------------------------------------------

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
      propertyImages: blobName,
    };

    await new Property(finalData).save();
    // await new Property({ ...req.body }).save();
    res.status(201).send({ message: "Property created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/:id", upload.array("files"), async (req, res) => {
  try {
    console.log("--inside put -----");
    const { id } = req.params;
    const data = JSON.parse(req.body.data);
    // const files = req.files.map((file) => file.filename);
    if (data._id) {
      delete data._id; // Remove the _id field to prevent updating it
      delete data.__v;
      delete data.propertyImages;
    }

    const { error } = validate(data);

    // Check for validation error and return a 400 response with the error message
    if (error) {
      console.log("-------", error);
      console.log("Validation error:", error);
      return res.status(400).send({ message: error.details[0].message });
    }

    // Update the document in MongoDB
    const updatedData = {
      ...data,
    };

    // Using `findOneAndUpdate` to update the document and exclude the _id field
    await Property.findOneAndUpdate({ _id: id }, updatedData, { new: true });
    res.status(200).json({
      message: "Form data saved successfully!",
      updatedData: updatedData,
    });
    // res.status(200).send({ message: "Property updated successfully" });
  } catch (error) {
    console.log("----------!", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/getProperties", async (req, res) => {
  try {
    console.log("inside getAllProperty req.body: ", req.body);
    // const query = req.body;
    const { city, bedrooms, baths, province, price } = req.body;
    const query = {};

    //creating a query for the available properties only coming from front end.
    if (city) query.city = city;
    if (bedrooms) query.bedrooms = bedrooms;
    if (baths) query.baths = baths;
    if (province) query.province = province;
    if (price) query.price = price;

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
