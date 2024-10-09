import Users from "../models/UserModel.js";

export const verifyUser = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
    }

    try {
        // Cari user berdasarkan UUID yang disimpan di session
        const user = await Users.findOne({
            where: {
                uuid: req.session.userId // pastikan userId sudah di set saat login
            }
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }
        req.userId = user.id;
        req.role = user.role;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
        
}

export const adminOnly = async (req, res, next) => {
    try {
        // Cari user berdasarkan UUID yang disimpan di session
        const user = await Users.findOne({
            where: {
                uuid: req.session.userId // pastikan userId sudah di set saat login
            }
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });

        }if (user.role !== "admin")
            return res.status(403).json({msg: "akses terlarang"})
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
        
}