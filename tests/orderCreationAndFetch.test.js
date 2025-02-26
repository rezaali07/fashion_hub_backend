const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
chai.use(chaiHttp);
chai.should();

describe("Order History API", () => {
  let adminToken;

  // Set up admin token before tests
  before((done) => {
    chai
      .request(app)
      .post("/api/v2/login")
      .send({
        email: "testadmin@gmail.com",  // Admin email
        password: "123456789"
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("token");
        adminToken = res.body.token;
        done();
      });
  });

  // Test for creating an order history
  it("should create order history", (done) => {
    const orderHistoryData = {
      ProductName: "Test Product",
      ProductPrice: 50,
      ProductImage: "image_url",
      PaymentType: "Credit Card",
      Address: "123 Test Street",
      Email: "user_1740215518895@example.com",
    };

    chai
      .request(app)
      .post("/api/v2/order/flutter/create")
      .send(orderHistoryData)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.have.property("orderHistory");
        done();
      });
  });

  // Test for getting order history by email
  it("should get order history by email", (done) => {
    chai
      .request(app)
      .get("/api/v2/order/flutter/user_1740215518895@example.com")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      });
  });
});
