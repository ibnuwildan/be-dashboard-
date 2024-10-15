import Users from "../models/UserModel.js"
import argon2d  from "argon2"

export const getUsers = async(req, res) => {
    try {
        const response = await Users.findAll({
            attributes: ['uuid', 'name','email', 'role']
        });
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

export const getUserById = async(req, res) => {
    try {
        const response = await Users.findOne({
            attributes: ['uuid', 'name','email', 'role'],
            where: {
                uuid: req.params.id
            }
        });
        res.status(200).json({response})
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

export const createUser = async(req, res) => {
    const {name, email, password, confPassword, role } = req.body;
    // Cek apakah password dan konfirmasi password sesuai
    if (password !== confPassword) return res.status(400).json({ msg: "Password dan konfirmasi password tidak sesuai" });
        const hashPassword = await argon2d.hash(password);
    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword,
            role: role
        })
        res.status(201).json({msg: "Register Berhasil"})
    } catch (error){
        res.status(400).json({msg: error.message})
    }
}

export const updateUser = async(req, res) => {
    const user = await Users.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if(!user) return res.status(404).json({msg: "user tidak di temukan"})
    const {name, email, password, confPassword, role } = req.body;
    let hashPassword;
    if (password === "" || password === null){
        hashPassword = user.password
    }else {
        hashPassword = await argon2d.hash(password)
    } if(password !== confPassword) return res.status(400).json({msg: "password dan confirm password tdk sama"})
        try {
            await Users.update({
                name: name,
                email: email,
                password: hashPassword,
                role: role

            }, {
                where: {
                    id: user.id
                }
            })
            res.status(202).json({msg: "User  Berhasil Update"})
        } catch (error){
            res.status(400).json({msg: error.message})
        }

}

export const deleteUser = async (req, res) => {
    const user = await Users.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if(!user) return res.status(404).json({msg: "user tidak di temukan"})
    try {
            await Users.destroy({
                where: {
                    id: user.id
                }
            })
            res.status(202).json({msg: "User Deleted"})
        } catch (error){
            res.status(400).json({msg: error.message})
        }
}