import {
    Posts,
    Users,
    UserSettings,
} from "./models/index.js";

async function main(){
    await Users.sync({alter:true, logging:true});
    await UserSettings.sync({alter:true, logging:true});
    await Posts.sync({alter:true, logging:true});

    process.exit(0);
}
main();