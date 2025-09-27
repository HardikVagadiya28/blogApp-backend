const Contact = require("../models/Contact");

const contactController = {
  createContact: async (req, res) => {
    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          msg: "All fields are required",
        });
      }

      const contact = await Contact.create({ name, email, message });

      res.status(201).json({
        success: true,
        msg: "Message sent successfully!",
        contact: contact,
      });
    } catch (error) {
      console.error("Create contact error:", error);
      res.status(500).json({
        success: false,
        msg: "Error sending message",
      });
    }
  },

  getContacts: async (req, res) => {
    try {
      const contacts = await Contact.find().sort({ date: -1 });

      res.json({
        success: true,
        contacts: contacts,
      });
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({
        success: false,
        msg: "Error fetching contacts",
      });
    }
  },
};

module.exports = contactController;
