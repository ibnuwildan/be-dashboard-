import Users from "../models/UserModel.js";
import  argon2 from "argon2";

export const Login = async (req, res) => {
    const user = await Users.findOne({
        where: {
            email: req.body.email
        }
    });
    if(!user) {
        return res.status(404).json({msg: "user tidak di temukan"});
    }
    const match = await argon2.verify(user.password, req.body.password);
    if(!match){
         return res.status(400).json({msg: "worng password"})
    }
    req.session.userId = user.uuid;
    const uuid = user.uuid
    const name = user.name
    const email = user.email
    const role = user.role
    res.status(200).json({uuid, name, email, role})
}

export const Me = async (req, res) => {
    // Cek apakah user sudah login dengan memeriksa session
    if (!req.session.userId) {
        return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
    }

    try {
        // Cari user berdasarkan UUID yang disimpan di session
        const user = await Users.findOne({
            attributes: ['uuid', 'name', 'email', 'role'],
            where: {
                uuid: req.session.userId // pastikan userId sudah di set saat login
            }
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // Kirim respons user jika ditemukan
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};

export const LogOut = (req, res) => {
    req.session.destroy((err) => {
        if(err) return res.status(400).json({msg: "tidak dapat Logout"})
            res.status(200).json({msg: "anda sudah logout"})
    })
}