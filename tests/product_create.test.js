const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const app = require("../app");  // Adjust to your app's path
const cloudinary = require("cloudinary");
chai.use(chaiHttp);
chai.should();

describe("POST /api/v2/product/new", () => {
  let authToken;  // Variable to store the authentication token

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

  // Login and store the token before the test
  before((done) => {
    chai
      .request(app)
      .post("/api/v2/login")
      .send({
        email: "testadmin@gmail.com",
        password: "123456789"
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("token");
        authToken = res.body.token;
        done();
      });
  });

  it("should create a new product", (done) => {
    // Demo base64 image string (1x1 transparent PNG)
    const demoBase64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgMBApIdl4UAAAAASUVORK5CYII=";

    const productData = {
      name: "New Product",
      description: "A new product for testing",
      price: 100,
      category: "Casual wear",
      stock: 50,
      offerPrice: 75,
      images: demoBase64Image
    };

    chai
      .request(app)
      .post("/api/v2/product/new")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Cookie", `token=${authToken}`)
      .send(productData)
      .end((err, res) => {
        res.should.have.status(201); // Expecting a successful creation with status 201
        res.body.should.have.property("success").eql(true);
        res.body.should.have.property("product").that.is.an("object");
        done();
      });
  });
});
