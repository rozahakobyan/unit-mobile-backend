import sendRegistrationEmail from "../helper/sendRegistrationEmail.js";
import HttpError from "http-errors";
import JWT from "jsonwebtoken";
import { UserSettings, Users } from "../models/index.js";
import path from "path";
import sharp from "sharp";
import fss from "fs"
import fs from "fs/promises";
import usersSchema from "../schema/usersSchema.js";
import _ from "lodash";
import {Op} from "sequelize";
import sendMassageToEmail from "../helper/sendMassageToEmail.js";
const { JWT_SECRET, FRONT_URL } = process.env;

class UsersController {
    static async register(req, res, next) {
        try {
            const { firstName, lastName, email, password } = req.body;

            const userExists = await Users.findOne({
                where: { email },
            });

            if (userExists) {
                throw HttpError(409, {
                    errors: {
                        exists: 'Already registered'
                    }
                })
            }

            const verification = JWT.sign({ email: email }, JWT_SECRET);
            const code = Math.floor(100000 + Math.random() * 900000)

            const newUser = await Users.create({
                firstName, lastName, email, phone: null, instagram: null, privacy: true,
                facebook: null, photo: "avatar.png", follower: 0, following: 0, number: "0",
                password, verification: verification
            });

            const html = `<h3>Dear ${newUser.firstName} ${newUser.lastName},</h3><p>You have been successfully registered. To activate your account please write this code as confirmation: <strong>${code}</strong> </p>`;

            await sendRegistrationEmail(newUser.email, html);
            await UserSettings.create({ recoveryCode: code, userId: newUser.id });

            res.json({
                status: "ok",
                message: "Successfully registered"
            })
        } catch (e) {
            next(e)
        }
    }

    static async registerToFb(req, res, next) {
        try {
            const { firstName, lastName, phone, password } = req.body;


            res.json({
                status: "ok",
                message: "Successfully registered"
            })
        } catch (e) {
            next(e)
        }
    }

    static async activate(req, res, next) {
        try {
            const {email, code} = req.body;

            const user = await Users.findOne({
                where: { email },
                attributes: {
                    exclude: ['verification', 'createdAt', 'updatedAt'],
                },
            });

            if (!user) {
                throw HttpError(403, {
                    errors: {
                        exists: 'No User Found'
                    }
                })
            }

            const recoveryUser = await UserSettings.findOne({
                where: {
                    userId: user.id,
                    recoveryCode: code
                }
            })

            if (!recoveryUser) {
                throw HttpError(403, {
                    errors: {
                        codeError: 'Invalid Code'
                    }
                })
            }

            await Users.update(
                { status: 'active' },
                {
                    where: { email },
                })

            res.json({
                status: 'ok',
                email,
            })

        } catch (e) {
            next(e)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await Users.findOne({
                where: {
                    email,
                    password: Users.passwordHash(password),
                    role: ["user"]
                },
                attributes: {
                    exclude: ['verification', 'createdAt', 'updatedAt'],
                    role: ["user"]
                },
            });

            if (!user) {
                throw HttpError(404, {
                    errors: {
                        exsist: 'Invalid email or password'
                    }
                });
            } else if (user.status !== 'active') {
                throw HttpError(404, {
                    errors: {
                        activateError: "You didn't activate your account"
                    }
                });
            }

            const token = JWT.sign({ userId: user.id }, JWT_SECRET);

            res.json({
                status: 'ok',
                user,
                token,
            });
        } catch (e) {
            next(e);
        }
    }

