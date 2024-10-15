import Products from "../models/ProductModel.js";
import { upload } from "../middleware/Upload.js";
import Users from "../models/UserModel.js";
import { Op, where } from "sequelize";
import path from "path"
import fs from 'fs';

export const getProducts = async (req, res) => {
    try {
        let response;
        if(req.role ==="admin"){
            response = await Products.findAll({
                attributes: ["uuid", "name", "price", "image"],
                include: [{
                    model: Users,
                    attributes: ["name", "email"]
                }]
            })
        } else {
            response = await Products.findAll({
                attributes: ["uuid", "name", "price", "image"],
                where: {
                    userId: req.userId
                },
                include: [{
                    model: Users,
                    attributes: ["name", "email"]
                }]
            })
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

export const getProductsById = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        })
        if(!product) return res.status(404).json({msg: "data tidak di temukan"})
        let response;
        if(req.role ==="admin"){
            response = await Products.findOne({
                attributes: ["uuid", "name", "price", "image"],
                where: {
                    id: product.id
                },
                include: [{
                    model: Users,
                    attributes: ["name", "email"]
                }]
            })
        } else {
            response = await Products.findOne({
                attributes: ["uuid", "name", "price", "image"],
                where: {
                    [Op.and]: [{id: product.id}, {userId: req.userId}]
                },
                include: [{
                    model: Users,
                    attributes: ["name", "email"]
                }]
            })
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

export const createProduct = async (req, res) => {
    const { name, price } = req.body;
    const image = req.file ? req.file.filename : null; // Menyimpan nama file gambar

    try {
        const newProduct = await Products.create({
            name: name,
            price: price,
            image: image,
            userId: req.userId
        });
        res.status(201).json(newProduct); // Kembalikan produk yang baru dibuat
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        })
        if(!product) return res.status(404).json({msg: "data tidak di temukan"})

        const {name, price} = req.body;
        const image = req.file ? req.file.filename : product.image; // Jika ada file baru, update gambar
// Hapus gambar lama jika ada gambar baru yang diupload
if (req.file && product.image) {
    const oldImagePath = path.resolve('public/images', product.image);
    if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
            if (err) {
                console.error("Failed to delete old image:", err);
            }
        });
    }
}

   // Update produk
   if (req.role === "admin") {
    await Products.update({ name, price, image }, { where: { id: product.id } });
    } else {
        if (req.userId !== product.userId) return res.status(403).json({ msg: "Forbidden" });
        await Products.update({ name, price, image }, {
            where: {
                [Op.and]: [{ id: product.id }, { userId: req.userId }]
            }
        });
    }
    res.status(200).json({msg: "product updated successfuly"});
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        })
        if(!product) return res.status(404).json({msg: "data tidak di temukan"})
        const {name, price} = req.body;
        if(req.role ==="admin"){
            await Products.destroy({
                where: {
                    id: product.id
                }
            })
        } else {
            if(req.userId !== product.userId) return res.status(403).json({msg: "Akses terlarang"})
            await Products.destroy({
                where: {
                    [Op.and]: [{id: product.id}, {userId: req.userId}]
                }
            })
        }
        res.status(200).json({msg: "product Deleted successfuly"});
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}