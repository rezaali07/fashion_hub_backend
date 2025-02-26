const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");  // Adjust to your app's path

chai.use(chaiHttp);
chai.should();

describe("GET /api/v2/products", () => {
  let adminToken;  // Variable to store the admin token

  // Login and store the token before the test
  before((done) => {
    chai
      .request(app)
      .post("/api/v2/login")
      .send({
        email: "testadmin@gmail.com",  // Use an actual admin account email
        password: "123456789"  // Use the correct password for the admin
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("token");  // Ensure token is present in the response
        adminToken = res.body.token;  // Store the token
        done();
      });
  });

  // Test case for getting all products
  it("should get all products", (done) => {
    chai
      .request(app)
      .get("/api/v2/products")  // The correct endpoint for getting all products
      .set("Authorization", `Bearer ${adminToken}`)  // Use the stored token for authentication
      .set("Cookie", `token=${adminToken}`)  // Store the token as a cookie (if needed)
      .end((err, res) => {
        res.should.have.status(200);  // Expecting a successful retrieval with status 200
        res.body.should.have.property("success").eql(true);  // Check for success in response
        res.body.should.have.property("products").that.is.an("array");  // Ensure the response has a 'products' array
        done();
      });
  });
});
