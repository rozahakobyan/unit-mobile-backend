import HttpError from "http-errors";
import path from "path";
import sharp from "sharp";
import Posts from "../models/Posts.js";
import fs from "fs";


class PostsController {
    static async add(req, res, next){
        try{
            const {id} = req.params;
            const posts = req.files["posts[]"];

            if(!id){
                throw HttpError(404)
            }

            if(!posts){
                throw HttpError(404, {
                    errors: {
                        file: 'Invalid file'
                    }
                })
            }else {
                const root = path.resolve(`public/posts/user_${id}`)

                if(!fs.existsSync(root)){
                    fs.mkdirSync(root)
                }

                var newPosts = posts.map(p => {
                    return `posts/user_${id}/${p.filename}`;
                })

                posts.map(async (file) => {
                    await sharp(file.path)
                        .rotate()
                        .toFile(path.join(root, file.filename));
                    await sharp(file.path)
                        .rotate()
                        .webp({
                            quality: 80,
                        })
                        .toFile(path.join(root, file.filename + '.webp'))
                });
            }

            const postsCreate = await Posts.create({
                photos: newPosts,
                userId: id
            })

            res.json({
                status: "ok",
                posts: postsCreate
            })
        }catch (e) {
            next(e)
        }
    }

    static async delete(req, res, next){
        try{
            const {id} = req.params;

            const post = await Posts.findOne({
                where: {id}
            })

            if(!post){
                throw HttpError(404)
            }

            const root = path.resolve(`public/`);

            if (post.photos) {
                post.photos.map(post => {
                    fs.unlinkSync(path.join(root, post));
                    fs.unlinkSync(path.join(root, post + '.webp'));
                })
            }

            await post.destroy();

            res.json({
                status: "ok"
            })
        }catch (e) {
            next(e)
        }
    }

    static async listByUserId(req, res, next){
        try{
            const {id} = req.params;

            const posts = await Posts.findAll({
                where: {userId: id}
            })

            if(!posts){
                throw HttpError(404)
            }

            res.json({
                status: "ok",
                posts
            })
        }catch (e) {
            next(e)
        }
    }
}

export default PostsController;