    static async adminLogin(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await Users.findOne({
                where: {
                    email,
                    password: Users.passwordHash(password),
                    role: ["admin", "super-admin"]
                },
                attributes: {
                    exclude: ['verification', 'createdAt', 'updatedAt'],
                    role: ["admin", "super-admin"]
                },
            });

            if (!user) {
                throw HttpError(404, {
                    errors: {
                        exsist: 'Invalid email or password'
                    }
                });
            } else if (user.status !== 'active') {
                throw HttpError(404, {
                    errors: {
                        activateError: "You didn't activate your account"
                    }
                });
            }

            const token = JWT.sign({ userId: user.id }, JWT_SECRET);

            res.json({
                status: 'ok',
                user,
                token,
            });
        } catch (e) {
            next(e);
        }
    }

    static async profile(req, res, next) {
        try {

            const userId = req.userId;
            const userProfile = await Users.findByPk(userId, {
                attributes: ['id', 'firstName', 'lastName', 'email', 'isOauth', 'status', 'photo'],
            });

            if (userProfile.photo.search('https') === -1) {
                if (fss.existsSync(`public/users/user_${userId}`)) {
                    userProfile.photo = `users/user_${req.userId}/${userProfile.photo ? userProfile.photo : "avatar.png"}`
                }
            }

            const profile = {
                ...userProfile.toJSON(),
            }

            res.json({
                status: 'ok',
                profile
            })
        } catch (e) {
            next(e)
        }
    }

    static async profileUpdate(req, res, next) {
        try {

            const { firstName, lastName, email } = req.body;
            const { id} = req.params;
            const { file } = req;

            const user = await Users.findByPk(id);

            if (!user) {
                throw HttpError(422, {
                    errors: {
                        error: 'No User Found'
                    }
                })
            }

            if (user.email !== email) {
                const verification = JWT.sign({ email: email }, JWT_SECRET);
                const html = `<h3>Dear ${firstName} ${lastName},</h3><p>Youe email was changed. To activate your account please click on the link below:</p><p><a href="${FRONT_URL}/activate?code=${verification}"> Click Here </a></p>`;

                await sendRegistrationEmail(email, html);
                await user.update({ status: 'pending', verification: verification });
            }
            if (file) {
                const destFolder = `public/users/user_${id}`;

                if (user.photo !== 'avatar.png' && user.photo.search('https') !== 0) {
                    console.log(user.photo.search('https'))
                    await fs.unlink(path.join(destFolder, user.photo));
                }

                if (!fss.existsSync(destFolder)) {
                    fss.mkdirSync(destFolder)
                }
                await sharp(file.path)
                    .rotate()
                    .resize({ width: 100 })
                    .toFile(path.join(destFolder, file.filename));

                await user.update({ firstName, lastName, email, photo: file.filename });

            } else {
                await user.update({ firstName, lastName, email });
            }

            res.json({
                status: 'ok',
                message: "Profile Successfully updated"
            })

        }
        catch (e) {
            next(e)
        }
    }

    static async sendPasswordRecoveryCode(req, res, next) {
        try {

            const { email } = req.body;

            const user = await Users.findOne({
                where: { email },
                attributes: { exclude: ['verification', 'createdAt', 'updatedAt'] }
            });

            if (!user) {
                throw HttpError(404, {
                    errors: {
                        email: 'User With That Email Not Found'
                    }
                })
            } else if (user.status === 'pending') {
                throw HttpError(403, {
                    errors: {
                        notActive: 'Not Active User'
                    }
                })
            }

            const recoveryCode = Math.floor(100000 + Math.random() * 900000)

            await UserSettings.create({ recoveryCode, userId: user.id });

            const html = `<h3>Dear ${user.firstName} ${user.lastName},</h3><p>We got a password recovery request. Your Verification Code is <strong>${recoveryCode}</strong>.If you didnt do that you can ignore this message</p>`;

            await sendRegistrationEmail(user.email, html);

            res.json({
                status: "ok",
                message: "Verification Code was sent to your email"
            })
        } catch (e) {
            next(e)
        }
    }

    static async validatePasswordRecoveryCode(req, res, next) {
        try {

            const { email, recoveryCode } = req.body;

            const user = await Users.findOne({
                where: { email },
                attributes: {
                    exclude: ['verification', 'createdAt', 'updatedAt'],
                },
            });

            if (!user) {
                throw HttpError(403, {
                    errors: {
                        exists: 'No User Found'
                    }
                })
            }
            const recoveryUser = await UserSettings.findOne({
                where: {
                    userId: user.id,
                    recoveryCode: recoveryCode
                }
            })

            if (!recoveryUser) {
                throw HttpError(403, {
                    errors: {
                        recoveryCodeError: 'Invalid Recovery Code'
                    }
                })
            }

            res.json({
                status: "ok",
                message: "Recovery code verified successfully",
            })
        } catch (e) {
            next(e)
        }
    }

    static async passwordUpdate(req, res, next) {
        try {

            const { email, newPassword } = req.body;

            const user = await Users.findOne({
                where: { email },
                attributes: { exclude: ['verification', 'createdAt', 'updatedAt'] }
            });

            if (!user) {
                throw HttpError(404, {
                    errors: {
                        exists: 'User Not Found'
                    }
                })
            }
            await user.update({ password: newPassword });

            res.json({
                status: "ok",
                message: "Password updated successfully",
            })
        } catch (e) {
            next(e)
        }
    }

    static async profileUpdatePrivacy (req, res, next){
        try{
            const {privacy} = req.body;
            const {id} = req.params;

            const user = await Users.findOne({
                where: {id}
            })

            if(!user){
                throw HttpError(404, {
                    errors: {
                        exists: 'User not found'
                    }
                })
            }

            await user.update({privacy});

            res.json({
                status: "ok",
                message: "Successfully profile update"
            })
        }catch(e){
            next(e)
        }
    }

    static async profileUpdateNumber (req, res, next){
        try{
            const {number} = req.body;
            const {id} = req.params;

            const user = await Users.findOne({
                where: {id}
            })

            if(!user){
                throw HttpError(404, {
                    errors: {
                        exists: 'User not found'
                    }
                })
            }

            await user.update({number});

            res.json({
                status: "ok",
                message: "Successfully profile update"
            })
        }catch(e){
            next(e)
        }
    }

    static async changeOldPassword(req, res, next) {

        try {

            const {password, ...data} = req.body;

            const userId = req.userId;

            const user = await Users.findOne({
               where:{
                    id:userId,
                    password:Users.passwordHash(password)
                }
            })
            if(!user){
                throw HttpError(404, {
                    errors: {
                        oldPassword: 'Old Password are Wrong'
                    }
                })
            }
            const  {value,error} =  usersSchema.updatePassword.validate(data,{
                abortEarly: false,
            })
            if(error){
                const errors = {};
                error.details.forEach(d => {
                    const textRemove = d.message.replace(`"${d.path}"`,'')
                    _.set(errors, d.path, textRemove)
                });
              throw  HttpError(422, { errors })
            }

            await user.update({ password: value.newPassword }, { where: { id: userId } })

            res.json({
                status:'ok',
                message:'Password Updated  Successfully'
            })

        }
        catch (e) {
            next(e)
        }

    }

    static async getUsers(req, res, next) {
        try {

            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if(search){
                where[Op.or] = [
                    { firstName: { [Op.substring]: search } },
                    { lastName: { [Op.substring]: search } },
                    { email: { [Op.substring]: search } },
                ];
            }
            const users = await Users.findAll({
                    where,
                    limit,
                    offset
                })

            const totalCount = await Users.count();

            res.json({
                status: 'ok',
                users,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            })

        }
        catch (e) {
            next(e)
        }

    }

    static async removeUser(req, res, next) {
        try {
            const {id} = req.params;
            const user = await Users.findByPk(id);

            if (!user) {
                throw HttpError(422, {
                    errors: {
                        error: 'No User found'
                    }
                })
            }

            if (user.photo !== 'avatar.png') {
                const photo = path.resolve(`public/users/user_${id}`);
                await fs.rm(photo, { recursive: true, force: true })
            }

            await user.destroy();

            res.json({
                status:'ok'
            })
        }
        catch (e) {
            next(e)
        }
    }

    static async updateUser(req, res, next){
        try{
            const {id} = req.params;
            const {role, status} = req.body;

            const user = await Users.findByPk(id);

            if (!user) {
                throw HttpError(422, {
                    errors: {
                        error: 'No User found'
                    }
                })
            }

            await user.update({role, status})

            res.json({
                status: "ok",
                user
            })
        }catch (e) {
            next(e)
        }
    }

    static async findUserById(req, res, next){
        try{
            const {id} = req.params;

            const user = await Users.findOne({
                where: {
                    id
                }
            })

            if (!user) {
                throw HttpError(422, {
                    errors: {
                        error: 'No User found'
                    }
                })
            }

            res.json({
                status: "ok",
                user
            })
        }catch (e) {
            next(e)
        }
    }
}
export default UsersController
