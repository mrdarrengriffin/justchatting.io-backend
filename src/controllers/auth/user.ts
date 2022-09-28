const User = require("../../models/auth/user");

exports.registerNewUser = async (req, res) => {
    let isUser = await User.find({ email: req.body.email });
    console.log(isUser);
    if (isUser.length >= 1) {
        return res.status(409).json({
            message: "email already in use",
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
};
exports.loginUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findByCredentials(email, password);
    console.log(user);
    if (!user) {
        return res.status(401).json({
            error: "Login failed! Check authentication credentials",
        });
    }
    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
};
exports.getUserDetails = async (req, res) => {
    await res.json(req.userData);
};
