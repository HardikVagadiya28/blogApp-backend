const request = require("supertest");
const app = require("./app");

// Test the basic routes
async function testRoutes() {
  console.log("Testing API routes...");

  try {
    const response1 = await request(app).get("/");
    console.log("Root route:", response1.status, response1.body);

    const response2 = await request(app).get("/health");
    console.log("Health route:", response2.status, response2.body);

    const response3 = await request(app).get("/api/health");
    console.log("API Health route:", response3.status, response3.body);

    const response4 = await request(app).get("/api/test");
    console.log("API Test route:", response4.status, response4.body);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testRoutes();
