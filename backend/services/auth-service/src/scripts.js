import { supabaseAdmin } from "./config/database/supabase.config.js";

async function createAdminUser(email, password) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            role: "admin",
        },
    });

    if (error) {
        console.error("Create admin failed:", error.message);
        throw new Error(error.message);
    }

    console.log("Create admin success:", data.user?.email, data.user?.id);
    return data;
}

const admins = [
    { email: "admin1@gmail.com", password: "123456" },
    { email: "admin2@gmail.com", password: "123456" },
    { email: "admin3@gmail.com", password: "123456" },
    { email: "admin4@gmail.com", password: "123456" },
];

for (const admin of admins) {
    try {
        await createAdminUser(admin.email, admin.password);
    } catch (error) {
        console.error(`Skip ${admin.email}: ${error.message}`);
    }
}
