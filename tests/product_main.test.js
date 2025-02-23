const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const app = require("../app");  // Adjust to your app's path
const cloudinary = require("cloudinary");
chai.use(chaiHttp);
chai.should();

describe("Product API", () => {
  let adminToken;
  let nonAdminToken;
  let productId;

  // Stub Cloudinary uploader before tests
  before(() => {
    sinon.stub(cloudinary.v2.uploader, "upload").resolves({
      public_id: "dummy_id",
      secure_url: "https://dummyurl.com/image.jpg",
    });
  });

  // Restore stub after tests
  after(() => {
    cloudinary.v2.uploader.upload.restore();
  });

  // Create an admin and non-admin user for testing
  before((done) => {
    // Admin login
    chai
      .request(app)
      .post("/api/v2/login")
      .send({
        email: "admin_test@gmail.com",  // Use your admin email here
        password: "123456@abc"
      })
      .end((err, res) => {
        if (err) console.error("Admin login error:", err);
        res.should.have.status(200);
        res.body.should.have.property("token");
        adminToken = res.body.token;  // Store admin token
        console.log("Admin token:", adminToken);  // Log the admin token

        // Non-admin login
        chai
          .request(app)
          .post("/api/v2/login")
          .send({
            email: "user_1740215518895@example.com",  // Use a non-admin email here
            password: "123456@abc"
          })
          .end((err, res) => {
            if (err) console.error("Non-admin login error:", err);
            res.should.have.status(200);
            res.body.should.have.property("token");
            nonAdminToken = res.body.token;  // Store non-admin token
            console.log("Non-admin token:", nonAdminToken);  // Log the non-admin token
            done();
          });
      });
  });

  // Test: Create a product and get it by ID
  it("should create and get a single product by ID", (done) => {
    const productData = {
      name: "Test Product",
      description: "Test Product Description",
      price: 50,
      category: "Casual wear",
      stock: 100,
      offerPrice: 40,
      images: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgMBApIdl4UAAAAASUVORK5CYII="  // Demo base64 image
    };

    // Create product
    chai
      .request(app)
      .post("/api/v2/product/new")
      .set("Authorization", `Bearer ${adminToken}`)
      .set("Cookie", `token=${adminToken}`)
      .send(productData)
      .end((err, res) => {
        if (err) console.error("Create Product Error:", err);
        res.should.have.status(201);
        res.body.should.have.property("product");
        productId = res.body.product._id;  // Store the product ID

        // Get the created product
        chai
          .request(app)
          .get(`/api/v2/product/${productId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .set("Cookie", `token=${adminToken}`)
          .end((err, res) => {
            if (err) console.error("Get Product Error:", err);
            res.should.have.status(200);
            res.body.should.have.property("product");
            res.body.product.should.have.property("_id").eql(productId);
            done();
          });
      });
  });

  // Test: Should fail if non-admin tries to create a product
  it("should fail if a non-admin user tries to create a product", (done) => {
    const productData = {
      name: "Test Product",
      description: "Test Product Description",
      price: 50,
      category: "Casual wear",
      stock: 100,
      offerPrice: 40,
      images: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgMBApIdl4UAAAAASUVORK5CYII="  // Demo base64 image
    };

    chai
      .request(app)
      .post("/api/v2/product/new")
      .set("Authorization", `Bearer ${nonAdminToken}`)
      .set("Cookie", `token=${nonAdminToken}`)
      .send(productData)
      .end((err, res) => {
        if (err) console.error("Non-admin Create Product Error:", err);
        res.should.have.status(403);  // Expecting a 403 Forbidden error for non-admin users
        res.body.should.have.property("message").eql("user are not authorized to perform this action");
        done();
      });
  });

  
  // Test: Should not allow non-admin user to delete a product
  it("should not allow a non-admin user to delete a product", (done) => {
    chai
      .request(app)
      .delete(`/api/v2/product/${productId}`)
      .set("Authorization", `Bearer ${nonAdminToken}`)
      .set("Cookie", `token=${nonAdminToken}`)
      .end((err, res) => {
        if (err) console.error("Non-admin Delete Product Error:", err);
        res.should.have.status(403);  // Expecting a 403 Forbidden error for non-admin users
        res.body.should.have.property("message").eql("user are not authorized to perform this action");
        done();
      });
  });
});
