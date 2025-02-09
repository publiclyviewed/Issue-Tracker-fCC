'use strict';

const mongoose = require("mongoose");
const { Project } = require("../models");
const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;

module.exports = function(app) {
  app.route("/api/issues/:project")
    .get(async (req, res) => {
      let projectName = req.params.project;
      console.log('Fetching issues for project:', projectName); 
      try {
        const project = await ProjectModel.findOne({ name: projectName });
        if (!project) {
          console.log('Project not found:', projectName); 
          res.json([{ error: "project not found" }]);
          return;
        } else {
          const issues = await IssueModel.find({
            projectId: project._id,
            ...req.query,
          });
          if (!issues || issues.length === 0) {
            res.json([{ error: "no issues found" }]);
            return;
          }
          res.json(issues);
        }
      } catch (err) {
        console.error('Error fetching issues:', err);
        res.json({ error: "could not get issues" });
      }
    })

    .post(async (req, res) => {
      let projectName = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      console.log('Creating issue for project:', projectName); 

      if (!issue_title || !issue_text || !created_by) {
        console.log('Missing required fields:', { issue_title, issue_text, created_by }); 
        res.json({ error: "required field(s) missing" });
        return;
      }

      try {
        let projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          projectModel = new ProjectModel({ name: projectName });
          projectModel = await projectModel.save();
          console.log('Created new project:', projectName); 
        }

        const newIssue = new IssueModel({
          projectId: projectModel._id,
          issue_title: issue_title || "",
          issue_text: issue_text || "",
          created_on: new Date(),
          updated_on: new Date(),
          created_by: created_by || "",
          assigned_to: assigned_to || "",
          open: true,
          status_text: status_text || "",
        });

        await newIssue.save();
        await projectModel.save();

        console.log('Created new issue:', newIssue); 
        res.json(newIssue);
      } catch (err) {
        console.error('Error creating issue:', err); 
        res.status(500).json({ error: "server error" });
      }
    })

    .put(async (req, res) => {
      let projectName = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
    
      if (!_id) {
        return res.json({ error: "missing _id" });
      }
    
      // Dynamically check for update fields
      const updateFields = { issue_title, issue_text, created_by, assigned_to, status_text, open };
      const hasUpdates = Object.values(updateFields).some(value => value !== undefined && value !== "");
    
      if (!hasUpdates) {
        return res.json({ error: "no update field(s) sent", _id });
      }
    
      try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          throw new Error("project not found");
        }
    
        // Construct safe update object
        const updateData = { updated_on: new Date() };
        if (issue_title) updateData.issue_title = issue_title;
        if (issue_text) updateData.issue_text = issue_text;
        if (created_by) updateData.created_by = created_by;
        if (assigned_to) updateData.assigned_to = assigned_to;
        if (status_text) updateData.status_text = status_text;
        if (open !== undefined) updateData.open = open;
    
        const issue = await IssueModel.findByIdAndUpdate(_id, updateData, { new: true });
    
        if (!issue) {
          return res.json({ error: "could not update", _id });
        }
    
        res.json({ result: "successfully updated", _id });
      } catch (err) {
        console.error("Error updating issue:", err);
        res.json({ error: "could not update", _id });
      }
    })
    

    .delete(async (req, res) => {
      let projectName = req.params.project;
      const { _id } = req.body;
      console.log('Request body for delete:', req.body); 

      if (!_id) {
        console.log('Missing _id:', req.body); 
        res.json({ error: "missing _id" });
        return;
      }

      try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          console.log('Project not found for delete:', projectName); 
          throw new Error("project not found");
        }

        const result = await IssueModel.deleteOne({
          _id: _id,
          projectId: projectModel._id,
        });

        if (result.deletedCount === 0) {
          console.log('No issues deleted for _id:', _id);
          throw new Error("ID not found");
        }

        res.json({ result: "successfully deleted", _id: _id });
      } catch (err) {
        console.error('Error deleting issue:', err); 
        res.json({ error: "could not delete", _id });
      }
    });
};
