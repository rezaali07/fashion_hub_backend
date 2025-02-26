const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");  // Make sure your app.js or server file is correctly set up
chai.use(chaiHttp);
chai.should();

describe("Admin Order Management", () => {
  let adminToken;
  let orderId;

  // Set up admin token before tests
  before((done) => {
    chai
      .request(app)
      .post("/api/v2/login")
      .send({
        email: "testadmin@gmail.com",  // Admin email
        password: "123456789"  // Admin password
      })
      .end((err, res) => {
        if (err) {
          console.log("Login Error: ", err);
        }

        res.should.have.status(200);
        res.body.should.have.property("token");

        // Save the token for authorization in subsequent requests
        adminToken = res.body.token;

        // Log the token to verify it's correct (for debugging)
        console.log('Admin Token:', adminToken);

        // Create an order to obtain orderId for delete test
        chai
          .request(app)
          .post("/api/v2/order/new")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            shippingInfo: {
              address: "123 Main St",
              city: "Some City",
              postalCode: "12345",
              country: "Country"
            },
            orderItems: [
              {
                product: "67b9a5d67b0624dae8fc28e2",  // Replace with actual product ID
                name: "Test Product",
                quantity: 1,
                price: 50
              }
            ],
            paymentInfo: {
              status: "Paid",
              method: "Credit Card"
            },
            itemsPrice: 50,
            taxPrice: 5,
            shippingPrice: 10,
            totalPrice: 65
          })
          .end((err, res) => {
            res.should.have.status(201);
            res.body.should.have.property("order");
            orderId = res.body.order._id;  // Save the orderId for future tests
            done();
          });
      });
  });

  // // Test for getting all orders as admin
  // it("should get all orders as admin", (done) => {
  //   chai
  //     .request(app)
  //     .get("/api/v2/admin/orders")
  //     .set("Authorization", `Bearer ${adminToken}`)
  //     .end((err, res) => {
  //       console.log('Response:', res.body);  // Log response for debugging

  //       res.should.have.status(200);
  //       res.body.should.have.property("orders").that.is.an("array");
  //       res.body.should.have.property("totalAmount");
  //       done();
  //     });
  // });

  // // Test for updating order status (admin only)
  // it("should update order status (admin)", (done) => {
  //   chai
  //     .request(app)
  //     .put(`/api/v2/admin/orders/${orderId}`)
  //     .set("Authorization", `Bearer ${adminToken}`)
  //     .send({ status: "Shipped" })
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       done();
  //     });
  // });

  // // Test for deleting an order (admin only)
  // it("should delete an order (admin)", (done) => {
  //   chai
  //     .request(app)
  //     .delete(`/api/v2/admin/orders/${orderId}`)
  //     .set("Authorization", `Bearer ${adminToken}`)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       done();
  //     });
  // });
});
