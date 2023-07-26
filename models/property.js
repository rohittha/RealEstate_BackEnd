const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { array } = require("joi");
// const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema(
  {
    addressline1: { type: String, required: true },
    addressline2: { type: String },
    city: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, required: true },
    zipcode: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    baths: { type: Number, required: true },
    price: { type: Number, required: true },
    listingtype: { type: String, required: true },
    propertyImages: { type: Array, required: true },
    // coverimage: { type: String, required: true },
  },
  { strict: "throw" }
);

// userSchema.methods.generateAuthToken = function () {
//   const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
//     expiresIn: "7d",
//   });
//   return token;
// };

const Property = mongoose.model("property", userSchema);

const validate = (data) => {
  const schema = Joi.object({
    // addressLine1: Joi.string().required().label("Address Line 1"),
    // addressLine2: Joi.string().allow(""),
    // city: Joi.string().required().label("City"),
    // province: Joi.string().required().label("Province"),
    // country: Joi.string().required().label("Country"),
    // zipcode: Joi.string().required().label("Zip Code"),
    // bedrooms: Joi.number().required().label("Bedrooms"),
    // baths: Joi.number().required().label("Baths"),
    // price: Joi.number().required().label("Price"),
    // listingType: Joi.string().required().label("Listing Type"),
    // coverImage: Joi.string().required().label("Cover Image"),
    addressline1: Joi.string().required().label("Address Line 1"),
    addressline2: Joi.string().allow(""),
    city: Joi.string().required().label("City"),
    province: Joi.string().required().label("Province"),
    country: Joi.string().required().label("Country"),
    zipcode: Joi.string().required().label("Zip Code"),
    bedrooms: Joi.number().required().label("Bedrooms"),
    baths: Joi.number().required().label("Baths"),
    price: Joi.number().required().label("Price"),
    listingtype: Joi.string().required().label("Listing Type"),
    // propertyImages: Joi.array().required().label(" Property Images"),
    // coverimage: Joi.string().label("Cover Image"),
  });
  return schema.validate(data);
};

module.exports = { Property, validate };
