const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server"); // Ensure correct path to your server
const { expect } = chai;

chai.use(chaiHttp);

const agent = chai.request.agent(server); // Use agent to persist cookies

// Function to generate a unique email for each test run
const generateRandomEmail = () => {
  return `user_${Date.now()}@gmail.com`;
};

let testEmail = generateRandomEmail();
let authToken; // Store auth token globally
let adminToken; // Store admin token for admin routes
let userId; // Store user ID for admin routes

describe("User Authentication API", () => {
  it("User Registration", (done) => {
    agent
      .post("/api/v2/register")
      .send({
        name: "Test User",
        email: testEmail,
        password: "123456789",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        userId = res.body.user._id; // Store user ID
        done();
      });
  });

  it("User Login", (done) => {
    agent
      .post("/api/v2/login")
      .send({
        email: testEmail,
        password: "123456789",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("token");
        authToken = res.body.token;
        done();
      });
  });

  it("Get User Details", (done) => {
    agent
      .get("/api/v2/me")
      .set("Authorization", `Bearer ${authToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("Update User Profile", (done) => {
    agent
      .put("/api/v2/me/update/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Updated Test User",
        email: testEmail,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("User Logout", (done) => {
    agent
      .get("/api/v2/logout")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  /** Admin Routes Tests **/
  it("Admin - Login as Admin", (done) => {
    agent
      .post("/api/v2/login")
      .send({
        email: "testadmin@gmail.com", // Ensure this admin exists
        password: "123456789",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("token");
        adminToken = res.body.token;
        done();
      });
  });

  it("Admin - Get All Users", (done) => {
    agent
      .get("/api/v2/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("Admin - Get Single User Details", (done) => {
    agent
      .get(`/api/v2/admin/user/${userId}`) // Use stored userId instead of testEmail
      .set("Authorization", `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("Admin - Update User Role", (done) => {
    agent
      .put(`/api/v2/admin/user/${userId}`) // Use stored userId instead of testEmail
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "admin" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("Admin - Delete User", (done) => {
    agent
      .delete(`/api/v2/admin/user/${userId}`) // Use stored userId instead of testEmail
      .set("Authorization", `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});





// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const server = require("../../server"); // Ensure correct path to your server
// const { expect } = chai;

// chai.use(chaiHttp);

// const agent = chai.request.agent(server); // Use agent to persist cookies

// // Function to generate a unique email for each test run
// const generateRandomEmail = () => {
//   return `user_${Date.now()}@gmail.com`;
// };

// describe("User Authentication API", () => {
//   let testEmail = generateRandomEmail();

//   it("User Registration", (done) => {
//     agent
//       .post("/api/v2/register")
//       .send({
//         name: "Test User",
//         email: testEmail, // Use the dynamically generated email
//         password: "123456@abc",
//       })
//       .end((err, res) => {
//         expect(res).to.have.status(201); // Updated from 200 to 201
//         done();
//       });
//   });

//   it("User Login", (done) => {
//     agent
//       .post("/api/v2/login")
//       .send({
//         email: testEmail, // Use the same email registered
//         password: "123456@abc",
//       })
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res).to.have.cookie("token"); // Ensure token cookie is set
//         done();
//       });
//   });

//   it("User Logout", (done) => {
//     agent
//       .get("/api/v2/logout") // Ensure this matches your backend logout route
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res).to.not.have.cookie("token"); // Ensure token cookie is removed
//         done();
//       });
//   });
// });