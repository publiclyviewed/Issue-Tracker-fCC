const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server'); 

chai.use(chaiHttp);

let issue1;
let issue2;

suite('Functional Tests', function() {
  suite("Routing Tests", function() {
    suite("3 Post request tests", function() {
      test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .post("/api/issues/testing123")
        .set("content-type", "application/json")
        .send({
          issue_title: "Issue 1",
          issue_text: "Functional Test",
          created_by: "fCC",
          assigned_to: "Dom",
          status_text: "Not Done",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          issue1 = res.body;
          assert.equal(res.body.issue_title, "Issue 1");
          assert.equal(res.body.assigned_to, "Dom");
          assert.equal(res.body.created_by, "fCC");
          assert.equal(res.body.status_text, "Not Done");
          assert.equal(res.body.issue_text, "Functional Test");
          done();
        });
      }).timeout(10000);

      test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {  
        chai
        .request(server)
        .post("/api/issues/testing123")
        .set("content-type", "application/json")
        .send({
          issue_title: "Issue 2",
          issue_text: "Functional Test",
          created_by: "fCC",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Issue 2");
          issue2 = res.body;
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.created_by, "fCC");
          assert.equal(res.body.status_text, "");
          assert.equal(res.body.issue_text, "Functional Test");
          done();
        });
      }).timeout(5000);

      test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .post("/api/issues/testing123")
        .set("content-type", "application/json")
        .send({
          issue_title: "",
          issue_text: "",
          created_by: "fCC",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
      }).timeout(5000);
    });

    suite("3 Get request tests", function () {
      test("View issues on a project: GET request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .get("/api/issues/testing123")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          done();
        });
      });

      test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .get("/api/issues/testing123")
        .query({
          _id: issue1._id,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body[0].issue_title, issue1.issue_title);
          assert.equal(res.body[0].issue_text, issue1.issue_text);
          done();
        });
      });

      test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .get("/api/issues/testing123")
        .query({
          issue_title: issue1.issue_title,
          issue_text: issue1.issue_text,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body[0].issue_title, issue1.issue_title);
          assert.equal(res.body[0].issue_text, issue1.issue_text);
          done();
        });
      });
    });

    suite("5 Put request tests", function () {
      test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .put("/api/issues/testing123")
        .send({
          _id: issue1._id,
          issue_title: "different",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, issue1._id);
          done();
        });
      });

      test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .put("/api/issues/testing123")
        .send({
          _id: issue1._id,
          issue_title: "random",
          issue_text: "random",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, issue1._id);
          done();
        });
      });

      test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .put("/api/issues/testing123")
        .send({
          issue_title: "update",
          issue_text: "update",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
      });

      test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .put("/api/issues/testing123")
        .send({
          _id: issue1._id,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
      });

      test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .put("/api/issues/testing123")
        .send({
          _id: "654364bc8f71f915ddb9975f",
          issue_title: "update",
          issue_text: "update",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          done();
        });
      });
    });

    suite("3 DELETE request Tests", function () {
      test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .delete("/api/issues/testing123")
        .send({ _id: issue1._id })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          done();
        });
      });

      test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .delete("/api/issues/testing123")
        .send({ _id: "654364bc8f71f915ddb9975f" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
          done();
        });
      });

      test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
        chai
        .request(server)
        .delete("/api/issues/testing123")
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
      });
    });
  });
});
