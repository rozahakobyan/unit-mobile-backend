import {Router} from "express";
import UsersController from "../controllers/UsersController.js";
import usersSchema from "../schema/usersSchema.js";
import validate from "../middelwares/validate.js";
import uploader from "../middelwares/uploader.js";

const router = Router();

router.post(
    '/register',
    validate(usersSchema.register),
    UsersController.register
);

router.post('/activate', UsersController.activate);

router.post('/login', validate(usersSchema.login), UsersController.login);

router.post('/admin-login', validate(usersSchema.adminLogin), UsersController.adminLogin);

router.get('/profile', UsersController.profile);

router.post('/send-password-recovery-code', UsersController.sendPasswordRecoveryCode);

router.post('/validate-password-recovery-code', UsersController.validatePasswordRecoveryCode);

router.post('/forgot-password-update', validate(usersSchema.passwordUpdate), UsersController.passwordUpdate);

router.put('/profile-update/:id', uploader.image.single('photo'), validate(usersSchema.profileUpdate), UsersController.profileUpdate);

router.put('/update-password', UsersController.changeOldPassword)

router.put('/profile-update-privacy/:id', validate(usersSchema.profileUpdatePrivacy), UsersController.profileUpdatePrivacy)

router.put('/profile-update-number/:id', validate(usersSchema.profileUpdateNumber), UsersController.profileUpdateNumber)

router.get('/get-users', UsersController.getUsers)

router.delete('/delete/:id', UsersController.removeUser)

router.put('/update/:id', UsersController.updateUser)

router.get('/find-user-by-id/:id', UsersController.findUserById)

export default router;
