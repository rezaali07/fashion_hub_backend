const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  createProductReview,
  getSingleProductReviews,
  deleteProductReview,
} = require("../controller/ProductController");
const { isAuthenticatedUser, authorizedRoles, auth } = require("../middleware/auth");
const router = express.Router();

router.route("/products").get(getAllProducts);


module.exports = router;
