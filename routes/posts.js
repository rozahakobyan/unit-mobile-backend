import {Router} from "express";
import validate from "../middelwares/validate.js";
import uploader from "../middelwares/uploader.js";
import postsSchema from "../schema/postsSchema.js";
import PostsController from "../controllers/PostsController.js";

const router = Router();

router.post("/add/:id",
    uploader.image.fields([
        {name: "posts[]", maxCount:10}
    ]),
    validate(postsSchema.add),
    PostsController.add)

router.delete("/delete/:id", PostsController.delete)

router.get("/list-by-user-id/:id", PostsController.listByUserId)

export default router