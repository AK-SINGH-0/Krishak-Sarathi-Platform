const Contact = require('../models/Contact');

// @desc   Submit a contact-us message
// @route  POST /api/contact
// @access Public
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    // Frontend field is called "email" in state but represents "contact" (email or phone)
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const contact = await Contact.create({ name, contact: email, subject, message });
    return res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.', contact });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { submitContact };
