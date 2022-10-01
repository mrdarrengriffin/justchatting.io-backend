const User = require("../../models/auth/user");

exports.registerNewUser = async (req, res) => {
    try {
        let isUser = await User.find({ email: req.body.email });
        if (isUser.length >= 1) {
            return res.status(409).json({
                error: "email already in use",
            });
        }
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        let data = await user.save();
        const token = await user.generateAuthToken(); // here it is calling the method that we created in the model
        res.status(201).json({ data, token });
    } catch (err) {
        res.status(400).json({ error: err.errors });
    }
};
exports.loginUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findByCredentials(email, password);
    if (!user) {
        return res.status(401).json({
            error: "Invalid login credentials",
        });
    }
    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
};
exports.getUserDetails = async (req, res) => {
    await res.json(req.userData);
};
