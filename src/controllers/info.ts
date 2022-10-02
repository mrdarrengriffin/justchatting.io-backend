exports.server = async (req, res) => {
    return res.status(200).json({
        version: "1.0.0",
    });
};
