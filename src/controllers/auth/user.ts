const User = require("../../models/auth/user");
exports.register = async (req, res) => {
    // Check to see ifa user by the provided email exists
    let isUser = await User.findOne({ email: req.body.email });

    // If the user exists, exit with error
    if (!!isUser) {
        return res.status(409).json({
            validation: { email: "This email aready exists" },
        });
    }

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });

    const userValidation = user.validateSync();

    if (userValidation) {
        const validationErrors = {};
        Object.keys(userValidation.errors).forEach((key) => {
            validationErrors[key] = userValidation.errors[key].message;
        });

        return res.status(409).json({
            validation: validationErrors,
        });
    }

    let data = await user.save();
    const token = await user.generateAuthToken(); // here it is calling the method that we created in the model
    res.status(201).json({ data, token });
};
exports.login = async (req, res) => {
    const validation = {};

    const email = req.body.email;
    if (!email) {
        validation["email"] = "This is required";
    }

    const password = req.body.password;
    if (!password) {
        validation["password"] = "This is required";
    }

    if (Object.keys(validation).length > 0) {
        return res.status(401).json({
            validation: validation,
        });
    }

    const user = await User.findByCredentials(email, password);

    if (!user) {
        return res.status(401).json({
            error: "Invalid login credentials",
        });
    }

    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
};

exports.getUser = async (req, res) => {
    await res.json(req.userData);
};
